import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { misReportService } from '../services/mis/mis-report.service';
import { ReportOptions } from '../services/mis/mis-report.service';

const router = Router();

// Apply authentication to all routes
// router.use(authenticate); // Commented out for testing

// Generate Sales Analysis Report
router.post('/sales-analysis',
  // authorize(['admin', 'manager', 'operator']),
  asyncHandler(async (req, res) => {
    const options: ReportOptions = {
      startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
      endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
      groupBy: req.body.groupBy || 'month',
      filters: req.body.filters || {},
      includeCharts: req.body.includeCharts !== false, // Default to true
      format: req.body.format || 'json'
    };

    const report = await misReportService.generateSalesAnalysisReport(options);
    
    if (options.format === 'excel') {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=sales-analysis-${Date.now()}.xlsx`);
      res.send(report.excelFile);
    } else {
      res.json(report);
    }
  })
);

// Generate Regulatory Compliance Dashboard
router.post('/regulatory-compliance',
  // authorize(['admin', 'manager']),
  asyncHandler(async (req, res) => {
    const options: ReportOptions = {
      groupBy: req.body.groupBy || 'country',
      filters: req.body.filters || {},
      includeCharts: req.body.includeCharts !== false,
      format: req.body.format || 'json'
    };

    const report = await misReportService.generateRegulatoryComplianceReport(options);
    
    if (options.format === 'excel') {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=regulatory-compliance-${Date.now()}.xlsx`);
      res.send(report.excelFile);
    } else {
      res.json(report);
    }
  })
);

// Generate Payment Outstanding Report
router.post('/payment-outstanding',
  // authorize(['admin', 'manager']),
  asyncHandler(async (req, res) => {
    const options: ReportOptions = {
      filters: {
        agingDays: req.body.agingDays || [30, 60, 90],
        ...req.body.filters
      },
      includeCharts: req.body.includeCharts !== false,
      format: req.body.format || 'json'
    };

    const report = await misReportService.generatePaymentOutstandingReport(options);
    
    if (options.format === 'excel') {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=payment-outstanding-${Date.now()}.xlsx`);
      res.send(report.excelFile);
    } else {
      res.json(report);
    }
  })
);

// Generate Inventory Movement Report
router.post('/inventory-movement',
  // authorize(['admin', 'manager', 'operator']),
  asyncHandler(async (req, res) => {
    const options: ReportOptions = {
      startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
      endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
      groupBy: req.body.groupBy || 'product',
      filters: req.body.filters || {},
      includeCharts: req.body.includeCharts !== false,
      format: req.body.format || 'json'
    };

    const report = await misReportService.generateInventoryMovementReport(options);
    
    if (options.format === 'excel') {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=inventory-movement-${Date.now()}.xlsx`);
      res.send(report.excelFile);
    } else {
      res.json(report);
    }
  })
);

// Generate Drawback/RODTEP Claims Report
router.post('/drawback-claims',
  // authorize(['admin', 'manager']),
  asyncHandler(async (req, res) => {
    const options: ReportOptions = {
      startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
      endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
      filters: req.body.filters || {},
      includeCharts: req.body.includeCharts !== false,
      format: req.body.format || 'json'
    };

    const report = await misReportService.generateDrawbackClaimsReport(options);
    
    if (options.format === 'excel') {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=drawback-claims-${Date.now()}.xlsx`);
      res.send(report.excelFile);
    } else {
      res.json(report);
    }
  })
);

// Get cached report
router.get('/cached/:reportType',
  // authorize(['admin', 'manager', 'operator']),
  asyncHandler(async (req, res) => {
    const reportType = req.params.reportType;
    const cacheKey = `${reportType}-${JSON.stringify(req.query)}`;
    
    // This would need to be implemented in the service
    const cachedReport = misReportService.getCachedReport(cacheKey);
    
    if (cachedReport) {
      res.json(cachedReport);
    } else {
      res.status(404).json({ message: 'Cached report not found' });
    }
  })
);

// Clear report cache
router.post('/clear-cache',
  // authorize(['admin']),
  asyncHandler(async (req, res) => {
    misReportService.clearCache();
    res.json({ message: 'Report cache cleared successfully' });
  })
);

// Schedule report generation
router.post('/schedule',
  // authorize(['admin', 'manager']),
  asyncHandler(async (req, res) => {
    const { reportType, schedule, options, recipients } = req.body;
    
    if (!reportType || !schedule) {
      res.status(400).json({ 
        message: 'Report type and schedule are required' 
      });
      return;
    }
    
    // This would integrate with the scheduled report generation
    const scheduledReport = {
      id: `schedule-${Date.now()}`,
      reportType,
      schedule,
      options,
      recipients,
      createdAt: new Date(),
      status: 'scheduled'
    };
    
    res.json({
      message: 'Report scheduled successfully',
      scheduledReport
    });
  })
);

// Get report metadata/available filters
router.get('/metadata/:reportType',
  // authorize(['admin', 'manager', 'operator']),
  asyncHandler(async (req, res) => {
    const reportType = req.params.reportType;
    
    const metadata = {
      salesAnalysis: {
        filters: ['customer', 'product', 'country', 'dateRange'],
        groupByOptions: ['month', 'quarter', 'year', 'customer', 'product', 'country'],
        chartTypes: ['line', 'bar', 'pie', 'heatmap'],
        formats: ['json', 'excel']
      },
      regulatoryCompliance: {
        filters: ['country', 'status', 'expiryDate'],
        groupByOptions: ['country', 'status', 'product'],
        chartTypes: ['pie', 'bar', 'gantt'],
        formats: ['json', 'excel']
      },
      paymentOutstanding: {
        filters: ['customer', 'agingDays', 'currency'],
        agingBuckets: [30, 60, 90, 120],
        chartTypes: ['bar', 'pie'],
        formats: ['json', 'excel']
      },
      inventoryMovement: {
        filters: ['product', 'dateRange', 'movementType'],
        groupByOptions: ['product', 'month', 'movementType'],
        chartTypes: ['line', 'bar'],
        formats: ['json', 'excel']
      },
      drawbackClaims: {
        filters: ['dateRange', 'status', 'claimType'],
        groupByOptions: ['month', 'status', 'claimType'],
        chartTypes: ['bar', 'line'],
        formats: ['json', 'excel']
      }
    };
    
    const reportMetadata = metadata[reportType as keyof typeof metadata];
    
    if (reportMetadata) {
      res.json(reportMetadata);
    } else {
      res.status(404).json({ message: 'Report type not found' });
    }
  })
);

export default router;