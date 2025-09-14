import { z } from 'zod';

export const ProductPricingSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  priceType: z.enum(['selling', 'procurement', 'market']),
  basePrice: z.number().positive(),
  currency: z.enum(['INR']),
  effectiveFrom: z.date(),
  effectiveTo: z.date().optional(),
  isActive: z.boolean().default(true),
  margin: z.number().optional(), // percentage
  discountable: z.boolean().default(true),
  notes: z.string().optional(),
  approvedBy: z.string().optional(),
  createdBy: z.string(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type ProductPricing = z.infer<typeof ProductPricingSchema>;

export const ProductSchema = z.object({
  id: z.string().uuid(),
  productCode: z.string().min(1, 'Product code is required'),
  brandName: z.string().min(1, 'Brand name is required'),
  genericName: z.string().min(1, 'Generic name is required'),
  strength: z.string().min(1, 'Strength is required'),
  packSize: z.string().min(1, 'Pack size is required'),
  manufacturer: z.string().min(1, 'Manufacturer is required'),
  hsnCode: z.string().regex(/^\d{4,8}$/, 'HSN Code must be 4-8 digits'),
  therapeuticCategory: z.string().optional(),
  dosageForm: z.string(),
  activeIngredients: z.array(z.object({
    name: z.string(),
    quantity: z.string(),
    unit: z.string()
  })).optional(),
  shelfLife: z.number().min(1).max(60), // months
  storageConditions: z.string().optional(),
  isScheduledDrug: z.boolean().default(false),
  scheduleCategory: z.string().optional(),
  // Legacy pricing fields for backward compatibility
  unitPrice: z.number().positive().optional(),
  currency: z.enum(['INR', 'USD']).optional(),
  // New pricing structure
  pricing: z.array(ProductPricingSchema).optional(),
  // Admin controls
  requiresApproval: z.boolean().default(true),
  approvalStatus: z.enum(['pending', 'approved', 'rejected']).default('pending'),
  approvedBy: z.string().optional(),
  approvalDate: z.date().optional(),
  createdBy: z.string(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type Product = z.infer<typeof ProductSchema>;

export const BatchInfoSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  batchNo: z.string().min(1, 'Batch number is required'),
  mfgDate: z.date(),
  expDate: z.date(),
  quantity: z.number().min(0),
  quantityUnit: z.enum(['tablets', 'capsules', 'vials', 'bottles', 'strips', 'sachets']),
  availableQuantity: z.number().min(0),
  status: z.enum(['available', 'allocated', 'quarantine', 'expired', 'sold']),
  qualityCertificateNo: z.string().optional(),
  releaseDate: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date()
}).refine(data => data.expDate > data.mfgDate, {
  message: 'Expiry date must be after manufacturing date',
  path: ['expDate']
});

export type BatchInfo = z.infer<typeof BatchInfoSchema>;

export const PackagingMaterialSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  materialType: z.enum(['carton', 'packInsert', 'label', 'blister', 'bottle', 'cap', 'innerBox']),
  name: z.string(),
  specifications: z.object({
    dimensions: z.object({
      length: z.number().optional(),
      width: z.number().optional(),
      height: z.number().optional(),
      unit: z.enum(['mm', 'cm', 'inch']).default('mm')
    }).optional(),
    material: z.string().optional(),
    color: z.string().optional(),
    printDetails: z.string().optional(),
    weight: z.object({
      value: z.number(),
      unit: z.enum(['g', 'kg', 'mg'])
    }).optional()
  }),
  quantityPerUnit: z.number().min(1),
  artworkVersion: z.string().optional(),
  approvalStatus: z.enum(['pending', 'approved', 'rejected']),
  approvedBy: z.string().optional(),
  approvalDate: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type PackagingMaterial = z.infer<typeof PackagingMaterialSchema>;

export const ProductInventorySchema = z.object({
  productId: z.string().uuid(),
  totalQuantity: z.number().min(0),
  allocatedQuantity: z.number().min(0),
  availableQuantity: z.number().min(0),
  reorderLevel: z.number().min(0),
  reorderQuantity: z.number().min(0),
  lastRestockDate: z.date().optional(),
  averageMonthlyConsumption: z.number().optional()
});

export type ProductInventory = z.infer<typeof ProductInventorySchema>;

export const BrandRegistrationSchema = z.object({
  id: z.string().uuid(),
  brandName: z.string().min(1, 'Brand name is required'),
  brandCode: z.string().min(1, 'Brand code is required'),
  genericName: z.string().min(1, 'Generic name is required'),
  therapeuticCategory: z.string().min(1, 'Therapeutic category is required'),
  dosageForm: z.enum(['tablet', 'capsule', 'injection', 'syrup', 'ointment', 'drops', 'powder', 'suspension']),
  strength: z.string().min(1, 'Strength is required'),
  packSizes: z.array(z.object({
    size: z.string(),
    unit: z.enum(['tablets', 'capsules', 'ml', 'grams', 'vials', 'bottles']),
    packType: z.enum(['blister', 'bottle', 'vial', 'tube', 'sachet'])
  })).min(1, 'At least one pack size is required'),
  manufacturerId: z.string().uuid(),
  manufacturerDetails: z.object({
    name: z.string(),
    licenseNo: z.string(),
    address: z.string()
  }),
  fpsDetails: z.object({
    fpsNumber: z.string().min(1, 'FPS number is required'),
    fpsVersion: z.string().min(1, 'FPS version is required'),
    approvedDate: z.date(),
    expiryDate: z.date(),
    regulatoryAuthority: z.string()
  }),
  specifications: z.object({
    appearance: z.string().optional(),
    activeIngredients: z.array(z.object({
      name: z.string(),
      quantity: z.string(),
      unit: z.string()
    })),
    excipients: z.array(z.object({
      name: z.string(),
      purpose: z.string()
    })).optional(),
    shelfLife: z.number().min(1).max(60), // months
    storageConditions: z.string()
  }),
  regulatoryStatus: z.object({
    domesticApproval: z.object({
      isApproved: z.boolean(),
      approvalNumber: z.string().optional(),
      approvalDate: z.date().optional()
    }),
    exportApprovals: z.array(z.object({
      country: z.string(),
      approvalNumber: z.string(),
      approvalDate: z.date(),
      expiryDate: z.date(),
      registrationAuthority: z.string()
    })).optional()
  }),
  qualityParameters: z.array(z.object({
    parameter: z.string(),
    specification: z.string(),
    testMethod: z.string(),
    acceptanceCriteria: z.string()
  })).optional(),
  status: z.enum(['active', 'inactive', 'discontinued', 'under_development']),
  approvalWorkflow: z.object({
    status: z.enum(['pending', 'approved', 'rejected']),
    approvedBy: z.string().optional(),
    approvalDate: z.date().optional(),
    rejectionReason: z.string().optional()
  }),
  createdBy: z.string(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type BrandRegistration = z.infer<typeof BrandRegistrationSchema>;

export const FPSIntegrationSchema = z.object({
  id: z.string().uuid(),
  brandId: z.string().uuid(),
  fpsSystemId: z.string(),
  syncStatus: z.enum(['pending', 'synced', 'failed', 'outdated']),
  lastSyncDate: z.date().optional(),
  syncErrors: z.array(z.string()).optional(),
  autoSync: z.boolean().default(true),
  syncFrequency: z.enum(['realtime', 'hourly', 'daily', 'manual']).default('daily'),
  mappingConfig: z.object({
    fieldMappings: z.record(z.string(), z.string()), // Local field -> FPS field
    transformRules: z.array(z.object({
      field: z.string(),
      rule: z.string(),
      parameters: z.record(z.string(), z.any()).optional()
    })).optional()
  }).optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type FPSIntegration = z.infer<typeof FPSIntegrationSchema>;