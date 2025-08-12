import { getDatabase } from '../config/sqlite.config';
import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

interface InvoiceData {
  customer: any;
  order: any;
  items: any[];
  invoice: any;
  totalAmount: number;
  invoiceNumber: string;
  invoiceDate: string;
  invoiceType: string;
  portOfLoading?: string;
  portOfDischarge?: string;
  placeOfDelivery?: string;
  termsOfDelivery?: string;
  paymentTerms?: string;
}

export class InvoiceGeneratorService {
  
  async generateInvoice(orderId: string, invoiceType: 'PROFORMA INVOICE' | 'INVOICE' = 'PROFORMA INVOICE'): Promise<{ invoiceId: string, filePath: string }> {
    const db = await getDatabase();
    
    // Get order details
    const order = await db.get(
      `SELECT * FROM orders WHERE id = ?`,
      [orderId]
    );
    
    if (!order) {
      throw new Error('Order not found');
    }
    
    // Get customer details
    const customer = await db.get(
      `SELECT * FROM customers WHERE id = ?`,
      [order.customer_id]
    );
    
    // Get order items with product details
    const items = await db.all(`
      SELECT oi.*, p.brand_name, p.generic_name, p.unit_pack, p.rate_usd
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
      ORDER BY p.brand_name
    `, [orderId]);
    
    // Create or update invoice record
    const invoiceId = uuidv4();
    const invoiceNumber = this.generateInvoiceNumber(invoiceType);
    const invoiceDate = new Date().toLocaleDateString('en-GB');
    
    await db.run(`
      INSERT INTO invoices (
        id, order_id, invoice_number, invoice_date, invoice_type, 
        total_amount, currency, port_of_loading, port_of_discharge, 
        place_of_delivery, payment_terms
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      invoiceId, orderId, invoiceNumber, invoiceDate, invoiceType.toLowerCase(),
      order.total_amount, 'INR',
      'NHAVA SHEVA/MUMBAI', 'LAEM CHABANG, THAILAND', 'YANGON VIA THAI-MYANMAR BORDER',
      'ADVANCE'
    ]);
    
    const invoiceData: InvoiceData = {
      customer,
      order,
      items: items.map(item => ({
        ...item,
        product: {
          brand_name: item.brand_name,
          generic_name: item.generic_name,
          unit_pack: item.unit_pack,
          rate_usd: item.rate_usd
        }
      })),
      invoice: { id: invoiceId },
      totalAmount: order.total_amount,
      invoiceNumber,
      invoiceDate,
      invoiceType,
      portOfLoading: 'NHAVA SHEVA/MUMBAI',
      portOfDischarge: 'LAEM CHABANG, THAILAND',
      placeOfDelivery: 'YANGON VIA THAI-MYANMAR BORDER',
      termsOfDelivery: 'CIF SEA LAEM CHABANG, THAILAND',
      paymentTerms: 'ADVANCE'
    };
    
    const filePath = await this.generatePDF(invoiceData);
    
    return { invoiceId, filePath };
  }
  
  private generateInvoiceNumber(type: string): string {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const prefix = type === 'PROFORMA INVOICE' ? 'PFI/GBF' : 'EXP';
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    
    return `${prefix}/${random}/${month}-${year}`;
  }
  
  private async generatePDF(data: InvoiceData): Promise<string> {
    const templatePath = path.join(__dirname, '../templates/invoice-template.html');
    let htmlContent = await fs.readFile(templatePath, 'utf-8');
    
    // Replace template variables
    htmlContent = this.replaceTemplateVars(htmlContent, data);
    
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setContent(htmlContent);
    
    const uploadsDir = path.join(__dirname, '../../uploads/invoices');
    await fs.mkdir(uploadsDir, { recursive: true });
    
    const filename = `invoice_${data.invoiceNumber.replace(/[\/\\]/g, '_')}_${Date.now()}.pdf`;
    const filePath = path.join(uploadsDir, filename);
    
    await page.pdf({
      path: filePath,
      format: 'A4',
      margin: {
        top: '20px',
        bottom: '20px',
        left: '20px',
        right: '20px'
      }
    });
    
    await browser.close();
    
    return filePath;
  }
  
  private replaceTemplateVars(html: string, data: InvoiceData): string {
    const helpers = {
      inc: (value: number) => value + 1
    };
    
    // Replace simple variables
    html = html.replace(/{{invoiceType}}/g, data.invoiceType);
    html = html.replace(/{{invoiceTypeShort}}/g, data.invoiceType === 'PROFORMA INVOICE' ? 'PFI No.' : 'Invoice No.');
    html = html.replace(/{{invoiceNumber}}/g, data.invoiceNumber);
    html = html.replace(/{{invoiceDate}}/g, data.invoiceDate);
    html = html.replace(/{{totalAmount}}/g, data.totalAmount.toFixed(2));
    html = html.replace(/{{totalAmountWords}}/g, this.numberToWords(data.totalAmount));
    html = html.replace(/{{isProforma}}/g, data.invoiceType === 'PROFORMA INVOICE' ? 'true' : 'false');
    
    // Customer info
    html = html.replace(/{{customer\.company_name}}/g, data.customer.company_name);
    html = html.replace(/{{customer\.address}}/g, data.customer.address);
    html = html.replace(/{{customer\.city}}/g, data.customer.city);
    html = html.replace(/{{customer\.country}}/g, data.customer.country);
    
    // Shipping details
    html = html.replace(/{{portOfLoading}}/g, data.portOfLoading || '');
    html = html.replace(/{{portOfDischarge}}/g, data.portOfDischarge || '');
    html = html.replace(/{{placeOfDelivery}}/g, data.placeOfDelivery || '');
    html = html.replace(/{{termsOfDelivery}}/g, data.termsOfDelivery || '');
    html = html.replace(/{{paymentTerms}}/g, data.paymentTerms || '');
    
    // Replace items loop
    let itemsHtml = '';
    data.items.forEach((item, index) => {
      itemsHtml += `
        <tr>
          <td>${index + 1}</td>
          <td>${item.product.brand_name} (${item.product.generic_name})</td>
          <td>${item.product.unit_pack}</td>
          <td>${item.quantity}</td>
          <td>0</td>
          <td>${item.quantity}</td>
          <td>${item.product.rate_usd.toFixed(3)}</td>
          <td>${item.amount.toFixed(2)}</td>
        </tr>
      `;
    });
    
    html = html.replace(/{{#each items}}[\s\S]*?{{\/each}}/g, itemsHtml);
    
    return html;
  }
  
  private numberToWords(num: number): string {
    const ones = [
      '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
      'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
      'Seventeen', 'Eighteen', 'Nineteen'
    ];
    
    const tens = [
      '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
    ];
    
    const scales = ['', 'Thousand', 'Million', 'Billion'];
    
    if (num === 0) return 'Zero';
    
    const integerPart = Math.floor(num);
    const decimalPart = Math.round((num - integerPart) * 100);
    
    let result = this.convertInteger(integerPart, ones, tens, scales);
    
    if (decimalPart > 0) {
      result += ` And Cent ${this.convertInteger(decimalPart, ones, tens, scales)}`;
    }
    
    return result;
  }
  
  private convertInteger(num: number, ones: string[], tens: string[], scales: string[]): string {
    if (num === 0) return '';
    
    let result = '';
    let scaleIndex = 0;
    
    while (num > 0) {
      const chunk = num % 1000;
      if (chunk > 0) {
        const chunkStr = this.convertChunk(chunk, ones, tens);
        result = chunkStr + (scales[scaleIndex] ? ' ' + scales[scaleIndex] : '') + 
                (result ? ' ' + result : '');
      }
      num = Math.floor(num / 1000);
      scaleIndex++;
    }
    
    return result;
  }
  
  private convertChunk(num: number, ones: string[], tens: string[]): string {
    let result = '';
    
    const hundreds = Math.floor(num / 100);
    if (hundreds > 0) {
      result += ones[hundreds] + ' Hundred';
    }
    
    const remainder = num % 100;
    if (remainder > 0) {
      if (result) result += ' ';
      
      if (remainder < 20) {
        result += ones[remainder];
      } else {
        const tensDigit = Math.floor(remainder / 10);
        const onesDigit = remainder % 10;
        result += tens[tensDigit];
        if (onesDigit > 0) {
          result += ' ' + ones[onesDigit];
        }
      }
    }
    
    return result;
  }
}