import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import * as XLSX from 'xlsx';
import { z } from 'zod';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'excel');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `cambodia-${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.xlsx' || ext === '.xls') {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Schema for Cambodia registration data
const CambodiaRegistrationSchema = z.object({
  productCode: z.string().optional(),
  brandName: z.string(),
  genericName: z.string(),
  strength: z.string().optional(),
  dosageForm: z.string().optional(),
  packSize: z.string().optional(),
  registrationNumber: z.string().optional(),
  registrationStatus: z.enum(['registered', 'pending', 'expired', 'not-registered']).optional(),
  registrationExpiry: z.string().optional(),
  manufacturingSite: z.string().optional()
});

// Upload and process Cambodia registration Excel
router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const filePath = req.file.path;
    
    // Read Excel file
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    // Process and validate data
    const processedData = [];
    const errors = [];

    for (let i = 0; i < data.length; i++) {
      const row: any = data[i];
      
      try {
        // Map Excel columns to our schema
        const mappedData = {
          productCode: row['Product Code'] || row['Code'] || `PROD-${i + 1}`,
          brandName: row['Brand Name'] || row['Product Name'] || '',
          genericName: row['Generic Name'] || row['Generic'] || '',
          strength: row['Strength'] || '',
          dosageForm: row['Dosage Form'] || row['Form'] || '',
          packSize: row['Pack Size'] || row['Pack'] || '',
          registrationNumber: row['Registration Number'] || row['Reg No'] || '',
          registrationStatus: mapRegistrationStatus(row['Status'] || row['Registration Status']),
          registrationExpiry: row['Expiry Date'] || row['Registration Expiry'] || '',
          manufacturingSite: row['Manufacturing Site'] || row['Manufacturer'] || ''
        };

        const validated = CambodiaRegistrationSchema.parse(mappedData);
        processedData.push(validated);
      } catch (error) {
        errors.push({
          row: i + 2, // Excel row number (accounting for header)
          error: error instanceof Error ? error.message : 'Validation failed'
        });
      }
    }

    // Store processed data in a JSON file for now
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    const cambodiaDataPath = path.join(dataDir, 'cambodia-registration.json');
    fs.writeFileSync(cambodiaDataPath, JSON.stringify(processedData, null, 2));

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: 'Excel file processed successfully',
      data: {
        totalRows: data.length,
        successfulRows: processedData.length,
        errors: errors.length > 0 ? errors : undefined,
        products: processedData
      }
    });

  } catch (error) {
    console.error('Excel processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process Excel file',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get processed Cambodia registration data
router.get('/products', async (req: Request, res: Response) => {
  try {
    const cambodiaDataPath = path.join(process.cwd(), 'data', 'cambodia-registration.json');
    
    if (!fs.existsSync(cambodiaDataPath)) {
      return res.json({
        success: true,
        data: []
      });
    }

    const data = JSON.parse(fs.readFileSync(cambodiaDataPath, 'utf-8'));
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Cambodia registration data'
    });
  }
});

// Helper function to map registration status
function mapRegistrationStatus(status: string): string {
  const statusMap: { [key: string]: string } = {
    'registered': 'registered',
    'active': 'registered',
    'pending': 'pending',
    'in progress': 'pending',
    'expired': 'expired',
    'not registered': 'not-registered',
    'none': 'not-registered'
  };
  
  const normalized = status?.toLowerCase().trim() || 'not-registered';
  return statusMap[normalized] || 'not-registered';
}

export default router;