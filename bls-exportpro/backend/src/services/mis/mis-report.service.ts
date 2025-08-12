import { Order, Invoice, Product, Customer } from '../../../../shared/types';
import { repositories } from '../../repositories';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import { ChartConfiguration } from 'chart.js';
import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';
import NodeCache from 'node-cache';

export interface ReportOptions {
  startDate?: Date;
  endDate?: Date;
  groupBy?: 'day' | 'week' | 'month' | 'quarter' | 'year' | 'country' | 'customer' | 'product' | 'status';
  currency?: 'USD' | 'INR';
  includeChart?: boolean;
  includeCharts?: boolean;
  format?: 'json' | 'excel' | 'pdf';
  filters?: any;
}

export interface ReportData {
  title: string;
  generatedAt: Date;
  period: {
    start: Date;
    end: Date;
  };
  data: any[];
  summary: any;
  charts?: {
    type: string;
    title: string;
    imageUrl?: string;
    config?: ChartConfiguration;
  }[];
  excelFile?: Buffer;
}

export class MISReportService {
  private cache: NodeCache;
  private chartRenderer: ChartJSNodeCanvas;
  
  constructor() {
    // Cache with 1 hour TTL
    this.cache = new NodeCache({ stdTTL: 3600 });
    
    // Chart renderer setup
    this.chartRenderer = new ChartJSNodeCanvas({
      width: 800,
      height: 400,
      backgroundColour: 'white'
    });
  }
  
  async generateSalesAnalysisReport(options: ReportOptions): Promise<ReportData> {
    const cacheKey = `sales-analysis-${JSON.stringify(options)}`;
    const cached = this.cache.get<ReportData>(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    const orders = await this.getOrdersInPeriod(options.startDate, options.endDate);
    const invoices = await this.getInvoicesInPeriod(options.startDate, options.endDate);
    
    // Product-wise analysis
    const productAnalysis = await this.analyzeByProduct(orders, options);
    
    // Country-wise analysis
    const countryAnalysis = await this.analyzeByCountry(orders, options);
    
    // Period-wise analysis
    const periodAnalysis = this.analyzeByPeriod(orders, options);
    
    // Generate summary
    const summary = {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, order) => sum + order.totalAmount, 0),
      totalProducts: new Set(orders.flatMap(o => o.items.map(i => i.productId))).size,
      totalCustomers: new Set(orders.map(o => o.customerId)).size,
      averageOrderValue: orders.length > 0 ? 
        orders.reduce((sum, order) => sum + order.totalAmount, 0) / orders.length : 0,
      topProduct: productAnalysis[0]?.productName || 'N/A',
      topCountry: countryAnalysis[0]?.country || 'N/A'
    };
    
    const report: ReportData = {
      title: 'Sales Analysis Report',
      generatedAt: new Date(),
      period: {
        start: options.startDate,
        end: options.endDate
      },
      data: [
        {
          section: 'Product Analysis',
          data: productAnalysis
        },
        {
          section: 'Country Analysis',
          data: countryAnalysis
        },
        {
          section: 'Period Analysis',
          data: periodAnalysis
        }
      ],
      summary,
      charts: []
    };
    
    // Generate charts if requested
    if (options.includeChart) {
      report.charts = await this.generateSalesCharts(productAnalysis, countryAnalysis, periodAnalysis);
    }
    
    this.cache.set(cacheKey, report);
    
    return report;
  }
  
  async generateRegulatoryComplianceReport(options: ReportOptions): Promise<ReportData> {
    const products = await repositories.product.findAll();
    
    const complianceData = products.map(product => {
      const registrationDate = product.registrationDate ? new Date(product.registrationDate) : null;
      const expiryDate = product.expiryDate ? new Date(product.expiryDate) : null;
      const today = new Date();
      
      let status = 'Not Registered';
      let daysToExpiry = null;
      
      if (registrationDate && expiryDate) {
        if (expiryDate < today) {
          status = 'Expired';
          daysToExpiry = Math.floor((today.getTime() - expiryDate.getTime()) / (1000 * 60 * 60 * 24));
        } else if (expiryDate.getTime() - today.getTime() < 90 * 24 * 60 * 60 * 1000) {
          status = 'Expiring Soon';
          daysToExpiry = Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        } else {
          status = 'Active';
          daysToExpiry = Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        }
      }
      
      return {
        productCode: product.productCode,
        productName: product.brandName,
        genericName: product.genericName,
        registrationStatus: product.cambodiaRegistrationStatus || status,
        registrationNumber: product.registrationNumber,
        registrationDate,
        expiryDate,
        daysToExpiry,
        status
      };
    });
    
    const summary = {
      totalProducts: products.length,
      registered: complianceData.filter(p => p.status === 'Active').length,
      expiringSoon: complianceData.filter(p => p.status === 'Expiring Soon').length,
      expired: complianceData.filter(p => p.status === 'Expired').length,
      notRegistered: complianceData.filter(p => p.status === 'Not Registered').length
    };
    
    const report: ReportData = {
      title: 'Regulatory Compliance Report',
      generatedAt: new Date(),
      period: {
        start: options.startDate,
        end: options.endDate
      },
      data: complianceData,
      summary,
      charts: []
    };
    
    if (options.includeChart) {
      report.charts = await this.generateComplianceCharts(summary);
    }
    
    return report;
  }
  
  async generatePaymentOutstandingReport(options: ReportOptions): Promise<ReportData> {
    const invoices = await this.getInvoicesInPeriod(options.startDate, options.endDate);
    
    const outstandingData = await Promise.all(invoices.map(async invoice => {
      const order = invoice.order;
      const customer = order?.customer;
      const invoiceDate = new Date(invoice.invoiceDate);
      const dueDate = new Date(invoiceDate);
      dueDate.setDate(dueDate.getDate() + 30); // Assuming 30 days payment terms
      
      const today = new Date();
      const daysOverdue = Math.max(0, Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));
      
      return {
        invoiceNumber: invoice.invoiceNumber,
        customerName: customer?.companyName || 'Unknown',
        invoiceDate,
        dueDate,
        amount: invoice.totalAmount,
        currency: invoice.currency,
        daysOverdue,
        status: daysOverdue > 0 ? 'Overdue' : 'Current',
        agingBucket: this.getAgingBucket(daysOverdue)
      };
    }));
    
    // Group by aging buckets
    const agingAnalysis = {
      current: outstandingData.filter(d => d.agingBucket === 'Current'),
      '1-30': outstandingData.filter(d => d.agingBucket === '1-30 days'),
      '31-60': outstandingData.filter(d => d.agingBucket === '31-60 days'),
      '61-90': outstandingData.filter(d => d.agingBucket === '61-90 days'),
      'over90': outstandingData.filter(d => d.agingBucket === 'Over 90 days')
    };
    
    const summary = {
      totalOutstanding: outstandingData.reduce((sum, d) => sum + d.amount, 0),
      totalOverdue: outstandingData.filter(d => d.status === 'Overdue').reduce((sum, d) => sum + d.amount, 0),
      currentAmount: agingAnalysis.current.reduce((sum, d) => sum + d.amount, 0),
      overdueCount: outstandingData.filter(d => d.status === 'Overdue').length,
      averageDaysOverdue: outstandingData.filter(d => d.daysOverdue > 0).reduce((sum, d) => sum + d.daysOverdue, 0) / 
        (outstandingData.filter(d => d.daysOverdue > 0).length || 1)
    };
    
    const report: ReportData = {
      title: 'Payment Outstanding Report',
      generatedAt: new Date(),
      period: {
        start: options.startDate,
        end: options.endDate
      },
      data: outstandingData,
      summary,
      charts: []
    };
    
    if (options.includeChart) {
      report.charts = await this.generateAgingCharts(agingAnalysis);
    }
    
    return report;
  }
  
  async generateInventoryMovementReport(options: ReportOptions): Promise<ReportData> {
    const orders = await this.getOrdersInPeriod(options.startDate, options.endDate);
    const products = await repositories.product.findAll();
    
    const movementData = await Promise.all(products.map(async product => {
      const productOrders = orders.filter(order => 
        order.items.some(item => item.productId === product.id)
      );
      
      const totalQuantity = productOrders.reduce((sum, order) => 
        sum + order.items
          .filter(item => item.productId === product.id)
          .reduce((itemSum, item) => itemSum + item.quantity, 0), 0
      );
      
      const totalRevenue = productOrders.reduce((sum, order) => 
        sum + order.items
          .filter(item => item.productId === product.id)
          .reduce((itemSum, item) => itemSum + (item.quantity * item.unitPrice), 0), 0
      );
      
      const monthlyMovement = this.calculateMonthlyMovement(productOrders, product.id, options);
      
      return {
        productCode: product.productCode,
        productName: product.brandName,
        genericName: product.genericName,
        totalQuantity,
        totalRevenue,
        averagePrice: totalQuantity > 0 ? totalRevenue / totalQuantity : 0,
        orderCount: productOrders.length,
        monthlyMovement,
        turnoverRate: this.calculateTurnoverRate(totalQuantity, options)
      };
    }));
    
    const summary = {
      totalProducts: products.length,
      activeProducts: movementData.filter(p => p.totalQuantity > 0).length,
      totalQuantityMoved: movementData.reduce((sum, p) => sum + p.totalQuantity, 0),
      totalRevenue: movementData.reduce((sum, p) => sum + p.totalRevenue, 0),
      topMovingProduct: movementData.sort((a, b) => b.totalQuantity - a.totalQuantity)[0]?.productName || 'N/A',
      slowMovingProducts: movementData.filter(p => p.turnoverRate < 1).length
    };
    
    const report: ReportData = {
      title: 'Inventory Movement Report',
      generatedAt: new Date(),
      period: {
        start: options.startDate,
        end: options.endDate
      },
      data: movementData,
      summary,
      charts: []
    };
    
    if (options.includeChart) {
      report.charts = await this.generateInventoryCharts(movementData);
    }
    
    return report;
  }
  
  async generateDrawbackRODTEPReport(options: ReportOptions): Promise<ReportData> {
    const invoices = await this.getInvoicesInPeriod(options.startDate, options.endDate);
    
    const claimsData = invoices.map(invoice => {
      const order = invoice.order;
      
      return {
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: invoice.invoiceDate,
        customerName: order?.customer?.companyName || 'Unknown',
        country: order?.customer?.address.country || 'Unknown',
        invoiceAmount: invoice.subtotal,
        drawbackAmount: invoice.drawback,
        drawbackRate: 1.2,
        rodtepAmount: invoice.rodtep,
        rodtepRate: 0.7,
        totalBenefit: invoice.drawback + invoice.rodtep,
        currency: invoice.currency,
        status: 'Claimed' // This would come from a claims tracking system
      };
    });
    
    const monthlyAnalysis = this.analyzeClaimsByMonth(claimsData);
    
    const summary = {
      totalInvoices: claimsData.length,
      totalInvoiceAmount: claimsData.reduce((sum, c) => sum + c.invoiceAmount, 0),
      totalDrawback: claimsData.reduce((sum, c) => sum + c.drawbackAmount, 0),
      totalRODTEP: claimsData.reduce((sum, c) => sum + c.rodtepAmount, 0),
      totalBenefit: claimsData.reduce((sum, c) => sum + c.totalBenefit, 0),
      averageBenefitRate: claimsData.length > 0 ?
        (claimsData.reduce((sum, c) => sum + c.totalBenefit, 0) / 
         claimsData.reduce((sum, c) => sum + c.invoiceAmount, 0)) * 100 : 0,
      monthlyAverage: monthlyAnalysis.reduce((sum, m) => sum + m.totalBenefit, 0) / monthlyAnalysis.length
    };
    
    const report: ReportData = {
      title: 'Drawback and RODTEP Claims Report',
      generatedAt: new Date(),
      period: {
        start: options.startDate,
        end: options.endDate
      },
      data: [
        {
          section: 'Claims Details',
          data: claimsData
        },
        {
          section: 'Monthly Analysis',
          data: monthlyAnalysis
        }
      ],
      summary,
      charts: []
    };
    
    if (options.includeChart) {
      report.charts = await this.generateClaimsCharts(monthlyAnalysis);
    }
    
    return report;
  }
  
  async exportReportToExcel(report: ReportData, outputPath: string): Promise<string> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'BLS ExportPro';
    workbook.created = new Date();
    
    // Summary sheet
    const summarySheet = workbook.addWorksheet('Summary');
    this.addSummarySheet(summarySheet, report);
    
    // Data sheets
    if (Array.isArray(report.data)) {
      report.data.forEach((section: any, index: number) => {
        if (section.section && section.data) {
          const sheet = workbook.addWorksheet(section.section);
          this.addDataSheet(sheet, section.data);
        } else if (index === 0) {
          const sheet = workbook.addWorksheet('Data');
          this.addDataSheet(sheet, report.data);
        }
      });
    }
    
    // Chart sheet if available
    if (report.charts && report.charts.length > 0) {
      const chartSheet = workbook.addWorksheet('Charts');
      await this.addChartSheet(chartSheet, report.charts);
    }
    
    await workbook.xlsx.writeFile(outputPath);
    
    return outputPath;
  }
  
  private async getOrdersInPeriod(startDate: Date, endDate: Date): Promise<Order[]> {
    const allOrders = await repositories.order.findAll();
    
    return allOrders.filter(order => {
      const orderDate = new Date(order.orderDate);
      return orderDate >= startDate && orderDate <= endDate;
    });
  }
  
  private async getInvoicesInPeriod(startDate: Date, endDate: Date): Promise<Invoice[]> {
    const allInvoices = await repositories.invoice.findAll();
    
    // Load related data
    for (const invoice of allInvoices) {
      if (invoice.orderId) {
        invoice.order = await repositories.order.findById(invoice.orderId) || undefined;
        if (invoice.order?.customerId) {
          invoice.order.customer = await repositories.customer.findById(invoice.order.customerId) || undefined;
        }
      }
    }
    
    return allInvoices.filter(invoice => {
      const invoiceDate = new Date(invoice.invoiceDate);
      return invoiceDate >= startDate && invoiceDate <= endDate;
    });
  }
  
  private async analyzeByProduct(orders: Order[], options: ReportOptions): Promise<any[]> {
    const productMap = new Map<string, any>();
    
    for (const order of orders) {
      for (const item of order.items) {
        const product = await repositories.product.findById(item.productId);
        if (!product) continue;
        
        const key = product.id;
        if (!productMap.has(key)) {
          productMap.set(key, {
            productId: product.id,
            productCode: product.productCode,
            productName: product.brandName,
            genericName: product.genericName,
            quantity: 0,
            revenue: 0,
            orderCount: 0
          });
        }
        
        const data = productMap.get(key);
        data.quantity += item.quantity;
        data.revenue += item.quantity * item.unitPrice;
        data.orderCount += 1;
      }
    }
    
    return Array.from(productMap.values()).sort((a, b) => b.revenue - a.revenue);
  }
  
  private async analyzeByCountry(orders: Order[], options: ReportOptions): Promise<any[]> {
    const countryMap = new Map<string, any>();
    
    for (const order of orders) {
      const customer = await repositories.customer.findById(order.customerId);
      if (!customer) continue;
      
      const country = customer.address.country;
      if (!countryMap.has(country)) {
        countryMap.set(country, {
          country,
          orderCount: 0,
          revenue: 0,
          customerCount: new Set()
        });
      }
      
      const data = countryMap.get(country);
      data.orderCount += 1;
      data.revenue += order.totalAmount;
      data.customerCount.add(customer.id);
    }
    
    return Array.from(countryMap.values()).map(data => ({
      ...data,
      customerCount: data.customerCount.size
    })).sort((a, b) => b.revenue - a.revenue);
  }
  
  private analyzeByPeriod(orders: Order[], options: ReportOptions): any[] {
    const periodMap = new Map<string, any>();
    const groupBy = options.groupBy || 'month';
    
    for (const order of orders) {
      const orderDate = new Date(order.orderDate);
      const periodKey = this.getPeriodKey(orderDate, groupBy);
      
      if (!periodMap.has(periodKey)) {
        periodMap.set(periodKey, {
          period: periodKey,
          orderCount: 0,
          revenue: 0,
          quantity: 0
        });
      }
      
      const data = periodMap.get(periodKey);
      data.orderCount += 1;
      data.revenue += order.totalAmount;
      data.quantity += order.items.reduce((sum, item) => sum + item.quantity, 0);
    }
    
    return Array.from(periodMap.values()).sort((a, b) => a.period.localeCompare(b.period));
  }
  
  private getPeriodKey(date: Date, groupBy: string): string {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const quarter = Math.ceil(month / 3);
    const week = this.getWeekNumber(date);
    
    switch (groupBy) {
      case 'day':
        return date.toISOString().split('T')[0];
      case 'week':
        return `${year}-W${week.toString().padStart(2, '0')}`;
      case 'month':
        return `${year}-${month.toString().padStart(2, '0')}`;
      case 'quarter':
        return `${year}-Q${quarter}`;
      case 'year':
        return year.toString();
      default:
        return `${year}-${month.toString().padStart(2, '0')}`;
    }
  }
  
  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }
  
  private getAgingBucket(daysOverdue: number): string {
    if (daysOverdue <= 0) return 'Current';
    if (daysOverdue <= 30) return '1-30 days';
    if (daysOverdue <= 60) return '31-60 days';
    if (daysOverdue <= 90) return '61-90 days';
    return 'Over 90 days';
  }
  
  private calculateMonthlyMovement(orders: Order[], productId: string, options: ReportOptions): any[] {
    const monthlyData = new Map<string, number>();
    
    orders.forEach(order => {
      const month = this.getPeriodKey(new Date(order.orderDate), 'month');
      const quantity = order.items
        .filter(item => item.productId === productId)
        .reduce((sum, item) => sum + item.quantity, 0);
      
      monthlyData.set(month, (monthlyData.get(month) || 0) + quantity);
    });
    
    return Array.from(monthlyData.entries()).map(([month, quantity]) => ({
      month,
      quantity
    }));
  }
  
  private calculateTurnoverRate(totalQuantity: number, options: ReportOptions): number {
    const months = Math.ceil((options.endDate.getTime() - options.startDate.getTime()) / (30 * 24 * 60 * 60 * 1000));
    return months > 0 ? totalQuantity / months : 0;
  }
  
  private analyzeClaimsByMonth(claimsData: any[]): any[] {
    const monthlyMap = new Map<string, any>();
    
    claimsData.forEach(claim => {
      const month = this.getPeriodKey(new Date(claim.invoiceDate), 'month');
      
      if (!monthlyMap.has(month)) {
        monthlyMap.set(month, {
          month,
          invoiceCount: 0,
          invoiceAmount: 0,
          drawbackAmount: 0,
          rodtepAmount: 0,
          totalBenefit: 0
        });
      }
      
      const data = monthlyMap.get(month);
      data.invoiceCount += 1;
      data.invoiceAmount += claim.invoiceAmount;
      data.drawbackAmount += claim.drawbackAmount;
      data.rodtepAmount += claim.rodtepAmount;
      data.totalBenefit += claim.totalBenefit;
    });
    
    return Array.from(monthlyMap.values()).sort((a, b) => a.month.localeCompare(b.month));
  }
  
  private async generateSalesCharts(productAnalysis: any[], countryAnalysis: any[], periodAnalysis: any[]): Promise<any[]> {
    const charts: any[] = [];
    
    // Product revenue chart
    const productChart: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: productAnalysis.slice(0, 10).map(p => p.productName),
        datasets: [{
          label: 'Revenue',
          data: productAnalysis.slice(0, 10).map(p => p.revenue),
          backgroundColor: 'rgba(30, 64, 175, 0.8)'
        }]
      },
      options: {
        responsive: false,
        plugins: {
          title: {
            display: true,
            text: 'Top 10 Products by Revenue'
          }
        }
      }
    };
    
    const productChartImage = await this.chartRenderer.renderToBuffer(productChart);
    charts.push({
      type: 'bar',
      title: 'Top 10 Products by Revenue',
      imageUrl: `data:image/png;base64,${productChartImage.toString('base64')}`,
      config: productChart
    });
    
    // Country pie chart
    const countryChart: ChartConfiguration = {
      type: 'pie',
      data: {
        labels: countryAnalysis.map(c => c.country),
        datasets: [{
          data: countryAnalysis.map(c => c.revenue),
          backgroundColor: [
            'rgba(30, 64, 175, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(147, 197, 253, 0.8)',
            'rgba(96, 165, 250, 0.8)',
            'rgba(37, 99, 235, 0.8)'
          ]
        }]
      },
      options: {
        responsive: false,
        plugins: {
          title: {
            display: true,
            text: 'Revenue by Country'
          }
        }
      }
    };
    
    const countryChartImage = await this.chartRenderer.renderToBuffer(countryChart);
    charts.push({
      type: 'pie',
      title: 'Revenue by Country',
      imageUrl: `data:image/png;base64,${countryChartImage.toString('base64')}`,
      config: countryChart
    });
    
    // Period trend chart
    const periodChart: ChartConfiguration = {
      type: 'line',
      data: {
        labels: periodAnalysis.map(p => p.period),
        datasets: [{
          label: 'Revenue',
          data: periodAnalysis.map(p => p.revenue),
          borderColor: 'rgba(30, 64, 175, 1)',
          backgroundColor: 'rgba(30, 64, 175, 0.1)',
          tension: 0.1
        }]
      },
      options: {
        responsive: false,
        plugins: {
          title: {
            display: true,
            text: 'Revenue Trend'
          }
        }
      }
    };
    
    const periodChartImage = await this.chartRenderer.renderToBuffer(periodChart);
    charts.push({
      type: 'line',
      title: 'Revenue Trend',
      imageUrl: `data:image/png;base64,${periodChartImage.toString('base64')}`,
      config: periodChart
    });
    
    return charts;
  }
  
  private async generateComplianceCharts(summary: any): Promise<any[]> {
    const chart: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: ['Active', 'Expiring Soon', 'Expired', 'Not Registered'],
        datasets: [{
          data: [
            summary.registered,
            summary.expiringSoon,
            summary.expired,
            summary.notRegistered
          ],
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',
            'rgba(251, 146, 60, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(156, 163, 175, 0.8)'
          ]
        }]
      },
      options: {
        responsive: false,
        plugins: {
          title: {
            display: true,
            text: 'Product Registration Status'
          }
        }
      }
    };
    
    const chartImage = await this.chartRenderer.renderToBuffer(chart);
    
    return [{
      type: 'doughnut',
      title: 'Product Registration Status',
      imageUrl: `data:image/png;base64,${chartImage.toString('base64')}`,
      config: chart
    }];
  }
  
  private async generateAgingCharts(agingAnalysis: any): Promise<any[]> {
    const chart: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: Object.keys(agingAnalysis),
        datasets: [{
          label: 'Amount',
          data: Object.values(agingAnalysis).map((items: any) => 
            items.reduce((sum: number, item: any) => sum + item.amount, 0)
          ),
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',
            'rgba(251, 191, 36, 0.8)',
            'rgba(251, 146, 60, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(127, 29, 29, 0.8)'
          ]
        }]
      },
      options: {
        responsive: false,
        plugins: {
          title: {
            display: true,
            text: 'Accounts Receivable Aging'
          }
        }
      }
    };
    
    const chartImage = await this.chartRenderer.renderToBuffer(chart);
    
    return [{
      type: 'bar',
      title: 'Accounts Receivable Aging',
      imageUrl: `data:image/png;base64,${chartImage.toString('base64')}`,
      config: chart
    }];
  }
  
  private async generateInventoryCharts(movementData: any[]): Promise<any[]> {
    const topProducts = movementData
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 10);
    
    const chart: ChartConfiguration = {
      type: 'horizontalBar',
      data: {
        labels: topProducts.map(p => p.productName),
        datasets: [{
          label: 'Quantity Moved',
          data: topProducts.map(p => p.totalQuantity),
          backgroundColor: 'rgba(30, 64, 175, 0.8)'
        }]
      },
      options: {
        responsive: false,
        plugins: {
          title: {
            display: true,
            text: 'Top 10 Products by Movement'
          }
        }
      }
    };
    
    const chartImage = await this.chartRenderer.renderToBuffer(chart as any);
    
    return [{
      type: 'horizontalBar',
      title: 'Top 10 Products by Movement',
      imageUrl: `data:image/png;base64,${chartImage.toString('base64')}`,
      config: chart
    }];
  }
  
  private async generateClaimsCharts(monthlyAnalysis: any[]): Promise<any[]> {
    const chart: ChartConfiguration = {
      type: 'line',
      data: {
        labels: monthlyAnalysis.map(m => m.month),
        datasets: [
          {
            label: 'Drawback',
            data: monthlyAnalysis.map(m => m.drawbackAmount),
            borderColor: 'rgba(30, 64, 175, 1)',
            backgroundColor: 'rgba(30, 64, 175, 0.1)',
            tension: 0.1
          },
          {
            label: 'RODTEP',
            data: monthlyAnalysis.map(m => m.rodtepAmount),
            borderColor: 'rgba(34, 197, 94, 1)',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            tension: 0.1
          }
        ]
      },
      options: {
        responsive: false,
        plugins: {
          title: {
            display: true,
            text: 'Monthly Drawback and RODTEP Claims'
          }
        }
      }
    };
    
    const chartImage = await this.chartRenderer.renderToBuffer(chart);
    
    return [{
      type: 'line',
      title: 'Monthly Drawback and RODTEP Claims',
      imageUrl: `data:image/png;base64,${chartImage.toString('base64')}`,
      config: chart
    }];
  }
  
  private addSummarySheet(sheet: ExcelJS.Worksheet, report: ReportData) {
    // Title
    sheet.mergeCells('A1:E1');
    sheet.getCell('A1').value = report.title;
    sheet.getCell('A1').font = { name: 'Arial', size: 16, bold: true };
    sheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
    
    // Generated date
    sheet.getCell('A3').value = 'Generated At:';
    sheet.getCell('B3').value = report.generatedAt;
    sheet.getCell('B3').numFmt = 'dd-mmm-yyyy hh:mm:ss';
    
    // Period
    sheet.getCell('A4').value = 'Report Period:';
    sheet.getCell('B4').value = `${report.period.start.toLocaleDateString()} to ${report.period.end.toLocaleDateString()}`;
    
    // Summary section
    sheet.getCell('A6').value = 'Summary';
    sheet.getCell('A6').font = { bold: true, size: 14 };
    
    let row = 7;
    Object.entries(report.summary).forEach(([key, value]) => {
      sheet.getCell(`A${row}`).value = this.formatLabel(key);
      sheet.getCell(`B${row}`).value = value;
      
      if (typeof value === 'number' && key.toLowerCase().includes('amount') || key.toLowerCase().includes('revenue')) {
        sheet.getCell(`B${row}`).numFmt = '#,##0.00';
      }
      
      row++;
    });
    
    // Format
    sheet.columns = [
      { width: 30 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 }
    ];
  }
  
  private addDataSheet(sheet: ExcelJS.Worksheet, data: any[]) {
    if (!data || data.length === 0) return;
    
    // Headers
    const headers = Object.keys(data[0]);
    const headerRow = sheet.addRow(headers.map(h => this.formatLabel(h)));
    
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E40AF' }
    };
    headerRow.font = { color: { argb: 'FFFFFFFF' }, bold: true };
    
    // Data
    data.forEach(row => {
      const values = headers.map(header => row[header]);
      sheet.addRow(values);
    });
    
    // Auto-fit columns
    sheet.columns.forEach((column, index) => {
      let maxLength = headers[index].length;
      
      data.forEach(row => {
        const value = row[headers[index]];
        if (value) {
          const length = value.toString().length;
          if (length > maxLength) maxLength = length;
        }
      });
      
      column.width = Math.min(maxLength + 2, 30);
    });
    
    // Add filters
    sheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: headers.length }
    };
  }
  
  private async addChartSheet(sheet: ExcelJS.Worksheet, charts: any[]) {
    let row = 1;
    
    for (const chart of charts) {
      sheet.mergeCells(`A${row}:E${row}`);
      sheet.getCell(`A${row}`).value = chart.title;
      sheet.getCell(`A${row}`).font = { bold: true, size: 14 };
      
      if (chart.imageUrl) {
        const imageId = sheet.workbook.addImage({
          base64: chart.imageUrl.split(',')[1],
          extension: 'png'
        });
        
        sheet.addImage(imageId, {
          tl: { col: 0, row: row },
          ext: { width: 600, height: 300 }
        });
        
        row += 20;
      }
    }
  }
  
  private formatLabel(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }
  
  async generateDrawbackClaimsReport(options: ReportOptions): Promise<ReportData> {
    const cacheKey = `drawback-claims-${JSON.stringify(options)}`;
    const cached = this.cache.get<ReportData>(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    const invoices = await this.getInvoicesInPeriod(options.startDate, options.endDate);
    const orders = await this.getOrdersInPeriod(options.startDate, options.endDate);
    
    // Calculate drawback and RODTEP claims
    const claimsData = orders.map(order => {
      const invoice = invoices.find(inv => inv.orderId === order.id);
      return {
        orderNumber: order.orderNumber,
        invoiceNumber: invoice?.invoiceNumber || '-',
        orderDate: order.orderDate,
        customer: order.customer?.companyName || 'Unknown',
        totalAmount: order.totalAmount,
        drawbackAmount: order.drawback,
        rodtepAmount: order.rodtep,
        totalClaim: order.drawback + order.rodtep,
        status: invoice ? 'Claimed' : 'Pending',
        currency: order.currency
      };
    });
    
    const summary = {
      totalOrders: claimsData.length,
      totalDrawback: claimsData.reduce((sum, c) => sum + c.drawbackAmount, 0),
      totalRodtep: claimsData.reduce((sum, c) => sum + c.rodtepAmount, 0),
      totalClaims: claimsData.reduce((sum, c) => sum + c.totalClaim, 0),
      pendingClaims: claimsData.filter(c => c.status === 'Pending').length,
      claimedAmount: claimsData.filter(c => c.status === 'Claimed')
        .reduce((sum, c) => sum + c.totalClaim, 0)
    };
    
    const reportData: ReportData = {
      title: 'Drawback/RODTEP Claims Report',
      generatedAt: new Date(),
      period: {
        start: options.startDate || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        end: options.endDate || new Date()
      },
      data: claimsData,
      summary
    };
    
    if (options.includeCharts || options.includeChart) {
      reportData.charts = await this.generateDrawbackCharts(claimsData, summary);
    }
    
    if (options.format === 'excel') {
      const excelFile = await this.createDrawbackExcelReport(reportData);
      reportData.excelFile = excelFile;
    }
    
    this.cache.set(cacheKey, reportData);
    return reportData;
  }

  private async generateDrawbackCharts(claimsData: any[], summary: any): Promise<any[]> {
    const charts: any[] = [];
    
    // Monthly claims chart
    const monthlyData = this.groupByMonth(claimsData, 'orderDate');
    const monthlyChart: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: Object.keys(monthlyData),
        datasets: [
          {
            label: 'Drawback',
            data: Object.values(monthlyData).map((items: any) => 
              items.reduce((sum: number, item: any) => sum + item.drawbackAmount, 0)
            ),
            backgroundColor: 'rgba(59, 130, 246, 0.8)'
          },
          {
            label: 'RODTEP',
            data: Object.values(monthlyData).map((items: any) => 
              items.reduce((sum: number, item: any) => sum + item.rodtepAmount, 0)
            ),
            backgroundColor: 'rgba(16, 185, 129, 0.8)'
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Monthly Drawback/RODTEP Claims'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            stacked: true
          },
          x: {
            stacked: true
          }
        }
      }
    };
    
    const monthlyChartImage = await this.chartRenderer.renderToBuffer(monthlyChart);
    charts.push({
      type: 'bar',
      title: 'Monthly Claims',
      imageUrl: `data:image/png;base64,${monthlyChartImage.toString('base64')}`,
      config: monthlyChart
    });
    
    return charts;
  }

  private async createDrawbackExcelReport(data: ReportData): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Drawback Claims');
    
    // Add headers
    worksheet.addRow(['Drawback/RODTEP Claims Report']);
    worksheet.addRow([`Generated: ${data.generatedAt.toLocaleString()}`]);
    worksheet.addRow([`Period: ${data.period.start.toLocaleDateString()} - ${data.period.end.toLocaleDateString()}`]);
    worksheet.addRow([]);
    
    // Add summary
    worksheet.addRow(['Summary']);
    worksheet.addRow(['Total Orders:', data.summary.totalOrders]);
    worksheet.addRow(['Total Drawback:', this.formatCurrency(data.summary.totalDrawback, 'INR')]);
    worksheet.addRow(['Total RODTEP:', this.formatCurrency(data.summary.totalRodtep, 'INR')]);
    worksheet.addRow(['Total Claims:', this.formatCurrency(data.summary.totalClaims, 'INR')]);
    worksheet.addRow(['Pending Claims:', data.summary.pendingClaims]);
    worksheet.addRow([]);
    
    // Add data table
    worksheet.addRow(['Order No', 'Invoice No', 'Date', 'Customer', 'Total Amount', 'Drawback', 'RODTEP', 'Total Claim', 'Status']);
    
    data.data.forEach((row: any) => {
      worksheet.addRow([
        row.orderNumber,
        row.invoiceNumber,
        new Date(row.orderDate).toLocaleDateString(),
        row.customer,
        this.formatCurrency(row.totalAmount, row.currency),
        this.formatCurrency(row.drawbackAmount, row.currency),
        this.formatCurrency(row.rodtepAmount, row.currency),
        this.formatCurrency(row.totalClaim, row.currency),
        row.status
      ]);
    });
    
    // Style the worksheet
    worksheet.getColumn(5).numFmt = '#,##0.00';
    worksheet.getColumn(6).numFmt = '#,##0.00';
    worksheet.getColumn(7).numFmt = '#,##0.00';
    worksheet.getColumn(8).numFmt = '#,##0.00';
    
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer as Buffer;
  }

  getCachedReport(cacheKey: string): ReportData | undefined {
    return this.cache.get<ReportData>(cacheKey);
  }

  clearCache(): void {
    this.cache.flushAll();
  }
}

export const misReportService = new MISReportService();