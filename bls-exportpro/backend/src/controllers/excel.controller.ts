import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { excelService } from '../services/excel.service';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AppError } from '../middleware/error.middleware';

const upload = multer({
  dest: 'uploads/temp/',
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.xlsx' && ext !== '.xls') {
      return cb(new Error('Only Excel files are allowed'));
    }
    cb(null, true);
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

export const uploadMiddleware = upload.single('file');

export const importExcel = asyncHandler(async (
  req: Request,
  res: Response
) => {
  if (!req.file) {
    throw new AppError(400, 'No file uploaded');
  }
  
  const { type } = req.body;
  if (!type || !['products', 'customers'].includes(type)) {
    throw new AppError(400, 'Invalid import type');
  }
  
  try {
    let result;
    if (type === 'products') {
      result = await excelService.importProducts(req.file.path);
    } else {
      result = await excelService.importCustomers(req.file.path);
    }
    
    res.json({
      status: 'success',
      data: result,
    });
  } finally {
    fs.unlinkSync(req.file.path);
  }
});

export const exportOrders = asyncHandler(async (
  req: Request,
  res: Response
) => {
  const { startDate, endDate } = req.query;
  
  const filepath = await excelService.exportOrders(
    startDate ? new Date(startDate as string) : undefined,
    endDate ? new Date(endDate as string) : undefined
  );
  
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="orders-export.xlsx"`);
  
  const stream = fs.createReadStream(filepath);
  stream.pipe(res);
  
  stream.on('end', () => {
    fs.unlinkSync(filepath);
  });
});

export const exportInvoices = asyncHandler(async (
  req: Request,
  res: Response
) => {
  const { invoiceType } = req.query;
  
  const filepath = await excelService.exportInvoices(invoiceType as string);
  
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="invoices-export.xlsx"`);
  
  const stream = fs.createReadStream(filepath);
  stream.pipe(res);
  
  stream.on('end', () => {
    fs.unlinkSync(filepath);
  });
});