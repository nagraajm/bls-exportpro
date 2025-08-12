import { BaseRepository } from './base.repository';
import { Invoice, InvoiceType } from '../../../shared/types.ts';

export class InvoiceRepository extends BaseRepository<Invoice> {
  constructor() {
    super('invoices');
  }
  
  async findByOrderId(orderId: string): Promise<Invoice[]> {
    return this.find(invoice => invoice.orderId === orderId);
  }
  
  async findByType(type: InvoiceType): Promise<Invoice[]> {
    return this.find(invoice => invoice.invoiceType === type);
  }
  
  async generateInvoiceNumber(type: InvoiceType): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = type === 'proforma' ? 'PI' : type === 'pre-shipment' ? 'PSI' : 'INV';
    const count = await this.count(invoice => 
      invoice.invoiceNumber.startsWith(`${prefix}-${year}-`)
    );
    return `${prefix}-${year}-${String(count + 1).padStart(5, '0')}`;
  }
}