import * as XLSX from 'xlsx';
import { EventEmitter } from 'events';
import path from 'path';
import fs from 'fs';
import { z } from 'zod';
import { Product, Customer, Order } from '../../../../shared/types';
import { repositories } from '../../repositories';

// Schema definitions for validation
const productImportSchema = z.object({
  productCode: z.string(),
  brandName: z.string(),
  genericName: z.string(),
  strength: z.string(),
  dosageForm: z.string(),
  packSize: z.string(),
  manufacturer: z.string(),
  hsnCode: z.string(),
  unitPrice: z.number().optional(),
  currency: z.enum(['USD', 'INR']).optional(),
  cambodiaRegistrationStatus: z.string().optional(),
  registrationNumber: z.string().optional(),
  registrationDate: z.string().optional(),
  expiryDate: z.string().optional()
});

const orderImportSchema = z.object({
  orderNumber: z.string(),
  customerName: z.string(),
  orderDate: z.string(),
  productCode: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
  currency: z.enum(['USD', 'INR']),
  status: z.string().optional()
});

export interface ImportOptions {
  sheetName?: string;
  headerRow?: number;
  startRow?: number;
  mapping?: Record<string, string>;
  validateOnly?: boolean;
}

export interface ImportResult {
  success: boolean;
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: ImportError[];
  data?: any[];
}

export interface ImportError {
  row: number;
  field?: string;
  message: string;
  data?: any;
}

export class ExcelImportService extends EventEmitter {
  private importCache = new Map<string, ImportResult>();
  
  async importProductMaster(filePath: string, options: ImportOptions = {}): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      totalRows: 0,
      successCount: 0,
      errorCount: 0,
      errors: []
    };
    
    try {
      const workbook = XLSX.readFile(filePath);
      const sheetName = options.sheetName || workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      if (!worksheet) {
        throw new Error(`Sheet "${sheetName}" not found`);
      }
      
      const data = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: '',
        blankrows: false
      });
      
      const headerRow = options.headerRow || 0;
      const startRow = options.startRow || headerRow + 1;
      const headers = data[headerRow] as string[];
      
      if (!headers || headers.length === 0) {
        throw new Error('No headers found in the Excel file');
      }
      
      const mapping = this.createFieldMapping(headers, options.mapping || {
        'Product Code': 'productCode',
        'Brand Name': 'brandName',
        'Generic Name': 'genericName',
        'Strength': 'strength',
        'Dosage Form': 'dosageForm',
        'Pack Size': 'packSize',
        'Manufacturer': 'manufacturer',
        'HSN Code': 'hsnCode',
        'Unit Price': 'unitPrice',
        'Currency': 'currency',
        'Cambodia Registration Status': 'cambodiaRegistrationStatus',
        'Registration Number': 'registrationNumber',
        'Registration Date': 'registrationDate',
        'Expiry Date': 'expiryDate'
      });
      
      const products: any[] = [];
      
      for (let i = startRow; i < data.length; i++) {
        const row = data[i] as any[];
        result.totalRows++;
        
        this.emit('progress', {
          current: i - startRow + 1,
          total: data.length - startRow,
          percentage: Math.round(((i - startRow + 1) / (data.length - startRow)) * 100)
        });
        
        try {
          const rowData = this.mapRowToObject(row, headers, mapping);
          
          // Convert numeric fields
          if (rowData.unitPrice) {
            rowData.unitPrice = this.parseNumber(rowData.unitPrice);
          }
          
          // Validate data
          const validated = productImportSchema.parse(rowData);
          
          if (!options.validateOnly) {
            // Check if product already exists
            const existingProducts = await repositories.product.findAll();
            const exists = existingProducts.find(p => p.productCode === validated.productCode);
            
            if (exists) {
              // Update existing product
              await repositories.product.update(exists.id, {
                ...validated,
                unitPrice: validated.unitPrice || 0,
                currency: validated.currency || 'USD',
                registrationDate: validated.registrationDate ? new Date(validated.registrationDate) : undefined,
                expiryDate: validated.expiryDate ? new Date(validated.expiryDate) : undefined
              } as any);
            } else {
              // Create new product
              await repositories.product.create({
                ...validated,
                unitPrice: validated.unitPrice || 0,
                currency: validated.currency || 'USD',
                registrationDate: validated.registrationDate ? new Date(validated.registrationDate) : undefined,
                expiryDate: validated.expiryDate ? new Date(validated.expiryDate) : undefined
              } as any);
            }
          }
          
          products.push(validated);
          result.successCount++;
        } catch (error: any) {
          result.errorCount++;
          result.errors.push({
            row: i + 1,
            message: error.message,
            data: row
          });
        }
      }
      
      result.success = result.errorCount === 0;
      result.data = products;
      
      // Cache the result
      this.importCache.set(filePath, result);
      
    } catch (error: any) {
      result.errors.push({
        row: 0,
        message: error.message
      });
    }
    
    return result;
  }
  
  async importCambodiaRegistration(filePath: string, options: ImportOptions = {}): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      totalRows: 0,
      successCount: 0,
      errorCount: 0,
      errors: []
    };
    
    try {
      const workbook = XLSX.readFile(filePath);
      const sheetName = options.sheetName || workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      const data = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: '',
        blankrows: false
      });
      
      const headerRow = options.headerRow || 0;
      const startRow = options.startRow || headerRow + 1;
      const headers = data[headerRow] as string[];
      
      const mapping = this.createFieldMapping(headers, options.mapping || {
        'Product Code': 'productCode',
        'Registration Status': 'registrationStatus',
        'Registration Number': 'registrationNumber',
        'Registration Date': 'registrationDate',
        'Expiry Date': 'expiryDate',
        'Dossier Status': 'dossierStatus',
        'Submission Date': 'submissionDate',
        'Approval Date': 'approvalDate'
      });
      
      const registrations: any[] = [];
      
      for (let i = startRow; i < data.length; i++) {
        const row = data[i] as any[];
        result.totalRows++;
        
        try {
          const rowData = this.mapRowToObject(row, headers, mapping);
          
          if (!options.validateOnly && rowData.productCode) {
            // Find product and update registration info
            const products = await repositories.product.findAll();
            const product = products.find(p => p.productCode === rowData.productCode);
            
            if (product) {
              await repositories.product.update(product.id, {
                cambodiaRegistrationStatus: rowData.registrationStatus,
                registrationNumber: rowData.registrationNumber,
                registrationDate: rowData.registrationDate ? new Date(rowData.registrationDate) : undefined,
                expiryDate: rowData.expiryDate ? new Date(rowData.expiryDate) : undefined
              } as any);
              
              result.successCount++;
            } else {
              throw new Error(`Product with code ${rowData.productCode} not found`);
            }
          }
          
          registrations.push(rowData);
        } catch (error: any) {
          result.errorCount++;
          result.errors.push({
            row: i + 1,
            message: error.message,
            data: row
          });
        }
      }
      
      result.success = result.errorCount === 0;
      result.data = registrations;
      
    } catch (error: any) {
      result.errors.push({
        row: 0,
        message: error.message
      });
    }
    
    return result;
  }
  
  async importHistoricalOrders(filePath: string, options: ImportOptions = {}): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      totalRows: 0,
      successCount: 0,
      errorCount: 0,
      errors: []
    };
    
    try {
      const workbook = XLSX.readFile(filePath);
      const sheetName = options.sheetName || workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      const data = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: '',
        blankrows: false
      });
      
      const headerRow = options.headerRow || 0;
      const startRow = options.startRow || headerRow + 1;
      const headers = data[headerRow] as string[];
      
      const mapping = this.createFieldMapping(headers, options.mapping || {
        'Order Number': 'orderNumber',
        'Customer Name': 'customerName',
        'Order Date': 'orderDate',
        'Product Code': 'productCode',
        'Quantity': 'quantity',
        'Unit Price': 'unitPrice',
        'Currency': 'currency',
        'Status': 'status'
      });
      
      const orders: any[] = [];
      const orderMap = new Map<string, any>();
      
      for (let i = startRow; i < data.length; i++) {
        const row = data[i] as any[];
        result.totalRows++;
        
        this.emit('progress', {
          current: i - startRow + 1,
          total: data.length - startRow,
          percentage: Math.round(((i - startRow + 1) / (data.length - startRow)) * 100)
        });
        
        try {
          const rowData = this.mapRowToObject(row, headers, mapping);
          
          // Convert numeric fields
          rowData.quantity = this.parseNumber(rowData.quantity);
          rowData.unitPrice = this.parseNumber(rowData.unitPrice);
          
          // Validate data
          const validated = orderImportSchema.parse(rowData);
          
          if (!options.validateOnly) {
            // Group items by order number
            if (!orderMap.has(validated.orderNumber)) {
              // Find or create customer
              const customers = await repositories.customer.findAll();
              let customer = customers.find(c => c.companyName === validated.customerName);
              
              if (!customer) {
                // Create basic customer record
                customer = await repositories.customer.create({
                  companyName: validated.customerName,
                  contactPerson: 'TBD',
                  email: 'tbd@example.com',
                  phone: 'TBD',
                  address: {
                    street: 'TBD',
                    city: 'TBD',
                    state: 'TBD',
                    country: 'Cambodia',
                    postalCode: 'TBD'
                  },
                  taxId: 'TBD',
                  currency: validated.currency
                });
              }
              
              orderMap.set(validated.orderNumber, {
                orderNumber: validated.orderNumber,
                customerId: customer.id,
                orderDate: new Date(validated.orderDate),
                currency: validated.currency,
                status: validated.status || 'completed',
                items: []
              });
            }
            
            // Find product
            const products = await repositories.product.findAll();
            const product = products.find(p => p.productCode === validated.productCode);
            
            if (!product) {
              throw new Error(`Product with code ${validated.productCode} not found`);
            }
            
            // Add item to order
            orderMap.get(validated.orderNumber).items.push({
              productId: product.id,
              quantity: validated.quantity,
              unitPrice: validated.unitPrice
            });
          }
          
          result.successCount++;
        } catch (error: any) {
          result.errorCount++;
          result.errors.push({
            row: i + 1,
            message: error.message,
            data: row
          });
        }
      }
      
      // Create orders
      if (!options.validateOnly) {
        for (const [orderNumber, orderData] of orderMap) {
          try {
            const order = await repositories.order.create(orderData);
            orders.push(order);
          } catch (error: any) {
            result.errors.push({
              row: 0,
              message: `Failed to create order ${orderNumber}: ${error.message}`
            });
          }
        }
      }
      
      result.success = result.errorCount === 0;
      result.data = orders;
      
    } catch (error: any) {
      result.errors.push({
        row: 0,
        message: error.message
      });
    }
    
    return result;
  }
  
  async importFinancialMIS(filePath: string, options: ImportOptions = {}): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      totalRows: 0,
      successCount: 0,
      errorCount: 0,
      errors: []
    };
    
    try {
      const workbook = XLSX.readFile(filePath);
      const financialData: any[] = [];
      
      // Process multiple sheets for different financial data
      const sheetsToProcess = options.sheetName ? [options.sheetName] : workbook.SheetNames;
      
      for (const sheetName of sheetsToProcess) {
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        
        financialData.push({
          sheet: sheetName,
          data: data,
          summary: this.generateFinancialSummary(data, sheetName)
        });
        
        result.totalRows += data.length;
        result.successCount += data.length;
      }
      
      result.success = true;
      result.data = financialData;
      
      // Store in cache for reporting
      this.importCache.set(`financial-${Date.now()}`, result);
      
    } catch (error: any) {
      result.errors.push({
        row: 0,
        message: error.message
      });
    }
    
    return result;
  }
  
  private createFieldMapping(headers: string[], defaultMapping: Record<string, string>): Record<number, string> {
    const mapping: Record<number, string> = {};
    
    headers.forEach((header, index) => {
      const normalizedHeader = header.trim();
      if (defaultMapping[normalizedHeader]) {
        mapping[index] = defaultMapping[normalizedHeader];
      }
    });
    
    return mapping;
  }
  
  private mapRowToObject(row: any[], headers: string[], mapping: Record<number, string>): any {
    const obj: any = {};
    
    Object.entries(mapping).forEach(([index, field]) => {
      const value = row[parseInt(index)];
      if (value !== undefined && value !== null && value !== '') {
        obj[field] = value;
      }
    });
    
    return obj;
  }
  
  private parseNumber(value: any): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const cleaned = value.replace(/[^0-9.-]/g, '');
      return parseFloat(cleaned) || 0;
    }
    return 0;
  }
  
  private generateFinancialSummary(data: any[], sheetName: string): any {
    const summary: any = {
      sheetName,
      rowCount: data.length,
      columns: Object.keys(data[0] || {}),
      dateRange: null,
      totals: {}
    };
    
    // Auto-detect date columns and numeric columns
    if (data.length > 0) {
      const firstRow = data[0];
      
      Object.keys(firstRow).forEach(key => {
        const values = data.map(row => row[key]);
        
        // Check if numeric column
        const numericValues = values.filter(v => !isNaN(parseFloat(v)));
        if (numericValues.length > values.length * 0.8) {
          summary.totals[key] = numericValues.reduce((sum, v) => sum + parseFloat(v), 0);
        }
        
        // Check if date column
        if (key.toLowerCase().includes('date')) {
          const dates = values.filter(v => !isNaN(Date.parse(v))).map(v => new Date(v));
          if (dates.length > 0) {
            summary.dateRange = {
              min: new Date(Math.min(...dates.map(d => d.getTime()))),
              max: new Date(Math.max(...dates.map(d => d.getTime())))
            };
          }
        }
      });
    }
    
    return summary;
  }
  
  async validateExcelStructure(filePath: string, expectedColumns: string[]): Promise<{
    valid: boolean;
    missingColumns: string[];
    extraColumns: string[];
  }> {
    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const headers = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0] as string[];
    
    const normalizedHeaders = headers.map(h => h.toString().trim());
    const normalizedExpected = expectedColumns.map(c => c.trim());
    
    const missingColumns = normalizedExpected.filter(col => !normalizedHeaders.includes(col));
    const extraColumns = normalizedHeaders.filter(col => !normalizedExpected.includes(col));
    
    return {
      valid: missingColumns.length === 0,
      missingColumns,
      extraColumns
    };
  }
  
  clearCache(): void {
    this.importCache.clear();
  }
}

export const excelImportService = new ExcelImportService();