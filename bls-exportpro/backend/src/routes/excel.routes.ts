import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { excelImportService } from '../services/excel/excel-import.service';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || './uploads/excel';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'import-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only Excel files are allowed.'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Apply authentication to all routes
// router.use(authenticate); // Commented out for testing

// Import product master data
router.post('/import/products', 
  // authorize(['admin', 'manager']),
  upload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    const options = {
      sheetName: req.body.sheetName,
      headerRow: req.body.headerRow ? parseInt(req.body.headerRow) : undefined,
      startRow: req.body.startRow ? parseInt(req.body.startRow) : undefined,
      validateOnly: req.body.validateOnly === 'true'
    };

    // Set up progress tracking
    const progressEvents: any[] = [];
    excelImportService.on('progress', (progress) => {
      progressEvents.push(progress);
    });

    try {
      const result = await excelImportService.importProductMaster(req.file.path, options);
      
      // Clean up the uploaded file
      fs.unlinkSync(req.file.path);
      
      res.json({
        ...result,
        progress: progressEvents
      });
    } catch (error: any) {
      // Clean up the uploaded file on error
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(400).json({ message: error.message });
    } finally {
      // Remove progress listener
      excelImportService.removeAllListeners('progress');
    }
  })
);

// Import Cambodia registration status
router.post('/import/cambodia-registration',
  // authorize(['admin', 'manager']),
  upload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    const options = {
      sheetName: req.body.sheetName,
      headerRow: req.body.headerRow ? parseInt(req.body.headerRow) : undefined,
      startRow: req.body.startRow ? parseInt(req.body.startRow) : undefined,
      validateOnly: req.body.validateOnly === 'true'
    };

    try {
      const result = await excelImportService.importCambodiaRegistration(req.file.path, options);
      
      // Clean up the uploaded file
      fs.unlinkSync(req.file.path);
      
      res.json(result);
    } catch (error: any) {
      // Clean up the uploaded file on error
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(400).json({ message: error.message });
    }
  })
);

// Import historical orders
router.post('/import/historical-orders',
  // authorize(['admin']),
  upload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    const options = {
      sheetName: req.body.sheetName,
      headerRow: req.body.headerRow ? parseInt(req.body.headerRow) : undefined,
      startRow: req.body.startRow ? parseInt(req.body.startRow) : undefined,
      validateOnly: req.body.validateOnly === 'true'
    };

    // Set up progress tracking
    const progressEvents: any[] = [];
    excelImportService.on('progress', (progress) => {
      progressEvents.push(progress);
    });

    try {
      const result = await excelImportService.importHistoricalOrders(req.file.path, options);
      
      // Clean up the uploaded file
      fs.unlinkSync(req.file.path);
      
      res.json({
        ...result,
        progress: progressEvents
      });
    } catch (error: any) {
      // Clean up the uploaded file on error
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(400).json({ message: error.message });
    } finally {
      // Remove progress listener
      excelImportService.removeAllListeners('progress');
    }
  })
);

// Import financial MIS data
router.post('/import/financial-mis',
  // authorize(['admin', 'manager']),
  upload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    const options = {
      sheetName: req.body.sheetName,
      validateOnly: req.body.validateOnly === 'true'
    };

    try {
      const result = await excelImportService.importFinancialMIS(req.file.path, options);
      
      // Clean up the uploaded file
      fs.unlinkSync(req.file.path);
      
      res.json(result);
    } catch (error: any) {
      // Clean up the uploaded file on error
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(400).json({ message: error.message });
    }
  })
);

// Validate Excel structure before import
router.post('/validate-structure',
  // authorize(['admin', 'manager']),
  upload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    const expectedColumns = req.body.expectedColumns ? 
      JSON.parse(req.body.expectedColumns) : [];

    try {
      const result = await excelImportService.validateExcelStructure(
        req.file.path, 
        expectedColumns
      );
      
      // Clean up the uploaded file
      fs.unlinkSync(req.file.path);
      
      res.json(result);
    } catch (error: any) {
      // Clean up the uploaded file on error
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(400).json({ message: error.message });
    }
  })
);

// Clear import cache
router.post('/clear-cache',
  // authorize(['admin']),
  asyncHandler(async (req, res) => {
    excelImportService.clearCache();
    res.json({ message: 'Import cache cleared successfully' });
  })
);

export default router;