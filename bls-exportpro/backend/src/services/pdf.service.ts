import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { Invoice, Order, PackingList } from '../../../shared/types.ts';
import { CONSTANTS } from '../config/constants';
import { formatCurrency } from '../utils/calculations';

export class PDFService {
  private uploadDir: string;
  
  constructor() {
    this.uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
    this.ensureUploadDir();
  }
  
  private ensureUploadDir() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }
  
  async generateInvoicePDF(invoice: Invoice): Promise<string> {
    const filename = `invoice-${invoice.invoiceNumber}.pdf`;
    const filepath = path.join(this.uploadDir, filename);
    
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margins: CONSTANTS.PDF.MARGINS,
      });
      
      const stream = fs.createWriteStream(filepath);
      doc.pipe(stream);
      
      this.addHeader(doc);
      this.addInvoiceTitle(doc, invoice);
      this.addBillingInfo(doc, invoice);
      this.addItemsTable(doc, invoice);
      this.addTotals(doc, invoice);
      this.addBankDetails(doc, invoice);
      this.addTerms(doc, invoice);
      
      doc.end();
      
      stream.on('finish', () => resolve(filepath));
      stream.on('error', reject);
    });
  }
  
  private addHeader(doc: any) {
    doc.fontSize(20)
       .font('Helvetica-Bold')
       .text(CONSTANTS.COMPANY_INFO.name, 50, 50);
    
    doc.fontSize(10)
       .font('Helvetica')
       .text(CONSTANTS.COMPANY_INFO.address.street, 50, 80)
       .text(`${CONSTANTS.COMPANY_INFO.address.city}, ${CONSTANTS.COMPANY_INFO.address.state}`, 50, 95)
       .text(`${CONSTANTS.COMPANY_INFO.address.country} - ${CONSTANTS.COMPANY_INFO.address.postalCode}`, 50, 110)
       .text(`Phone: ${CONSTANTS.COMPANY_INFO.phone}`, 50, 125)
       .text(`Email: ${CONSTANTS.COMPANY_INFO.email}`, 50, 140)
       .text(`GSTIN: ${CONSTANTS.COMPANY_INFO.gstin}`, 50, 155);
    
    doc.moveTo(50, 175)
       .lineTo(550, 175)
       .stroke();
  }
  
  private addInvoiceTitle(doc: any, invoice: Invoice) {
    const title = invoice.invoiceType === 'proforma' ? 'PROFORMA INVOICE' :
                  invoice.invoiceType === 'pre-shipment' ? 'PRE-SHIPMENT INVOICE' :
                  'COMMERCIAL INVOICE';
    
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .text(title, 50, 190, { align: 'center' });
    
    doc.fontSize(10)
       .font('Helvetica')
       .text(`Invoice No: ${invoice.invoiceNumber}`, 400, 210)
       .text(`Date: ${new Date(invoice.invoiceDate).toLocaleDateString()}`, 400, 225);
  }
  
  private addBillingInfo(doc: any, invoice: Invoice) {
    if (!invoice.order?.customer) return;
    
    const customer = invoice.order.customer;
    
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('Bill To:', 50, 250);
    
    doc.fontSize(10)
       .font('Helvetica')
       .text(customer.companyName, 50, 270)
       .text(customer.address.street, 50, 285)
       .text(`${customer.address.city}, ${customer.address.state}`, 50, 300)
       .text(`${customer.address.country} - ${customer.address.postalCode}`, 50, 315)
       .text(`Contact: ${customer.contactPerson}`, 50, 330)
       .text(`Email: ${customer.email}`, 50, 345);
  }
  
  private addItemsTable(doc: any, invoice: Invoice) {
    if (!invoice.order?.items) return;
    
    const tableTop = 380;
    const itemsPerPage = 15;
    
    doc.fontSize(10).font('Helvetica-Bold');
    
    doc.text('S.No', 50, tableTop)
       .text('Product Description', 90, tableTop)
       .text('Batch', 250, tableTop)
       .text('Qty', 320, tableTop)
       .text('Unit Price', 370, tableTop)
       .text('Total', 450, tableTop);
    
    doc.moveTo(50, tableTop + 15)
       .lineTo(550, tableTop + 15)
       .stroke();
    
    doc.font('Helvetica');
    let yPosition = tableTop + 25;
    
    invoice.order.items.forEach((item: any, index: number) => {
      if (index > 0 && index % itemsPerPage === 0) {
        doc.addPage();
        yPosition = 50;
      }
      
      const product = item.product;
      const description = product ? 
        `${product.brandName}\n${product.genericName} ${product.strength}` : 
        'Product';
      
      doc.text(`${index + 1}`, 50, yPosition)
         .text(description, 90, yPosition, { width: 150 })
         .text(item.batchNumber, 250, yPosition)
         .text(`${item.quantity}`, 320, yPosition)
         .text(formatCurrency(item.unitPrice, invoice.currency), 370, yPosition)
         .text(formatCurrency(item.totalPrice, invoice.currency), 450, yPosition);
      
      yPosition += 30;
    });
  }
  
  private addTotals(doc: any, invoice: Invoice) {
    const y = doc.y + 20;
    
    doc.fontSize(10).font('Helvetica');
    
    doc.text('Subtotal:', 400, y)
       .text(formatCurrency(invoice.subtotal, invoice.currency), 480, y, { align: 'right' });
    
    if (invoice.igst > 0) {
      doc.text('IGST (0%):', 400, y + 15)
         .text(formatCurrency(invoice.igst, invoice.currency), 480, y + 15, { align: 'right' });
    }
    
    if (invoice.drawback > 0) {
      doc.text('Drawback (1.2%):', 400, y + 30)
         .text(`-${formatCurrency(invoice.drawback, invoice.currency)}`, 480, y + 30, { align: 'right' });
    }
    
    if (invoice.rodtep > 0) {
      doc.text('RODTEP (0.7%):', 400, y + 45)
         .text(`-${formatCurrency(invoice.rodtep, invoice.currency)}`, 480, y + 45, { align: 'right' });
    }
    
    doc.fontSize(12).font('Helvetica-Bold');
    doc.text('Total Amount:', 400, y + 65)
       .text(formatCurrency(invoice.totalAmount, invoice.currency), 480, y + 65, { align: 'right' });
  }
  
  private addBankDetails(doc: any, invoice: Invoice) {
    const y = doc.y + 40;
    
    doc.fontSize(12).font('Helvetica-Bold')
       .text('Bank Details:', 50, y);
    
    doc.fontSize(10).font('Helvetica');
    const bank = invoice.bankDetails;
    
    doc.text(`Bank Name: ${bank.bankName}`, 50, y + 20)
       .text(`Account Name: ${bank.accountName}`, 50, y + 35)
       .text(`Account Number: ${bank.accountNumber}`, 50, y + 50)
       .text(`SWIFT Code: ${bank.swiftCode}`, 50, y + 65);
    
    if (bank.ifscCode) {
      doc.text(`IFSC Code: ${bank.ifscCode}`, 50, y + 80);
    }
  }
  
  private addTerms(doc: any, invoice: Invoice) {
    if (!invoice.termsAndConditions) return;
    
    const y = doc.y + 30;
    
    doc.fontSize(12).font('Helvetica-Bold')
       .text('Terms & Conditions:', 50, y);
    
    doc.fontSize(9).font('Helvetica')
       .text(invoice.termsAndConditions, 50, y + 20, { width: 500 });
  }
  
  async generatePackingListPDF(packingList: PackingList): Promise<string> {
    const filename = `packing-list-${packingList.packingListNumber}.pdf`;
    const filepath = path.join(this.uploadDir, filename);
    
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margins: CONSTANTS.PDF.MARGINS,
      });
      
      const stream = fs.createWriteStream(filepath);
      doc.pipe(stream);
      
      this.addHeader(doc);
      
      doc.fontSize(16)
         .font('Helvetica-Bold')
         .text('PACKING LIST', 50, 190, { align: 'center' });
      
      doc.fontSize(10)
         .font('Helvetica')
         .text(`Packing List No: ${packingList.packingListNumber}`, 400, 210)
         .text(`Date: ${new Date(packingList.createdAt).toLocaleDateString()}`, 400, 225);
      
      if (packingList.containerNumber) {
        doc.text(`Container No: ${packingList.containerNumber}`, 50, 250);
      }
      if (packingList.sealNumber) {
        doc.text(`Seal No: ${packingList.sealNumber}`, 50, 265);
      }
      
      const tableTop = 300;
      doc.fontSize(10).font('Helvetica-Bold');
      
      doc.text('S.No', 50, tableTop)
         .text('Product Description', 90, tableTop)
         .text('Batch', 250, tableTop)
         .text('Qty', 320, tableTop)
         .text('Packages', 370, tableTop)
         .text('Gross Wt', 430, tableTop)
         .text('Net Wt', 490, tableTop);
      
      doc.moveTo(50, tableTop + 15)
         .lineTo(550, tableTop + 15)
         .stroke();
      
      doc.font('Helvetica');
      let yPosition = tableTop + 25;
      
      packingList.items.forEach((item: any, index: number) => {
        const product = item.product;
        const description = product ? 
          `${product.brandName} ${product.strength}` : 
          'Product';
        
        doc.text(`${index + 1}`, 50, yPosition)
           .text(description, 90, yPosition, { width: 150 })
           .text(item.batchNumber, 250, yPosition)
           .text(`${item.quantity}`, 320, yPosition)
           .text(`${item.packagesCount}`, 370, yPosition)
           .text(`${item.grossWeight} kg`, 430, yPosition)
           .text(`${item.netWeight} kg`, 490, yPosition);
        
        yPosition += 25;
      });
      
      doc.fontSize(10).font('Helvetica-Bold');
      doc.text('Total:', 250, yPosition + 10)
         .text(`${packingList.totalPackages}`, 370, yPosition + 10)
         .text(`${packingList.totalGrossWeight} kg`, 430, yPosition + 10)
         .text(`${packingList.totalNetWeight} kg`, 490, yPosition + 10);
      
      if (packingList.shippingMarks) {
        doc.fontSize(12).font('Helvetica-Bold')
           .text('Shipping Marks:', 50, yPosition + 40);
        
        doc.fontSize(10).font('Helvetica')
           .text(packingList.shippingMarks, 50, yPosition + 60, { width: 500 });
      }
      
      doc.end();
      
      stream.on('finish', () => resolve(filepath));
      stream.on('error', reject);
    });
  }
}

export const pdfService = new PDFService();