import { z } from 'zod';

export const CurrencySchema = z.enum(['USD', 'EUR', 'GBP', 'INR', 'AED', 'SAR', 'CNY', 'JPY', 'AUD', 'CAD']);

export type Currency = z.infer<typeof CurrencySchema>;

export const ExchangeRateSchema = z.object({
  id: z.string().uuid(),
  fromCurrency: CurrencySchema,
  toCurrency: CurrencySchema,
  rate: z.number().min(0),
  effectiveDate: z.date(),
  expiryDate: z.date().optional(),
  source: z.enum(['RBI', 'market', 'custom', 'bank']),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type ExchangeRate = z.infer<typeof ExchangeRateSchema>;

export const PaymentTermsSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string(),
  creditDays: z.number().min(0).max(365),
  paymentMethod: z.enum(['bank_transfer', 'LC', 'CAD', 'DA', 'DP', 'open_account']),
  advancePercentage: z.number().min(0).max(100).default(0),
  lcTerms: z.object({
    lcType: z.enum(['sight', 'usance', 'revolving', 'standby']),
    issuingBank: z.string().optional(),
    confirmingBank: z.string().optional(),
    usanceDays: z.number().optional(),
    tolerancePercentage: z.number().min(0).max(10).optional()
  }).optional(),
  penaltyTerms: z.object({
    gracePeriod: z.number().min(0), // days
    penaltyRate: z.number().min(0).max(100), // percentage per annum
    compoundInterval: z.enum(['daily', 'monthly', 'quarterly', 'annually']).optional()
  }).optional(),
  isDefault: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type PaymentTerms = z.infer<typeof PaymentTermsSchema>;

export const CalculationSchema = z.object({
  FOB: z.object({
    productCost: z.number().min(0),
    packagingCost: z.number().min(0),
    inlandFreight: z.number().min(0),
    handlingCharges: z.number().min(0),
    documentationCharges: z.number().min(0),
    otherCharges: z.number().min(0).default(0),
    total: z.number().min(0)
  }),
  CIF: z.object({
    FOBValue: z.number().min(0),
    freightCharges: z.number().min(0),
    insuranceCharges: z.number().min(0),
    total: z.number().min(0)
  }),
  IGST: z.object({
    taxableValue: z.number().min(0),
    rate: z.number().min(0).max(28), // percentage
    amount: z.number().min(0),
    isLUT: z.boolean().default(false),
    lutNo: z.string().optional(),
    lutValidUpto: z.date().optional()
  }).optional(),
  drawback: z.object({
    scheme: z.enum(['DBK', 'RoDTEP', 'RoSCTL', 'MEIS']),
    rate: z.number().min(0).max(100), // percentage or per unit
    rateType: z.enum(['percentage', 'per_unit']),
    capAmount: z.number().optional(),
    calculatedAmount: z.number().min(0),
    claimStatus: z.enum(['eligible', 'claimed', 'received', 'rejected']).optional()
  }).optional(),
  RODTEP: z.object({
    rate: z.number().min(0).max(10), // percentage
    amount: z.number().min(0),
    certificateNo: z.string().optional(),
    claimDate: z.date().optional(),
    status: z.enum(['pending', 'claimed', 'credited', 'utilized']).optional()
  }).optional(),
  profitMargin: z.object({
    percentage: z.number().min(0).max(100),
    amount: z.number().min(0)
  }).optional(),
  finalPrice: z.number().min(0),
  currency: CurrencySchema
});

export type Calculation = z.infer<typeof CalculationSchema>;

export const PaymentStatusSchema = z.object({
  id: z.string().uuid(),
  invoiceId: z.string().uuid(),
  invoiceNo: z.string(),
  totalAmount: z.number().min(0),
  currency: CurrencySchema,
  paidAmount: z.number().min(0),
  pendingAmount: z.number().min(0),
  status: z.enum(['pending', 'partial', 'paid', 'overdue', 'written_off']),
  dueDate: z.date(),
  payments: z.array(z.object({
    paymentId: z.string().uuid(),
    paymentDate: z.date(),
    amount: z.number().min(0),
    currency: CurrencySchema,
    exchangeRate: z.number().optional(),
    paymentMethod: z.enum(['bank_transfer', 'cheque', 'LC', 'cash', 'offset']),
    referenceNo: z.string(),
    bankCharges: z.number().min(0).default(0),
    remarks: z.string().optional()
  })),
  lastPaymentDate: z.date().optional(),
  remindersSent: z.number().default(0),
  lastReminderDate: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;

export const BankingDetailsSchema = z.object({
  id: z.string().uuid(),
  accountName: z.string().min(1),
  bankName: z.string().min(1),
  branchName: z.string(),
  accountNumber: z.string().min(1),
  accountType: z.enum(['current', 'savings', 'od', 'cc']),
  currency: CurrencySchema,
  ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/).optional(), // For Indian banks
  swiftCode: z.string().min(8).max(11).optional(),
  iban: z.string().optional(),
  routingNumber: z.string().optional(), // For US banks
  sortCode: z.string().optional(), // For UK banks
  correspondentBank: z.object({
    bankName: z.string(),
    swiftCode: z.string(),
    accountNumber: z.string().optional(),
    address: z.string()
  }).optional(),
  isActive: z.boolean().default(true),
  isPrimary: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type BankingDetails = z.infer<typeof BankingDetailsSchema>;

export const TaxConfigurationSchema = z.object({
  id: z.string().uuid(),
  country: z.string(),
  taxType: z.enum(['GST', 'VAT', 'sales_tax', 'customs_duty']),
  taxName: z.string(),
  rate: z.number().min(0).max(100),
  applicableOn: z.enum(['FOB', 'CIF', 'product_value']),
  effectiveFrom: z.date(),
  effectiveTo: z.date().optional(),
  HSNCodeRanges: z.array(z.object({
    fromHSN: z.string(),
    toHSN: z.string(),
    specificRate: z.number().optional()
  })).optional(),
  exemptions: z.array(z.object({
    condition: z.string(),
    exemptionPercentage: z.number().min(0).max(100)
  })).optional(),
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type TaxConfiguration = z.infer<typeof TaxConfigurationSchema>;

export const FinancialTransactionSchema = z.object({
  id: z.string().uuid(),
  transactionType: z.enum(['sale', 'purchase', 'payment_received', 'payment_made', 'refund', 'credit_note', 'debit_note']),
  transactionDate: z.date(),
  referenceType: z.enum(['invoice', 'purchase_order', 'payment', 'journal']),
  referenceId: z.string().uuid(),
  referenceNo: z.string(),
  description: z.string(),
  debitAccount: z.string(),
  creditAccount: z.string(),
  amount: z.number().min(0),
  currency: CurrencySchema,
  exchangeRate: z.number().optional(),
  baseAmount: z.number().min(0), // Amount in base currency
  taxAmount: z.number().min(0).default(0),
  netAmount: z.number().min(0),
  status: z.enum(['pending', 'posted', 'reversed']),
  postedBy: z.string().optional(),
  postedDate: z.date().optional(),
  reversalReason: z.string().optional(),
  createdBy: z.string(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type FinancialTransaction = z.infer<typeof FinancialTransactionSchema>;

export const CostCenterSchema = z.object({
  id: z.string().uuid(),
  code: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(['export', 'manufacturing', 'logistics', 'regulatory', 'admin']),
  parentId: z.string().uuid().optional(),
  budget: z.object({
    annual: z.number().min(0),
    quarterly: z.number().min(0),
    monthly: z.number().min(0),
    currency: CurrencySchema
  }).optional(),
  actualSpend: z.object({
    currentMonth: z.number().min(0),
    currentQuarter: z.number().min(0),
    currentYear: z.number().min(0),
    currency: CurrencySchema
  }).optional(),
  manager: z.string(),
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type CostCenter = z.infer<typeof CostCenterSchema>;