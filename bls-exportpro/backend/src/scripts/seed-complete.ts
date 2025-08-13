import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(__dirname, '../../data');

// Sample Products
const products = [
  {
    id: "PRD001",
    name: "Paracetamol 500mg",
    genericName: "Paracetamol",
    brandName: "DOLO 500",
    strength: "500mg",
    packSize: "10x10 Tablets",
    manufacturer: "BLS Pharma",
    price: 50.00,
    currency: "INR",
    category: "Analgesics",
    registrationStatus: "Approved",
    registrationNumber: "REG123456",
    expiryDate: "2026-12-31"
  },
  {
    id: "PRD002",
    name: "Amoxicillin 250mg",
    genericName: "Amoxicillin",
    brandName: "AMOX 250",
    strength: "250mg",
    packSize: "10x10 Capsules",
    manufacturer: "BLS Pharma",
    price: 75.00,
    currency: "INR",
    category: "Antibiotics",
    registrationStatus: "Approved",
    registrationNumber: "REG789012",
    expiryDate: "2026-06-30"
  }
];

// Sample Customers
const customers = [
  {
    id: "CUS001",
    name: "Cambodia Pharma Ltd",
    country: "Cambodia",
    address: "123 Pharma Street, Phnom Penh",
    contactPerson: "John Doe",
    email: "john@cambodiapharma.com",
    phone: "+855 123456789"
  },
  {
    id: "CUS002",
    name: "Myanmar Medical Supplies",
    country: "Myanmar",
    address: "456 Medical Road, Yangon",
    contactPerson: "Jane Smith",
    email: "jane@myanmarmedical.com",
    phone: "+95 987654321"
  }
];

// Sample Orders
const orders = [
  {
    id: "ORD001",
    orderNumber: "ORD/2025/001",
    customerId: "CUS001",
    customerName: "Cambodia Pharma Ltd",
    orderDate: "2025-08-13",
    deliveryDate: "2025-09-13",
    status: "confirmed",
    items: [
      {
        productId: "PRD001",
        productName: "Paracetamol 500mg",
        quantity: 1000,
        unitPrice: 50.00,
        totalPrice: 50000.00
      }
    ],
    totalAmount: 50000.00,
    currency: "INR"
  },
  {
    id: "ORD002",
    orderNumber: "ORD/2025/002",
    customerId: "CUS002",
    customerName: "Myanmar Medical Supplies",
    orderDate: "2025-08-13",
    deliveryDate: "2025-09-20",
    status: "processing",
    items: [
      {
        productId: "PRD002",
        productName: "Amoxicillin 250mg",
        quantity: 500,
        unitPrice: 75.00,
        totalPrice: 37500.00
      }
    ],
    totalAmount: 37500.00,
    currency: "INR"
  }
];

// Sample Invoices
const invoices = [
  {
    id: "INV001",
    invoiceNumber: "INV/2025/001",
    orderId: "ORD001",
    orderNumber: "ORD/2025/001",
    customerId: "CUS001",
    customerName: "Cambodia Pharma Ltd",
    invoiceDate: "2025-08-13",
    dueDate: "2025-09-13",
    status: "paid",
    items: [
      {
        productId: "PRD001",
        productName: "Paracetamol 500mg",
        quantity: 1000,
        unitPrice: 50.00,
        totalPrice: 50000.00
      }
    ],
    totalAmount: 50000.00,
    currency: "INR"
  }
];

// Sample Packing Lists
const packingLists = [
  {
    id: "PCK001",
    packingListNumber: "PL/2025/001",
    orderId: "ORD001",
    orderNumber: "ORD/2025/001",
    invoiceId: "INV001",
    invoiceNumber: "INV/2025/001",
    customerName: "Cambodia Pharma Ltd",
    customerCountry: "Cambodia",
    shippingDate: "2025-08-20",
    manufacturingSite: "BLS Pharma - Unit 1",
    status: "prepared",
    items: [
      {
        productId: "PRD001",
        productName: "Paracetamol 500mg",
        brandName: "DOLO 500",
        genericName: "Paracetamol",
        strength: "500mg",
        packSize: "10x10 Tablets",
        batches: [
          {
            batchNumber: "BAT001",
            manufacturingDate: "2025-01-01",
            expiryDate: "2026-12-31",
            quantity: 1000
          }
        ],
        totalQuantity: 1000,
        shipperQuantity: 10,
        grossWeight: 25,
        netWeight: 22
      }
    ],
    totalShippers: 10,
    totalGrossWeight: 25,
    totalNetWeight: 22
  }
];

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Write all data files
const dataFiles = {
  'products.json': products,
  'customers.json': customers,
  'orders.json': orders,
  'invoices.json': invoices,
  'packing-lists.json': packingLists
};

Object.entries(dataFiles).forEach(([filename, data]) => {
  fs.writeFileSync(
    path.join(DATA_DIR, filename),
    JSON.stringify(data, null, 2)
  );
  console.log(`✅ ${filename} seeded successfully!`);
});

console.log('✅ All data seeded successfully!')
