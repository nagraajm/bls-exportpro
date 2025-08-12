"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardMetricsSchema = exports.FinancialSummarySchema = exports.InventoryMetricsSchema = exports.RegulatoryMetricsSchema = exports.ExportMetricsSchema = exports.DateRangeSchema = void 0;
const zod_1 = require("zod");
const financial_1 = require("../financial");
const regulatory_1 = require("../regulatory");
exports.DateRangeSchema = zod_1.z.object({
    startDate: zod_1.z.date(),
    endDate: zod_1.z.date()
}).refine(data => data.endDate >= data.startDate, {
    message: 'End date must be after or equal to start date',
    path: ['endDate']
});
exports.ExportMetricsSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    reportDate: zod_1.z.date(),
    period: exports.DateRangeSchema,
    totalExports: zod_1.z.object({
        volume: zod_1.z.object({
            quantity: zod_1.z.number().min(0),
            unit: zod_1.z.string(),
            percentageChange: zod_1.z.number() // compared to previous period
        }),
        value: zod_1.z.object({
            amount: zod_1.z.number().min(0),
            currency: financial_1.CurrencySchema,
            percentageChange: zod_1.z.number()
        })
    }),
    countryWise: zod_1.z.array(zod_1.z.object({
        country: zod_1.z.string(),
        countryCode: zod_1.z.string().length(2),
        volume: zod_1.z.number().min(0),
        value: zod_1.z.number().min(0),
        currency: financial_1.CurrencySchema,
        numberOfShipments: zod_1.z.number().min(0),
        topProducts: zod_1.z.array(zod_1.z.object({
            productId: zod_1.z.string().uuid(),
            productName: zod_1.z.string(),
            quantity: zod_1.z.number().min(0),
            value: zod_1.z.number().min(0)
        })),
        marketShare: zod_1.z.number().min(0).max(100) // percentage
    })),
    productWise: zod_1.z.array(zod_1.z.object({
        productId: zod_1.z.string().uuid(),
        productName: zod_1.z.string(),
        brandName: zod_1.z.string(),
        totalQuantity: zod_1.z.number().min(0),
        totalValue: zod_1.z.number().min(0),
        averagePrice: zod_1.z.number().min(0),
        topMarkets: zod_1.z.array(zod_1.z.object({
            country: zod_1.z.string(),
            quantity: zod_1.z.number().min(0),
            value: zod_1.z.number().min(0)
        }))
    })),
    customerWise: zod_1.z.array(zod_1.z.object({
        customerId: zod_1.z.string().uuid(),
        customerName: zod_1.z.string(),
        country: zod_1.z.string(),
        totalOrders: zod_1.z.number().min(0),
        totalValue: zod_1.z.number().min(0),
        currency: financial_1.CurrencySchema,
        outstandingAmount: zod_1.z.number().min(0),
        averageOrderValue: zod_1.z.number().min(0)
    })),
    monthlyTrend: zod_1.z.array(zod_1.z.object({
        month: zod_1.z.string(), // YYYY-MM format
        volume: zod_1.z.number().min(0),
        value: zod_1.z.number().min(0),
        numberOfShipments: zod_1.z.number().min(0)
    })),
    comparisonWithLastYear: zod_1.z.object({
        volumeGrowth: zod_1.z.number(), // percentage
        valueGrowth: zod_1.z.number(), // percentage
        newMarketsAdded: zod_1.z.number().min(0),
        newCustomersAdded: zod_1.z.number().min(0)
    }),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date()
});
exports.RegulatoryMetricsSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    reportDate: zod_1.z.date(),
    period: exports.DateRangeSchema,
    registrationSummary: zod_1.z.object({
        totalRegistrations: zod_1.z.number().min(0),
        activeRegistrations: zod_1.z.number().min(0),
        pendingRegistrations: zod_1.z.number().min(0),
        expiredRegistrations: zod_1.z.number().min(0),
        renewalsDue: zod_1.z.number().min(0)
    }),
    compliancePercentage: zod_1.z.number().min(0).max(100),
    countryWise: zod_1.z.array(zod_1.z.object({
        country: zod_1.z.string(),
        countryCode: zod_1.z.string().length(2),
        totalProducts: zod_1.z.number().min(0),
        registeredProducts: zod_1.z.number().min(0),
        pendingApplications: zod_1.z.number().min(0),
        complianceScore: zod_1.z.number().min(0).max(100),
        upcomingRenewals: zod_1.z.array(zod_1.z.object({
            productId: zod_1.z.string().uuid(),
            productName: zod_1.z.string(),
            registrationNo: zod_1.z.string(),
            expiryDate: zod_1.z.date()
        }))
    })),
    productWise: zod_1.z.array(zod_1.z.object({
        productId: zod_1.z.string().uuid(),
        productName: zod_1.z.string(),
        registeredCountries: zod_1.z.number().min(0),
        pendingCountries: zod_1.z.number().min(0),
        complianceStatus: zod_1.z.record(zod_1.z.string(), regulatory_1.ComplianceStatusEnum) // country -> status
    })),
    pendingActions: zod_1.z.array(zod_1.z.object({
        actionType: zod_1.z.enum(['renewal', 'submission', 'response', 'inspection']),
        priority: zod_1.z.enum(['low', 'medium', 'high', 'critical']),
        description: zod_1.z.string(),
        dueDate: zod_1.z.date(),
        country: zod_1.z.string().optional(),
        productId: zod_1.z.string().uuid().optional(),
        assignedTo: zod_1.z.string()
    })),
    dossierStatus: zod_1.z.object({
        totalDossiers: zod_1.z.number().min(0),
        submitted: zod_1.z.number().min(0),
        underReview: zod_1.z.number().min(0),
        approved: zod_1.z.number().min(0),
        rejected: zod_1.z.number().min(0)
    }),
    inspectionSummary: zod_1.z.object({
        scheduled: zod_1.z.number().min(0),
        completed: zod_1.z.number().min(0),
        passed: zod_1.z.number().min(0),
        failed: zod_1.z.number().min(0),
        upcomingInspections: zod_1.z.array(zod_1.z.object({
            date: zod_1.z.date(),
            country: zod_1.z.string(),
            facility: zod_1.z.string(),
            type: zod_1.z.string()
        }))
    }),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date()
});
exports.InventoryMetricsSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    reportDate: zod_1.z.date(),
    totalProducts: zod_1.z.number().min(0),
    stockSummary: zod_1.z.object({
        totalValue: zod_1.z.number().min(0),
        currency: financial_1.CurrencySchema,
        inStock: zod_1.z.number().min(0),
        lowStock: zod_1.z.number().min(0),
        outOfStock: zod_1.z.number().min(0),
        expiringSoon: zod_1.z.number().min(0) // within 6 months
    }),
    productWise: zod_1.z.array(zod_1.z.object({
        productId: zod_1.z.string().uuid(),
        productName: zod_1.z.string(),
        availableQuantity: zod_1.z.number().min(0),
        allocatedQuantity: zod_1.z.number().min(0),
        unit: zod_1.z.string(),
        stockValue: zod_1.z.number().min(0),
        reorderLevel: zod_1.z.number().min(0),
        stockStatus: zod_1.z.enum(['adequate', 'low', 'critical', 'excess']),
        averageMonthlyConsumption: zod_1.z.number().min(0),
        monthsOfStockAvailable: zod_1.z.number().min(0),
        expiryAnalysis: zod_1.z.object({
            expired: zod_1.z.number().min(0),
            expiringIn30Days: zod_1.z.number().min(0),
            expiringIn90Days: zod_1.z.number().min(0),
            expiringIn180Days: zod_1.z.number().min(0)
        })
    })),
    batchWise: zod_1.z.array(zod_1.z.object({
        batchId: zod_1.z.string().uuid(),
        batchNo: zod_1.z.string(),
        productId: zod_1.z.string().uuid(),
        productName: zod_1.z.string(),
        mfgDate: zod_1.z.date(),
        expDate: zod_1.z.date(),
        availableQuantity: zod_1.z.number().min(0),
        status: zod_1.z.string(),
        daysToExpiry: zod_1.z.number()
    })),
    warehouseWise: zod_1.z.array(zod_1.z.object({
        warehouseId: zod_1.z.string(),
        warehouseName: zod_1.z.string(),
        location: zod_1.z.string(),
        totalProducts: zod_1.z.number().min(0),
        totalValue: zod_1.z.number().min(0),
        capacityUtilization: zod_1.z.number().min(0).max(100) // percentage
    })).optional(),
    turnoverAnalysis: zod_1.z.object({
        inventoryTurnoverRatio: zod_1.z.number().min(0),
        averageHoldingPeriod: zod_1.z.number().min(0), // days
        slowMovingItems: zod_1.z.array(zod_1.z.object({
            productId: zod_1.z.string().uuid(),
            productName: zod_1.z.string(),
            lastMovementDate: zod_1.z.date(),
            quantity: zod_1.z.number().min(0),
            value: zod_1.z.number().min(0)
        })),
        fastMovingItems: zod_1.z.array(zod_1.z.object({
            productId: zod_1.z.string().uuid(),
            productName: zod_1.z.string(),
            monthlyMovement: zod_1.z.number().min(0),
            turnoverRatio: zod_1.z.number().min(0)
        }))
    }),
    reorderAlerts: zod_1.z.array(zod_1.z.object({
        productId: zod_1.z.string().uuid(),
        productName: zod_1.z.string(),
        currentStock: zod_1.z.number().min(0),
        reorderLevel: zod_1.z.number().min(0),
        suggestedOrderQuantity: zod_1.z.number().min(0),
        lastSupplier: zod_1.z.string().optional()
    })),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date()
});
exports.FinancialSummarySchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    reportDate: zod_1.z.date(),
    period: exports.DateRangeSchema,
    revenue: zod_1.z.object({
        totalSales: zod_1.z.number().min(0),
        exportSales: zod_1.z.number().min(0),
        domesticSales: zod_1.z.number().min(0),
        currency: financial_1.CurrencySchema,
        growthPercentage: zod_1.z.number()
    }),
    receivables: zod_1.z.object({
        totalOutstanding: zod_1.z.number().min(0),
        current: zod_1.z.number().min(0), // 0-30 days
        overdue30Days: zod_1.z.number().min(0),
        overdue60Days: zod_1.z.number().min(0),
        overdue90Days: zod_1.z.number().min(0),
        overdueAbove90Days: zod_1.z.number().min(0),
        currency: financial_1.CurrencySchema
    }),
    profitability: zod_1.z.object({
        grossProfit: zod_1.z.number(),
        grossProfitMargin: zod_1.z.number().min(0).max(100),
        netProfit: zod_1.z.number(),
        netProfitMargin: zod_1.z.number().min(-100).max(100),
        currency: financial_1.CurrencySchema
    }),
    cashFlow: zod_1.z.object({
        openingBalance: zod_1.z.number(),
        receipts: zod_1.z.number().min(0),
        payments: zod_1.z.number().min(0),
        closingBalance: zod_1.z.number(),
        currency: financial_1.CurrencySchema
    }),
    incentives: zod_1.z.object({
        rodtepClaimed: zod_1.z.number().min(0),
        rodtepReceived: zod_1.z.number().min(0),
        drawbackClaimed: zod_1.z.number().min(0),
        drawbackReceived: zod_1.z.number().min(0),
        otherIncentives: zod_1.z.number().min(0),
        totalIncentives: zod_1.z.number().min(0),
        currency: financial_1.CurrencySchema
    }),
    customerWiseOutstanding: zod_1.z.array(zod_1.z.object({
        customerId: zod_1.z.string().uuid(),
        customerName: zod_1.z.string(),
        country: zod_1.z.string(),
        totalOutstanding: zod_1.z.number().min(0),
        overdueAmount: zod_1.z.number().min(0),
        currency: financial_1.CurrencySchema,
        agingBracket: zod_1.z.string(),
        creditLimit: zod_1.z.number().min(0).optional(),
        creditUtilization: zod_1.z.number().min(0).max(100).optional()
    })),
    bankWiseSummary: zod_1.z.array(zod_1.z.object({
        bankId: zod_1.z.string().uuid(),
        bankName: zod_1.z.string(),
        accountNumber: zod_1.z.string(),
        currency: financial_1.CurrencySchema,
        currentBalance: zod_1.z.number(),
        monthlyReceipts: zod_1.z.number().min(0),
        monthlyPayments: zod_1.z.number().min(0)
    })),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date()
});
exports.DashboardMetricsSchema = zod_1.z.object({
    exportMetrics: exports.ExportMetricsSchema.pick({
        totalExports: true,
        monthlyTrend: true,
        comparisonWithLastYear: true
    }),
    regulatoryMetrics: exports.RegulatoryMetricsSchema.pick({
        registrationSummary: true,
        compliancePercentage: true,
        pendingActions: true
    }),
    inventoryMetrics: exports.InventoryMetricsSchema.pick({
        stockSummary: true,
        reorderAlerts: true
    }),
    financialMetrics: exports.FinancialSummarySchema.pick({
        revenue: true,
        receivables: true,
        profitability: true
    }),
    alerts: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string().uuid(),
        type: zod_1.z.enum(['regulatory', 'inventory', 'financial', 'operational']),
        severity: zod_1.z.enum(['info', 'warning', 'critical']),
        message: zod_1.z.string(),
        actionRequired: zod_1.z.string().optional(),
        link: zod_1.z.string().optional(),
        createdAt: zod_1.z.date()
    })),
    lastUpdated: zod_1.z.date()
});
//# sourceMappingURL=index.js.map