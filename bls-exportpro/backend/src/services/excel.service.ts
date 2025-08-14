import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { Product, Customer, Order, ExcelImportResult } from '../../../shared/types';
import { repositories } from '../repositories';
import path from 'path';
import fs from 'fs/promises';

export class ExcelService {
  async importProducts(filePath: string): Promise<ExcelImportResult> {
    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    let successfulRecords = 0;
    let failedRecords = 0;
    const errors: Array<{ row: number; field: string; message: string }> = [];
    
    for (let i = 0; i < data.length; i++) {
      try {
        const row: any = data[i];
        await repositories.product.create({
          productCode: row['Product Code'] || `PROD-${Date.now()}-${i}`,
          brandName: row['Brand Name'] || row['Product Name'],
          genericName: row['Generic Name'] || row['Composition'],
          strength: row['Strength'] || '',
          dosageForm: row['Dosage Form'] || row['Form'],
          packSize: row['Pack Size'] || row['Packing'],
          manufacturer: row['Manufacturer'] || 'Unknown',
          hsnCode: row['HSN Code'] || '',
          unitPrice: parseFloat(row['Price'] || row['Unit Price'] || '0'),
          currency: row['Currency'] || 'USD',
        });
        successfulRecords++;
      } catch (error) {
        failedRecords++;
        errors.push({
          row: i + 2,
          field: 'general',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
    
    return {
      success: failedRecords === 0,
      totalRecords: data.length,
      successfulRecords,
      failedRecords,
      errors: errors.length > 0 ? errors : undefined,
    };
  }
  
  async importCustomers(filePath: string): Promise<ExcelImportResult> {
    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    let successfulRecords = 0;
    let failedRecords = 0;
    const errors: Array<{ row: number; field: string; message: string }> = [];
    
    for (let i = 0; i < data.length; i++) {
      try {
        const row: any = data[i];
        await repositories.customer.create({
          companyName: row['Company Name'] || row['Customer Name'],
          contactPerson: row['Contact Person'] || row['Contact'],
          email: row['Email'] || `customer${i}@example.com`,
          phone: row['Phone'] || row['Contact Number'] || '',
          address: {
            street: row['Street'] || row['Address Line 1'] || '',
            city: row['City'] || '',
            state: row['State'] || row['Province'] || '',
            country: row['Country'] || '',
            postalCode: row['Postal Code'] || row['ZIP'] || '',
          },
          taxId: row['Tax ID'] || row['GST'] || '',
          currency: row['Currency'] || 'USD',
        });
        successfulRecords++;
      } catch (error) {
        failedRecords++;
        errors.push({
          row: i + 2,
          field: 'general',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
    
    return {
      success: failedRecords === 0,
      totalRecords: data.length,
      successfulRecords,
      failedRecords,
      errors: errors.length > 0 ? errors : undefined,
    };
  }
  
  async exportOrders(startDate?: Date, endDate?: Date): Promise<string> {
    const orders = await repositories.order.findAll();
    
    let filteredOrders = orders;
    if (startDate || endDate) {
      filteredOrders = orders.filter(order => {
        const orderDate = new Date(order.orderDate);
        if (startDate && orderDate < startDate) return false;
        if (endDate && orderDate > endDate) return false;
        return true;
      });
    }
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Orders');
    
    worksheet.columns = [
      { header: 'Order Number', key: 'orderNumber', width: 15 },
      { header: 'Order Date', key: 'orderDate', width: 12 },
      { header: 'Customer', key: 'customer', width: 25 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Currency', key: 'currency', width: 10 },
      { header: 'Subtotal', key: 'subtotal', width: 12 },
      { header: 'IGST', key: 'igst', width: 10 },
      { header: 'Drawback', key: 'drawback', width: 10 },
      { header: 'RODTEP', key: 'rodtep', width: 10 },
      { header: 'Total Amount', key: 'totalAmount', width: 15 },
    ];
    
    for (const order of filteredOrders) {
      const customer = await repositories.customer.findById(order.customerId);
      worksheet.addRow({
        orderNumber: order.orderNumber,
        orderDate: new Date(order.orderDate).toLocaleDateString(),
        customer: customer?.companyName || 'Unknown',
        status: order.status,
        currency: order.currency,
        subtotal: order.subtotal,
        igst: order.igst,
        drawback: order.drawback,
        rodtep: order.rodtep,
        totalAmount: order.totalAmount,
      });
    }
    
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };
    
    const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });
    
    const filename = `orders-export-${Date.now()}.xlsx`;
    const filepath = path.join(uploadDir, filename);
    
    await workbook.xlsx.writeFile(filepath);
    
    return filepath;
  }
  
  async exportInvoices(invoiceType?: string): Promise<string> {
    const invoices = await repositories.invoice.findAll();
    
    let filteredInvoices = invoices;
    if (invoiceType) {
      filteredInvoices = invoices.filter(inv => inv.invoiceType === invoiceType);
    }
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Invoices');
    
    worksheet.columns = [
      { header: 'Invoice Number', key: 'invoiceNumber', width: 18 },
      { header: 'Type', key: 'invoiceType', width: 15 },
      { header: 'Invoice Date', key: 'invoiceDate', width: 12 },
      { header: 'Order Number', key: 'orderNumber', width: 15 },
      { header: 'Customer', key: 'customer', width: 25 },
      { header: 'Currency', key: 'currency', width: 10 },
      { header: 'Total Amount', key: 'totalAmount', width: 15 },
    ];
    
    for (const invoice of filteredInvoices) {
      const order = await repositories.order.findById(invoice.orderId);
      const customer = order ? await repositories.customer.findById(order.customerId) : null;
      
      worksheet.addRow({
        invoiceNumber: invoice.invoiceNumber,
        invoiceType: invoice.invoiceType,
        invoiceDate: new Date(invoice.invoiceDate).toLocaleDateString(),
        orderNumber: order?.orderNumber || 'N/A',
        customer: customer?.companyName || 'Unknown',
        currency: invoice.currency,
        totalAmount: invoice.totalAmount,
      });
    }
    
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };
    
    const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });
    
    const filename = `invoices-export-${Date.now()}.xlsx`;
    const filepath = path.join(uploadDir, filename);
    
    await workbook.xlsx.writeFile(filepath);
    
    return filepath;
  }
}

export const excelService = new ExcelService();