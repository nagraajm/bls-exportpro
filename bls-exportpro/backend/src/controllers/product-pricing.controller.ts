import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { repositories } from '../repositories';

const createPricingSchema = z.object({
  productId: z.string().uuid(),
  priceType: z.enum(['selling', 'procurement', 'market']),
  basePrice: z.number().positive(),
  effectiveFrom: z.string().datetime(),
  effectiveTo: z.string().datetime().optional(),
  margin: z.number().optional(),
  discountable: z.boolean().default(true),
  notes: z.string().optional()
});

const updatePricingSchema = z.object({
  basePrice: z.number().positive().optional(),
  effectiveFrom: z.string().datetime().optional(),
  effectiveTo: z.string().datetime().optional(),
  margin: z.number().optional(),
  discountable: z.boolean().optional(),
  notes: z.string().optional(),
  isActive: z.boolean().optional()
});

export const getPricingHistory = asyncHandler(async (req: Request, res: Response) => {
  const { productId } = req.params;
  const page = req.query.page ? Number(req.query.page) : 1;
  const limit = req.query.limit ? Number(req.query.limit) : 20;
  
  try {
    // For now, return mock pricing history data
    // TODO: Implement proper pricing repository when needed
    const mockPricingData = [
      {
        id: uuidv4(),
        productId,
        priceType: 'selling',
        basePrice: 100,
        currency: 'INR',
        effectiveFrom: new Date('2025-01-01'),
        isActive: true,
        createdAt: new Date(),
        createdBy: 'system'
      }
    ];
    
    res.json({
      status: 'success',
      data: mockPricingData,
      pagination: {
        total: mockPricingData.length,
        page,
        totalPages: 1,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch pricing history',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export const createPricing = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = createPricingSchema.parse(req.body);
  
  // Check if user has admin/manager role for creating pricing
  if (req.user?.role !== 'admin' && req.user?.role !== 'manager') {
    res.status(403).json({
      status: 'error',
      message: 'Only administrators and managers can create product pricing',
    });
    return;
  }

  const pricingData = {
    id: uuidv4(),
    ...validatedData,
    currency: 'INR' as const,
    effectiveFrom: new Date(validatedData.effectiveFrom),
    effectiveTo: validatedData.effectiveTo ? new Date(validatedData.effectiveTo) : undefined,
    isActive: true,
    approvedBy: req.user?.role === 'admin' ? req.user.id : undefined,
    createdBy: req.user?.id || 'system',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  try {
    // Deactivate previous active pricing for the same product and price type
    await repositories.productPricing.deactivatePrevious(validatedData.productId, validatedData.priceType);
    
    const pricing = await repositories.productPricing.create(pricingData);
    
    res.status(201).json({
      status: 'success',
      data: pricing,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to create pricing',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export const updatePricing = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const validatedData = updatePricingSchema.parse(req.body);
  
  // Check if user has admin/manager role for updating pricing
  if (req.user?.role !== 'admin' && req.user?.role !== 'manager') {
    res.status(403).json({
      status: 'error',
      message: 'Only administrators and managers can update product pricing',
    });
    return;
  }

  const updates = {
    ...validatedData,
    effectiveFrom: validatedData.effectiveFrom ? new Date(validatedData.effectiveFrom) : undefined,
    effectiveTo: validatedData.effectiveTo ? new Date(validatedData.effectiveTo) : undefined,
    updatedAt: new Date()
  };

  try {
    const pricing = await repositories.productPricing.update(id, updates);
    
    if (!pricing) {
      res.status(404).json({
        status: 'error',
        message: 'Pricing record not found',
      });
      return;
    }
    
    res.json({
      status: 'success',
      data: pricing,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to update pricing',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export const getActivePricing = asyncHandler(async (req: Request, res: Response) => {
  const { productId } = req.params;
  const { priceType } = req.query;
  
  try {
    const activePricing = await repositories.productPricing.getActivePricing(
      productId, 
      priceType as 'selling' | 'procurement' | 'market'
    );
    
    res.json({
      status: 'success',
      data: activePricing,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch active pricing',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export const approvePricing = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  // Only admins can approve pricing
  if (req.user?.role !== 'admin') {
    res.status(403).json({
      status: 'error',
      message: 'Only administrators can approve pricing changes',
    });
    return;
  }

  try {
    const pricing = await repositories.productPricing.update(id, {
      approvedBy: req.user.id,
      updatedAt: new Date()
    });
    
    if (!pricing) {
      res.status(404).json({
        status: 'error',
        message: 'Pricing record not found',
      });
      return;
    }
    
    res.json({
      status: 'success',
      data: pricing,
      message: 'Pricing approved successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to approve pricing',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export const pricingController = {
  getPricingHistory,
  createPricing,
  updatePricing,
  getActivePricing,
  approvePricing,
};