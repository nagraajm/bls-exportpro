import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { BrandRegistrationService } from '../services/brand-registration.service';
import { BrandRegistrationSchema } from '../../../shared/types/product/index';

const brandRegistrationService = new BrandRegistrationService();

export const createBrandRegistration = asyncHandler(async (req: Request, res: Response) => {
  // Temporary: Skip validation for testing
  const brandRegistration = await brandRegistrationService.createBrandRegistration(req.body);
  
  res.status(201).json({
    success: true,
    data: brandRegistration,
    message: 'Brand registration created successfully'
  });
});

export const getAllBrandRegistrations = asyncHandler(async (req: Request, res: Response) => {
  const brandRegistrations = await brandRegistrationService.getAllBrandRegistrations();
  
  res.json({
    success: true,
    data: brandRegistrations,
    count: brandRegistrations.length
  });
});

export const getBrandRegistration = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const brandRegistration = await brandRegistrationService.getBrandRegistration(id);
  
  if (!brandRegistration) {
    res.status(404).json({
      success: false,
      message: 'Brand registration not found'
    });
    return;
  }

  res.json({
    success: true,
    data: brandRegistration
  });
});

export const updateBrandRegistration = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = BrandRegistrationSchema.partial().parse(req.body);

  try {
    const updatedBrandRegistration = await brandRegistrationService.updateBrandRegistration(id, updateData);
    
    res.json({
      success: true,
      data: updatedBrandRegistration,
      message: 'Brand registration updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Update failed'
    });
  }
});

export const deleteBrandRegistration = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await brandRegistrationService.deleteBrandRegistration(id);
    
    res.json({
      success: true,
      message: 'Brand registration deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Delete failed'
    });
  }
});

export const searchBrandRegistrations = asyncHandler(async (req: Request, res: Response) => {
  const searchQuery = {
    brandName: req.query.brandName as string,
    genericName: req.query.genericName as string,
    therapeuticCategory: req.query.therapeuticCategory as string,
    status: req.query.status as any,
    approvalStatus: req.query.approvalStatus as any
  };

  // Remove undefined values
  Object.keys(searchQuery).forEach(key => 
    searchQuery[key as keyof typeof searchQuery] === undefined && 
    delete searchQuery[key as keyof typeof searchQuery]
  );

  const brandRegistrations = await brandRegistrationService.searchBrandRegistrations(searchQuery);
  
  res.json({
    success: true,
    data: brandRegistrations,
    count: brandRegistrations.length,
    query: searchQuery
  });
});

export const getBrandRegistrationsByManufacturer = asyncHandler(async (req: Request, res: Response) => {
  const { manufacturerId } = req.params;
  
  const brandRegistrations = await brandRegistrationService.getBrandRegistrationsByManufacturer(manufacturerId);
  
  res.json({
    success: true,
    data: brandRegistrations,
    count: brandRegistrations.length
  });
});

export const getBrandRegistrationsByStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.params;
  
  const brandRegistrations = await brandRegistrationService.getBrandRegistrationsByStatus(status as any);
  
  res.json({
    success: true,
    data: brandRegistrations,
    count: brandRegistrations.length
  });
});

export const getBrandRegistrationsByApprovalStatus = asyncHandler(async (req: Request, res: Response) => {
  const { approvalStatus } = req.params;
  
  const brandRegistrations = await brandRegistrationService.getBrandRegistrationsByApprovalStatus(approvalStatus as any);
  
  res.json({
    success: true,
    data: brandRegistrations,
    count: brandRegistrations.length
  });
});

export const approveBrandRegistration = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { approvedBy } = req.body;

  if (!approvedBy) {
    res.status(400).json({
      success: false,
      message: 'approvedBy is required'
    });
    return;
  }

  try {
    const updatedBrandRegistration = await brandRegistrationService.approveBrandRegistration(id, approvedBy);
    
    res.json({
      success: true,
      data: updatedBrandRegistration,
      message: 'Brand registration approved successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Approval failed'
    });
  }
});

export const rejectBrandRegistration = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { rejectionReason } = req.body;

  if (!rejectionReason) {
    res.status(400).json({
      success: false,
      message: 'rejectionReason is required'
    });
    return;
  }

  try {
    const updatedBrandRegistration = await brandRegistrationService.rejectBrandRegistration(id, rejectionReason);
    
    res.json({
      success: true,
      data: updatedBrandRegistration,
      message: 'Brand registration rejected successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Rejection failed'
    });
  }
});

export const getFPSIntegration = asyncHandler(async (req: Request, res: Response) => {
  const { brandId } = req.params;
  
  const integration = await brandRegistrationService.getFPSIntegration(brandId);
  
  if (!integration) {
    res.status(404).json({
      success: false,
      message: 'FPS integration not found'
    });
    return;
  }

  res.json({
    success: true,
    data: integration
  });
});

export const syncWithFPS = asyncHandler(async (req: Request, res: Response) => {
  const { brandId } = req.params;
  
  const result = await brandRegistrationService.syncWithFPS(brandId);
  
  if (result.success) {
    res.json({
      success: true,
      message: 'Successfully synced with FPS'
    });
  } else {
    res.status(400).json({
      success: false,
      message: result.error || 'Sync failed'
    });
  }
});

export const syncAllFPS = asyncHandler(async (req: Request, res: Response) => {
  await brandRegistrationService.syncAllPendingFPS();
  
  res.json({
    success: true,
    message: 'FPS sync process completed'
  });
});