import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { BaseDocumentTemplate, DocumentOptions } from './base.template';
import { PurchaseOrder } from '../../../../../shared/types';

export class PurchaseOrderTemplate extends BaseDocumentTemplate {
  constructor(options: DocumentOptions = {}) {
    super(options);
  }
  
  async generate(purchaseOrder: PurchaseOrder): Promise<string> {
    const filename = `purchase-order-${purchaseOrder.poNumber}-${Date.now()}.pdf`;
    const filepath = path.join(process.env.UPLOAD_DIR || './uploads', filename);
    
    return new Promise((resolve, reject) => {
      this.doc = new PDFDocument({
        size: this.options.size,
        margins: this.options.margins,
        bufferPages: true
      });
      
      const stream = fs.createWriteStream(filepath);
      this.doc.pipe(stream);
      
      // Generate content
      this.addContent(purchaseOrder);
      
      // Get total pages
      this.totalPages = this.doc.bufferedPageRange().count;
      
      // Add page numbers to all pages
      for (let i = 0; i < this.totalPages; i++) {
        this.doc.switchToPage(i);
        this.currentPage = i + 1;
        this.addPageNumber(this.doc);
        this.addWatermark(this.doc, 'PURCHASE ORDER');
      }
      
      this.doc.end();
      
      stream.on('finish', () => resolve(filepath));
      stream.on('error', reject);
    });
  }
  
  private addContent(purchaseOrder: PurchaseOrder) {
    // Company header
    this.addCompanyHeader(this.doc);
    
    // Purchase order header
    this.addPurchaseOrderHeader(purchaseOrder);
    
    // Add QR code with PO details
    const qrData = JSON.stringify({
      poNo: purchaseOrder.poNumber,
      date: purchaseOrder.orderDate,
      supplier: purchaseOrder.supplier?.companyName,
      amount: purchaseOrder.totalAmount
    });
    this.addQRCode(this.doc, qrData, 450, 170, 80);
    
    // Supplier details
    this.addSupplierDetails(purchaseOrder);
    
    // Delivery and payment terms
    this.addDeliveryPaymentTerms(purchaseOrder);
    
    // Items table with specifications
    const tableEndY = this.addItemsTable(purchaseOrder);
    
    // Tax calculations
    this.addTaxCalculations(purchaseOrder, tableEndY);
    
    // Terms and conditions
    this.addTermsConditions(purchaseOrder);
    
    // Approval section
    this.addApprovalSection(purchaseOrder);
  }
  
  private addPurchaseOrderHeader(purchaseOrder: PurchaseOrder) {
    // Title
    this.doc.fontSize(18)
       .font('Helvetica-Bold')
       .fillColor('#1e40af')
       .text('PURCHASE ORDER', 50, 170, { align: 'center', width: 350 });
    
    // PO details box
    this.doc.roundedRect(50, 200, 250, 100, 5)
       .stroke();
    
    this.doc.fontSize(10)
       .fillColor('#000000')
       .font('Helvetica-Bold')
       .text('PO Number:', 60, 210)
       .text('PO Date:', 60, 230)
       .text('Delivery Date:', 60, 250)
       .text('Reference:', 60, 270);
    
    this.doc.font('Helvetica')
       .text(purchaseOrder.poNumber, 140, 210)
       .text(new Date(purchaseOrder.orderDate).toLocaleDateString('en-US', {
         year: 'numeric',
         month: 'long',
         day: 'numeric'
       }), 140, 230)
       .text(purchaseOrder.expectedDeliveryDate ? new Date(purchaseOrder.expectedDeliveryDate).toLocaleDateString() : '-', 140, 250)
       .text((purchaseOrder as any).reference || '-', 140, 270);
    
    // Status badge
    const statusColor = purchaseOrder.status === 'completed' ? '#10b981' :
                       purchaseOrder.status === 'sent' ? '#f59e0b' :
                       purchaseOrder.status === 'cancelled' ? '#ef4444' : '#6b7280';
    
    this.doc.roundedRect(320, 200, 100, 30, 15)
       .fillAndStroke(statusColor, statusColor);
    
    this.doc.fontSize(10)
       .fillColor('#ffffff')
       .font('Helvetica-Bold')
       .text(purchaseOrder.status.toUpperCase(), 320, 210, { align: 'center', width: 100 });
    
    this.doc.fillColor('#000000'); // Reset
  }
  
  private addSupplierDetails(purchaseOrder: PurchaseOrder) {
    const supplier = purchaseOrder.supplier;
    if (!supplier) return;
    
    const y = 320;
    
    // Supplier section
    this.doc.roundedRect(50, y, 500, 120, 5)
       .fillAndStroke('#f0f9ff', '#1e40af');
    
    this.doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#1e40af')
       .text('SUPPLIER DETAILS:', 60, y + 10);
    
    this.doc.fontSize(10)
       .fillColor('#000000')
       .font('Helvetica-Bold')
       .text(supplier.companyName, 60, y + 30);
    
    this.doc.font('Helvetica')
       .text(supplier.address.street, 60, y + 45)
       .text(`${supplier.address.city}, ${supplier.address.state} - ${supplier.address.postalCode}`, 60, y + 60)
       .text(`${supplier.address.country}`, 60, y + 75)
       .text(`Contact: ${supplier.contactPerson} | Phone: ${supplier.phone}`, 60, y + 90)
       .text(`Email: ${supplier.email} | GSTIN: ${(supplier as any).gstin || '-'}`, 60, y + 105);
    
    // Delivery address
    this.doc.fontSize(10)
       .font('Helvetica-Bold')
       .text('DELIVER TO:', 300, y + 30);
    
    this.doc.font('Helvetica')
       .text('BLS TRADING COMPANY', 300, y + 45)
       .text('Warehouse: Plot No. 456', 300, y + 60)
       .text('Industrial Area, Chittoor', 300, y + 75)
       .text('Andhra Pradesh - 517001', 300, y + 90);
  }
  
  private addDeliveryPaymentTerms(purchaseOrder: PurchaseOrder) {
    const y = 460;
    
    this.doc.roundedRect(50, y, 240, 60, 5)
       .stroke();
    
    this.doc.roundedRect(310, y, 240, 60, 5)
       .stroke();
    
    // Delivery terms
    this.doc.fontSize(10)
       .font('Helvetica-Bold')
       .text('DELIVERY TERMS:', 60, y + 10);
    
    this.doc.font('Helvetica')
       .text(`Incoterms: ${(purchaseOrder as any).incoterms || 'FOB'}`, 60, y + 30)
       .text(`Delivery: ${purchaseOrder.deliveryTerms || 'Within 30 days'}`, 60, y + 45);
    
    // Payment terms
    this.doc.font('Helvetica-Bold')
       .text('PAYMENT TERMS:', 320, y + 10);
    
    this.doc.font('Helvetica')
       .text(`Terms: ${purchaseOrder.paymentTerms || '30 days'}`, 320, y + 30)
       .text(`Currency: ${purchaseOrder.currency}`, 320, y + 45);
  }
  
  private addItemsTable(purchaseOrder: PurchaseOrder): number {
    const items = purchaseOrder.items || [];
    const startY = 540;
    const columnWidths = [40, 180, 80, 60, 80, 60];
    const headers = ['S.No', 'Item Description', 'HSN Code', 'Qty', 'Unit Price', 'Total'];
    
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
        `Manufacturer: ${product.manufacturer}`,
        item.specifications || ''
      ].filter(Boolean).join('\n') : item.description || 'Item';
      
      // Alternate row coloring
      if (index % 2 === 0) {
        this.doc.rect(50, currentY - 5, columnWidths.reduce((a, b) => a + b, 0), 60)
           .fill('#f3f4f6')
           .fill('#000000');
      }
      
      this.doc.fontSize(9)
         .text(String(index + 1), 55, currentY)
         .text(description, 95, currentY, { width: 170, height: 55 })
         .text(product?.hsnCode || (item as any).hsnCode || '', 275, currentY)
         .text(String(item.quantity), 355, currentY)
         .text(this.formatCurrency(item.unitPrice, purchaseOrder.currency), 415, currentY)
         .text(this.formatCurrency(item.totalPrice, purchaseOrder.currency), 475, currentY);
      
      currentY += 60;
    });
    
    // Table border
    this.doc.rect(50, startY - 5, columnWidths.reduce((a, b) => a + b, 0), currentY - startY + 5)
       .stroke();
    
    return currentY + 10;
  }
  
  private addTaxCalculations(purchaseOrder: PurchaseOrder, startY: number) {
    const calcX = 300;
    let currentY = startY + 20;
    
    // Subtotal
    this.doc.fontSize(10)
       .text('Subtotal:', calcX, currentY)
       .text(this.formatCurrency(purchaseOrder.subtotal, purchaseOrder.currency), 420, currentY, { align: 'right', width: 130 });
    
    currentY += 20;
    
    // Tax
    if (purchaseOrder.tax > 0) {
      this.doc.text('Tax:', calcX, currentY)
         .text(this.formatCurrency(purchaseOrder.tax, purchaseOrder.currency), 420, currentY, { align: 'right', width: 130 });
      currentY += 20;
    }
    
    // Other charges
    if ((purchaseOrder as any).otherCharges > 0) {
      this.doc.text('Other Charges:', calcX, currentY)
         .text(this.formatCurrency((purchaseOrder as any).otherCharges, purchaseOrder.currency), 420, currentY, { align: 'right', width: 130 });
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
       .text(this.formatCurrency(purchaseOrder.totalAmount, purchaseOrder.currency), 420, currentY, { align: 'right', width: 130 });
    
    // Amount in words
    currentY += 30;
    this.doc.fontSize(10)
       .fillColor('#000000')
       .font('Helvetica')
       .text(`Amount in words: ${this.numberToWords(purchaseOrder.totalAmount)} ${purchaseOrder.currency} Only`, 50, currentY, { width: 500 });
  }
  
  private numberToWords(num: number): string {
    // Simple implementation for demo
    const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    if (num === 0) return 'Zero';
    
    // For simplicity, just return a formatted string
    return `${num.toLocaleString()}`;
  }
  
  private addTermsConditions(purchaseOrder: PurchaseOrder) {
    if (this.doc.y > 500) {
      this.doc.addPage();
      this.addCompanyHeader(this.doc);
    }
    
    const y = this.doc.y + 50;
    
    this.doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#1e40af')
       .text('TERMS & CONDITIONS:', 50, y);
    
    const terms = (purchaseOrder as any).termsAndConditions || [
      '1. Goods must be delivered as per the specifications mentioned above.',
      '2. Quality certificates and test reports must accompany the delivery.',
      '3. Goods must comply with all applicable pharmaceutical regulations.',
      '4. Proper documentation including invoice, packing list, and COA required.',
      '5. Any deviation from the order must be pre-approved in writing.',
      '6. Warranty period: 12 months from the date of delivery.',
      '7. Payment will be processed after satisfactory receipt and inspection of goods.'
    ].join('\n');
    
    this.doc.fontSize(9)
       .fillColor('#000000')
       .font('Helvetica')
       .text(terms, 50, y + 20, { width: 500, align: 'justify' });
  }
  
  private addApprovalSection(purchaseOrder: PurchaseOrder) {
    const y = this.doc.page.height - 200;
    
    // Approval matrix
    this.doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#1e40af')
       .text('APPROVAL MATRIX:', 50, y);
    
    // Three approval sections
    const approvalY = y + 30;
    const approvalWidth = 160;
    
    // Prepared by
    this.doc.fontSize(10)
       .fillColor('#000000')
       .font('Helvetica-Bold')
       .text('Prepared By:', 50, approvalY);
    
    this.addDigitalSignaturePlaceholder(this.doc, 50, approvalY + 20);
    
    this.doc.fontSize(9)
       .font('Helvetica')
       .text('Name: _________________', 50, approvalY + 90)
       .text('Date: _________________', 50, approvalY + 105);
    
    // Verified by
    this.doc.fontSize(10)
       .font('Helvetica-Bold')
       .text('Verified By:', 200, approvalY);
    
    this.addDigitalSignaturePlaceholder(this.doc, 200, approvalY + 20);
    
    this.doc.fontSize(9)
       .font('Helvetica')
       .text('Name: _________________', 200, approvalY + 90)
       .text('Date: _________________', 200, approvalY + 105);
    
    // Approved by
    this.doc.fontSize(10)
       .font('Helvetica-Bold')
       .text('Approved By:', 350, approvalY);
    
    this.addDigitalSignaturePlaceholder(this.doc, 350, approvalY + 20);
    
    this.doc.fontSize(9)
       .font('Helvetica')
       .text('Name: _________________', 350, approvalY + 90)
       .text('Date: _________________', 350, approvalY + 105);
    
    // Add barcode for PO number
    this.addBarcode(this.doc, purchaseOrder.poNumber, 200, y - 30, { width: 200 });
  }
}