"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FreightForwarderSchema = exports.ManufacturerSchema = exports.SupplierSchema = exports.CustomerSchema = exports.ContactDetailsSchema = exports.AddressSchema = void 0;
const zod_1 = require("zod");
exports.AddressSchema = zod_1.z.object({
    line1: zod_1.z.string().min(1, 'Address line 1 is required'),
    line2: zod_1.z.string().optional(),
    city: zod_1.z.string().min(1, 'City is required'),
    state: zod_1.z.string().min(1, 'State/Province is required'),
    postalCode: zod_1.z.string().min(1, 'Postal code is required'),
    country: zod_1.z.string().min(1, 'Country is required'),
    countryCode: zod_1.z.string().length(2, 'Country code must be 2 characters')
});
exports.ContactDetailsSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Contact name is required'),
    designation: zod_1.z.string().optional(),
    email: zod_1.z.string().email('Invalid email address'),
    phone: zod_1.z.string().regex(/^\+?[\d\s-()]+$/, 'Invalid phone number'),
    mobile: zod_1.z.string().regex(/^\+?[\d\s-()]+$/, 'Invalid mobile number').optional(),
    isPrimary: zod_1.z.boolean().default(false)
});
exports.CustomerSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(1, 'Customer name is required'),
    country: zod_1.z.string().min(1, 'Country is required'),
    countryCode: zod_1.z.string().length(2, 'Country code must be 2 characters'),
    address: exports.AddressSchema,
    registrationNo: zod_1.z.string().min(1, 'Registration number is required'),
    taxId: zod_1.z.string().optional(),
    importLicenseNo: zod_1.z.string().optional(),
    contactDetails: zod_1.z.array(exports.ContactDetailsSchema).min(1, 'At least one contact is required'),
    customerType: zod_1.z.enum(['distributor', 'hospital', 'pharmacy', 'government', 'other']),
    status: zod_1.z.enum(['active', 'inactive', 'blacklisted']),
    creditLimit: zod_1.z.number().min(0).optional(),
    paymentTerms: zod_1.z.number().min(0).max(180).optional(), // days
    bankDetails: zod_1.z.object({
        bankName: zod_1.z.string(),
        accountNumber: zod_1.z.string(),
        swiftCode: zod_1.z.string().optional(),
        iban: zod_1.z.string().optional(),
        routingNumber: zod_1.z.string().optional()
    }).optional(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date()
});
exports.SupplierSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(1, 'Supplier name is required'),
    GSTIN: zod_1.z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GSTIN format'),
    address: exports.AddressSchema,
    products: zod_1.z.array(zod_1.z.string().uuid()), // Array of product IDs
    licenseNumbers: zod_1.z.object({
        drugLicense: zod_1.z.string().optional(),
        manufacturingLicense: zod_1.z.string().optional(),
        gmpCertificate: zod_1.z.string().optional(),
        isoNumber: zod_1.z.string().optional(),
        whoGmpNumber: zod_1.z.string().optional()
    }),
    contactDetails: zod_1.z.array(exports.ContactDetailsSchema).min(1, 'At least one contact is required'),
    supplierType: zod_1.z.enum(['manufacturer', 'trader', 'importer', 'distributor']),
    status: zod_1.z.enum(['active', 'inactive', 'suspended']),
    qualityRating: zod_1.z.number().min(0).max(5).optional(),
    deliveryRating: zod_1.z.number().min(0).max(5).optional(),
    paymentTerms: zod_1.z.number().min(0).max(180).optional(), // days
    bankDetails: zod_1.z.object({
        bankName: zod_1.z.string(),
        accountNumber: zod_1.z.string(),
        ifscCode: zod_1.z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code'),
        branch: zod_1.z.string()
    }),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date()
});
exports.ManufacturerSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(1, 'Manufacturer name is required'),
    location: exports.AddressSchema,
    plantAddress: exports.AddressSchema.optional(),
    certifications: zod_1.z.object({
        whoGmp: zod_1.z.object({
            certificateNo: zod_1.z.string(),
            validFrom: zod_1.z.date(),
            validTo: zod_1.z.date(),
            issuingAuthority: zod_1.z.string()
        }).optional(),
        usFda: zod_1.z.object({
            facilityId: zod_1.z.string(),
            registrationNo: zod_1.z.string(),
            validFrom: zod_1.z.date(),
            validTo: zod_1.z.date()
        }).optional(),
        euGmp: zod_1.z.object({
            certificateNo: zod_1.z.string(),
            validFrom: zod_1.z.date(),
            validTo: zod_1.z.date(),
            issuingAuthority: zod_1.z.string()
        }).optional(),
        iso: zod_1.z.array(zod_1.z.object({
            standard: zod_1.z.enum(['ISO9001', 'ISO14001', 'ISO45001', 'ISO22000']),
            certificateNo: zod_1.z.string(),
            validFrom: zod_1.z.date(),
            validTo: zod_1.z.date(),
            certifyingBody: zod_1.z.string()
        })).optional(),
        other: zod_1.z.array(zod_1.z.object({
            name: zod_1.z.string(),
            certificateNo: zod_1.z.string(),
            validFrom: zod_1.z.date(),
            validTo: zod_1.z.date(),
            issuingAuthority: zod_1.z.string()
        })).optional()
    }),
    drugLicenseNo: zod_1.z.string(),
    manufacturingLicenseNo: zod_1.z.string(),
    contactDetails: zod_1.z.array(exports.ContactDetailsSchema),
    products: zod_1.z.array(zod_1.z.string().uuid()), // Array of product IDs
    status: zod_1.z.enum(['active', 'inactive', 'suspended']),
    inspectionHistory: zod_1.z.array(zod_1.z.object({
        date: zod_1.z.date(),
        authority: zod_1.z.string(),
        result: zod_1.z.enum(['passed', 'failed', 'conditional']),
        nextInspectionDue: zod_1.z.date().optional(),
        remarks: zod_1.z.string().optional()
    })).optional(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date()
});
exports.FreightForwarderSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(1, 'Freight forwarder name is required'),
    address: exports.AddressSchema,
    contactDetails: zod_1.z.array(exports.ContactDetailsSchema),
    services: zod_1.z.array(zod_1.z.enum(['ocean', 'air', 'road', 'rail', 'multimodal'])),
    iataCode: zod_1.z.string().optional(),
    fmcNumber: zod_1.z.string().optional(),
    customsClearance: zod_1.z.boolean(),
    dangerousGoodsLicense: zod_1.z.boolean(),
    coldChainCapability: zod_1.z.boolean(),
    trackingUrl: zod_1.z.string().url().optional(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date()
});
//# sourceMappingURL=index.js.map