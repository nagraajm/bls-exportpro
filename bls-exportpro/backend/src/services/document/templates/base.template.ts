import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';
import { createCanvas } from 'canvas';
import path from 'path';
import fs from 'fs';

export interface DocumentOptions {
  size?: string;
  margins?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  watermark?: string;
  includePageNumbers?: boolean;
  includeVersion?: boolean;
  version?: string;
  digitalSignaturePlaceholder?: boolean;
}

export abstract class BaseDocumentTemplate {
  protected doc: any;
  protected currentPage: number = 1;
  protected totalPages: number = 1;
  protected options: DocumentOptions;
  
  constructor(options: DocumentOptions = {}) {
    this.options = {
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      includePageNumbers: true,
      includeVersion: true,
      version: '1.0',
      digitalSignaturePlaceholder: true,
      ...options
    };
  }
  
  protected addCompanyHeader(doc: any) {
    const logoPath = path.join(process.cwd(), 'assets', 'bls-logo.png');
    
    // Add logo if exists
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, 30, { width: 60 });
    }
    
    // Company details
    doc.fontSize(20)
       .font('Helvetica-Bold')
       .text('BLS TRADING COMPANY', 130, 40);
    
    doc.fontSize(9)
       .font('Helvetica')
       .text('Plot No. 123, Industrial Area', 130, 65)
       .text('Chittoor, Andhra Pradesh - 517001', 130, 78)
       .text('India', 130, 91)
       .text('Phone: +91 8572 223456 | Email: info@blstrading.com', 130, 104)
       .text('GSTIN: 37ABCDE1234F1Z5 | IEC: 1234567890', 130, 117)
       .text('Drug License No: AP/CTR/2023/1234', 130, 130);
    
    // Add a professional line separator
    doc.strokeColor('#1e40af')
       .lineWidth(2)
       .moveTo(50, 150)
       .lineTo(550, 150)
       .stroke();
    
    doc.strokeColor('#000000').lineWidth(1); // Reset
  }
  
  protected async addQRCode(doc: any, data: string, x: number, y: number, size: number = 100) {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(data, {
        width: size,
        margin: 1,
        errorCorrectionLevel: 'M'
      });
      
      const qrCodeBuffer = Buffer.from(qrCodeDataUrl.split(',')[1], 'base64');
      doc.image(qrCodeBuffer, x, y, { width: size, height: size });
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  }
  
  protected addBarcode(doc: any, data: string, x: number, y: number, options: any = {}) {
    const canvas = createCanvas(200, 100);
    
    JsBarcode(canvas, data, {
      format: 'CODE128',
      width: 2,
      height: 50,
      displayValue: true,
      ...options
    });
    
    const buffer = canvas.toBuffer('image/png');
    doc.image(buffer, x, y, { width: options.width || 150 });
  }
  
  protected addWatermark(doc: any, text: string) {
    if (!this.options.watermark) return;
    
    doc.save();
    doc.fontSize(60)
       .fillColor('#cccccc')
       .opacity(0.2)
       .rotate(-45, { origin: [300, 400] })
       .text(text, 200, 400, { align: 'center' });
    doc.restore();
  }
  
  protected addPageNumber(doc: any) {
    if (!this.options.includePageNumbers) return;
    
    const pageText = `Page ${this.currentPage} of ${this.totalPages}`;
    doc.fontSize(9)
       .fillColor('#666666')
       .text(pageText, 50, doc.page.height - 30, { 
         align: 'center',
         width: doc.page.width - 100
       });
    
    if (this.options.includeVersion) {
      doc.text(`Version: ${this.options.version}`, 50, doc.page.height - 30, {
        align: 'right',
        width: doc.page.width - 100
      });
    }
    
    doc.fillColor('#000000'); // Reset
  }
  
  protected addDigitalSignaturePlaceholder(doc: any, x: number, y: number) {
    if (!this.options.digitalSignaturePlaceholder) return;
    
    // Signature box
    doc.rect(x, y, 200, 60)
       .stroke();
    
    doc.fontSize(8)
       .fillColor('#666666')
       .text('Digital Signature', x + 5, y + 5)
       .text('Sign here:', x + 5, y + 45);
    
    // Add timestamp placeholder
    const timestamp = new Date().toISOString();
    doc.fontSize(7)
       .text(`Timestamp: ${timestamp}`, x + 5, y + 65);
    
    doc.fillColor('#000000'); // Reset
  }
  
  protected formatCurrency(amount: number, currency: string = 'USD'): string {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return formatter.format(amount);
  }
  
  protected addTableHeader(doc: any, headers: string[], x: number, y: number, columnWidths: number[]) {
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .fillColor('#ffffff');
    
    // Header background
    doc.rect(x, y - 5, columnWidths.reduce((a, b) => a + b, 0), 20)
       .fill('#1e40af');
    
    // Header text
    let currentX = x;
    headers.forEach((header, index) => {
      doc.fillColor('#ffffff')
         .text(header, currentX + 5, y, { width: columnWidths[index] - 10 });
      currentX += columnWidths[index];
    });
    
    doc.fillColor('#000000').font('Helvetica'); // Reset
    return y + 20;
  }
  
  protected wrapText(text: string, maxWidth: number, fontSize: number): string[] {
    // Simple text wrapping logic
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    const avgCharWidth = fontSize * 0.5; // Approximate
    const maxChars = Math.floor(maxWidth / avgCharWidth);
    
    words.forEach(word => {
      if ((currentLine + ' ' + word).length <= maxChars) {
        currentLine = currentLine ? currentLine + ' ' + word : word;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    });
    
    if (currentLine) lines.push(currentLine);
    return lines;
  }
  
  abstract generate(data: any): Promise<string>;
}