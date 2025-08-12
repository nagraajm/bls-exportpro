import { z } from 'zod';
import { CurrencySchema } from '../financial';
import { ComplianceStatusEnum } from '../regulatory';

export const DateRangeSchema = z.object({
  startDate: z.date(),
  endDate: z.date()
}).refine(data => data.endDate >= data.startDate, {
  message: 'End date must be after or equal to start date',
  path: ['endDate']
});

export type DateRange = z.infer<typeof DateRangeSchema>;

export const ExportMetricsSchema = z.object({
  id: z.string().uuid(),
  reportDate: z.date(),
  period: DateRangeSchema,
  totalExports: z.object({
    volume: z.object({
      quantity: z.number().min(0),
      unit: z.string(),
      percentageChange: z.number() // compared to previous period
    }),
    value: z.object({
      amount: z.number().min(0),
      currency: CurrencySchema,
      percentageChange: z.number()
    })
  }),
  countryWise: z.array(z.object({
    country: z.string(),
    countryCode: z.string().length(2),
    volume: z.number().min(0),
    value: z.number().min(0),
    currency: CurrencySchema,
    numberOfShipments: z.number().min(0),
    topProducts: z.array(z.object({
      productId: z.string().uuid(),
      productName: z.string(),
      quantity: z.number().min(0),
      value: z.number().min(0)
    })),
    marketShare: z.number().min(0).max(100) // percentage
  })),
  productWise: z.array(z.object({
    productId: z.string().uuid(),
    productName: z.string(),
    brandName: z.string(),
    totalQuantity: z.number().min(0),
    totalValue: z.number().min(0),
    averagePrice: z.number().min(0),
    topMarkets: z.array(z.object({
      country: z.string(),
      quantity: z.number().min(0),
      value: z.number().min(0)
    }))
  })),
  customerWise: z.array(z.object({
    customerId: z.string().uuid(),
    customerName: z.string(),
    country: z.string(),
    totalOrders: z.number().min(0),
    totalValue: z.number().min(0),
    currency: CurrencySchema,
    outstandingAmount: z.number().min(0),
    averageOrderValue: z.number().min(0)
  })),
  monthlyTrend: z.array(z.object({
    month: z.string(), // YYYY-MM format
    volume: z.number().min(0),
    value: z.number().min(0),
    numberOfShipments: z.number().min(0)
  })),
  comparisonWithLastYear: z.object({
    volumeGrowth: z.number(), // percentage
    valueGrowth: z.number(), // percentage
    newMarketsAdded: z.number().min(0),
    newCustomersAdded: z.number().min(0)
  }),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type ExportMetrics = z.infer<typeof ExportMetricsSchema>;

export const RegulatoryMetricsSchema = z.object({
  id: z.string().uuid(),
  reportDate: z.date(),
  period: DateRangeSchema,
  registrationSummary: z.object({
    totalRegistrations: z.number().min(0),
    activeRegistrations: z.number().min(0),
    pendingRegistrations: z.number().min(0),
    expiredRegistrations: z.number().min(0),
    renewalsDue: z.number().min(0)
  }),
  compliancePercentage: z.number().min(0).max(100),
  countryWise: z.array(z.object({
    country: z.string(),
    countryCode: z.string().length(2),
    totalProducts: z.number().min(0),
    registeredProducts: z.number().min(0),
    pendingApplications: z.number().min(0),
    complianceScore: z.number().min(0).max(100),
    upcomingRenewals: z.array(z.object({
      productId: z.string().uuid(),
      productName: z.string(),
      registrationNo: z.string(),
      expiryDate: z.date()
    }))
  })),
  productWise: z.array(z.object({
    productId: z.string().uuid(),
    productName: z.string(),
    registeredCountries: z.number().min(0),
    pendingCountries: z.number().min(0),
    complianceStatus: z.record(z.string(), ComplianceStatusEnum) // country -> status
  })),
  pendingActions: z.array(z.object({
    actionType: z.enum(['renewal', 'submission', 'response', 'inspection']),
    priority: z.enum(['low', 'medium', 'high', 'critical']),
    description: z.string(),
    dueDate: z.date(),
    country: z.string().optional(),
    productId: z.string().uuid().optional(),
    assignedTo: z.string()
  })),
  dossierStatus: z.object({
    totalDossiers: z.number().min(0),
    submitted: z.number().min(0),
    underReview: z.number().min(0),
    approved: z.number().min(0),
    rejected: z.number().min(0)
  }),
  inspectionSummary: z.object({
    scheduled: z.number().min(0),
    completed: z.number().min(0),
    passed: z.number().min(0),
    failed: z.number().min(0),
    upcomingInspections: z.array(z.object({
      date: z.date(),
      country: z.string(),
      facility: z.string(),
      type: z.string()
    }))
  }),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type RegulatoryMetrics = z.infer<typeof RegulatoryMetricsSchema>;

export const InventoryMetricsSchema = z.object({
  id: z.string().uuid(),
  reportDate: z.date(),
  totalProducts: z.number().min(0),
  stockSummary: z.object({
    totalValue: z.number().min(0),
    currency: CurrencySchema,
    inStock: z.number().min(0),
    lowStock: z.number().min(0),
    outOfStock: z.number().min(0),
    expiringSoon: z.number().min(0) // within 6 months
  }),
  productWise: z.array(z.object({
    productId: z.string().uuid(),
    productName: z.string(),
    availableQuantity: z.number().min(0),
    allocatedQuantity: z.number().min(0),
    unit: z.string(),
    stockValue: z.number().min(0),
    reorderLevel: z.number().min(0),
    stockStatus: z.enum(['adequate', 'low', 'critical', 'excess']),
    averageMonthlyConsumption: z.number().min(0),
    monthsOfStockAvailable: z.number().min(0),
    expiryAnalysis: z.object({
      expired: z.number().min(0),
      expiringIn30Days: z.number().min(0),
      expiringIn90Days: z.number().min(0),
      expiringIn180Days: z.number().min(0)
    })
  })),
  batchWise: z.array(z.object({
    batchId: z.string().uuid(),
    batchNo: z.string(),
    productId: z.string().uuid(),
    productName: z.string(),
    mfgDate: z.date(),
    expDate: z.date(),
    availableQuantity: z.number().min(0),
    status: z.string(),
    daysToExpiry: z.number()
  })),
  warehouseWise: z.array(z.object({
    warehouseId: z.string(),
    warehouseName: z.string(),
    location: z.string(),
    totalProducts: z.number().min(0),
    totalValue: z.number().min(0),
    capacityUtilization: z.number().min(0).max(100) // percentage
  })).optional(),
  turnoverAnalysis: z.object({
    inventoryTurnoverRatio: z.number().min(0),
    averageHoldingPeriod: z.number().min(0), // days
    slowMovingItems: z.array(z.object({
      productId: z.string().uuid(),
      productName: z.string(),
      lastMovementDate: z.date(),
      quantity: z.number().min(0),
      value: z.number().min(0)
    })),
    fastMovingItems: z.array(z.object({
      productId: z.string().uuid(),
      productName: z.string(),
      monthlyMovement: z.number().min(0),
      turnoverRatio: z.number().min(0)
    }))
  }),
  reorderAlerts: z.array(z.object({
    productId: z.string().uuid(),
    productName: z.string(),
    currentStock: z.number().min(0),
    reorderLevel: z.number().min(0),
    suggestedOrderQuantity: z.number().min(0),
    lastSupplier: z.string().optional()
  })),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type InventoryMetrics = z.infer<typeof InventoryMetricsSchema>;

export const FinancialSummarySchema = z.object({
  id: z.string().uuid(),
  reportDate: z.date(),
  period: DateRangeSchema,
  revenue: z.object({
    totalSales: z.number().min(0),
    exportSales: z.number().min(0),
    domesticSales: z.number().min(0),
    currency: CurrencySchema,
    growthPercentage: z.number()
  }),
  receivables: z.object({
    totalOutstanding: z.number().min(0),
    current: z.number().min(0), // 0-30 days
    overdue30Days: z.number().min(0),
    overdue60Days: z.number().min(0),
    overdue90Days: z.number().min(0),
    overdueAbove90Days: z.number().min(0),
    currency: CurrencySchema
  }),
  profitability: z.object({
    grossProfit: z.number(),
    grossProfitMargin: z.number().min(0).max(100),
    netProfit: z.number(),
    netProfitMargin: z.number().min(-100).max(100),
    currency: CurrencySchema
  }),
  cashFlow: z.object({
    openingBalance: z.number(),
    receipts: z.number().min(0),
    payments: z.number().min(0),
    closingBalance: z.number(),
    currency: CurrencySchema
  }),
  incentives: z.object({
    rodtepClaimed: z.number().min(0),
    rodtepReceived: z.number().min(0),
    drawbackClaimed: z.number().min(0),
    drawbackReceived: z.number().min(0),
    otherIncentives: z.number().min(0),
    totalIncentives: z.number().min(0),
    currency: CurrencySchema
  }),
  customerWiseOutstanding: z.array(z.object({
    customerId: z.string().uuid(),
    customerName: z.string(),
    country: z.string(),
    totalOutstanding: z.number().min(0),
    overdueAmount: z.number().min(0),
    currency: CurrencySchema,
    agingBracket: z.string(),
    creditLimit: z.number().min(0).optional(),
    creditUtilization: z.number().min(0).max(100).optional()
  })),
  bankWiseSummary: z.array(z.object({
    bankId: z.string().uuid(),
    bankName: z.string(),
    accountNumber: z.string(),
    currency: CurrencySchema,
    currentBalance: z.number(),
    monthlyReceipts: z.number().min(0),
    monthlyPayments: z.number().min(0)
  })),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type FinancialSummary = z.infer<typeof FinancialSummarySchema>;

export const DashboardMetricsSchema = z.object({
  exportMetrics: ExportMetricsSchema.pick({
    totalExports: true,
    monthlyTrend: true,
    comparisonWithLastYear: true
  }),
  regulatoryMetrics: RegulatoryMetricsSchema.pick({
    registrationSummary: true,
    compliancePercentage: true,
    pendingActions: true
  }),
  inventoryMetrics: InventoryMetricsSchema.pick({
    stockSummary: true,
    reorderAlerts: true
  }),
  financialMetrics: FinancialSummarySchema.pick({
    revenue: true,
    receivables: true,
    profitability: true
  }),
  alerts: z.array(z.object({
    id: z.string().uuid(),
    type: z.enum(['regulatory', 'inventory', 'financial', 'operational']),
    severity: z.enum(['info', 'warning', 'critical']),
    message: z.string(),
    actionRequired: z.string().optional(),
    link: z.string().optional(),
    createdAt: z.date()
  })),
  lastUpdated: z.date()
});

export type DashboardMetrics = z.infer<typeof DashboardMetricsSchema>;