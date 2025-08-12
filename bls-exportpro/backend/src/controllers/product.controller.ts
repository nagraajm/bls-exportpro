import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { repositories } from '../repositories';
import { z } from 'zod';

const createProductSchema = z.object({
  productCode: z.string(),
  brandName: z.string(),
  genericName: z.string(),
  strength: z.string(),
  dosageForm: z.string(),
  packSize: z.string(),
  manufacturer: z.string(),
  hsnCode: z.string(),
  batchNumber: z.string().optional(),
  expiryDate: z.string().datetime().optional(),
  unitPrice: z.number().positive(),
  currency: z.enum(['USD', 'INR']),
});

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const page = req.query.page ? Number(req.query.page) : 1;
  const limit = req.query.limit ? Number(req.query.limit) : 20;
  
  const result = await repositories.product.paginate(page, limit);
  
  res.json({
    status: 'success',
    data: result.data,
    pagination: {
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
    },
  });
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const product = await repositories.product.findById(req.params.id);
  
  if (!product) {
    res.status(404).json({
      status: 'error',
      message: 'Product not found',
    });
    return;
  }
  
  res.json({
    status: 'success',
    data: product,
  });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = createProductSchema.parse(req.body);
  const productData = {
    ...validatedData,
    expiryDate: validatedData.expiryDate ? new Date(validatedData.expiryDate) : undefined,
  };
  
  const product = await repositories.product.create(productData);
  
  res.status(201).json({
    status: 'success',
    data: product,
  });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const updates = req.body;
  if (updates.expiryDate) {
    updates.expiryDate = new Date(updates.expiryDate);
  }
  
  const product = await repositories.product.update(req.params.id, updates);
  
  if (!product) {
    res.status(404).json({
      status: 'error',
      message: 'Product not found',
    });
    return;
  }
  
  res.json({
    status: 'success',
    data: product,
  });
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const deleted = await repositories.product.delete(req.params.id);
  
  if (!deleted) {
    res.status(404).json({
      status: 'error',
      message: 'Product not found',
    });
    return;
  }
  
  res.status(204).send();
});

export const productController = {
  getAll,
  getById,
  create,
  update,
  delete: deleteProduct,
};