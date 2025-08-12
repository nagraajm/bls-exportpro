import { z } from 'zod';

export const AddressSchema = z.object({
  line1: z.string().min(1, 'Address line 1 is required'),
  line2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State/Province is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
  countryCode: z.string().length(2, 'Country code must be 2 characters')
});

export type Address = z.infer<typeof AddressSchema>;

export const ContactDetailsSchema = z.object({
  name: z.string().min(1, 'Contact name is required'),
  designation: z.string().optional(),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\+?[\d\s-()]+$/, 'Invalid phone number'),
  mobile: z.string().regex(/^\+?[\d\s-()]+$/, 'Invalid mobile number').optional(),
  isPrimary: z.boolean().default(false)
});

export type ContactDetails = z.infer<typeof ContactDetailsSchema>;

export const CustomerSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Customer name is required'),
  country: z.string().min(1, 'Country is required'),
  countryCode: z.string().length(2, 'Country code must be 2 characters'),
  address: AddressSchema,
  registrationNo: z.string().min(1, 'Registration number is required'),
  taxId: z.string().optional(),
  importLicenseNo: z.string().optional(),
  contactDetails: z.array(ContactDetailsSchema).min(1, 'At least one contact is required'),
  customerType: z.enum(['distributor', 'hospital', 'pharmacy', 'government', 'other']),
  status: z.enum(['active', 'inactive', 'blacklisted']),
  creditLimit: z.number().min(0).optional(),
  paymentTerms: z.number().min(0).max(180).optional(), // days
  bankDetails: z.object({
    bankName: z.string(),
    accountNumber: z.string(),
    swiftCode: z.string().optional(),
    iban: z.string().optional(),
    routingNumber: z.string().optional()
  }).optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type Customer = z.infer<typeof CustomerSchema>;

export const SupplierSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Supplier name is required'),
  GSTIN: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GSTIN format'),
  address: AddressSchema,
  products: z.array(z.string().uuid()), // Array of product IDs
  licenseNumbers: z.object({
    drugLicense: z.string().optional(),
    manufacturingLicense: z.string().optional(),
    gmpCertificate: z.string().optional(),
    isoNumber: z.string().optional(),
    whoGmpNumber: z.string().optional()
  }),
  contactDetails: z.array(ContactDetailsSchema).min(1, 'At least one contact is required'),
  supplierType: z.enum(['manufacturer', 'trader', 'importer', 'distributor']),
  status: z.enum(['active', 'inactive', 'suspended']),
  qualityRating: z.number().min(0).max(5).optional(),
  deliveryRating: z.number().min(0).max(5).optional(),
  paymentTerms: z.number().min(0).max(180).optional(), // days
  bankDetails: z.object({
    bankName: z.string(),
    accountNumber: z.string(),
    ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code'),
    branch: z.string()
  }),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type Supplier = z.infer<typeof SupplierSchema>;

export const ManufacturerSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Manufacturer name is required'),
  location: AddressSchema,
  plantAddress: AddressSchema.optional(),
  certifications: z.object({
    whoGmp: z.object({
      certificateNo: z.string(),
      validFrom: z.date(),
      validTo: z.date(),
      issuingAuthority: z.string()
    }).optional(),
    usFda: z.object({
      facilityId: z.string(),
      registrationNo: z.string(),
      validFrom: z.date(),
      validTo: z.date()
    }).optional(),
    euGmp: z.object({
      certificateNo: z.string(),
      validFrom: z.date(),
      validTo: z.date(),
      issuingAuthority: z.string()
    }).optional(),
    iso: z.array(z.object({
      standard: z.enum(['ISO9001', 'ISO14001', 'ISO45001', 'ISO22000']),
      certificateNo: z.string(),
      validFrom: z.date(),
      validTo: z.date(),
      certifyingBody: z.string()
    })).optional(),
    other: z.array(z.object({
      name: z.string(),
      certificateNo: z.string(),
      validFrom: z.date(),
      validTo: z.date(),
      issuingAuthority: z.string()
    })).optional()
  }),
  drugLicenseNo: z.string(),
  manufacturingLicenseNo: z.string(),
  contactDetails: z.array(ContactDetailsSchema),
  products: z.array(z.string().uuid()), // Array of product IDs
  status: z.enum(['active', 'inactive', 'suspended']),
  inspectionHistory: z.array(z.object({
    date: z.date(),
    authority: z.string(),
    result: z.enum(['passed', 'failed', 'conditional']),
    nextInspectionDue: z.date().optional(),
    remarks: z.string().optional()
  })).optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type Manufacturer = z.infer<typeof ManufacturerSchema>;

export const FreightForwarderSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Freight forwarder name is required'),
  address: AddressSchema,
  contactDetails: z.array(ContactDetailsSchema),
  services: z.array(z.enum(['ocean', 'air', 'road', 'rail', 'multimodal'])),
  iataCode: z.string().optional(),
  fmcNumber: z.string().optional(),
  customsClearance: z.boolean(),
  dangerousGoodsLicense: z.boolean(),
  coldChainCapability: z.boolean(),
  trackingUrl: z.string().url().optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type FreightForwarder = z.infer<typeof FreightForwarderSchema>;