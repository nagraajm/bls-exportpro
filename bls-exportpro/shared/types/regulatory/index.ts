import { z } from 'zod';

export const ComplianceStatusEnum = z.enum(['pending', 'submitted', 'under_review', 'approved', 'rejected', 'expired', 'renewal_due']);

export type ComplianceStatus = z.infer<typeof ComplianceStatusEnum>;

export const RegistrationSchema = z.object({
  id: z.string().uuid(),
  country: z.string().min(1, 'Country is required'),
  countryCode: z.string().length(2, 'Country code must be 2 characters'),
  productId: z.string().uuid(),
  registrationNo: z.string().min(1, 'Registration number is required'),
  registrationType: z.enum(['new', 'renewal', 'variation', 'extension']),
  dossierNo: z.string().min(1, 'Dossier number is required'),
  dossierType: z.enum(['CTD', 'ACTD', 'eCTD', 'national']),
  status: ComplianceStatusEnum,
  applicationDate: z.date(),
  approvalDate: z.date().optional(),
  validFrom: z.date().optional(),
  validTo: z.date().optional(),
  renewalDueDate: z.date().optional(),
  regulatoryAuthority: z.string().min(1),
  maHolder: z.string().min(1, 'Marketing Authorization Holder is required'),
  localAgent: z.object({
    name: z.string(),
    address: z.string(),
    licenseNo: z.string(),
    contactPerson: z.string(),
    email: z.string().email(),
    phone: z.string()
  }).optional(),
  fees: z.object({
    applicationFee: z.number().min(0),
    renewalFee: z.number().min(0),
    currency: z.string().length(3),
    paidAmount: z.number().min(0),
    paymentStatus: z.enum(['pending', 'partial', 'paid'])
  }),
  documents: z.array(z.object({
    documentType: z.string(),
    fileName: z.string(),
    uploadDate: z.date(),
    version: z.string(),
    status: z.enum(['draft', 'submitted', 'approved', 'rejected'])
  })),
  variations: z.array(z.object({
    variationType: z.enum(['minor', 'major', 'administrative']),
    description: z.string(),
    submissionDate: z.date(),
    approvalDate: z.date().optional(),
    status: ComplianceStatusEnum
  })).optional(),
  inspections: z.array(z.object({
    inspectionDate: z.date(),
    inspectionType: z.enum(['pre-approval', 'routine', 'for-cause']),
    outcome: z.enum(['passed', 'failed', 'conditional']),
    nextInspectionDue: z.date().optional(),
    findings: z.string().optional()
  })).optional(),
  remarks: z.string().optional(),
  createdBy: z.string(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type Registration = z.infer<typeof RegistrationSchema>;

export const RegulatoryRequirementSchema = z.object({
  id: z.string().uuid(),
  country: z.string(),
  countryCode: z.string().length(2),
  requirementType: z.enum(['registration', 'import_permit', 'quality_certificate', 'labeling', 'packaging']),
  description: z.string(),
  applicableProducts: z.array(z.string()), // Product categories or specific products
  mandatoryDocuments: z.array(z.object({
    documentName: z.string(),
    description: z.string(),
    isRequired: z.boolean(),
    validityPeriod: z.number().optional() // in months
  })),
  processingTime: z.number().min(0), // in days
  renewalPeriod: z.number().optional(), // in months
  fees: z.object({
    applicationFee: z.number().min(0),
    renewalFee: z.number().min(0),
    currency: z.string().length(3)
  }).optional(),
  effectiveDate: z.date(),
  lastUpdated: z.date(),
  source: z.string(), // Regulatory bulletin or notification reference
  createdAt: z.date(),
  updatedAt: z.date()
});

export type RegulatoryRequirement = z.infer<typeof RegulatoryRequirementSchema>;

export const ComplianceChecklistSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  country: z.string(),
  productCategory: z.string(),
  checklistItems: z.array(z.object({
    itemNo: z.number(),
    category: z.enum(['documentation', 'quality', 'labeling', 'packaging', 'regulatory']),
    requirement: z.string(),
    description: z.string().optional(),
    isMandatory: z.boolean(),
    status: z.enum(['pending', 'in_progress', 'completed', 'not_applicable']),
    completedDate: z.date().optional(),
    completedBy: z.string().optional(),
    attachments: z.array(z.object({
      fileName: z.string(),
      uploadDate: z.date(),
      fileType: z.string()
    })).optional(),
    remarks: z.string().optional()
  })),
  overallStatus: z.enum(['pending', 'in_progress', 'completed']),
  completionPercentage: z.number().min(0).max(100),
  targetCompletionDate: z.date(),
  assignedTo: z.string(),
  createdBy: z.string(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type ComplianceChecklist = z.infer<typeof ComplianceChecklistSchema>;

export const RegulatoryAlertSchema = z.object({
  id: z.string().uuid(),
  alertType: z.enum(['renewal_due', 'expiry_warning', 'regulation_change', 'inspection_due', 'document_update']),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  title: z.string(),
  description: z.string(),
  country: z.string().optional(),
  productId: z.string().uuid().optional(),
  registrationId: z.string().uuid().optional(),
  dueDate: z.date().optional(),
  actionRequired: z.string(),
  status: z.enum(['active', 'acknowledged', 'resolved', 'dismissed']),
  acknowledgedBy: z.string().optional(),
  acknowledgedDate: z.date().optional(),
  resolvedBy: z.string().optional(),
  resolvedDate: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type RegulatoryAlert = z.infer<typeof RegulatoryAlertSchema>;

export const DossierSchema = z.object({
  id: z.string().uuid(),
  dossierNo: z.string().min(1),
  productId: z.string().uuid(),
  country: z.string(),
  dossierType: z.enum(['CTD', 'ACTD', 'eCTD', 'national']),
  version: z.string(),
  modules: z.object({
    module1: z.object({
      status: z.enum(['not_started', 'in_progress', 'completed']),
      documents: z.array(z.string()),
      completionDate: z.date().optional()
    }),
    module2: z.object({
      status: z.enum(['not_started', 'in_progress', 'completed']),
      sections: z.object({
        quality: z.boolean(),
        manufacturing: z.boolean(),
        controlStrategy: z.boolean()
      }),
      completionDate: z.date().optional()
    }),
    module3: z.object({
      status: z.enum(['not_started', 'in_progress', 'completed']),
      sections: z.object({
        pharmacology: z.boolean(),
        toxicology: z.boolean(),
        pharmacokinetics: z.boolean()
      }),
      completionDate: z.date().optional()
    }),
    module4: z.object({
      status: z.enum(['not_started', 'in_progress', 'completed']),
      clinicalStudies: z.array(z.string()),
      completionDate: z.date().optional()
    }),
    module5: z.object({
      status: z.enum(['not_started', 'in_progress', 'completed']),
      clinicalReports: z.array(z.string()),
      completionDate: z.date().optional()
    })
  }),
  submissionDate: z.date().optional(),
  status: z.enum(['draft', 'under_review', 'submitted', 'approved', 'rejected']),
  reviewComments: z.array(z.object({
    date: z.date(),
    reviewer: z.string(),
    section: z.string(),
    comment: z.string(),
    status: z.enum(['open', 'addressed', 'closed'])
  })).optional(),
  createdBy: z.string(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type Dossier = z.infer<typeof DossierSchema>;