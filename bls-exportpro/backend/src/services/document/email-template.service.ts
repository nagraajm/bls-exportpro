import Handlebars from 'handlebars';
import juice from 'juice';
import path from 'path';
import fs from 'fs';
import { Invoice, PackingList, PurchaseOrder } from '../../../../shared/types';

export class EmailTemplateService {
  private templates: Map<string, HandlebarsTemplateDelegate> = new Map();
  
  constructor() {
    this.registerHelpers();
    this.loadTemplates();
  }
  
  private registerHelpers() {
    Handlebars.registerHelper('formatCurrency', (amount: number, currency: string) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
      }).format(amount);
    });
    
    Handlebars.registerHelper('formatDate', (date: Date | string) => {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    });
    
    Handlebars.registerHelper('eq', (a: any, b: any) => a === b);
    Handlebars.registerHelper('add', (a: number, b: number) => a + b);
    Handlebars.registerHelper('multiply', (a: number, b: number) => a * b);
  }
  
  private loadTemplates() {
    // For now, we'll use inline templates
    // In production, these would be loaded from files
  }
  
  private getBaseStyles(): string {
    return `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #1f2937;
          background-color: #f9fafb;
        }
        
        .email-container {
          max-width: 800px;
          margin: 0 auto;
          background-color: #ffffff;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        }
        
        .header {
          background-color: #1e40af;
          color: white;
          padding: 2rem;
          text-align: center;
        }
        
        .header h1 {
          font-size: 1.875rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }
        
        .header p {
          font-size: 0.875rem;
          opacity: 0.9;
        }
        
        .content {
          padding: 2rem;
        }
        
        .section {
          margin-bottom: 2rem;
        }
        
        .section-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1e40af;
          margin-bottom: 1rem;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 0.5rem;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        
        .info-item {
          padding: 0.75rem;
          background-color: #f3f4f6;
          border-radius: 0.375rem;
        }
        
        .info-label {
          font-size: 0.875rem;
          color: #6b7280;
          font-weight: 500;
        }
        
        .info-value {
          font-size: 1rem;
          color: #1f2937;
          font-weight: 600;
          margin-top: 0.25rem;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 1rem;
        }
        
        th {
          background-color: #1e40af;
          color: white;
          padding: 0.75rem;
          text-align: left;
          font-weight: 600;
          font-size: 0.875rem;
        }
        
        td {
          padding: 0.75rem;
          border-bottom: 1px solid #e5e7eb;
          font-size: 0.875rem;
        }
        
        tr:nth-child(even) {
          background-color: #f9fafb;
        }
        
        .totals {
          margin-top: 2rem;
          border-top: 2px solid #e5e7eb;
          padding-top: 1rem;
        }
        
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
        }
        
        .total-label {
          font-weight: 500;
        }
        
        .total-value {
          font-weight: 600;
        }
        
        .grand-total {
          font-size: 1.25rem;
          color: #1e40af;
          border-top: 1px solid #e5e7eb;
          margin-top: 0.5rem;
          padding-top: 0.5rem;
        }
        
        .footer {
          background-color: #f3f4f6;
          padding: 2rem;
          text-align: center;
          font-size: 0.875rem;
          color: #6b7280;
        }
        
        .button {
          display: inline-block;
          padding: 0.75rem 1.5rem;
          background-color: #1e40af;
          color: white;
          text-decoration: none;
          border-radius: 0.375rem;
          font-weight: 600;
          margin-top: 1rem;
        }
        
        .alert {
          padding: 1rem;
          border-radius: 0.375rem;
          margin-bottom: 1rem;
        }
        
        .alert-info {
          background-color: #dbeafe;
          color: #1e40af;
          border: 1px solid #3b82f6;
        }
        
        .shipping-marks {
          background-color: #fef3c7;
          border: 2px dashed #f59e0b;
          padding: 1rem;
          border-radius: 0.375rem;
          margin-top: 1rem;
          font-family: monospace;
          white-space: pre-wrap;
        }
        
        @media print {
          .email-container {
            box-shadow: none;
          }
          
          .button {
            display: none;
          }
        }
      </style>
    `;
  }
  
  async generateInvoiceHTML(invoice: Invoice): Promise<string> {
    const template = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice ${invoice.invoiceNumber}</title>
        ${this.getBaseStyles()}
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1>BLS TRADING COMPANY</h1>
            <p>Plot No. 123, Industrial Area, Chittoor, AP - 517001</p>
            <p>Phone: +91 8572 223456 | Email: info@blstrading.com</p>
            <p>GSTIN: 37ABCDE1234F1Z5 | IEC: 1234567890</p>
          </div>
          
          <div class="content">
            <div class="alert alert-info">
              <strong>${this.getInvoiceTitle(invoice.invoiceType)}</strong>
            </div>
            
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Invoice Number</div>
                <div class="info-value">${invoice.invoiceNumber}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Invoice Date</div>
                <div class="info-value">${new Date(invoice.invoiceDate).toLocaleDateString()}</div>
              </div>
            </div>
            
            ${invoice.order?.customer ? `
            <div class="section">
              <h2 class="section-title">Bill To</h2>
              <div style="background-color: #f9fafb; padding: 1rem; border-radius: 0.375rem;">
                <strong>${invoice.order.customer.companyName}</strong><br>
                ${invoice.order.customer.address.street}<br>
                ${invoice.order.customer.address.city}, ${invoice.order.customer.address.state}<br>
                ${invoice.order.customer.address.country} - ${invoice.order.customer.address.postalCode}<br>
                Contact: ${invoice.order.customer.contactPerson}<br>
                Email: ${invoice.order.customer.email}
              </div>
            </div>
            ` : ''}
            
            <div class="section">
              <h2 class="section-title">Products</h2>
              <table>
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Product Description</th>
                    <th>HSN Code</th>
                    <th>Batch</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${invoice.order?.items.map((item: any, index: number) => {
                    const product = item.product;
                    return `
                      <tr>
                        <td>${index + 1}</td>
                        <td>
                          <strong>${product?.brandName || 'Product'}</strong><br>
                          ${product?.genericName} ${product?.strength}<br>
                          <small>${product?.dosageForm} - ${product?.packSize}</small>
                        </td>
                        <td>${product?.hsnCode || ''}</td>
                        <td>${item.batchNumber}</td>
                        <td>${item.quantity}</td>
                        <td>${this.formatCurrency(item.unitPrice, invoice.currency)}</td>
                        <td>${this.formatCurrency(item.totalPrice, invoice.currency)}</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
            
            <div class="totals">
              <div class="total-row">
                <span class="total-label">Subtotal:</span>
                <span class="total-value">${this.formatCurrency(invoice.subtotal, invoice.currency)}</span>
              </div>
              ${invoice.drawback > 0 ? `
              <div class="total-row">
                <span class="total-label">Drawback (1.2%):</span>
                <span class="total-value">-${this.formatCurrency(invoice.drawback, invoice.currency)}</span>
              </div>
              ` : ''}
              ${invoice.rodtep > 0 ? `
              <div class="total-row">
                <span class="total-label">RODTEP (0.70%):</span>
                <span class="total-value">-${this.formatCurrency(invoice.rodtep, invoice.currency)}</span>
              </div>
              ` : ''}
              <div class="total-row grand-total">
                <span class="total-label">Total Amount:</span>
                <span class="total-value">${this.formatCurrency(invoice.totalAmount, invoice.currency)}</span>
              </div>
            </div>
            
            ${invoice.order?.shippingMarks ? `
            <div class="section">
              <h2 class="section-title">Shipping Marks</h2>
              <div class="shipping-marks">${invoice.order.shippingMarks}</div>
            </div>
            ` : ''}
            
            <div class="section">
              <h2 class="section-title">Bank Details</h2>
              <div style="background-color: #f9fafb; padding: 1rem; border-radius: 0.375rem;">
                <strong>Bank Name:</strong> ${invoice.bankDetails.bankName}<br>
                <strong>Account Name:</strong> ${invoice.bankDetails.accountName}<br>
                <strong>Account Number:</strong> ${invoice.bankDetails.accountNumber}<br>
                <strong>SWIFT Code:</strong> ${invoice.bankDetails.swiftCode}<br>
                ${invoice.bankDetails.ifscCode ? `<strong>IFSC Code:</strong> ${invoice.bankDetails.ifscCode}<br>` : ''}
              </div>
            </div>
            
            ${invoice.termsAndConditions ? `
            <div class="section">
              <h2 class="section-title">Terms & Conditions</h2>
              <div style="font-size: 0.875rem; color: #6b7280;">
                ${invoice.termsAndConditions.split('\n').join('<br>')}
              </div>
            </div>
            ` : ''}
            
            <div style="text-align: center; margin-top: 2rem;">
              <a href="#" class="button">Download PDF</a>
            </div>
          </div>
          
          <div class="footer">
            <p>This is a computer-generated document and does not require a signature.</p>
            <p>For any queries, please contact us at info@blstrading.com</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    // Inline CSS for email compatibility
    return juice(template);
  }
  
  async generatePackingListHTML(packingList: PackingList): Promise<string> {
    const template = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Packing List ${packingList.packingListNumber}</title>
        ${this.getBaseStyles()}
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1>BLS TRADING COMPANY</h1>
            <p>PACKING LIST</p>
          </div>
          
          <div class="content">
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Packing List No</div>
                <div class="info-value">${packingList.packingListNumber}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Date</div>
                <div class="info-value">${new Date(packingList.createdAt).toLocaleDateString()}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Container No</div>
                <div class="info-value">${packingList.containerNumber || '-'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Seal No</div>
                <div class="info-value">${packingList.sealNumber || '-'}</div>
              </div>
            </div>
            
            <div class="section">
              <h2 class="section-title">Package Details</h2>
              <table>
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Product</th>
                    <th>Batch</th>
                    <th>Expiry</th>
                    <th>Quantity</th>
                    <th>Packages</th>
                    <th>Gross Wt</th>
                    <th>Net Wt</th>
                  </tr>
                </thead>
                <tbody>
                  ${packingList.items.map((item: any, index: number) => {
                    const product = item.product;
                    return `
                      <tr>
                        <td>${index + 1}</td>
                        <td>${product?.brandName} ${product?.strength}</td>
                        <td>${item.batchNumber}</td>
                        <td>${item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : '-'}</td>
                        <td>${item.quantity}</td>
                        <td>${item.packagesCount || 1}</td>
                        <td>${item.grossWeight} kg</td>
                        <td>${item.netWeight} kg</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
                <tfoot>
                  <tr>
                    <th colspan="5">TOTAL</th>
                    <th>${packingList.totalPackages}</th>
                    <th>${packingList.totalGrossWeight} kg</th>
                    <th>${packingList.totalNetWeight} kg</th>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            ${packingList.shippingMarks ? `
            <div class="section">
              <h2 class="section-title">Shipping Marks</h2>
              <div class="shipping-marks">${packingList.shippingMarks}</div>
            </div>
            ` : ''}
          </div>
          
          <div class="footer">
            <p>This packing list certifies that the goods are properly packed for export.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    return juice(template);
  }
  
  async generatePurchaseOrderHTML(purchaseOrder: PurchaseOrder): Promise<string> {
    const template = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Purchase Order ${purchaseOrder.poNumber}</title>
        ${this.getBaseStyles()}
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1>BLS TRADING COMPANY</h1>
            <p>PURCHASE ORDER</p>
          </div>
          
          <div class="content">
            <div class="alert alert-info">
              <strong>PO Number:</strong> ${purchaseOrder.poNumber} | 
              <strong>Status:</strong> ${purchaseOrder.status.toUpperCase()}
            </div>
            
            ${purchaseOrder.supplier ? `
            <div class="section">
              <h2 class="section-title">Supplier Details</h2>
              <div style="background-color: #f9fafb; padding: 1rem; border-radius: 0.375rem;">
                <strong>${purchaseOrder.supplier.companyName}</strong><br>
                ${purchaseOrder.supplier.address.street}<br>
                ${purchaseOrder.supplier.address.city}, ${purchaseOrder.supplier.address.state}<br>
                GSTIN: ${(purchaseOrder.supplier as any).gstin || '-'}
              </div>
            </div>
            ` : ''}
            
            <div class="section">
              <h2 class="section-title">Order Items</h2>
              <table>
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Description</th>
                    <th>HSN Code</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${purchaseOrder.items.map((item: any, index: number) => `
                    <tr>
                      <td>${index + 1}</td>
                      <td>${item.product?.brandName || item.description}</td>
                      <td>${item.product?.hsnCode || item.hsnCode || ''}</td>
                      <td>${item.quantity}</td>
                      <td>${this.formatCurrency(item.unitPrice, purchaseOrder.currency)}</td>
                      <td>${this.formatCurrency(item.totalPrice, purchaseOrder.currency)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            
            <div class="totals">
              <div class="total-row">
                <span class="total-label">Subtotal:</span>
                <span class="total-value">${this.formatCurrency(purchaseOrder.subtotal, purchaseOrder.currency)}</span>
              </div>
              ${(purchaseOrder as any).cgst > 0 ? `
              <div class="total-row">
                <span class="total-label">CGST (9%):</span>
                <span class="total-value">${this.formatCurrency((purchaseOrder as any).cgst, purchaseOrder.currency)}</span>
              </div>
              ` : ''}
              ${(purchaseOrder as any).sgst > 0 ? `
              <div class="total-row">
                <span class="total-label">SGST (9%):</span>
                <span class="total-value">${this.formatCurrency((purchaseOrder as any).sgst, purchaseOrder.currency)}</span>
              </div>
              ` : ''}
              <div class="total-row grand-total">
                <span class="total-label">Total Amount:</span>
                <span class="total-value">${this.formatCurrency(purchaseOrder.totalAmount, purchaseOrder.currency)}</span>
              </div>
            </div>
          </div>
          
          <div class="footer">
            <p>This purchase order is subject to our standard terms and conditions.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    return juice(template);
  }
  
  private formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }
  
  private getInvoiceTitle(type: string): string {
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
}