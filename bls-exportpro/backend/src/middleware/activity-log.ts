import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';

const LOG_DIR = path.join(process.cwd(), 'logs');
const LOG_FILE = path.join(LOG_DIR, 'activity.log');

// Create logs directory if it doesn't exist
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

export const logActivity = (req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl;
  
  // Simple log entry
  const logEntry = `[${timestamp}] ${method} ${url}\n`;
  
  // Write to log file
  fs.appendFile(LOG_FILE, logEntry, (err) => {
    if (err) console.error('Log write error:', err);
  });
  
  next();
}