import { InvoiceTemplate } from './templates/invoice.template';
import { PackingListTemplate } from './templates/packing-list.template';
import { PurchaseOrderTemplate } from './templates/purchase-order.template';
import { ExcelExportService } from './excel-export.service';
import { EmailTemplateService } from './email-template.service';
import { Invoice, PackingList, PurchaseOrder } from '../../../../shared/types';
import path from 'path';
import fs from 'fs';

export interface DocumentGenerationOptions {
  watermark?: string;
  includePageNumbers?: boolean;
  includeVersion?: boolean;
  version?: string;
  digitalSignaturePlaceholder?: boolean;
  format?: 'pdf' | 'excel' | 'html';
}

export class EnhancedDocumentService {
  private invoiceTemplate: InvoiceTemplate;
  private packingListTemplate: PackingListTemplate;
  private purchaseOrderTemplate: PurchaseOrderTemplate;
  private excelExportService: ExcelExportService;
  private emailTemplateService: EmailTemplateService;
  
  constructor() {
    this.invoiceTemplate = new InvoiceTemplate();
    this.packingListTemplate = new PackingListTemplate();
    this.purchaseOrderTemplate = new PurchaseOrderTemplate();
    this.excelExportService = new ExcelExportService();
    this.emailTemplateService = new EmailTemplateService();
    
    this.ensureDirectories();
  }
  
  private ensureDirectories() {
    const dirs = [
      process.env.UPLOAD_DIR || './uploads',
      path.join(process.env.UPLOAD_DIR || './uploads', 'invoices'),
      path.join(process.env.UPLOAD_DIR || './uploads', 'packing-lists'),
      path.join(process.env.UPLOAD_DIR || './uploads', 'purchase-orders'),
      path.join(process.env.UPLOAD_DIR || './uploads', 'excel'),
      path.join(process.env.UPLOAD_DIR || './uploads', 'temp')
    ];
    
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }
  
  async generateInvoice(invoice: Invoice, options: DocumentGenerationOptions = {}): Promise<{
    pdf?: string;
    excel?: string;
    html?: string;
  }> {
    const results: any = {};
    
    // Always generate PDF as primary format
    const customOptions = {
      watermark: options.watermark || this.getInvoiceWatermark(invoice.invoiceType),
      includePageNumbers: options.includePageNumbers !== false,
      includeVersion: options.includeVersion !== false,
      version: options.version || '1.0',
      digitalSignaturePlaceholder: options.digitalSignaturePlaceholder !== false
    };
    
    results.pdf = await this.invoiceTemplate.generate(invoice);
    
    // Generate Excel if requested
    if (options.format === 'excel' || options.format === undefined) {
      results.excel = await this.excelExportService.generateInvoiceExcel(invoice);
    }
    
    // Generate HTML for email if requested
    if (options.format === 'html') {
      results.html = await this.emailTemplateService.generateInvoiceHTML(invoice);
    }
    
    // Track document version
    await this.trackDocumentVersion(invoice.invoiceNumber, 'invoice', results);
    
    return results;
  }
  
  async generatePackingList(packingList: PackingList, options: DocumentGenerationOptions = {}): Promise<{
    pdf?: string;
    excel?: string;
    html?: string;
  }> {
    const results: any = {};
    
    const customOptions = {
      watermark: options.watermark || 'PACKING LIST',
      includePageNumbers: options.includePageNumbers !== false,
      includeVersion: options.includeVersion !== false,
      version: options.version || '1.0',
      digitalSignaturePlaceholder: options.digitalSignaturePlaceholder !== false
    };
    
    results.pdf = await this.packingListTemplate.generate(packingList);
    
    if (options.format === 'excel' || options.format === undefined) {
      results.excel = await this.excelExportService.generatePackingListExcel(packingList);
    }
    
    if (options.format === 'html') {
      results.html = await this.emailTemplateService.generatePackingListHTML(packingList);
    }
    
    await this.trackDocumentVersion(packingList.packingListNumber, 'packing-list', results);
    
    return results;
  }
  
  async generatePurchaseOrder(purchaseOrder: PurchaseOrder, options: DocumentGenerationOptions = {}): Promise<{
    pdf?: string;
    excel?: string;
    html?: string;
  }> {
    const results: any = {};
    
    const customOptions = {
      watermark: options.watermark || this.getPOWatermark(purchaseOrder.status),
      includePageNumbers: options.includePageNumbers !== false,
      includeVersion: options.includeVersion !== false,
      version: options.version || '1.0',
      digitalSignaturePlaceholder: options.digitalSignaturePlaceholder !== false
    };
    
    results.pdf = await this.purchaseOrderTemplate.generate(purchaseOrder);
    
    if (options.format === 'excel' || options.format === undefined) {
      results.excel = await this.excelExportService.generatePurchaseOrderExcel(purchaseOrder);
    }
    
    if (options.format === 'html') {
      results.html = await this.emailTemplateService.generatePurchaseOrderHTML(purchaseOrder);
    }
    
    await this.trackDocumentVersion(purchaseOrder.poNumber, 'purchase-order', results);
    
    return results;
  }
  
  private getInvoiceWatermark(type: string): string {
    switch (type) {
      case 'proforma':
        return 'PROFORMA';
      case 'pre-shipment':
        return 'PRE-SHIPMENT';
      case 'post-shipment':
        return 'FINAL';
      default:
        return '';
    }
  }
  
  private getPOWatermark(status: string): string {
    switch (status) {
      case 'draft':
        return 'DRAFT';
      case 'cancelled':
        return 'CANCELLED';
      default:
        return '';
    }
  }
  
  private async trackDocumentVersion(documentNumber: string, type: string, files: any) {
    const versionFile = path.join(process.env.UPLOAD_DIR || './uploads', 'versions.json');
    let versions: any = {};
    
    if (fs.existsSync(versionFile)) {
      versions = JSON.parse(fs.readFileSync(versionFile, 'utf-8'));
    }
    
    if (!versions[type]) {
      versions[type] = {};
    }
    
    if (!versions[type][documentNumber]) {
      versions[type][documentNumber] = [];
    }
    
    versions[type][documentNumber].push({
      timestamp: new Date().toISOString(),
      files: files,
      version: versions[type][documentNumber].length + 1
    });
    
    fs.writeFileSync(versionFile, JSON.stringify(versions, null, 2));
  }
  
  async getDocumentVersions(documentNumber: string, type: string): Promise<any[]> {
    const versionFile = path.join(process.env.UPLOAD_DIR || './uploads', 'versions.json');
    
    if (!fs.existsSync(versionFile)) {
      return [];
    }
    
    const versions: any = JSON.parse(fs.readFileSync(versionFile, 'utf-8'));
    return versions[type]?.[documentNumber] || [];
  }
  
  // Bulk document generation
  async generateBulkDocuments(orders: any[], type: 'invoice' | 'packing-list', options: DocumentGenerationOptions = {}): Promise<string> {
    const tempDir = path.join(process.env.UPLOAD_DIR || './uploads', 'temp', `bulk-${Date.now()}`);
    fs.mkdirSync(tempDir, { recursive: true });
    
    const results = [];
    
    for (const order of orders) {
      try {
        let result;
        if (type === 'invoice') {
          result = await this.generateInvoice(order.invoice, options);
        } else if (type === 'packing-list') {
          result = await this.generatePackingList(order.packingList, options);
        }
        
        if (result?.pdf) {
          const filename = path.basename(result.pdf);
          const tempPath = path.join(tempDir, filename);
          fs.copyFileSync(result.pdf, tempPath);
          results.push(tempPath);
        }
      } catch (error) {
        console.error(`Error generating document for order ${order.id}:`, error);
      }
    }
    
    // Create a zip file of all documents
    const archiver = require('archiver');
    const zipPath = path.join(process.env.UPLOAD_DIR || './uploads', `bulk-${type}-${Date.now()}.zip`);
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    return new Promise((resolve, reject) => {
      output.on('close', () => {
        // Clean up temp directory
        fs.rmSync(tempDir, { recursive: true, force: true });
        resolve(zipPath);
      });
      
      archive.on('error', reject);
      archive.pipe(output);
      archive.directory(tempDir, false);
      archive.finalize();
    });
  }
}

export const enhancedDocumentService = new EnhancedDocumentService();