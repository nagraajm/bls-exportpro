import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import * as XLSX from 'xlsx';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'status');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `status-${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.xlsx' || ext === '.xls' || ext === '.csv') {
      cb(null, true);
    } else {
      cb(new Error('Only Excel and CSV files are allowed'));
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit for larger files
});

// Generic status file upload and processing
router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const filePath = req.file.path;
    
    // Read Excel file with all sheets
    const workbook = XLSX.readFile(filePath, { cellDates: true });
    
    // Process all worksheets
    const allData: any = {};
    const summary = {
      totalSheets: workbook.SheetNames.length,
      sheets: [] as any[],
      totalRows: 0,
      totalProducts: 0
    };

    // Process each worksheet
    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON with proper header detection
      // First, try to get all data including potential headers
      const allRows = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1,  // Return as array of arrays
        raw: false,
        dateNF: 'yyyy-mm-dd',
        defval: ''
      });
      
      if (!allRows || allRows.length === 0) {
        allData[sheetName] = [];
        continue;
      }
      
      // Find the header row (usually has column names like "Sr.No", "Brand Name", etc.)
      let headerRowIndex = 0;
      let headers: string[] = [];
      
      for (let i = 0; i < Math.min(5, allRows.length); i++) {
        const row = allRows[i] as any[];
        if (row && row.length > 0) {
          // Check if this looks like a header row
          const nonEmptyCount = row.filter(cell => cell && String(cell).trim()).length;
          if (nonEmptyCount >= 3) {  // At least 3 non-empty cells
            headerRowIndex = i;
            headers = row.map(cell => String(cell || '').trim()).filter(h => h);
            if (headers.some(h => 
              h.toLowerCase().includes('name') || 
              h.toLowerCase().includes('no') ||
              h.toLowerCase().includes('status') ||
              h.toLowerCase().includes('date')
            )) {
              break;  // Found a likely header row
            }
          }
        }
      }
      
      // If no good headers found, use first row
      if (headers.length === 0 && allRows.length > 0) {
        headers = (allRows[0] as any[]).map((cell, index) => 
          cell ? String(cell).trim() : `Column ${index + 1}`
        );
      }
      
      // Convert data rows using found headers
      const dataRows = allRows.slice(headerRowIndex + 1);
      const rawData = dataRows.map((row: any) => {
        const obj: any = {};
        headers.forEach((header, index) => {
          if (header && row[index] !== undefined) {
            obj[header] = row[index];
          }
        });
        return obj;
      }).filter(row => 
        // Filter out empty rows
        Object.values(row).some(val => val !== null && val !== undefined && String(val).trim())
      );
      
      // Process and clean data
      const processedData = rawData.map((row: any, index: number) => {
        // Auto-detect and normalize common fields
        const normalizedRow: any = {
          rowNumber: index + 1,
          sheetName: sheetName
        };
        
        // Map common pharmaceutical fields (flexible mapping)
        Object.keys(row).forEach(key => {
          const lowerKey = key.toLowerCase().trim();
          const value = row[key];
          
          // Smart field mapping
          if (lowerKey.includes('brand') || lowerKey.includes('product name')) {
            normalizedRow.brandName = value;
          } else if (lowerKey.includes('generic')) {
            normalizedRow.genericName = value;
          } else if (lowerKey.includes('strength')) {
            normalizedRow.strength = value;
          } else if (lowerKey.includes('dosage') || lowerKey.includes('form')) {
            normalizedRow.dosageForm = value;
          } else if (lowerKey.includes('pack')) {
            normalizedRow.packSize = value;
          } else if (lowerKey.includes('registration') && lowerKey.includes('no')) {
            normalizedRow.registrationNumber = value;
          } else if (lowerKey.includes('status')) {
            normalizedRow.status = normalizeStatus(value);
          } else if (lowerKey.includes('expiry') || lowerKey.includes('expire')) {
            normalizedRow.expiryDate = value;
          } else if (lowerKey.includes('manufacturer') || lowerKey.includes('mfg')) {
            normalizedRow.manufacturer = value;
          } else if (lowerKey.includes('country')) {
            normalizedRow.country = value;
          } else if (lowerKey.includes('price') || lowerKey.includes('cost')) {
            normalizedRow.price = parseFloat(value) || 0;
          } else if (lowerKey.includes('quantity') || lowerKey.includes('qty')) {
            normalizedRow.quantity = parseInt(value) || 0;
          }
          
          // Keep original field as well
          normalizedRow[key] = value;
        });
        
        return normalizedRow;
      });
      
      allData[sheetName] = processedData;
      
      summary.sheets.push({
        name: sheetName,
        rowCount: processedData.length,
        columns: Object.keys(rawData[0] || {})
      });
      
      summary.totalRows += processedData.length;
    }
    
    // Store all processed data
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Save complete data
    const statusDataPath = path.join(dataDir, 'uploaded-status-data.json');
    fs.writeFileSync(statusDataPath, JSON.stringify(allData, null, 2));
    
    // Save summary
    const summaryPath = path.join(dataDir, 'upload-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: 'File processed successfully',
      summary: summary,
      data: allData
    });

  } catch (error) {
    console.error('File processing error:', error);
    
    // Clean up on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to process file',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get all uploaded data
router.get('/data', async (req: Request, res: Response) => {
  try {
    const statusDataPath = path.join(process.cwd(), 'data', 'uploaded-status-data.json');
    const summaryPath = path.join(process.cwd(), 'data', 'upload-summary.json');
    
    if (!fs.existsSync(statusDataPath)) {
      return res.json({
        success: true,
        data: {},
        summary: null
      });
    }

    const data = JSON.parse(fs.readFileSync(statusDataPath, 'utf-8'));
    const summary = fs.existsSync(summaryPath) 
      ? JSON.parse(fs.readFileSync(summaryPath, 'utf-8'))
      : null;
    
    res.json({
      success: true,
      data,
      summary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch data'
    });
  }
});

// Get data for specific sheet
router.get('/sheet/:sheetName', async (req: Request, res: Response) => {
  try {
    const { sheetName } = req.params;
    const statusDataPath = path.join(process.cwd(), 'data', 'uploaded-status-data.json');
    
    if (!fs.existsSync(statusDataPath)) {
      return res.json({
        success: false,
        message: 'No data available'
      });
    }

    const allData = JSON.parse(fs.readFileSync(statusDataPath, 'utf-8'));
    const sheetData = allData[sheetName];
    
    if (!sheetData) {
      return res.status(404).json({
        success: false,
        message: `Sheet "${sheetName}" not found`
      });
    }
    
    res.json({
      success: true,
      sheetName,
      data: sheetData,
      count: sheetData.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sheet data'
    });
  }
});

// Generate dashboard data from uploaded file
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const statusDataPath = path.join(process.cwd(), 'data', 'uploaded-status-data.json');
    
    if (!fs.existsSync(statusDataPath)) {
      return res.json({
        success: false,
        message: 'No data available for dashboard'
      });
    }

    const allData = JSON.parse(fs.readFileSync(statusDataPath, 'utf-8'));
    
    // Generate dashboard metrics
    const dashboard = {
      overview: {
        totalSheets: Object.keys(allData).length,
        totalRecords: 0,
        lastUpdated: fs.statSync(statusDataPath).mtime
      },
      statusBreakdown: {} as any,
      sheetsInfo: [] as any[],
      recentItems: [] as any[],
      totalRecords: 0  // Add this as a temporary counter
    };
    
    // Process each sheet for dashboard
    Object.keys(allData).forEach(sheetName => {
      const sheetData = allData[sheetName];
      dashboard.totalRecords += sheetData.length;
      
      // Count status types
      sheetData.forEach((item: any) => {
        if (item.status) {
          dashboard.statusBreakdown[item.status] = 
            (dashboard.statusBreakdown[item.status] || 0) + 1;
        }
      });
      
      // Sheet info
      dashboard.sheetsInfo.push({
        name: sheetName,
        recordCount: sheetData.length,
        hasRegistrationData: sheetData.some((item: any) => item.registrationNumber),
        hasPriceData: sheetData.some((item: any) => item.price)
      });
      
      // Add recent items (first 5 from each sheet)
      dashboard.recentItems.push(...sheetData.slice(0, 5));
    });
    
    // Limit recent items to 20
    dashboard.recentItems = dashboard.recentItems.slice(0, 20);
    dashboard.overview.totalRecords = dashboard.totalRecords;
    
    res.json({
      success: true,
      dashboard
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate dashboard'
    });
  }
});

// Helper function to normalize status values
function normalizeStatus(status: string): string {
  if (!status) return 'unknown';
  
  const normalized = status.toLowerCase().trim();
  
  const statusMap: { [key: string]: string } = {
    'registered': 'registered',
    'active': 'active',
    'approved': 'approved',
    'pending': 'pending',
    'in progress': 'in-progress',
    'expired': 'expired',
    'not registered': 'not-registered',
    'rejected': 'rejected',
    'none': 'not-registered',
    'n/a': 'not-applicable'
  };
  
  return statusMap[normalized] || normalized;
}

export default router;