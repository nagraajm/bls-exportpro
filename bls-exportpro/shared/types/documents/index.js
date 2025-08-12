"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShippingDocumentSchema = exports.CertificateOfAnalysisSchema = exports.PurchaseOrderSchema = exports.PurchaseOrderItemSchema = exports.PackingListSchema = exports.PackingListItemSchema = exports.InvoiceSchema = exports.InvoiceItemSchema = void 0;
const zod_1 = require("zod");
const product_1 = require("../product");
const business_1 = require("../business");
exports.InvoiceItemSchema = zod_1.z.object({
    lineNo: zod_1.z.number().min(1),
    productId: zod_1.z.string().uuid(),
    productDetails: product_1.ProductSchema.optional(), // Populated when needed
    batchId: zod_1.z.string().uuid(),
    batchDetails: product_1.BatchInfoSchema.optional(), // Populated when needed
    quantity: zod_1.z.number().min(1),
    unitPrice: zod_1.z.number().min(0),
    currency: zod_1.z.enum(['USD', 'EUR', 'GBP', 'INR']),
    totalPrice: zod_1.z.number().min(0),
    HSNCode: zod_1.z.string(),
    taxRate: zod_1.z.number().min(0).max(100),
    taxAmount: zod_1.z.number().min(0),
    discount: zod_1.z.number().min(0).default(0),
    netAmount: zod_1.z.number().min(0)
});
exports.InvoiceSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    invoiceNo: zod_1.z.string().min(1, 'Invoice number is required'),
    invoiceType: zod_1.z.enum(['proforma', 'preshipment', 'postshipment', 'commercial', 'tax']),
    invoiceDate: zod_1.z.date(),
    customerId: zod_1.z.string().uuid(),
    customerDetails: business_1.CustomerSchema.optional(), // Populated when needed
    buyerOrderNo: zod_1.z.string().optional(),
    buyerOrderDate: zod_1.z.date().optional(),
    items: zod_1.z.array(exports.InvoiceItemSchema).min(1, 'At least one item is required'),
    currency: zod_1.z.enum(['USD', 'EUR', 'GBP', 'INR']),
    exchangeRate: zod_1.z.number().min(0).optional(),
    subtotal: zod_1.z.number().min(0),
    totalTax: zod_1.z.number().min(0),
    shippingCharges: zod_1.z.number().min(0).default(0),
    otherCharges: zod_1.z.number().min(0).default(0),
    totalAmount: zod_1.z.number().min(0),
    incoterms: zod_1.z.enum(['EXW', 'FCA', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP', 'FAS', 'FOB', 'CFR', 'CIF']),
    paymentTerms: zod_1.z.string(),
    paymentDueDate: zod_1.z.date().optional(),
    bankDetails: zod_1.z.object({
        bankName: zod_1.z.string(),
        accountNumber: zod_1.z.string(),
        swiftCode: zod_1.z.string(),
        iban: zod_1.z.string().optional(),
        correspondentBank: zod_1.z.string().optional()
    }),
    shippingDetails: zod_1.z.object({
        portOfLoading: zod_1.z.string(),
        portOfDischarge: zod_1.z.string(),
        finalDestination: zod_1.z.string().optional(),
        vesselName: zod_1.z.string().optional(),
        voyageNo: zod_1.z.string().optional(),
        containerNo: zod_1.z.string().optional(),
        sealNo: zod_1.z.string().optional()
    }).optional(),
    status: zod_1.z.enum(['draft', 'sent', 'paid', 'cancelled', 'overdue']),
    notes: zod_1.z.string().optional(),
    termsAndConditions: zod_1.z.string().optional(),
    createdBy: zod_1.z.string(),
    approvedBy: zod_1.z.string().optional(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date()
});
exports.PackingListItemSchema = zod_1.z.object({
    lineNo: zod_1.z.number().min(1),
    productId: zod_1.z.string().uuid(),
    productDetails: product_1.ProductSchema.optional(),
    batchId: zod_1.z.string().uuid(),
    batchDetails: product_1.BatchInfoSchema.optional(),
    quantity: zod_1.z.number().min(1),
    unitOfMeasure: zod_1.z.string(),
    packagingType: zod_1.z.enum(['carton', 'pallet', 'drum', 'bag', 'container']),
    numberOfPackages: zod_1.z.number().min(1),
    grossWeight: zod_1.z.number().min(0),
    netWeight: zod_1.z.number().min(0),
    weightUnit: zod_1.z.enum(['kg', 'lbs', 'mt']),
    dimensions: zod_1.z.object({
        length: zod_1.z.number().min(0),
        width: zod_1.z.number().min(0),
        height: zod_1.z.number().min(0),
        unit: zod_1.z.enum(['cm', 'inch', 'm'])
    }).optional(),
    markings: zod_1.z.string().optional()
});
exports.PackingListSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    packingListNo: zod_1.z.string().min(1, 'Packing list number is required'),
    invoiceId: zod_1.z.string().uuid(),
    invoiceNo: zod_1.z.string(),
    date: zod_1.z.date(),
    customerId: zod_1.z.string().uuid(),
    customerDetails: business_1.CustomerSchema.optional(),
    items: zod_1.z.array(exports.PackingListItemSchema).min(1),
    totalPackages: zod_1.z.number().min(1),
    totalGrossWeight: zod_1.z.number().min(0),
    totalNetWeight: zod_1.z.number().min(0),
    weightUnit: zod_1.z.enum(['kg', 'lbs', 'mt']),
    totalVolume: zod_1.z.number().min(0).optional(),
    volumeUnit: zod_1.z.enum(['cbm', 'cft']).optional(),
    shippers: zod_1.z.array(zod_1.z.object({
        shipperNo: zod_1.z.string(),
        description: zod_1.z.string(),
        quantity: zod_1.z.number().min(1),
        weight: zod_1.z.number().min(0)
    })),
    containerDetails: zod_1.z.array(zod_1.z.object({
        containerNo: zod_1.z.string(),
        sealNo: zod_1.z.string(),
        size: zod_1.z.enum(['20ft', '40ft', '40ftHC']),
        packagesLoaded: zod_1.z.number().min(1)
    })).optional(),
    specialInstructions: zod_1.z.string().optional(),
    preparedBy: zod_1.z.string(),
    checkedBy: zod_1.z.string().optional(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date()
});
exports.PurchaseOrderItemSchema = zod_1.z.object({
    lineNo: zod_1.z.number().min(1),
    productId: zod_1.z.string().uuid(),
    productDetails: product_1.ProductSchema.optional(),
    quantity: zod_1.z.number().min(1),
    unitPrice: zod_1.z.number().min(0),
    currency: zod_1.z.enum(['INR', 'USD', 'EUR']),
    totalPrice: zod_1.z.number().min(0),
    deliveryDate: zod_1.z.date(),
    specifications: zod_1.z.string().optional(),
    qualityParameters: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional()
});
exports.PurchaseOrderSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    poNumber: zod_1.z.string().min(1, 'PO number is required'),
    poDate: zod_1.z.date(),
    supplierId: zod_1.z.string().uuid(),
    supplierDetails: business_1.SupplierSchema.optional(),
    items: zod_1.z.array(exports.PurchaseOrderItemSchema).min(1),
    currency: zod_1.z.enum(['INR', 'USD', 'EUR']),
    subtotal: zod_1.z.number().min(0),
    taxAmount: zod_1.z.number().min(0),
    totalAmount: zod_1.z.number().min(0),
    deliveryTerms: zod_1.z.object({
        deliveryLocation: zod_1.z.string(),
        deliveryDate: zod_1.z.date(),
        partialDelivery: zod_1.z.boolean().default(false),
        transportMode: zod_1.z.enum(['road', 'rail', 'air', 'sea']).optional()
    }),
    paymentTerms: zod_1.z.object({
        creditDays: zod_1.z.number().min(0),
        advancePercentage: zod_1.z.number().min(0).max(100).default(0),
        paymentMode: zod_1.z.enum(['bank_transfer', 'LC', 'cheque', 'cash'])
    }),
    termsAndConditions: zod_1.z.array(zod_1.z.string()),
    specialInstructions: zod_1.z.string().optional(),
    status: zod_1.z.enum(['draft', 'sent', 'acknowledged', 'partial', 'completed', 'cancelled']),
    approvalStatus: zod_1.z.enum(['pending', 'approved', 'rejected']),
    approvedBy: zod_1.z.string().optional(),
    approvalDate: zod_1.z.date().optional(),
    createdBy: zod_1.z.string(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date()
});
exports.CertificateOfAnalysisSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    certificateNo: zod_1.z.string().min(1),
    batchId: zod_1.z.string().uuid(),
    productId: zod_1.z.string().uuid(),
    issueDate: zod_1.z.date(),
    testParameters: zod_1.z.array(zod_1.z.object({
        parameter: zod_1.z.string(),
        specification: zod_1.z.string(),
        result: zod_1.z.string(),
        testMethod: zod_1.z.string(),
        status: zod_1.z.enum(['pass', 'fail'])
    })),
    overallStatus: zod_1.z.enum(['pass', 'fail']),
    testedBy: zod_1.z.string(),
    approvedBy: zod_1.z.string(),
    laboratoryName: zod_1.z.string(),
    laboratoryAccreditation: zod_1.z.string().optional(),
    remarks: zod_1.z.string().optional(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date()
});
exports.ShippingDocumentSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    documentType: zod_1.z.enum(['BL', 'AWB', 'CMR', 'LR']),
    documentNo: zod_1.z.string().min(1),
    issueDate: zod_1.z.date(),
    invoiceId: zod_1.z.string().uuid(),
    shipperId: zod_1.z.string(),
    consigneeId: zod_1.z.string().uuid(),
    notifyParty: zod_1.z.string().optional(),
    vesselName: zod_1.z.string().optional(),
    voyageNo: zod_1.z.string().optional(),
    flightNo: zod_1.z.string().optional(),
    portOfLoading: zod_1.z.string(),
    portOfDischarge: zod_1.z.string(),
    placeOfDelivery: zod_1.z.string().optional(),
    containerDetails: zod_1.z.array(zod_1.z.object({
        containerNo: zod_1.z.string(),
        sealNo: zod_1.z.string(),
        size: zod_1.z.string()
    })).optional(),
    goodsDescription: zod_1.z.string(),
    grossWeight: zod_1.z.string(),
    netWeight: zod_1.z.string().optional(),
    freight: zod_1.z.enum(['prepaid', 'collect']),
    freightAmount: zod_1.z.number().optional(),
    status: zod_1.z.enum(['draft', 'issued', 'surrendered', 'released']),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date()
});
//# sourceMappingURL=index.js.map