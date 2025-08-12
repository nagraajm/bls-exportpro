import { z } from 'zod';
import { ProductSchema, BatchInfoSchema } from '../product';
import { CustomerSchema, SupplierSchema } from '../business';

export const InvoiceItemSchema = z.object({
  lineNo: z.number().min(1),
  productId: z.string().uuid(),
  productDetails: ProductSchema.optional(), // Populated when needed
  batchId: z.string().uuid(),
  batchDetails: BatchInfoSchema.optional(), // Populated when needed
  quantity: z.number().min(1),
  unitPrice: z.number().min(0),
  currency: z.enum(['USD', 'EUR', 'GBP', 'INR']),
  totalPrice: z.number().min(0),
  HSNCode: z.string(),
  taxRate: z.number().min(0).max(100),
  taxAmount: z.number().min(0),
  discount: z.number().min(0).default(0),
  netAmount: z.number().min(0)
});

export type InvoiceItem = z.infer<typeof InvoiceItemSchema>;

export const InvoiceSchema = z.object({
  id: z.string().uuid(),
  invoiceNo: z.string().min(1, 'Invoice number is required'),
  invoiceType: z.enum(['proforma', 'preshipment', 'postshipment', 'commercial', 'tax']),
  invoiceDate: z.date(),
  customerId: z.string().uuid(),
  customerDetails: CustomerSchema.optional(), // Populated when needed
  buyerOrderNo: z.string().optional(),
  buyerOrderDate: z.date().optional(),
  items: z.array(InvoiceItemSchema).min(1, 'At least one item is required'),
  currency: z.enum(['USD', 'EUR', 'GBP', 'INR']),
  exchangeRate: z.number().min(0).optional(),
  subtotal: z.number().min(0),
  totalTax: z.number().min(0),
  shippingCharges: z.number().min(0).default(0),
  otherCharges: z.number().min(0).default(0),
  totalAmount: z.number().min(0),
  incoterms: z.enum(['EXW', 'FCA', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP', 'FAS', 'FOB', 'CFR', 'CIF']),
  paymentTerms: z.string(),
  paymentDueDate: z.date().optional(),
  bankDetails: z.object({
    bankName: z.string(),
    accountNumber: z.string(),
    swiftCode: z.string(),
    iban: z.string().optional(),
    correspondentBank: z.string().optional()
  }),
  shippingDetails: z.object({
    portOfLoading: z.string(),
    portOfDischarge: z.string(),
    finalDestination: z.string().optional(),
    vesselName: z.string().optional(),
    voyageNo: z.string().optional(),
    containerNo: z.string().optional(),
    sealNo: z.string().optional()
  }).optional(),
  status: z.enum(['draft', 'sent', 'paid', 'cancelled', 'overdue']),
  notes: z.string().optional(),
  termsAndConditions: z.string().optional(),
  createdBy: z.string(),
  approvedBy: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type Invoice = z.infer<typeof InvoiceSchema>;

export const PackingListItemSchema = z.object({
  lineNo: z.number().min(1),
  productId: z.string().uuid(),
  productDetails: ProductSchema.optional(),
  batchId: z.string().uuid(),
  batchDetails: BatchInfoSchema.optional(),
  quantity: z.number().min(1),
  unitOfMeasure: z.string(),
  packagingType: z.enum(['carton', 'pallet', 'drum', 'bag', 'container']),
  numberOfPackages: z.number().min(1),
  grossWeight: z.number().min(0),
  netWeight: z.number().min(0),
  weightUnit: z.enum(['kg', 'lbs', 'mt']),
  dimensions: z.object({
    length: z.number().min(0),
    width: z.number().min(0),
    height: z.number().min(0),
    unit: z.enum(['cm', 'inch', 'm'])
  }).optional(),
  markings: z.string().optional()
});

export type PackingListItem = z.infer<typeof PackingListItemSchema>;

export const PackingListSchema = z.object({
  id: z.string().uuid(),
  packingListNo: z.string().min(1, 'Packing list number is required'),
  invoiceId: z.string().uuid(),
  invoiceNo: z.string(),
  date: z.date(),
  customerId: z.string().uuid(),
  customerDetails: CustomerSchema.optional(),
  items: z.array(PackingListItemSchema).min(1),
  totalPackages: z.number().min(1),
  totalGrossWeight: z.number().min(0),
  totalNetWeight: z.number().min(0),
  weightUnit: z.enum(['kg', 'lbs', 'mt']),
  totalVolume: z.number().min(0).optional(),
  volumeUnit: z.enum(['cbm', 'cft']).optional(),
  shippers: z.array(z.object({
    shipperNo: z.string(),
    description: z.string(),
    quantity: z.number().min(1),
    weight: z.number().min(0)
  })),
  containerDetails: z.array(z.object({
    containerNo: z.string(),
    sealNo: z.string(),
    size: z.enum(['20ft', '40ft', '40ftHC']),
    packagesLoaded: z.number().min(1)
  })).optional(),
  specialInstructions: z.string().optional(),
  preparedBy: z.string(),
  checkedBy: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type PackingList = z.infer<typeof PackingListSchema>;

export const PurchaseOrderItemSchema = z.object({
  lineNo: z.number().min(1),
  productId: z.string().uuid(),
  productDetails: ProductSchema.optional(),
  quantity: z.number().min(1),
  unitPrice: z.number().min(0),
  currency: z.enum(['INR', 'USD', 'EUR']),
  totalPrice: z.number().min(0),
  deliveryDate: z.date(),
  specifications: z.string().optional(),
  qualityParameters: z.record(z.string(), z.any()).optional()
});

export type PurchaseOrderItem = z.infer<typeof PurchaseOrderItemSchema>;

export const PurchaseOrderSchema = z.object({
  id: z.string().uuid(),
  poNumber: z.string().min(1, 'PO number is required'),
  poDate: z.date(),
  supplierId: z.string().uuid(),
  supplierDetails: SupplierSchema.optional(),
  items: z.array(PurchaseOrderItemSchema).min(1),
  currency: z.enum(['INR', 'USD', 'EUR']),
  subtotal: z.number().min(0),
  taxAmount: z.number().min(0),
  totalAmount: z.number().min(0),
  deliveryTerms: z.object({
    deliveryLocation: z.string(),
    deliveryDate: z.date(),
    partialDelivery: z.boolean().default(false),
    transportMode: z.enum(['road', 'rail', 'air', 'sea']).optional()
  }),
  paymentTerms: z.object({
    creditDays: z.number().min(0),
    advancePercentage: z.number().min(0).max(100).default(0),
    paymentMode: z.enum(['bank_transfer', 'LC', 'cheque', 'cash'])
  }),
  termsAndConditions: z.array(z.string()),
  specialInstructions: z.string().optional(),
  status: z.enum(['draft', 'sent', 'acknowledged', 'partial', 'completed', 'cancelled']),
  approvalStatus: z.enum(['pending', 'approved', 'rejected']),
  approvedBy: z.string().optional(),
  approvalDate: z.date().optional(),
  createdBy: z.string(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type PurchaseOrder = z.infer<typeof PurchaseOrderSchema>;

export const CertificateOfAnalysisSchema = z.object({
  id: z.string().uuid(),
  certificateNo: z.string().min(1),
  batchId: z.string().uuid(),
  productId: z.string().uuid(),
  issueDate: z.date(),
  testParameters: z.array(z.object({
    parameter: z.string(),
    specification: z.string(),
    result: z.string(),
    testMethod: z.string(),
    status: z.enum(['pass', 'fail'])
  })),
  overallStatus: z.enum(['pass', 'fail']),
  testedBy: z.string(),
  approvedBy: z.string(),
  laboratoryName: z.string(),
  laboratoryAccreditation: z.string().optional(),
  remarks: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type CertificateOfAnalysis = z.infer<typeof CertificateOfAnalysisSchema>;

export const ShippingDocumentSchema = z.object({
  id: z.string().uuid(),
  documentType: z.enum(['BL', 'AWB', 'CMR', 'LR']),
  documentNo: z.string().min(1),
  issueDate: z.date(),
  invoiceId: z.string().uuid(),
  shipperId: z.string(),
  consigneeId: z.string().uuid(),
  notifyParty: z.string().optional(),
  vesselName: z.string().optional(),
  voyageNo: z.string().optional(),
  flightNo: z.string().optional(),
  portOfLoading: z.string(),
  portOfDischarge: z.string(),
  placeOfDelivery: z.string().optional(),
  containerDetails: z.array(z.object({
    containerNo: z.string(),
    sealNo: z.string(),
    size: z.string()
  })).optional(),
  goodsDescription: z.string(),
  grossWeight: z.string(),
  netWeight: z.string().optional(),
  freight: z.enum(['prepaid', 'collect']),
  freightAmount: z.number().optional(),
  status: z.enum(['draft', 'issued', 'surrendered', 'released']),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type ShippingDocument = z.infer<typeof ShippingDocumentSchema>;