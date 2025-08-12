"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CostCenterSchema = exports.FinancialTransactionSchema = exports.TaxConfigurationSchema = exports.BankingDetailsSchema = exports.PaymentStatusSchema = exports.CalculationSchema = exports.PaymentTermsSchema = exports.ExchangeRateSchema = exports.CurrencySchema = void 0;
const zod_1 = require("zod");
exports.CurrencySchema = zod_1.z.enum(['USD', 'EUR', 'GBP', 'INR', 'AED', 'SAR', 'CNY', 'JPY', 'AUD', 'CAD']);
exports.ExchangeRateSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    fromCurrency: exports.CurrencySchema,
    toCurrency: exports.CurrencySchema,
    rate: zod_1.z.number().min(0),
    effectiveDate: zod_1.z.date(),
    expiryDate: zod_1.z.date().optional(),
    source: zod_1.z.enum(['RBI', 'market', 'custom', 'bank']),
    isActive: zod_1.z.boolean(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date()
});
exports.PaymentTermsSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(1),
    description: zod_1.z.string(),
    creditDays: zod_1.z.number().min(0).max(365),
    paymentMethod: zod_1.z.enum(['bank_transfer', 'LC', 'CAD', 'DA', 'DP', 'open_account']),
    advancePercentage: zod_1.z.number().min(0).max(100).default(0),
    lcTerms: zod_1.z.object({
        lcType: zod_1.z.enum(['sight', 'usance', 'revolving', 'standby']),
        issuingBank: zod_1.z.string().optional(),
        confirmingBank: zod_1.z.string().optional(),
        usanceDays: zod_1.z.number().optional(),
        tolerancePercentage: zod_1.z.number().min(0).max(10).optional()
    }).optional(),
    penaltyTerms: zod_1.z.object({
        gracePeriod: zod_1.z.number().min(0), // days
        penaltyRate: zod_1.z.number().min(0).max(100), // percentage per annum
        compoundInterval: zod_1.z.enum(['daily', 'monthly', 'quarterly', 'annually']).optional()
    }).optional(),
    isDefault: zod_1.z.boolean().default(false),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date()
});
exports.CalculationSchema = zod_1.z.object({
    FOB: zod_1.z.object({
        productCost: zod_1.z.number().min(0),
        packagingCost: zod_1.z.number().min(0),
        inlandFreight: zod_1.z.number().min(0),
        handlingCharges: zod_1.z.number().min(0),
        documentationCharges: zod_1.z.number().min(0),
        otherCharges: zod_1.z.number().min(0).default(0),
        total: zod_1.z.number().min(0)
    }),
    CIF: zod_1.z.object({
        FOBValue: zod_1.z.number().min(0),
        freightCharges: zod_1.z.number().min(0),
        insuranceCharges: zod_1.z.number().min(0),
        total: zod_1.z.number().min(0)
    }),
    IGST: zod_1.z.object({
        taxableValue: zod_1.z.number().min(0),
        rate: zod_1.z.number().min(0).max(28), // percentage
        amount: zod_1.z.number().min(0),
        isLUT: zod_1.z.boolean().default(false),
        lutNo: zod_1.z.string().optional(),
        lutValidUpto: zod_1.z.date().optional()
    }).optional(),
    drawback: zod_1.z.object({
        scheme: zod_1.z.enum(['DBK', 'RoDTEP', 'RoSCTL', 'MEIS']),
        rate: zod_1.z.number().min(0).max(100), // percentage or per unit
        rateType: zod_1.z.enum(['percentage', 'per_unit']),
        capAmount: zod_1.z.number().optional(),
        calculatedAmount: zod_1.z.number().min(0),
        claimStatus: zod_1.z.enum(['eligible', 'claimed', 'received', 'rejected']).optional()
    }).optional(),
    RODTEP: zod_1.z.object({
        rate: zod_1.z.number().min(0).max(10), // percentage
        amount: zod_1.z.number().min(0),
        certificateNo: zod_1.z.string().optional(),
        claimDate: zod_1.z.date().optional(),
        status: zod_1.z.enum(['pending', 'claimed', 'credited', 'utilized']).optional()
    }).optional(),
    profitMargin: zod_1.z.object({
        percentage: zod_1.z.number().min(0).max(100),
        amount: zod_1.z.number().min(0)
    }).optional(),
    finalPrice: zod_1.z.number().min(0),
    currency: exports.CurrencySchema
});
exports.PaymentStatusSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    invoiceId: zod_1.z.string().uuid(),
    invoiceNo: zod_1.z.string(),
    totalAmount: zod_1.z.number().min(0),
    currency: exports.CurrencySchema,
    paidAmount: zod_1.z.number().min(0),
    pendingAmount: zod_1.z.number().min(0),
    status: zod_1.z.enum(['pending', 'partial', 'paid', 'overdue', 'written_off']),
    dueDate: zod_1.z.date(),
    payments: zod_1.z.array(zod_1.z.object({
        paymentId: zod_1.z.string().uuid(),
        paymentDate: zod_1.z.date(),
        amount: zod_1.z.number().min(0),
        currency: exports.CurrencySchema,
        exchangeRate: zod_1.z.number().optional(),
        paymentMethod: zod_1.z.enum(['bank_transfer', 'cheque', 'LC', 'cash', 'offset']),
        referenceNo: zod_1.z.string(),
        bankCharges: zod_1.z.number().min(0).default(0),
        remarks: zod_1.z.string().optional()
    })),
    lastPaymentDate: zod_1.z.date().optional(),
    remindersSent: zod_1.z.number().default(0),
    lastReminderDate: zod_1.z.date().optional(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date()
});
exports.BankingDetailsSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    accountName: zod_1.z.string().min(1),
    bankName: zod_1.z.string().min(1),
    branchName: zod_1.z.string(),
    accountNumber: zod_1.z.string().min(1),
    accountType: zod_1.z.enum(['current', 'savings', 'od', 'cc']),
    currency: exports.CurrencySchema,
    ifscCode: zod_1.z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/).optional(), // For Indian banks
    swiftCode: zod_1.z.string().min(8).max(11).optional(),
    iban: zod_1.z.string().optional(),
    routingNumber: zod_1.z.string().optional(), // For US banks
    sortCode: zod_1.z.string().optional(), // For UK banks
    correspondentBank: zod_1.z.object({
        bankName: zod_1.z.string(),
        swiftCode: zod_1.z.string(),
        accountNumber: zod_1.z.string().optional(),
        address: zod_1.z.string()
    }).optional(),
    isActive: zod_1.z.boolean().default(true),
    isPrimary: zod_1.z.boolean().default(false),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date()
});
exports.TaxConfigurationSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    country: zod_1.z.string(),
    taxType: zod_1.z.enum(['GST', 'VAT', 'sales_tax', 'customs_duty']),
    taxName: zod_1.z.string(),
    rate: zod_1.z.number().min(0).max(100),
    applicableOn: zod_1.z.enum(['FOB', 'CIF', 'product_value']),
    effectiveFrom: zod_1.z.date(),
    effectiveTo: zod_1.z.date().optional(),
    HSNCodeRanges: zod_1.z.array(zod_1.z.object({
        fromHSN: zod_1.z.string(),
        toHSN: zod_1.z.string(),
        specificRate: zod_1.z.number().optional()
    })).optional(),
    exemptions: zod_1.z.array(zod_1.z.object({
        condition: zod_1.z.string(),
        exemptionPercentage: zod_1.z.number().min(0).max(100)
    })).optional(),
    isActive: zod_1.z.boolean().default(true),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date()
});
exports.FinancialTransactionSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    transactionType: zod_1.z.enum(['sale', 'purchase', 'payment_received', 'payment_made', 'refund', 'credit_note', 'debit_note']),
    transactionDate: zod_1.z.date(),
    referenceType: zod_1.z.enum(['invoice', 'purchase_order', 'payment', 'journal']),
    referenceId: zod_1.z.string().uuid(),
    referenceNo: zod_1.z.string(),
    description: zod_1.z.string(),
    debitAccount: zod_1.z.string(),
    creditAccount: zod_1.z.string(),
    amount: zod_1.z.number().min(0),
    currency: exports.CurrencySchema,
    exchangeRate: zod_1.z.number().optional(),
    baseAmount: zod_1.z.number().min(0), // Amount in base currency
    taxAmount: zod_1.z.number().min(0).default(0),
    netAmount: zod_1.z.number().min(0),
    status: zod_1.z.enum(['pending', 'posted', 'reversed']),
    postedBy: zod_1.z.string().optional(),
    postedDate: zod_1.z.date().optional(),
    reversalReason: zod_1.z.string().optional(),
    createdBy: zod_1.z.string(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date()
});
exports.CostCenterSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    code: zod_1.z.string().min(1),
    name: zod_1.z.string().min(1),
    type: zod_1.z.enum(['export', 'manufacturing', 'logistics', 'regulatory', 'admin']),
    parentId: zod_1.z.string().uuid().optional(),
    budget: zod_1.z.object({
        annual: zod_1.z.number().min(0),
        quarterly: zod_1.z.number().min(0),
        monthly: zod_1.z.number().min(0),
        currency: exports.CurrencySchema
    }).optional(),
    actualSpend: zod_1.z.object({
        currentMonth: zod_1.z.number().min(0),
        currentQuarter: zod_1.z.number().min(0),
        currentYear: zod_1.z.number().min(0),
        currency: exports.CurrencySchema
    }).optional(),
    manager: zod_1.z.string(),
    isActive: zod_1.z.boolean().default(true),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date()
});
//# sourceMappingURL=index.js.map