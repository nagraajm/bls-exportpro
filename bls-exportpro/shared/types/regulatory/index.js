"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DossierSchema = exports.RegulatoryAlertSchema = exports.ComplianceChecklistSchema = exports.RegulatoryRequirementSchema = exports.RegistrationSchema = exports.ComplianceStatusEnum = void 0;
const zod_1 = require("zod");
exports.ComplianceStatusEnum = zod_1.z.enum(['pending', 'submitted', 'under_review', 'approved', 'rejected', 'expired', 'renewal_due']);
exports.RegistrationSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    country: zod_1.z.string().min(1, 'Country is required'),
    countryCode: zod_1.z.string().length(2, 'Country code must be 2 characters'),
    productId: zod_1.z.string().uuid(),
    registrationNo: zod_1.z.string().min(1, 'Registration number is required'),
    registrationType: zod_1.z.enum(['new', 'renewal', 'variation', 'extension']),
    dossierNo: zod_1.z.string().min(1, 'Dossier number is required'),
    dossierType: zod_1.z.enum(['CTD', 'ACTD', 'eCTD', 'national']),
    status: exports.ComplianceStatusEnum,
    applicationDate: zod_1.z.date(),
    approvalDate: zod_1.z.date().optional(),
    validFrom: zod_1.z.date().optional(),
    validTo: zod_1.z.date().optional(),
    renewalDueDate: zod_1.z.date().optional(),
    regulatoryAuthority: zod_1.z.string().min(1),
    maHolder: zod_1.z.string().min(1, 'Marketing Authorization Holder is required'),
    localAgent: zod_1.z.object({
        name: zod_1.z.string(),
        address: zod_1.z.string(),
        licenseNo: zod_1.z.string(),
        contactPerson: zod_1.z.string(),
        email: zod_1.z.string().email(),
        phone: zod_1.z.string()
    }).optional(),
    fees: zod_1.z.object({
        applicationFee: zod_1.z.number().min(0),
        renewalFee: zod_1.z.number().min(0),
        currency: zod_1.z.string().length(3),
        paidAmount: zod_1.z.number().min(0),
        paymentStatus: zod_1.z.enum(['pending', 'partial', 'paid'])
    }),
    documents: zod_1.z.array(zod_1.z.object({
        documentType: zod_1.z.string(),
        fileName: zod_1.z.string(),
        uploadDate: zod_1.z.date(),
        version: zod_1.z.string(),
        status: zod_1.z.enum(['draft', 'submitted', 'approved', 'rejected'])
    })),
    variations: zod_1.z.array(zod_1.z.object({
        variationType: zod_1.z.enum(['minor', 'major', 'administrative']),
        description: zod_1.z.string(),
        submissionDate: zod_1.z.date(),
        approvalDate: zod_1.z.date().optional(),
        status: exports.ComplianceStatusEnum
    })).optional(),
    inspections: zod_1.z.array(zod_1.z.object({
        inspectionDate: zod_1.z.date(),
        inspectionType: zod_1.z.enum(['pre-approval', 'routine', 'for-cause']),
        outcome: zod_1.z.enum(['passed', 'failed', 'conditional']),
        nextInspectionDue: zod_1.z.date().optional(),
        findings: zod_1.z.string().optional()
    })).optional(),
    remarks: zod_1.z.string().optional(),
    createdBy: zod_1.z.string(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date()
});
exports.RegulatoryRequirementSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    country: zod_1.z.string(),
    countryCode: zod_1.z.string().length(2),
    requirementType: zod_1.z.enum(['registration', 'import_permit', 'quality_certificate', 'labeling', 'packaging']),
    description: zod_1.z.string(),
    applicableProducts: zod_1.z.array(zod_1.z.string()), // Product categories or specific products
    mandatoryDocuments: zod_1.z.array(zod_1.z.object({
        documentName: zod_1.z.string(),
        description: zod_1.z.string(),
        isRequired: zod_1.z.boolean(),
        validityPeriod: zod_1.z.number().optional() // in months
    })),
    processingTime: zod_1.z.number().min(0), // in days
    renewalPeriod: zod_1.z.number().optional(), // in months
    fees: zod_1.z.object({
        applicationFee: zod_1.z.number().min(0),
        renewalFee: zod_1.z.number().min(0),
        currency: zod_1.z.string().length(3)
    }).optional(),
    effectiveDate: zod_1.z.date(),
    lastUpdated: zod_1.z.date(),
    source: zod_1.z.string(), // Regulatory bulletin or notification reference
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date()
});
exports.ComplianceChecklistSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(1),
    country: zod_1.z.string(),
    productCategory: zod_1.z.string(),
    checklistItems: zod_1.z.array(zod_1.z.object({
        itemNo: zod_1.z.number(),
        category: zod_1.z.enum(['documentation', 'quality', 'labeling', 'packaging', 'regulatory']),
        requirement: zod_1.z.string(),
        description: zod_1.z.string().optional(),
        isMandatory: zod_1.z.boolean(),
        status: zod_1.z.enum(['pending', 'in_progress', 'completed', 'not_applicable']),
        completedDate: zod_1.z.date().optional(),
        completedBy: zod_1.z.string().optional(),
        attachments: zod_1.z.array(zod_1.z.object({
            fileName: zod_1.z.string(),
            uploadDate: zod_1.z.date(),
            fileType: zod_1.z.string()
        })).optional(),
        remarks: zod_1.z.string().optional()
    })),
    overallStatus: zod_1.z.enum(['pending', 'in_progress', 'completed']),
    completionPercentage: zod_1.z.number().min(0).max(100),
    targetCompletionDate: zod_1.z.date(),
    assignedTo: zod_1.z.string(),
    createdBy: zod_1.z.string(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date()
});
exports.RegulatoryAlertSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    alertType: zod_1.z.enum(['renewal_due', 'expiry_warning', 'regulation_change', 'inspection_due', 'document_update']),
    severity: zod_1.z.enum(['low', 'medium', 'high', 'critical']),
    title: zod_1.z.string(),
    description: zod_1.z.string(),
    country: zod_1.z.string().optional(),
    productId: zod_1.z.string().uuid().optional(),
    registrationId: zod_1.z.string().uuid().optional(),
    dueDate: zod_1.z.date().optional(),
    actionRequired: zod_1.z.string(),
    status: zod_1.z.enum(['active', 'acknowledged', 'resolved', 'dismissed']),
    acknowledgedBy: zod_1.z.string().optional(),
    acknowledgedDate: zod_1.z.date().optional(),
    resolvedBy: zod_1.z.string().optional(),
    resolvedDate: zod_1.z.date().optional(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date()
});
exports.DossierSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    dossierNo: zod_1.z.string().min(1),
    productId: zod_1.z.string().uuid(),
    country: zod_1.z.string(),
    dossierType: zod_1.z.enum(['CTD', 'ACTD', 'eCTD', 'national']),
    version: zod_1.z.string(),
    modules: zod_1.z.object({
        module1: zod_1.z.object({
            status: zod_1.z.enum(['not_started', 'in_progress', 'completed']),
            documents: zod_1.z.array(zod_1.z.string()),
            completionDate: zod_1.z.date().optional()
        }),
        module2: zod_1.z.object({
            status: zod_1.z.enum(['not_started', 'in_progress', 'completed']),
            sections: zod_1.z.object({
                quality: zod_1.z.boolean(),
                manufacturing: zod_1.z.boolean(),
                controlStrategy: zod_1.z.boolean()
            }),
            completionDate: zod_1.z.date().optional()
        }),
        module3: zod_1.z.object({
            status: zod_1.z.enum(['not_started', 'in_progress', 'completed']),
            sections: zod_1.z.object({
                pharmacology: zod_1.z.boolean(),
                toxicology: zod_1.z.boolean(),
                pharmacokinetics: zod_1.z.boolean()
            }),
            completionDate: zod_1.z.date().optional()
        }),
        module4: zod_1.z.object({
            status: zod_1.z.enum(['not_started', 'in_progress', 'completed']),
            clinicalStudies: zod_1.z.array(zod_1.z.string()),
            completionDate: zod_1.z.date().optional()
        }),
        module5: zod_1.z.object({
            status: zod_1.z.enum(['not_started', 'in_progress', 'completed']),
            clinicalReports: zod_1.z.array(zod_1.z.string()),
            completionDate: zod_1.z.date().optional()
        })
    }),
    submissionDate: zod_1.z.date().optional(),
    status: zod_1.z.enum(['draft', 'under_review', 'submitted', 'approved', 'rejected']),
    reviewComments: zod_1.z.array(zod_1.z.object({
        date: zod_1.z.date(),
        reviewer: zod_1.z.string(),
        section: zod_1.z.string(),
        comment: zod_1.z.string(),
        status: zod_1.z.enum(['open', 'addressed', 'closed'])
    })).optional(),
    createdBy: zod_1.z.string(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date()
});
//# sourceMappingURL=index.js.map