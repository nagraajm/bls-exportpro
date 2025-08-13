import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(__dirname, '../../data');

// Sample packing list data
const packingLists = [
  {
    id: '1',
    packingListNumber: 'PL/2025/001',
    orderId: 'cb1c5e16-910a-4b47-89a8-854357176d09',
    orderNumber: 'ORD-2025-00001',
    invoiceId: 'e9f0bdc5-ed41-4f11-9643-6a8516e6b72e',
    invoiceNumber: 'PI-2025-00001',
    customerName: 'Cambodia Pharma Ltd',
    customerCountry: 'Cambodia',
    shippingDate: '2025-09-07',
    manufacturingSite: 'Site A - India',
    status: 'confirmed',
    items: [
      {
        productId: 'a97721f6-ecb7-4f2b-8d22-af280f46838c',
        productName: 'Paracetamol 500mg',
        brandName: 'DOLO 650',
        genericName: 'Paracetamol',
        strength: '500mg',
        packSize: '10x10 Tablets',
        batches: [
          {
            batchNumber: 'PAR2024001',
            manufacturingDate: '2024-01-15',
            expiryDate: '2026-12-31',
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

// Write packing lists data
fs.writeFileSync(
  path.join(DATA_DIR, 'packing-lists.json'),
  JSON.stringify(packingLists, null, 2)
);

console.log('✅ Data seeded successfully!');
