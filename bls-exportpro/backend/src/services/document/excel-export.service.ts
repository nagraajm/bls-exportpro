import ExcelJS from 'exceljs';
import path from 'path';
import { Invoice, PackingList, PurchaseOrder } from '../../../../shared/types';

export class ExcelExportService {
  private createWorkbook(): ExcelJS.Workbook {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'BLS Trading Company';
    workbook.lastModifiedBy = 'BLS ExportPro System';
    workbook.created = new Date();
    workbook.modified = new Date();
    workbook.properties.date1904 = true;
    
    return workbook;
  }
  
  private addCompanyHeader(worksheet: ExcelJS.Worksheet, startRow: number = 1): number {
    // Merge cells for company header
    worksheet.mergeCells(`A${startRow}:H${startRow}`);
    worksheet.getCell(`A${startRow}`).value = 'BLS TRADING COMPANY';
    worksheet.getCell(`A${startRow}`).font = {
      name: 'Arial',
      size: 16,
      bold: true,
      color: { argb: 'FF1E40AF' }
    };
    worksheet.getCell(`A${startRow}`).alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getRow(startRow).height = 30;
    
    // Company details
    const details = [
      'Plot No. 123, Industrial Area, Chittoor, Andhra Pradesh - 517001, India',
      'Phone: +91 8572 223456 | Email: info@blstrading.com',
      'GSTIN: 37ABCDE1234F1Z5 | IEC: 1234567890 | Drug License: AP/CTR/2023/1234'
    ];
    
    details.forEach((detail, index) => {
      worksheet.mergeCells(`A${startRow + index + 1}:H${startRow + index + 1}`);
      worksheet.getCell(`A${startRow + index + 1}`).value = detail;
      worksheet.getCell(`A${startRow + index + 1}`).font = { name: 'Arial', size: 10 };
      worksheet.getCell(`A${startRow + index + 1}`).alignment = { vertical: 'middle', horizontal: 'center' };
    });
    
    // Add border
    const borderRange = `A${startRow}:H${startRow + 3}`;
    worksheet.getCell(borderRange).border = {
      top: { style: 'medium', color: { argb: 'FF1E40AF' } },
      left: { style: 'medium', color: { argb: 'FF1E40AF' } },
      bottom: { style: 'medium', color: { argb: 'FF1E40AF' } },
      right: { style: 'medium', color: { argb: 'FF1E40AF' } }
    };
    
    return startRow + 5;
  }
  
  async generateInvoiceExcel(invoice: Invoice): Promise<string> {
    const workbook = this.createWorkbook();
    const worksheet = workbook.addWorksheet('Invoice', {
      pageSetup: {
        paperSize: 9, // A4
        orientation: 'portrait',
        margins: {
          left: 0.5, right: 0.5,
          top: 0.75, bottom: 0.75,
          header: 0.3, footer: 0.3
        }
      }
    });
    
    let currentRow = this.addCompanyHeader(worksheet);
    
    // Invoice title
    worksheet.mergeCells(`A${currentRow}:H${currentRow}`);
    const titleCell = worksheet.getCell(`A${currentRow}`);
    titleCell.value = this.getInvoiceTitle(invoice.invoiceType);
    titleCell.font = { name: 'Arial', size: 14, bold: true };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E7FF' }
    };
    currentRow += 2;
    
    // Invoice details
    worksheet.getCell(`A${currentRow}`).value = 'Invoice No:';
    worksheet.getCell(`B${currentRow}`).value = invoice.invoiceNumber;
    worksheet.getCell(`D${currentRow}`).value = 'Invoice Date:';
    worksheet.getCell(`E${currentRow}`).value = new Date(invoice.invoiceDate);
    worksheet.getCell(`E${currentRow}`).numFmt = 'dd-mmm-yyyy';
    currentRow += 2;
    
    // Customer details
    worksheet.getCell(`A${currentRow}`).value = 'BILL TO:';
    worksheet.getCell(`A${currentRow}`).font = { bold: true, color: { argb: 'FF1E40AF' } };
    currentRow++;
    
    if (invoice.order?.customer) {
      const customer = invoice.order.customer;
      worksheet.getCell(`A${currentRow}`).value = customer.companyName;
      worksheet.getCell(`A${currentRow}`).font = { bold: true };
      currentRow++;
      worksheet.getCell(`A${currentRow}`).value = customer.address.street;
      currentRow++;
      worksheet.getCell(`A${currentRow}`).value = `${customer.address.city}, ${customer.address.state}`;
      currentRow++;
      worksheet.getCell(`A${currentRow}`).value = `${customer.address.country} - ${customer.address.postalCode}`;
      currentRow += 2;
    }
    
    // Items table
    const tableStartRow = currentRow;
    const headers = ['S.No', 'Product Description', 'HSN Code', 'Batch', 'Quantity', 'Unit Price', 'Total'];
    const headerRow = worksheet.getRow(currentRow);
    
    headers.forEach((header, index) => {
      const cell = headerRow.getCell(index + 1);
      cell.value = header;
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E40AF' }
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
    
    currentRow++;
    
    // Add items with formulas
    invoice.order?.items.forEach((item: any, index: number) => {
      const row = worksheet.getRow(currentRow);
      const product = item.product;
      
      row.getCell(1).value = index + 1;
      row.getCell(2).value = product ? `${product.brandName} - ${product.genericName} ${product.strength}` : 'Product';
      row.getCell(3).value = product?.hsnCode || '';
      row.getCell(4).value = item.batchNumber;
      row.getCell(5).value = item.quantity;
      row.getCell(6).value = item.unitPrice;
      row.getCell(7).value = { formula: `E${currentRow}*F${currentRow}` };
      row.getCell(7).numFmt = '$#,##0.00';
      
      // Add borders
      for (let i = 1; i <= 7; i++) {
        row.getCell(i).border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      }
      
      // Alternate row coloring
      if (index % 2 === 0) {
        for (let i = 1; i <= 7; i++) {
          row.getCell(i).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF3F4F6' }
          };
        }
      }
      
      currentRow++;
    });
    
    // Totals section with formulas
    currentRow++;
    worksheet.getCell(`E${currentRow}`).value = 'Subtotal:';
    worksheet.getCell(`E${currentRow}`).font = { bold: true };
    worksheet.getCell(`G${currentRow}`).value = { formula: `SUM(G${tableStartRow + 1}:G${currentRow - 2})` };
    worksheet.getCell(`G${currentRow}`).numFmt = '$#,##0.00';
    
    currentRow++;
    worksheet.getCell(`E${currentRow}`).value = 'Drawback (1.2%):';
    worksheet.getCell(`G${currentRow}`).value = { formula: `G${currentRow - 1}*0.012` };
    worksheet.getCell(`G${currentRow}`).numFmt = '$#,##0.00';
    
    currentRow++;
    worksheet.getCell(`E${currentRow}`).value = 'RODTEP (0.7%):';
    worksheet.getCell(`G${currentRow}`).value = { formula: `G${currentRow - 2}*0.007` };
    worksheet.getCell(`G${currentRow}`).numFmt = '$#,##0.00';
    
    currentRow++;
    worksheet.getCell(`E${currentRow}`).value = 'Total Amount:';
    worksheet.getCell(`E${currentRow}`).font = { bold: true, size: 12 };
    worksheet.getCell(`G${currentRow}`).value = { formula: `G${currentRow - 3}-G${currentRow - 2}-G${currentRow - 1}` };
    worksheet.getCell(`G${currentRow}`).numFmt = '$#,##0.00';
    worksheet.getCell(`G${currentRow}`).font = { bold: true, size: 12, color: { argb: 'FF1E40AF' } };
    
    // Bank details
    currentRow += 3;
    worksheet.getCell(`A${currentRow}`).value = 'BANK DETAILS:';
    worksheet.getCell(`A${currentRow}`).font = { bold: true, color: { argb: 'FF1E40AF' } };
    currentRow++;
    
    const bankDetails = [
      `Bank Name: ${invoice.bankDetails.bankName}`,
      `Account Name: ${invoice.bankDetails.accountName}`,
      `Account Number: ${invoice.bankDetails.accountNumber}`,
      `SWIFT Code: ${invoice.bankDetails.swiftCode}`,
      `IFSC Code: ${invoice.bankDetails.ifscCode || '-'}`
    ];
    
    bankDetails.forEach(detail => {
      worksheet.getCell(`A${currentRow}`).value = detail;
      currentRow++;
    });
    
    // Set column widths
    worksheet.getColumn(1).width = 8;
    worksheet.getColumn(2).width = 35;
    worksheet.getColumn(3).width = 12;
    worksheet.getColumn(4).width = 15;
    worksheet.getColumn(5).width = 10;
    worksheet.getColumn(6).width = 12;
    worksheet.getColumn(7).width = 15;
    
    // Save file
    const filename = `invoice-${invoice.invoiceNumber}-${Date.now()}.xlsx`;
    const filepath = path.join(process.env.UPLOAD_DIR || './uploads', 'excel', filename);
    await workbook.xlsx.writeFile(filepath);
    
    return filepath;
  }
  
  async generatePackingListExcel(packingList: PackingList): Promise<string> {
    const workbook = this.createWorkbook();
    const worksheet = workbook.addWorksheet('Packing List', {
      pageSetup: {
        paperSize: 9,
        orientation: 'landscape',
        margins: {
          left: 0.5, right: 0.5,
          top: 0.75, bottom: 0.75,
          header: 0.3, footer: 0.3
        }
      }
    });
    
    let currentRow = this.addCompanyHeader(worksheet);
    
    // Packing list title
    worksheet.mergeCells(`A${currentRow}:H${currentRow}`);
    worksheet.getCell(`A${currentRow}`).value = 'PACKING LIST';
    worksheet.getCell(`A${currentRow}`).font = { name: 'Arial', size: 14, bold: true };
    worksheet.getCell(`A${currentRow}`).alignment = { vertical: 'middle', horizontal: 'center' };
    currentRow += 2;
    
    // Details
    worksheet.getCell(`A${currentRow}`).value = 'Packing List No:';
    worksheet.getCell(`B${currentRow}`).value = packingList.packingListNumber;
    worksheet.getCell(`D${currentRow}`).value = 'Date:';
    worksheet.getCell(`E${currentRow}`).value = new Date(packingList.createdAt);
    worksheet.getCell(`E${currentRow}`).numFmt = 'dd-mmm-yyyy';
    currentRow++;
    
    worksheet.getCell(`A${currentRow}`).value = 'Container No:';
    worksheet.getCell(`B${currentRow}`).value = packingList.containerNumber || '-';
    worksheet.getCell(`D${currentRow}`).value = 'Seal No:';
    worksheet.getCell(`E${currentRow}`).value = packingList.sealNumber || '-';
    currentRow += 2;
    
    // Items with detailed batch information
    const headers = ['S.No', 'Carton No', 'Product', 'Batch', 'Expiry', 'Quantity', 'Packages', 'Gross Wt(kg)', 'Net Wt(kg)'];
    const headerRow = worksheet.getRow(currentRow);
    
    headers.forEach((header, index) => {
      const cell = headerRow.getCell(index + 1);
      cell.value = header;
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E40AF' }
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
    
    currentRow++;
    const itemStartRow = currentRow;
    
    let cartonSerial = 1;
    packingList.items.forEach((item: any, index: number) => {
      const row = worksheet.getRow(currentRow);
      const product = item.product;
      
      const cartonStart = cartonSerial;
      const cartonEnd = cartonSerial + (item.packagesCount || 1) - 1;
      const cartonRange = cartonStart === cartonEnd ? String(cartonStart) : `${cartonStart}-${cartonEnd}`;
      cartonSerial = cartonEnd + 1;
      
      row.getCell(1).value = index + 1;
      row.getCell(2).value = cartonRange;
      row.getCell(3).value = product ? `${product.brandName} ${product.strength}` : 'Product';
      row.getCell(4).value = item.batchNumber;
      row.getCell(5).value = item.expiryDate ? new Date(item.expiryDate) : '-';
      if (item.expiryDate) row.getCell(5).numFmt = 'mmm-yyyy';
      row.getCell(6).value = item.quantity;
      row.getCell(7).value = item.packagesCount || 1;
      row.getCell(8).value = item.grossWeight || 0;
      row.getCell(9).value = item.netWeight || 0;
      
      currentRow++;
    });
    
    // Totals row with formulas
    const totalRow = worksheet.getRow(currentRow);
    totalRow.getCell(5).value = 'TOTAL:';
    totalRow.getCell(5).font = { bold: true };
    totalRow.getCell(7).value = { formula: `SUM(G${itemStartRow}:G${currentRow - 1})` };
    totalRow.getCell(8).value = { formula: `SUM(H${itemStartRow}:H${currentRow - 1})` };
    totalRow.getCell(9).value = { formula: `SUM(I${itemStartRow}:I${currentRow - 1})` };
    
    // Format totals
    for (let i = 7; i <= 9; i++) {
      totalRow.getCell(i).font = { bold: true };
      totalRow.getCell(i).numFmt = '#,##0.00';
    }
    
    // Set column widths
    worksheet.getColumn(1).width = 8;
    worksheet.getColumn(2).width = 12;
    worksheet.getColumn(3).width = 30;
    worksheet.getColumn(4).width = 15;
    worksheet.getColumn(5).width = 12;
    worksheet.getColumn(6).width = 10;
    worksheet.getColumn(7).width = 10;
    worksheet.getColumn(8).width = 12;
    worksheet.getColumn(9).width = 12;
    
    // Save file
    const filename = `packing-list-${packingList.packingListNumber}-${Date.now()}.xlsx`;
    const filepath = path.join(process.env.UPLOAD_DIR || './uploads', 'excel', filename);
    await workbook.xlsx.writeFile(filepath);
    
    return filepath;
  }
  
  async generatePurchaseOrderExcel(purchaseOrder: PurchaseOrder): Promise<string> {
    const workbook = this.createWorkbook();
    const worksheet = workbook.addWorksheet('Purchase Order');
    
    let currentRow = this.addCompanyHeader(worksheet);
    
    // PO title
    worksheet.mergeCells(`A${currentRow}:H${currentRow}`);
    worksheet.getCell(`A${currentRow}`).value = 'PURCHASE ORDER';
    worksheet.getCell(`A${currentRow}`).font = { name: 'Arial', size: 14, bold: true };
    worksheet.getCell(`A${currentRow}`).alignment = { vertical: 'middle', horizontal: 'center' };
    currentRow += 2;
    
    // PO details
    worksheet.getCell(`A${currentRow}`).value = 'PO Number:';
    worksheet.getCell(`B${currentRow}`).value = purchaseOrder.poNumber;
    worksheet.getCell(`D${currentRow}`).value = 'PO Date:';
    worksheet.getCell(`E${currentRow}`).value = new Date(purchaseOrder.orderDate);
    worksheet.getCell(`E${currentRow}`).numFmt = 'dd-mmm-yyyy';
    currentRow += 2;
    
    // Supplier details
    if (purchaseOrder.supplier) {
      worksheet.getCell(`A${currentRow}`).value = 'SUPPLIER:';
      worksheet.getCell(`A${currentRow}`).font = { bold: true, color: { argb: 'FF1E40AF' } };
      currentRow++;
      worksheet.getCell(`A${currentRow}`).value = purchaseOrder.supplier.companyName;
      worksheet.getCell(`A${currentRow}`).font = { bold: true };
      currentRow++;
      worksheet.getCell(`A${currentRow}`).value = `GSTIN: ${(purchaseOrder.supplier as any).gstin || '-'}`;
      currentRow += 2;
    }
    
    // Items table
    const headers = ['S.No', 'Description', 'HSN Code', 'Quantity', 'Unit Price', 'Total'];
    const headerRow = worksheet.getRow(currentRow);
    
    headers.forEach((header, index) => {
      const cell = headerRow.getCell(index + 1);
      cell.value = header;
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E40AF' }
      };
    });
    
    currentRow++;
    const itemStartRow = currentRow;
    
    purchaseOrder.items.forEach((item: any, index: number) => {
      const row = worksheet.getRow(currentRow);
      const product = item.product;
      
      row.getCell(1).value = index + 1;
      row.getCell(2).value = product ? `${product.brandName} - ${product.genericName} ${product.strength}` : item.description;
      row.getCell(3).value = product?.hsnCode || item.hsnCode || '';
      row.getCell(4).value = item.quantity;
      row.getCell(5).value = item.unitPrice;
      row.getCell(6).value = { formula: `D${currentRow}*E${currentRow}` };
      row.getCell(6).numFmt = '#,##0.00';
      
      currentRow++;
    });
    
    // Tax calculations
    currentRow++;
    worksheet.getCell(`D${currentRow}`).value = 'Subtotal:';
    worksheet.getCell(`F${currentRow}`).value = { formula: `SUM(F${itemStartRow}:F${currentRow - 2})` };
    worksheet.getCell(`F${currentRow}`).numFmt = '#,##0.00';
    
    if (purchaseOrder.tax > 0) {
      currentRow++;
      worksheet.getCell(`D${currentRow}`).value = 'Tax:';
      worksheet.getCell(`F${currentRow}`).value = purchaseOrder.tax;
      worksheet.getCell(`F${currentRow}`).numFmt = '#,##0.00';
    }
    
    currentRow++;
    worksheet.getCell(`D${currentRow}`).value = 'Total Amount:';
    worksheet.getCell(`D${currentRow}`).font = { bold: true, size: 12 };
    worksheet.getCell(`F${currentRow}`).value = purchaseOrder.totalAmount;
    worksheet.getCell(`F${currentRow}`).numFmt = '#,##0.00';
    worksheet.getCell(`F${currentRow}`).font = { bold: true, size: 12, color: { argb: 'FF1E40AF' } };
    
    // Save file
    const filename = `purchase-order-${purchaseOrder.poNumber}-${Date.now()}.xlsx`;
    const filepath = path.join(process.env.UPLOAD_DIR || './uploads', 'excel', filename);
    await workbook.xlsx.writeFile(filepath);
    
    return filepath;
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