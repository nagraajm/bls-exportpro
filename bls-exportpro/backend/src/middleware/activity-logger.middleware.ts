import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';

const LOG_DIR = path.join(process.cwd(), 'logs');
const ACTIVITY_LOG = path.join(LOG_DIR, 'user-activity.log');

// Ensure logs directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

interface ActivityLog {
  timestamp: string;
  method: string;
  path: string;
  statusCode?: number;
  userAgent?: string;
}

// Activity logging middleware
export const activityLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // Log response after it's sent
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    // Only log API requests and page navigations
    if (req.path.startsWith('/api/') || req.path === '/' || !req.path.includes('.')) {
      const log: ActivityLog = {
        timestamp: new Date().toISOString(),
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        userAgent: req.get('user-agent')?.substring(0, 100)
      };
      
      const logLine = JSON.stringify(log) + '\n';
      
      fs.appendFile(ACTIVITY_LOG, logLine, (err) => {
        if (err) {
          console.error('Failed to write activity log:', err);
        }
      });
    }
  });
  
  next();
};

// Read recent activity logs
export const getRecentActivity = (count: number = 50): ActivityLog[] => {
  try {
    if (!fs.existsSync(ACTIVITY_LOG)) {
      return [];
    }
    
    const content = fs.readFileSync(ACTIVITY_LOG, 'utf-8');
    const lines = content.trim().split('\n').filter(Boolean);
    
    return lines
      .slice(-count)
      .map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(Boolean) as ActivityLog[];
  } catch (error) {
    console.error('Failed to read activity logs:', error);
    return [];
  }
}