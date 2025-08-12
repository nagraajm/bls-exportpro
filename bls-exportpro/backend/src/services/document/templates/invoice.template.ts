import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { BaseDocumentTemplate, DocumentOptions } from './base.template';
import { Invoice, InvoiceType } from '../../../../../shared/types';

export class InvoiceTemplate extends BaseDocumentTemplate {
  constructor(options: DocumentOptions = {}) {
    super(options);
  }
  
  async generate(invoice: Invoice): Promise<string> {
    const filename = `invoice-${invoice.invoiceNumber}-${Date.now()}.pdf`;
    const filepath = path.join(process.env.UPLOAD_DIR || './uploads', filename);
    
    return new Promise((resolve, reject) => {
      this.doc = new PDFDocument({
        size: this.options.size,
        margins: this.options.margins,
        bufferPages: true // Enable page buffering for total page count
      });
      
      const stream = fs.createWriteStream(filepath);
      this.doc.pipe(stream);
      
      // Generate content
      this.addContent(invoice);
      
      // Get total pages
      this.totalPages = this.doc.bufferedPageRange().count;
      
      // Add page numbers to all pages
      for (let i = 0; i < this.totalPages; i++) {
        this.doc.switchToPage(i);
        this.currentPage = i + 1;
        this.addPageNumber(this.doc);
        this.addWatermark(this.doc, this.getWatermarkText(invoice.invoiceType));
      }
      
      this.doc.end();
      
      stream.on('finish', () => resolve(filepath));
      stream.on('error', reject);
    });
  }
  
  private addContent(invoice: Invoice) {
    // Company header
    this.addCompanyHeader(this.doc);
    
    // Invoice title and details
    this.addInvoiceHeader(invoice);
    
    // Add QR code with invoice details
    const qrData = JSON.stringify({
      invoiceNo: invoice.invoiceNumber,
      date: invoice.invoiceDate,
      amount: invoice.totalAmount,
      currency: invoice.currency
    });
    this.addQRCode(this.doc, qrData, 450, 170, 80);
    
    // Billing and shipping information
    this.addBillingShippingInfo(invoice);
    
    // Items table
    const tableEndY = this.addItemsTable(invoice);
    
    // Calculations section
    this.addCalculationsSection(invoice, tableEndY);
    
    // Shipping marks
    if (invoice.order?.shippingMarks) {
      this.addShippingMarks(invoice.order.shippingMarks);
    }
    
    // Bank details
    this.addBankDetails(invoice);
    
    // Terms and conditions
    this.addTermsAndConditions(invoice);
    
    // Authorized signatory
    this.addAuthorizedSignatory(invoice);
  }
  
  private getWatermarkText(invoiceType: InvoiceType): string {
    switch (invoiceType) {
      case 'proforma':
        return 'PROFORMA';
      case 'pre-shipment':
        return 'PRE-SHIPMENT';
      case 'post-shipment':
        return 'FINAL INVOICE';
      default:
        return 'INVOICE';
    }
  }
  
  private addInvoiceHeader(invoice: Invoice) {
    const title = this.getInvoiceTitle(invoice.invoiceType);
    
    // Title
    this.doc.fontSize(18)
       .font('Helvetica-Bold')
       .fillColor('#1e40af')
       .text(title, 50, 170, { align: 'center', width: 350 });
    
    // Invoice details box
    this.doc.roundedRect(50, 200, 250, 80, 5)
       .stroke();
    
    this.doc.fontSize(10)
       .fillColor('#000000')
       .font('Helvetica-Bold')
       .text('Invoice No:', 60, 210)
       .text('Invoice Date:', 60, 230)
       .text('Due Date:', 60, 250);
    
    this.doc.font('Helvetica')
       .text(invoice.invoiceNumber, 140, 210)
       .text(new Date(invoice.invoiceDate).toLocaleDateString('en-US', {
         year: 'numeric',
         month: 'long',
         day: 'numeric'
       }), 140, 230);
    
    const dueDate = new Date(invoice.invoiceDate);
    dueDate.setDate(dueDate.getDate() + 30);
    this.doc.text(dueDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }), 140, 250);
  }
  
  private getInvoiceTitle(type: InvoiceType): string {
    switch (type) {
      case 'proforma':
        return 'PROFORMA INVOICE';
      case 'pre-shipment':
        return 'PRE-SHIPMENT INVOICE';
      case 'post-shipment':
        return 'COMMERCIAL INVOICE';
      default:
        return 'INVOICE';
    }
  }
  
  private addBillingShippingInfo(invoice: Invoice) {
    const customer = invoice.order?.customer;
    if (!customer) return;
    
    const y = 300;
    
    // Bill To section
    this.doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#1e40af')
       .text('BILL TO:', 50, y);
    
    this.doc.fontSize(10)
       .fillColor('#000000')
       .font('Helvetica-Bold')
       .text(customer.companyName, 50, y + 20);
    
    this.doc.font('Helvetica')
       .text(customer.address.street, 50, y + 35)
       .text(`${customer.address.city}, ${customer.address.state}`, 50, y + 50)
       .text(`${customer.address.country} - ${customer.address.postalCode}`, 50, y + 65)
       .text(`Contact: ${customer.contactPerson}`, 50, y + 80)
       .text(`Email: ${customer.email}`, 50, y + 95)
       .text(`Phone: ${customer.phone}`, 50, y + 110);
    
    // Ship To section (same as Bill To for now)
    this.doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#1e40af')
       .text('SHIP TO:', 300, y);
    
    this.doc.fontSize(10)
       .fillColor('#000000')
       .font('Helvetica-Bold')
       .text(customer.companyName, 300, y + 20);
    
    this.doc.font('Helvetica')
       .text(customer.address.street, 300, y + 35)
       .text(`${customer.address.city}, ${customer.address.state}`, 300, y + 50)
       .text(`${customer.address.country} - ${customer.address.postalCode}`, 300, y + 65);
  }
  
  private addItemsTable(invoice: Invoice): number {
    const items = invoice.order?.items || [];
    const startY = 450;
    const columnWidths = [40, 200, 80, 60, 80, 90];
    const headers = ['S.No', 'Product Description', 'HSN Code', 'Qty', 'Unit Price', 'Total'];
    
    let currentY = this.addTableHeader(this.doc, headers, 50, startY, columnWidths);
    
    items.forEach((item: any, index: number) => {
      if (currentY > 700) {
        this.doc.addPage();
        this.addCompanyHeader(this.doc);
        currentY = 180;
        currentY = this.addTableHeader(this.doc, headers, 50, currentY, columnWidths);
      }
      
      const product = item.product;
      const description = product ? [
        product.brandName,
        `${product.genericName} ${product.strength}`,
        `${product.dosageForm} - ${product.packSize}`,
        `Batch: ${item.batchNumber}`,
        item.expiryDate ? `Exp: ${new Date(item.expiryDate).toLocaleDateString()}` : ''
      ].filter(Boolean).join('\n') : 'Product';
      
      // Alternate row coloring
      if (index % 2 === 0) {
        this.doc.rect(50, currentY - 5, columnWidths.reduce((a, b) => a + b, 0), 50)
           .fill('#f3f4f6')
           .fill('#000000');
      }
      
      this.doc.fontSize(9)
         .text(String(index + 1), 55, currentY)
         .text(description, 95, currentY, { width: 190, height: 45 })
         .text(product?.hsnCode || '', 295, currentY)
         .text(String(item.quantity), 375, currentY)
         .text(this.formatCurrency(item.unitPrice, invoice.currency), 435, currentY)
         .text(this.formatCurrency(item.totalPrice, invoice.currency), 515, currentY);
      
      currentY += 50;
    });
    
    // Table border
    this.doc.rect(50, startY - 5, columnWidths.reduce((a, b) => a + b, 0), currentY - startY + 5)
       .stroke();
    
    return currentY + 10;
  }
  
  private addCalculationsSection(invoice: Invoice, startY: number) {
    const calcX = 350;
    let currentY = startY + 20;
    
    // Subtotal
    this.doc.fontSize(10)
       .text('Subtotal:', calcX, currentY)
       .text(this.formatCurrency(invoice.subtotal, invoice.currency), 470, currentY, { align: 'right', width: 80 });
    
    currentY += 20;
    
    // IGST
    if (invoice.igst !== undefined) {
      this.doc.text('IGST (0%):', calcX, currentY)
         .text(this.formatCurrency(invoice.igst, invoice.currency), 470, currentY, { align: 'right', width: 80 });
      currentY += 20;
    }
    
    // Drawback
    if (invoice.drawback > 0) {
      this.doc.text('Drawback (1.2%):', calcX, currentY)
         .text(`-${this.formatCurrency(invoice.drawback, invoice.currency)}`, 470, currentY, { align: 'right', width: 80 });
      currentY += 20;
    }
    
    // RODTEP
    if (invoice.rodtep > 0) {
      this.doc.text('RODTEP (0.70%):', calcX, currentY)
         .text(`-${this.formatCurrency(invoice.rodtep, invoice.currency)}`, 470, currentY, { align: 'right', width: 80 });
      currentY += 20;
    }
    
    // Total line
    this.doc.moveTo(calcX, currentY)
       .lineTo(550, currentY)
       .stroke();
    
    currentY += 10;
    
    // Total amount
    this.doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#1e40af')
       .text('Total Amount:', calcX, currentY)
       .text(this.formatCurrency(invoice.totalAmount, invoice.currency), 470, currentY, { align: 'right', width: 80 });
    
    this.doc.fillColor('#000000').font('Helvetica');
  }
  
  private addShippingMarks(shippingMarks: string) {
    if (this.doc.y > 600) {
      this.doc.addPage();
      this.addCompanyHeader(this.doc);
    }
    
    const y = this.doc.y + 30;
    
    this.doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#1e40af')
       .text('SHIPPING MARKS:', 50, y);
    
    this.doc.roundedRect(50, y + 20, 500, 80, 5)
       .stroke();
    
    this.doc.fontSize(10)
       .fillColor('#000000')
       .font('Helvetica')
       .text(shippingMarks, 60, y + 30, { width: 480, height: 60 });
  }
  
  private addBankDetails(invoice: Invoice) {
    if (this.doc.y > 500) {
      this.doc.addPage();
      this.addCompanyHeader(this.doc);
    }
    
    const y = this.doc.y + 120;
    const bank = invoice.bankDetails;
    
    this.doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#1e40af')
       .text('BANK DETAILS FOR PAYMENT:', 50, y);
    
    this.doc.roundedRect(50, y + 20, 500, 120, 5)
       .fillAndStroke('#f8fafc', '#e5e7eb');
    
    this.doc.fillColor('#000000')
       .fontSize(10)
       .font('Helvetica-Bold')
       .text('Bank Name:', 60, y + 30)
       .text('Account Name:', 60, y + 50)
       .text('Account Number:', 60, y + 70)
       .text('SWIFT Code:', 300, y + 30)
       .text('IFSC Code:', 300, y + 50)
       .text('Branch:', 300, y + 70);
    
    this.doc.font('Helvetica')
       .text(bank.bankName, 150, y + 30)
       .text(bank.accountName, 150, y + 50)
       .text(bank.accountNumber, 150, y + 70)
       .text(bank.swiftCode, 380, y + 30)
       .text(bank.ifscCode || '-', 380, y + 50)
       .text(bank.branchAddress || '-', 380, y + 70, { width: 160 });
  }
  
  private addTermsAndConditions(invoice: Invoice) {
    if (!invoice.termsAndConditions) return;
    
    if (this.doc.y > 450) {
      this.doc.addPage();
      this.addCompanyHeader(this.doc);
    }
    
    const y = this.doc.y + 160;
    
    this.doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#1e40af')
       .text('TERMS & CONDITIONS:', 50, y);
    
    this.doc.fontSize(9)
       .fillColor('#000000')
       .font('Helvetica')
       .text(invoice.termsAndConditions, 50, y + 20, { width: 500, align: 'justify' });
  }
  
  private addAuthorizedSignatory(invoice: Invoice) {
    const y = this.doc.page.height - 150;
    
    // For BLS Trading Company
    this.doc.fontSize(10)
       .font('Helvetica-Bold')
       .text('For BLS TRADING COMPANY', 350, y);
    
    // Digital signature placeholder
    this.addDigitalSignaturePlaceholder(this.doc, 350, y + 20);
    
    this.doc.fontSize(10)
       .font('Helvetica')
       .text('Authorized Signatory', 350, y + 90);
    
    // Add barcode for invoice number
    this.addBarcode(this.doc, invoice.invoiceNumber, 50, y + 20, { width: 200 });
  }
}