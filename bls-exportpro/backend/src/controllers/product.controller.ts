import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { repositories } from '../repositories';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

// Schema that matches the existing database structure
const createProductSchema = z.object({
  productCode: z.string().min(1, 'Product code is required').optional(), // Will use as batch_prefix
  brandName: z.string().min(1, 'Brand name is required'),
  genericName: z.string().min(1, 'Generic name is required'),
  strength: z.string().min(1, 'Strength is required'),
  dosageForm: z.string().optional(), // Not in current DB schema
  packSize: z.string().min(1, 'Pack size is required'),
  manufacturer: z.string().optional(), // Not in current DB schema
  hsnCode: z.string().regex(/^\d{4,8}$/, 'HSN Code must be 4-8 digits'),
  therapeuticCategory: z.string().optional(),
  storageConditions: z.string().optional(),
  shelfLife: z.number().min(1).max(60).optional(),
  isScheduledDrug: z.boolean().default(false),
  scheduleCategory: z.string().optional(),
  // Legacy pricing for backward compatibility  
  unitPrice: z.number().positive().optional(),
  currency: z.enum(['INR', 'USD']).default('INR'),
});

const updateProductSchema = z.object({
  productCode: z.string().min(1).optional(),
  brandName: z.string().min(1).optional(),
  genericName: z.string().min(1).optional(),
  strength: z.string().min(1).optional(),
  dosageForm: z.string().min(1).optional(),
  packSize: z.string().min(1).optional(),
  manufacturer: z.string().min(1).optional(),
  hsnCode: z.string().regex(/^\d{4,8}$/).optional(),
  therapeuticCategory: z.string().optional(),
  storageConditions: z.string().optional(),
  shelfLife: z.number().min(1).max(60).optional(),
  isScheduledDrug: z.boolean().optional(),
  scheduleCategory: z.string().optional(),
  unitPrice: z.number().positive().optional(),
  currency: z.enum(['INR']).optional(),
  approvalStatus: z.enum(['pending', 'approved', 'rejected']).optional(),
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
  
  // Check if user has permission to create products
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'manager')) {
    res.status(403).json({
      status: 'error',
      message: 'Only administrators and managers can create products',
    });
    return;
  }

  // Map frontend data to database schema
  const productData = {
    id: uuidv4(),
    brand_name: validatedData.brandName,
    generic_name: validatedData.genericName,
    strength: validatedData.strength,
    unit_pack: validatedData.packSize,
    pack_size: parseInt(validatedData.packSize.replace(/\D/g, '')) || 1, // Extract number from pack size
    rate_usd: validatedData.unitPrice || 0,
    hs_code: validatedData.hsnCode,
    batch_prefix: validatedData.productCode || validatedData.brandName.substring(0, 3).toUpperCase(),
    created_at: new Date().toISOString()
  };
  
  try {
    const product = await repositories.product.create(productData as any);
    
    res.status(201).json({
      status: 'success',
      data: product,
      message: 'Product created successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to create product',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const validatedUpdates = updateProductSchema.parse(req.body);
  
  // Check if user has permission to update products
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'manager')) {
    res.status(403).json({
      status: 'error',
      message: 'Only administrators and managers can update products',
    });
    return;
  }

  // Get current product to check approval status
  const currentProduct = await repositories.product.findById(req.params.id);
  if (!currentProduct) {
    res.status(404).json({
      status: 'error',
      message: 'Product not found',
    });
    return;
  }

  // Check if making significant changes that require re-approval
  const significantFields = ['brandName', 'genericName', 'strength', 'dosageForm', 'hsnCode'];
  const hasSignificantChanges = significantFields.some(field => 
    validatedUpdates[field as keyof typeof validatedUpdates] !== undefined
  );

  const updates = {
    ...validatedUpdates,
    updatedAt: new Date(),
    // Reset approval if significant changes and not admin
    ...(hasSignificantChanges && req.user.role !== 'admin' && {
      approvalStatus: 'pending',
      approvedBy: undefined,
      approvalDate: undefined
    })
  };
  
  try {
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
      message: hasSignificantChanges && req.user.role !== 'admin' 
        ? 'Product updated but requires approval for significant changes'
        : 'Product updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to update product',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  // Only admins can delete products
  if (req.user?.role !== 'admin') {
    res.status(403).json({
      status: 'error',
      message: 'Only administrators can delete products',
    });
    return;
  }

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

export const approveProduct = asyncHandler(async (req: Request, res: Response) => {
  // Only admins can approve products
  if (req.user?.role !== 'admin') {
    res.status(403).json({
      status: 'error',
      message: 'Only administrators can approve products',
    });
    return;
  }

  const product = await repositories.product.update(req.params.id, {
    approvalStatus: 'approved' as const,
    approvedBy: req.user.id,
    approvalDate: new Date(),
    updatedAt: new Date()
  } as any);
  
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
    message: 'Product approved successfully'
  });
});

export const rejectProduct = asyncHandler(async (req: Request, res: Response) => {
  // Only admins can reject products
  if (req.user?.role !== 'admin') {
    res.status(403).json({
      status: 'error',
      message: 'Only administrators can reject products',
    });
    return;
  }

  const { reason } = req.body;

  const product = await repositories.product.update(req.params.id, {
    approvalStatus: 'rejected' as const,
    approvedBy: req.user.id,
    approvalDate: new Date(),
    updatedAt: new Date(),
    rejectionReason: reason
  } as any);
  
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
    message: 'Product rejected'
  });
});

export const getPendingApprovals = asyncHandler(async (req: Request, res: Response) => {
  // Only admins can view pending approvals
  if (req.user?.role !== 'admin') {
    res.status(403).json({
      status: 'error',
      message: 'Only administrators can view pending approvals',
    });
    return;
  }

  const page = req.query.page ? Number(req.query.page) : 1;
  const limit = req.query.limit ? Number(req.query.limit) : 20;
  
  // This would need to be implemented in the repository
  // For now, we'll get all products and filter
  const result = await repositories.product.paginate(page, limit);
  const pendingProducts = result.data.filter((product: any) => product.approvalStatus === 'pending');
  
  res.json({
    status: 'success',
    data: pendingProducts,
    pagination: {
      total: pendingProducts.length,
      page: result.page,
      totalPages: Math.ceil(pendingProducts.length / limit),
    },
  });
});

export const productController = {
  getAll,
  getById,
  create,
  update,
  delete: deleteProduct,
  approve: approveProduct,
  reject: rejectProduct,
  getPendingApprovals
};