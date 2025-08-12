import { z } from 'zod';

export const ProductSchema = z.object({
  id: z.string().uuid(),
  brandName: z.string().min(1, 'Brand name is required'),
  genericName: z.string().min(1, 'Generic name is required'),
  strength: z.string().min(1, 'Strength is required'),
  packSize: z.string().min(1, 'Pack size is required'),
  HSNCode: z.string().regex(/^\d{4,8}$/, 'HSN Code must be 4-8 digits'),
  therapeuticCategory: z.string().optional(),
  dosageForm: z.string(),
  activeIngredients: z.array(z.object({
    name: z.string(),
    quantity: z.string(),
    unit: z.string()
  })).optional(),
  shelfLife: z.number().min(1).max(60), // months
  storageConditions: z.string(),
  isScheduledDrug: z.boolean().default(false),
  scheduleCategory: z.string().optional(),
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