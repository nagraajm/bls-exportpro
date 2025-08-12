import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { BaseDocumentTemplate, DocumentOptions } from './base.template';
import { PackingList } from '../../../../../shared/types.ts';

export class PackingListTemplate extends BaseDocumentTemplate {
  constructor(options: DocumentOptions = {}) {
    super(options);
  }
  
  async generate(packingList: PackingList): Promise<string> {
    const filename = `packing-list-${packingList.packingListNumber}-${Date.now()}.pdf`;
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
      this.addContent(packingList);
      
      // Get total pages
      this.totalPages = this.doc.bufferedPageRange().count;
      
      // Add page numbers to all pages
      for (let i = 0; i < this.totalPages; i++) {
        this.doc.switchToPage(i);
        this.currentPage = i + 1;
        this.addPageNumber(this.doc);
        this.addWatermark(this.doc, 'PACKING LIST');
      }
      
      this.doc.end();
      
      stream.on('finish', () => resolve(filepath));
      stream.on('error', reject);
    });
  }
  
  private addContent(packingList: PackingList) {
    // Company header
    this.addCompanyHeader(this.doc);
    
    // Packing list header
    this.addPackingListHeader(packingList);
    
    // Container and shipment details
    this.addShipmentDetails(packingList);
    
    // Add QR code with packing list details
    const qrData = JSON.stringify({
      plNo: packingList.packingListNumber,
      orderNo: packingList.orderId,
      container: packingList.containerNumber,
      totalPkgs: packingList.totalPackages
    });
    this.addQRCode(this.doc, qrData, 450, 170, 80);
    
    // Consignee details
    this.addConsigneeDetails(packingList);
    
    // Items table with batch details
    const tableEndY = this.addDetailedItemsTable(packingList);
    
    // Summary section
    this.addSummarySection(packingList, tableEndY);
    
    // Shipping marks
    if (packingList.shippingMarks) {
      this.addShippingMarksSection(packingList.shippingMarks, packingList);
    }
    
    // Declaration and signature
    this.addDeclarationSection();
  }
  
  private addPackingListHeader(packingList: PackingList) {
    // Title
    this.doc.fontSize(18)
       .font('Helvetica-Bold')
       .fillColor('#1e40af')
       .text('PACKING LIST', 50, 170, { align: 'center', width: 350 });
    
    // Packing list details box
    this.doc.roundedRect(50, 200, 250, 100, 5)
       .stroke();
    
    this.doc.fontSize(10)
       .fillColor('#000000')
       .font('Helvetica-Bold')
       .text('Packing List No:', 60, 210)
       .text('Date:', 60, 230)
       .text('Invoice No:', 60, 250)
       .text('Order No:', 60, 270);
    
    this.doc.font('Helvetica')
       .text(packingList.packingListNumber, 160, 210)
       .text(new Date(packingList.createdAt).toLocaleDateString('en-US', {
         year: 'numeric',
         month: 'long',
         day: 'numeric'
       }), 160, 230)
       .text(packingList.invoiceId || '-', 160, 250)
       .text(packingList.orderId || '-', 160, 270);
  }
  
  private addShipmentDetails(packingList: PackingList) {
    const y = 320;
    
    this.doc.roundedRect(50, y, 500, 80, 5)
       .fillAndStroke('#f0f9ff', '#1e40af');
    
    this.doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#1e40af')
       .text('SHIPMENT DETAILS', 60, y + 10);
    
    this.doc.fontSize(10)
       .fillColor('#000000')
       .font('Helvetica-Bold')
       .text('Container No:', 60, y + 35)
       .text('Seal No:', 300, y + 35)
       .text('Port of Loading:', 60, y + 55)
       .text('Port of Discharge:', 300, y + 55);
    
    this.doc.font('Helvetica')
       .text(packingList.containerNumber || '-', 150, y + 35)
       .text(packingList.sealNumber || '-', 380, y + 35)
       .text((packingList as any).portOfLoading || 'Chennai, India', 150, y + 55)
       .text((packingList as any).portOfDischarge || '-', 400, y + 55);
  }
  
  private addConsigneeDetails(packingList: PackingList) {
    const order = packingList.order;
    const customer = order?.customer;
    
    if (!customer) return;
    
    const y = 420;
    
    this.doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#1e40af')
       .text('CONSIGNEE:', 50, y);
    
    this.doc.fontSize(10)
       .fillColor('#000000')
       .font('Helvetica-Bold')
       .text(customer.companyName, 50, y + 20);
    
    this.doc.font('Helvetica')
       .text(customer.address.street, 50, y + 35)
       .text(`${customer.address.city}, ${customer.address.state}`, 50, y + 50)
       .text(`${customer.address.country} - ${customer.address.postalCode}`, 50, y + 65)
       .text(`Contact: ${customer.contactPerson}`, 50, y + 80);
    
    // Notify party (if different)
    this.doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#1e40af')
       .text('NOTIFY PARTY:', 300, y);
    
    this.doc.fontSize(10)
       .fillColor('#000000')
       .font('Helvetica')
       .text('Same as Consignee', 300, y + 20);
  }
  
  private addDetailedItemsTable(packingList: PackingList): number {
    const items = packingList.items || [];
    const startY = 540;
    const columnWidths = [40, 60, 140, 70, 50, 50, 60, 60];
    const headers = ['S.No', 'Carton\nS.No', 'Product Description', 'Batch No', 'Qty', 'Pkgs', 'Gross\nWt (kg)', 'Net\nWt (kg)'];
    
    let currentY = this.addTableHeader(this.doc, headers, 50, startY, columnWidths);
    let cartonSerial = 1;
    
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
        `${product.dosageForm}`,
        `Pack: ${product.packSize}`,
        `Exp: ${(item as any).expiryDate ? new Date((item as any).expiryDate).toLocaleDateString() : '-'}`
      ].filter(Boolean).join('\n') : 'Product';
      
      // Calculate carton range
      const cartonStart = cartonSerial;
      const cartonEnd = cartonSerial + (item.packagesCount || 1) - 1;
      const cartonRange = cartonStart === cartonEnd ? String(cartonStart) : `${cartonStart}-${cartonEnd}`;
      cartonSerial = cartonEnd + 1;
      
      // Alternate row coloring
      if (index % 2 === 0) {
        this.doc.rect(50, currentY - 5, columnWidths.reduce((a, b) => a + b, 0), 70)
           .fill('#f3f4f6')
           .fill('#000000');
      }
      
      this.doc.fontSize(8)
         .text(String(index + 1), 55, currentY)
         .text(cartonRange, 95, currentY)
         .text(description, 155, currentY, { width: 130, height: 65 })
         .text(item.batchNumber || '-', 295, currentY)
         .text(String(item.quantity), 365, currentY)
         .text(String(item.packagesCount || 1), 415, currentY)
         .text(String(item.grossWeight || 0), 465, currentY)
         .text(String(item.netWeight || 0), 525, currentY);
      
      currentY += 70;
    });
    
    // Table border
    this.doc.rect(50, startY - 5, columnWidths.reduce((a, b) => a + b, 0), currentY - startY + 5)
       .stroke();
    
    return currentY + 10;
  }
  
  private addSummarySection(packingList: PackingList, startY: number) {
    let currentY = startY + 20;
    
    // Total line
    this.doc.fontSize(10)
       .font('Helvetica-Bold')
       .text('TOTAL:', 295, currentY)
       .text(String(packingList.totalPackages || 0), 415, currentY)
       .text(String(packingList.totalGrossWeight || 0), 465, currentY)
       .text(String(packingList.totalNetWeight || 0), 525, currentY);
    
    currentY += 30;
    
    // Summary box
    this.doc.roundedRect(50, currentY, 500, 80, 5)
       .fillAndStroke('#f8fafc', '#e5e7eb');
    
    this.doc.fontSize(10)
       .font('Helvetica-Bold')
       .fillColor('#000000')
       .text('Total Packages:', 60, currentY + 15)
       .text('Total Gross Weight:', 60, currentY + 35)
       .text('Total Net Weight:', 60, currentY + 55)
       .text('Total CBM:', 300, currentY + 15)
       .text('Dimensions:', 300, currentY + 35);
    
    this.doc.font('Helvetica')
       .text(`${packingList.totalPackages} Cartons`, 180, currentY + 15)
       .text(`${packingList.totalGrossWeight} kg`, 180, currentY + 35)
       .text(`${packingList.totalNetWeight} kg`, 180, currentY + 55)
       .text(`${(packingList as any).totalCBM || '-'} CBM`, 380, currentY + 15)
       .text((packingList as any).dimensions || '-', 380, currentY + 35);
  }
  
  private addShippingMarksSection(shippingMarks: string, packingList: PackingList) {
    if (this.doc.y > 550) {
      this.doc.addPage();
      this.addCompanyHeader(this.doc);
    }
    
    const y = this.doc.y + 110;
    
    this.doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#1e40af')
       .text('SHIPPING MARKS & NUMBERS:', 50, y);
    
    this.doc.roundedRect(50, y + 20, 500, 100, 5)
       .stroke();
    
    this.doc.fontSize(10)
       .fillColor('#000000')
       .font('Helvetica')
       .text(shippingMarks, 60, y + 30, { width: 480, height: 80 });
    
    // Add barcode for container number if available
    const containerNum = packingList.containerNumber;
    if (containerNum) {
      this.addBarcode(this.doc, containerNum, 400, y + 40, { width: 140, height: 40 });
    }
  }
  
  private addDeclarationSection() {
    const y = this.doc.page.height - 180;
    
    this.doc.fontSize(10)
       .font('Helvetica-Bold')
       .text('DECLARATION:', 50, y);
    
    this.doc.fontSize(9)
       .font('Helvetica')
       .text('We hereby certify that the goods described above are properly packed and labeled for export.', 50, y + 20, { width: 500 });
    
    // Signature sections
    this.doc.fontSize(10)
       .font('Helvetica-Bold')
       .text('Prepared By:', 50, y + 60)
       .text('Verified By:', 300, y + 60);
    
    // Digital signature placeholders
    this.addDigitalSignaturePlaceholder(this.doc, 50, y + 80);
    this.addDigitalSignaturePlaceholder(this.doc, 300, y + 80);
    
    this.doc.fontSize(9)
       .font('Helvetica')
       .text('Name: _________________', 50, y + 150)
       .text('Date: _________________', 50, y + 165)
       .text('Name: _________________', 300, y + 150)
       .text('Date: _________________', 300, y + 165);
  }
}