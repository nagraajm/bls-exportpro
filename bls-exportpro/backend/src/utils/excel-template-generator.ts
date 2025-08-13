import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

export const generateInvoiceImportTemplate = (): Buffer => {
  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet([
    // Header row with column names
    [
      'Invoice Number',
      'Invoice Type',
      'Customer Name',
      'Customer Country',
      'Invoice Date',
      'Due Date',
      'Total Amount',
      'Currency',
      'Status',
      'Product Name',
      'Quantity',
      'Unit Price',
      'Total Price'
    ],
    // Sample data row
    [
      'INV/2024/001',
      'proforma',
      'ABC Trading Co.',
      'USA',
      '2024-12-15',
      '2024-12-30',
      12500,
      'USD',
      'pending',
      'Sample Product',
      10,
      100,
      1000
    ],
    // Another sample row
    [
      'INV/2024/002',
      'pre-shipment',
      'XYZ Import Ltd.',
      'UK',
      '2024-12-16',
      '2024-12-31',
      8500,
      'USD',
      'pending',
      'Another Product',
      5,
      200,
      1000
    ]
  ]);

  // Set column widths
  const columnWidths = [
    { wch: 15 }, // Invoice Number
    { wch: 12 }, // Invoice Type
    { wch: 20 }, // Customer Name
    { wch: 15 }, // Customer Country
    { wch: 12 }, // Invoice Date
    { wch: 12 }, // Due Date
    { wch: 12 }, // Total Amount
    { wch: 8 },  // Currency
    { wch: 10 }, // Status
    { wch: 20 }, // Product Name
    { wch: 10 }, // Quantity
    { wch: 12 }, // Unit Price
    { wch: 12 }  // Total Price
  ];
  worksheet['!cols'] = columnWidths;

  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Invoices');

  // Create a second sheet with instructions
  const instructionsSheet = XLSX.utils.aoa_to_sheet([
    ['Invoice Import Template - Instructions'],
    [''],
    ['Required Fields:'],
    ['- Invoice Number: Unique identifier for the invoice (e.g., INV/2024/001)'],
    ['- Invoice Type: Must be one of: proforma, pre-shipment, post-shipment'],
    ['- Customer Name: Name of the customer'],
    ['- Customer Country: Country of the customer'],
    ['- Invoice Date: Date of the invoice (YYYY-MM-DD format)'],
    ['- Total Amount: Total amount of the invoice (numeric)'],
    ['- Currency: Must be USD or INR'],
    [''],
    ['Optional Fields:'],
    ['- Due Date: Due date for payment (YYYY-MM-DD format)'],
    ['- Status: Invoice status (draft, pending, paid, overdue, cancelled) - defaults to pending'],
    ['- Product Name: Name of the product (for item details)'],
    ['- Quantity: Quantity of the product (numeric)'],
    ['- Unit Price: Unit price of the product (numeric)'],
    ['- Total Price: Total price for this item (numeric)'],
    [''],
    ['Notes:'],
    ['- Dates should be in YYYY-MM-DD format'],
    ['- Amounts should be numeric values'],
    ['- Invoice numbers must be unique'],
    ['- If product details are provided, they will be included in the invoice'],
    ['- Duplicate invoice numbers will be skipped during import']
  ]);

  // Set column width for instructions
  instructionsSheet['!cols'] = [{ wch: 80 }];
  XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions');

  // Generate the Excel file as buffer
  const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  
  return excelBuffer;
};

export const saveInvoiceImportTemplate = (filePath: string): void => {
  const buffer = generateInvoiceImportTemplate();
  fs.writeFileSync(filePath, buffer);
};

