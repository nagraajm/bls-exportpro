import { repositories } from '../repositories';
import { Invoice, InvoiceType, Order } from '../../../shared/types.ts';
import { calculateOrderTotals } from '../utils/calculations';
import { AppError } from '../middleware/error.middleware';
import { CONSTANTS } from '../config/constants';

export class InvoiceService {
  async generateInvoice(data: {
    orderId: string;
    invoiceType: InvoiceType;
    dueDate?: Date;
    termsAndConditions?: string;
  }): Promise<Invoice> {
    const order = await repositories.order.findById(data.orderId);
    if (!order) {
      throw new AppError(404, 'Order not found');
    }
    
    const existingInvoice = await repositories.invoice.findOne(
      inv => inv.orderId === data.orderId && inv.invoiceType === data.invoiceType
    );
    
    if (existingInvoice) {
      throw new AppError(400, `${data.invoiceType} invoice already exists for this order`);
    }
    
    const invoiceNumber = await repositories.invoice.generateInvoiceNumber(data.invoiceType);
    
    const invoice = await repositories.invoice.create({
      invoiceNumber,
      invoiceType: data.invoiceType,
      orderId: data.orderId,
      invoiceDate: new Date(),
      dueDate: data.dueDate,
      subtotal: order.subtotal,
      igst: order.igst,
      drawback: order.drawback,
      rodtep: order.rodtep,
      totalAmount: order.totalAmount,
      currency: order.currency,
      exchangeRate: order.exchangeRate,
      bankDetails: CONSTANTS.BANK_DETAILS.primary,
      termsAndConditions: data.termsAndConditions || this.getDefaultTerms(data.invoiceType),
    });
    
    return invoice;
  }
  
  async importInvoices(invoicesData: Array<{
    invoiceNumber: string;
    invoiceType: InvoiceType;
    customerName: string;
    customerCountry: string;
    invoiceDate: string;
    dueDate?: string;
    totalAmount: number;
    currency: 'USD' | 'INR';
    status?: string;
    items?: Array<{
      productName: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }>;
  }>): Promise<{
    success: boolean;
    totalRecords: number;
    successfulRecords: number;
    failedRecords: number;
    errors?: Array<{
      row: number;
      field: string;
      message: string;
    }>;
  }> {
    const result = {
      success: true,
      totalRecords: invoicesData.length,
      successfulRecords: 0,
      failedRecords: 0,
      errors: [] as Array<{ row: number; field: string; message: string }>
    };

    for (let i = 0; i < invoicesData.length; i++) {
      const invoiceData = invoicesData[i];
      const rowNumber = i + 1;

      try {
        // Check for duplicate invoice number
        const existingInvoice = await repositories.invoice.findOne(
          inv => inv.invoiceNumber === invoiceData.invoiceNumber
        );

        if (existingInvoice) {
          result.errors!.push({
            row: rowNumber,
            field: 'invoiceNumber',
            message: `Invoice number ${invoiceData.invoiceNumber} already exists`
          });
          result.failedRecords++;
          continue;
        }

        // Create or find customer
        let customer = await repositories.customer.findOne(
          c => c.companyName === invoiceData.customerName
        );

        if (!customer) {
          customer = await repositories.customer.create({
            companyName: invoiceData.customerName,
            contactPerson: invoiceData.customerName,
            email: `${invoiceData.customerName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
            phone: '+1234567890',
            address: {
              street: 'Unknown',
              city: 'Unknown',
              state: 'Unknown',
              country: invoiceData.customerCountry,
              postalCode: '00000'
            },
            taxId: 'UNKNOWN',
            currency: invoiceData.currency
          });
        }

        // Create a mock order for the invoice
        const order = await repositories.order.create({
          orderNumber: `ORD-${Date.now()}-${i}`,
          customerId: customer.id,
          orderDate: new Date(invoiceData.invoiceDate),
          status: 'confirmed',
          items: invoiceData.items?.map(item => ({
            productId: 'mock-product-id',
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            batchNumber: 'BATCH-001',
            expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
          })) || [],
          subtotal: invoiceData.totalAmount,
          igst: 0,
          drawback: 0,
          rodtep: 0,
          totalAmount: invoiceData.totalAmount,
          currency: invoiceData.currency
        });

        // Create the invoice
        const invoice = await repositories.invoice.create({
          invoiceNumber: invoiceData.invoiceNumber,
          invoiceType: invoiceData.invoiceType,
          orderId: order.id,
          invoiceDate: new Date(invoiceData.invoiceDate),
          dueDate: invoiceData.dueDate ? new Date(invoiceData.dueDate) : undefined,
          subtotal: invoiceData.totalAmount,
          igst: 0,
          drawback: 0,
          rodtep: 0,
          totalAmount: invoiceData.totalAmount,
          currency: invoiceData.currency,
          bankDetails: CONSTANTS.BANK_DETAILS.primary,
          termsAndConditions: this.getDefaultTerms(invoiceData.invoiceType),
        });

        result.successfulRecords++;
      } catch (error) {
        console.error(`Error importing invoice at row ${rowNumber}:`, error);
        result.errors!.push({
          row: rowNumber,
          field: 'general',
          message: error instanceof Error ? error.message : 'Unknown error occurred'
        });
        result.failedRecords++;
      }
    }

    result.success = result.failedRecords === 0;
    return result;
  }
  
  async getInvoice(id: string): Promise<Invoice> {
    const invoice = await repositories.invoice.findById(id);
    if (!invoice) {
      throw new AppError(404, 'Invoice not found');
    }
    
    invoice.order = await repositories.order.findById(invoice.orderId) || undefined;
    if (invoice.order) {
      invoice.order.customer = await repositories.customer.findById(invoice.order.customerId) || undefined;
      for (const item of invoice.order.items) {
        item.product = await repositories.product.findById(item.productId) || undefined;
      }
    }
    
    return invoice;
  }
  
  async listInvoices(filters: {
    page?: number;
    limit?: number;
    invoiceType?: InvoiceType;
    orderId?: string;
  }) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    
    let predicate: ((invoice: Invoice) => boolean) | undefined;
    
    if (filters.invoiceType || filters.orderId) {
      predicate = (invoice: Invoice) => {
        let match = true;
        
        if (filters.invoiceType && invoice.invoiceType !== filters.invoiceType) match = false;
        if (filters.orderId && invoice.orderId !== filters.orderId) match = false;
        
        return match;
      };
    }
    
    return repositories.invoice.paginate(page, limit, predicate);
  }
  
  async updateInvoice(id: string, updates: Partial<Invoice>): Promise<Invoice> {
    const invoice = await repositories.invoice.findById(id);
    if (!invoice) {
      throw new AppError(404, 'Invoice not found');
    }
    
    const updatedInvoice = await repositories.invoice.update(id, updates);
    if (!updatedInvoice) {
      throw new AppError(500, 'Failed to update invoice');
    }
    
    return updatedInvoice;
  }
  
  async deleteInvoice(id: string): Promise<void> {
    const deleted = await repositories.invoice.delete(id);
    if (!deleted) {
      throw new AppError(404, 'Invoice not found');
    }
  }
  
  private getDefaultTerms(invoiceType: InvoiceType): string {
    switch (invoiceType) {
      case 'proforma':
        return '1. This is a Proforma Invoice and not a demand for payment.\n' +
               '2. Validity: 30 days from the date of issue.\n' +
               '3. Payment Terms: 100% advance payment via wire transfer.\n' +
               '4. Delivery: Within 30-45 days after receipt of payment.\n' +
               '5. All prices are ' + (invoiceType === 'proforma' ? 'FOB' : 'CIF') + ' basis.';
      
      case 'pre-shipment':
        return '1. Payment Terms: As per agreed terms.\n' +
               '2. Shipment will be released upon receipt of payment.\n' +
               '3. All goods are inspected and certified.\n' +
               '4. Insurance and freight charges are as per actual.';
      
      case 'post-shipment':
        return '1. Payment Terms: As per Letter of Credit / agreed terms.\n' +
               '2. All shipment documents are attached.\n' +
               '3. Goods shipped are as per purchase order.\n' +
               '4. Claims, if any, must be made within 7 days of receipt.';
      
      default:
        return '';
    }
  }
}

export const invoiceService = new InvoiceService();