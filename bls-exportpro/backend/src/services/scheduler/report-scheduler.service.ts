import * as cron from 'node-cron';
import { misReportService } from '../mis/mis-report.service';
import { emailService } from '../email.service';
import { ReportOptions } from '../mis/mis-report.service';
import fs from 'fs';
import path from 'path';

export interface ScheduledReport {
  id: string;
  name: string;
  reportType: 'sales-analysis' | 'regulatory-compliance' | 'payment-outstanding' | 'inventory-movement' | 'drawback-claims';
  schedule: string; // Cron expression
  options: ReportOptions;
  recipients: string[];
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class ReportSchedulerService {
  private scheduledJobs: Map<string, cron.ScheduledTask>;
  private scheduledReports: Map<string, ScheduledReport>;

  constructor() {
    this.scheduledJobs = new Map();
    this.scheduledReports = new Map();
    this.loadScheduledReports();
  }

  private loadScheduledReports() {
    // In a real application, this would load from database
    // For now, we'll use a file-based approach
    const configPath = path.join(process.cwd(), 'config', 'scheduled-reports.json');
    
    if (fs.existsSync(configPath)) {
      try {
        const data = fs.readFileSync(configPath, 'utf-8');
        const reports = JSON.parse(data) as ScheduledReport[];
        
        reports.forEach(report => {
          this.scheduledReports.set(report.id, report);
          if (report.enabled) {
            this.scheduleReport(report);
          }
        });
      } catch (error) {
        console.error('Error loading scheduled reports:', error);
      }
    }
  }

  private saveScheduledReports() {
    const configPath = path.join(process.cwd(), 'config', 'scheduled-reports.json');
    const reports = Array.from(this.scheduledReports.values());
    
    try {
      if (!fs.existsSync(path.dirname(configPath))) {
        fs.mkdirSync(path.dirname(configPath), { recursive: true });
      }
      fs.writeFileSync(configPath, JSON.stringify(reports, null, 2));
    } catch (error) {
      console.error('Error saving scheduled reports:', error);
    }
  }

  addScheduledReport(report: Omit<ScheduledReport, 'id' | 'createdAt' | 'updatedAt'>): ScheduledReport {
    const newReport: ScheduledReport = {
      ...report,
      id: `report-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.scheduledReports.set(newReport.id, newReport);
    
    if (newReport.enabled) {
      this.scheduleReport(newReport);
    }
    
    this.saveScheduledReports();
    return newReport;
  }

  updateScheduledReport(id: string, updates: Partial<ScheduledReport>): ScheduledReport | null {
    const report = this.scheduledReports.get(id);
    if (!report) return null;

    const updatedReport = {
      ...report,
      ...updates,
      id: report.id, // Ensure ID cannot be changed
      updatedAt: new Date()
    };

    // If schedule changed or enabled/disabled, update the cron job
    if (updates.schedule !== undefined || updates.enabled !== undefined) {
      this.cancelScheduledJob(id);
      if (updatedReport.enabled) {
        this.scheduleReport(updatedReport);
      }
    }

    this.scheduledReports.set(id, updatedReport);
    this.saveScheduledReports();
    return updatedReport;
  }

  deleteScheduledReport(id: string): boolean {
    this.cancelScheduledJob(id);
    const deleted = this.scheduledReports.delete(id);
    if (deleted) {
      this.saveScheduledReports();
    }
    return deleted;
  }

  getScheduledReport(id: string): ScheduledReport | undefined {
    return this.scheduledReports.get(id);
  }

  getAllScheduledReports(): ScheduledReport[] {
    return Array.from(this.scheduledReports.values());
  }

  private scheduleReport(report: ScheduledReport) {
    if (!cron.validate(report.schedule)) {
      console.error(`Invalid cron expression for report ${report.id}: ${report.schedule}`);
      return;
    }

    const job = cron.schedule(report.schedule, async () => {
      await this.executeReport(report);
    }, {
      scheduled: true,
      timezone: process.env.TZ || 'Asia/Kolkata'
    });

    this.scheduledJobs.set(report.id, job);
    
    // Update next run time
    report.nextRun = this.getNextRunTime(report.schedule);
    this.scheduledReports.set(report.id, report);
  }

  private cancelScheduledJob(reportId: string) {
    const job = this.scheduledJobs.get(reportId);
    if (job) {
      job.stop();
      this.scheduledJobs.delete(reportId);
    }
  }

  private async executeReport(report: ScheduledReport) {
    console.log(`Executing scheduled report: ${report.name} (${report.id})`);
    
    try {
      let reportData;
      
      // Generate the report based on type
      switch (report.reportType) {
        case 'sales-analysis':
          reportData = await misReportService.generateSalesAnalysisReport({
            ...report.options,
            format: 'excel'
          });
          break;
        case 'regulatory-compliance':
          reportData = await misReportService.generateRegulatoryComplianceReport({
            ...report.options,
            format: 'excel'
          });
          break;
        case 'payment-outstanding':
          reportData = await misReportService.generatePaymentOutstandingReport({
            ...report.options,
            format: 'excel'
          });
          break;
        case 'inventory-movement':
          reportData = await misReportService.generateInventoryMovementReport({
            ...report.options,
            format: 'excel'
          });
          break;
        case 'drawback-claims':
          reportData = await misReportService.generateDrawbackClaimsReport({
            ...report.options,
            format: 'excel'
          });
          break;
        default:
          throw new Error(`Unknown report type: ${report.reportType}`);
      }

      // Save the report file
      const reportsDir = path.join(process.cwd(), 'generated-reports');
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }

      const fileName = `${report.reportType}-${new Date().toISOString().split('T')[0]}-${Date.now()}.xlsx`;
      const filePath = path.join(reportsDir, fileName);
      
      if (reportData.excelFile) {
        fs.writeFileSync(filePath, reportData.excelFile);
      }

      // Send email to recipients
      if (report.recipients.length > 0) {
        await this.sendReportEmail(report, filePath, reportData);
      }

      // Update last run time
      report.lastRun = new Date();
      report.nextRun = this.getNextRunTime(report.schedule);
      this.scheduledReports.set(report.id, report);
      this.saveScheduledReports();

      console.log(`Successfully executed scheduled report: ${report.name}`);
    } catch (error) {
      console.error(`Error executing scheduled report ${report.id}:`, error);
      // In a production system, we would send an alert or log this to a monitoring service
    }
  }

  private async sendReportEmail(report: ScheduledReport, filePath: string, reportData: any) {
    const subject = `[BLS ExportPro] ${report.name} - ${new Date().toLocaleDateString()}`;
    
    const summary = this.generateReportSummary(report.reportType, reportData);
    
    const htmlContent = `
      <h2>${report.name}</h2>
      <p>Your scheduled ${report.reportType.replace('-', ' ')} report has been generated.</p>
      
      <h3>Report Summary:</h3>
      ${summary}
      
      <p>Please find the detailed report attached.</p>
      
      <hr>
      <p style="font-size: 12px; color: #666;">
        This is an automated report generated by BLS ExportPro.
        Report generated on: ${new Date().toLocaleString()}
      </p>
    `;

    try {
      await emailService.sendEmail({
        to: report.recipients,
        subject,
        html: htmlContent,
        attachments: [{
          filename: path.basename(filePath),
          path: filePath
        }]
      });
    } catch (error) {
      console.error('Error sending report email:', error);
    }
  }

  private generateReportSummary(reportType: string, reportData: any): string {
    const summary = reportData.summary || {};
    
    switch (reportType) {
      case 'sales-analysis':
        return `
          <ul>
            <li>Total Revenue: ${summary.totalRevenue || 'N/A'}</li>
            <li>Number of Orders: ${summary.totalOrders || 'N/A'}</li>
            <li>Top Product: ${summary.topProduct || 'N/A'}</li>
            <li>Period: ${summary.period || 'N/A'}</li>
          </ul>
        `;
      
      case 'regulatory-compliance':
        return `
          <ul>
            <li>Active Registrations: ${summary.activeCount || 0}</li>
            <li>Expiring Soon: ${summary.expiringSoonCount || 0}</li>
            <li>Expired: ${summary.expiredCount || 0}</li>
            <li>Compliance Rate: ${summary.complianceRate || 'N/A'}%</li>
          </ul>
        `;
      
      case 'payment-outstanding':
        return `
          <ul>
            <li>Total Outstanding: ${summary.totalOutstanding || 'N/A'}</li>
            <li>Overdue Amount: ${summary.overdueAmount || 'N/A'}</li>
            <li>Number of Pending Invoices: ${summary.pendingInvoices || 0}</li>
          </ul>
        `;
      
      default:
        return '<p>Report generated successfully. Please see attached file for details.</p>';
    }
  }

  private getNextRunTime(cronExpression: string): Date {
    const interval = cron.parseExpression(cronExpression);
    return interval.next().toDate();
  }

  // Start all enabled scheduled reports
  startScheduler() {
    console.log('Starting report scheduler...');
    this.scheduledReports.forEach(report => {
      if (report.enabled && !this.scheduledJobs.has(report.id)) {
        this.scheduleReport(report);
      }
    });
  }

  // Stop all scheduled reports
  stopScheduler() {
    console.log('Stopping report scheduler...');
    this.scheduledJobs.forEach((job, id) => {
      job.stop();
    });
    this.scheduledJobs.clear();
  }
}

export const reportSchedulerService = new ReportSchedulerService();