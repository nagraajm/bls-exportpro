"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductInventorySchema = exports.PackagingMaterialSchema = exports.BatchInfoSchema = exports.ProductSchema = void 0;
const zod_1 = require("zod");
exports.ProductSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    brandName: zod_1.z.string().min(1, 'Brand name is required'),
    genericName: zod_1.z.string().min(1, 'Generic name is required'),
    strength: zod_1.z.string().min(1, 'Strength is required'),
    packSize: zod_1.z.string().min(1, 'Pack size is required'),
    HSNCode: zod_1.z.string().regex(/^\d{4,8}$/, 'HSN Code must be 4-8 digits'),
    therapeuticCategory: zod_1.z.string().optional(),
    dosageForm: zod_1.z.string(),
    activeIngredients: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string(),
        quantity: zod_1.z.string(),
        unit: zod_1.z.string()
    })).optional(),
    shelfLife: zod_1.z.number().min(1).max(60), // months
    storageConditions: zod_1.z.string(),
    isScheduledDrug: zod_1.z.boolean().default(false),
    scheduleCategory: zod_1.z.string().optional(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date()
});
exports.BatchInfoSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    productId: zod_1.z.string().uuid(),
    batchNo: zod_1.z.string().min(1, 'Batch number is required'),
    mfgDate: zod_1.z.date(),
    expDate: zod_1.z.date(),
    quantity: zod_1.z.number().min(0),
    quantityUnit: zod_1.z.enum(['tablets', 'capsules', 'vials', 'bottles', 'strips', 'sachets']),
    availableQuantity: zod_1.z.number().min(0),
    status: zod_1.z.enum(['available', 'allocated', 'quarantine', 'expired', 'sold']),
    qualityCertificateNo: zod_1.z.string().optional(),
    releaseDate: zod_1.z.date().optional(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date()
}).refine(data => data.expDate > data.mfgDate, {
    message: 'Expiry date must be after manufacturing date',
    path: ['expDate']
});
exports.PackagingMaterialSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    productId: zod_1.z.string().uuid(),
    materialType: zod_1.z.enum(['carton', 'packInsert', 'label', 'blister', 'bottle', 'cap', 'innerBox']),
    name: zod_1.z.string(),
    specifications: zod_1.z.object({
        dimensions: zod_1.z.object({
            length: zod_1.z.number().optional(),
            width: zod_1.z.number().optional(),
            height: zod_1.z.number().optional(),
            unit: zod_1.z.enum(['mm', 'cm', 'inch']).default('mm')
        }).optional(),
        material: zod_1.z.string().optional(),
        color: zod_1.z.string().optional(),
        printDetails: zod_1.z.string().optional(),
        weight: zod_1.z.object({
            value: zod_1.z.number(),
            unit: zod_1.z.enum(['g', 'kg', 'mg'])
        }).optional()
    }),
    quantityPerUnit: zod_1.z.number().min(1),
    artworkVersion: zod_1.z.string().optional(),
    approvalStatus: zod_1.z.enum(['pending', 'approved', 'rejected']),
    approvedBy: zod_1.z.string().optional(),
    approvalDate: zod_1.z.date().optional(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date()
});
exports.ProductInventorySchema = zod_1.z.object({
    productId: zod_1.z.string().uuid(),
    totalQuantity: zod_1.z.number().min(0),
    allocatedQuantity: zod_1.z.number().min(0),
    availableQuantity: zod_1.z.number().min(0),
    reorderLevel: zod_1.z.number().min(0),
    reorderQuantity: zod_1.z.number().min(0),
    lastRestockDate: zod_1.z.date().optional(),
    averageMonthlyConsumption: zod_1.z.number().optional()
});
//# sourceMappingURL=index.js.map