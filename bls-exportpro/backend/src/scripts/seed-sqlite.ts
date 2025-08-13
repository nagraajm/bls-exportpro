import { initDatabase } from '../config/sqlite.config';
import { v4 as uuidv4 } from 'uuid';

async function seedDatabase() {
  const db = await initDatabase();

  // Clear existing data
  await db.exec('DELETE FROM packing_list_items');
  await db.exec('DELETE FROM packing_lists');
  await db.exec('DELETE FROM invoices');
  await db.exec('DELETE FROM order_items');
  await db.exec('DELETE FROM orders');
  await db.exec('DELETE FROM products');
  await db.exec('DELETE FROM customers');

  console.log('Cleared existing data...');

  // Seed products based on sample invoices (INR prices)
  const products = [
    {
      id: uuidv4(),
      brand_name: 'DOLO 650',
      generic_name: 'Paracetamol Tablets BP 500mg',
      strength: '650mg',
      unit_pack: '50x10',
      pack_size: 500,
      rate_usd: 140.00,
      hs_code: '30043919',
      batch_prefix: 'E'
    },
    {
      id: uuidv4(),
      brand_name: 'PENTOZOLE',
      generic_name: 'Pantoprazole for Injection BP 40 mg',
      strength: '40mg',
      unit_pack: '1 Vial+WFI+Carton+PI',
      pack_size: 1,
      rate_usd: 12.00,
      hs_code: '30043919',
      batch_prefix: 'D'
    },
    {
      id: uuidv4(),
      brand_name: 'OMELOC-40',
      generic_name: 'Omeprazole for injection 40 mg',
      strength: '40mg',
      unit_pack: '1 Vial+WFI+Carton+PI',
      pack_size: 1,
      rate_usd: 13.50,
      hs_code: '30043919',
      batch_prefix: 'D'
    },
    {
      id: uuidv4(),
      brand_name: 'MEPRELON-4',
      generic_name: 'Methylprednisolone Tablets BP 4mg',
      strength: '4mg',
      unit_pack: '10x10',
      pack_size: 100,
      rate_usd: 55.00,
      hs_code: '30043919',
      batch_prefix: 'MEP'
    },
    {
      id: uuidv4(),
      brand_name: 'MEPRELON-8',
      generic_name: 'Methylprednisolone Tablets BP 8mg',
      strength: '8mg',
      unit_pack: '10x10',
      pack_size: 100,
      rate_usd: 75.00,
      hs_code: '30043919',
      batch_prefix: 'MEP'
    },
    {
      id: uuidv4(),
      brand_name: 'ANTACID TABLETS',
      generic_name: 'Antacid Tablets (Acid Free)',
      strength: 'Standard',
      unit_pack: '90x9',
      pack_size: 810,
      rate_usd: 295.00,
      hs_code: '30043919',
      batch_prefix: 'S'
    }
  ];

  for (const product of products) {
    await db.run(
      `INSERT INTO products (id, brand_name, generic_name, strength, unit_pack, pack_size, rate_usd, hs_code, batch_prefix)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [product.id, product.brand_name, product.generic_name, product.strength, product.unit_pack, product.pack_size, product.rate_usd, product.hs_code, product.batch_prefix]
    );
  }

  console.log(`Seeded ${products.length} products...`);

  // Seed customers
  const customers = [
    {
      id: uuidv4(),
      company_name: 'GOLDEN BRIGHT FUTURE CO., LTD.',
      contact_person: 'Manager',
      address: 'BLDG NO.37, ROOM NO.,03 SABAI STREET, BACK OF YUZANA PLAZA,BOLEING AUNGMINGALAR QUARTER, TARMWE T/S',
      city: 'YANGON',
      country: 'MYANMAR',
      phone: '',
      email: ''
    },
    {
      id: uuidv4(),
      company_name: 'EVERFLOW INT\'L TRADE PTE LTD',
      contact_person: 'Trading Manager',
      address: '703, PASIR RIS DRIVE 10 09-131',
      city: 'SINGAPORE',
      country: 'SINGAPORE',
      phone: '',
      email: ''
    }
  ];

  for (const customer of customers) {
    await db.run(
      `INSERT INTO customers (id, company_name, contact_person, address, city, country, phone, email)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [customer.id, customer.company_name, customer.contact_person, customer.address, customer.city, customer.country, customer.phone, customer.email]
    );
  }

  console.log(`Seeded ${customers.length} customers...`);

  // Seed multiple sample orders
  const orders = [
    {
      id: uuidv4(),
      customerId: customers[0].id,
      orderNumber: 'ORD-2025-001',
      orderDate: '2025-01-15',
      estimatedShipmentDate: '2025-02-15',
      status: 'confirmed',
      totalAmount: 38034.65,
      currency: 'INR'
    },
    {
      id: uuidv4(),
      customerId: customers[1].id,
      orderNumber: 'ORD-2025-002',
      orderDate: '2025-01-20',
      estimatedShipmentDate: '2025-02-20',
      status: 'pending',
      totalAmount: 125000.00,
      currency: 'INR'
    },
    {
      id: uuidv4(),
      customerId: customers[0].id,
      orderNumber: 'ORD-2025-003',
      orderDate: '2025-01-25',
      estimatedShipmentDate: '2025-02-25',
      status: 'processing',
      totalAmount: 85000.50,
      currency: 'INR'
    }
  ];

  for (const order of orders) {
    await db.run(
      `INSERT INTO orders (id, customer_id, order_number, order_date, estimated_shipment_date, status, total_amount, currency)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [order.id, order.customerId, order.orderNumber, order.orderDate, order.estimatedShipmentDate, order.status, order.totalAmount, order.currency]
    );
  }

  // Seed order items for each order
  const allOrderItems = [
    // Order 1 items
    {
      orderId: orders[0].id,
      items: [
        { product_index: 0, quantity: 9854, rate_inr: 140.00, amount: 1379560.00 },
        { product_index: 1, quantity: 1860, rate_inr: 12.00, amount: 22320.00 },
        { product_index: 2, quantity: 1480, rate_inr: 13.50, amount: 19980.00 },
        { product_index: 3, quantity: 16000, rate_inr: 55.00, amount: 880000.00 },
        { product_index: 4, quantity: 6500, rate_inr: 75.00, amount: 487500.00 },
        { product_index: 5, quantity: 1235, rate_inr: 295.00, amount: 364325.00 }
      ]
    },
    // Order 2 items
    {
      orderId: orders[1].id,
      items: [
        { product_index: 0, quantity: 15000, rate_inr: 140.00, amount: 2100000.00 },
        { product_index: 3, quantity: 25000, rate_inr: 55.00, amount: 1375000.00 },
        { product_index: 4, quantity: 10000, rate_inr: 75.00, amount: 750000.00 }
      ]
    },
    // Order 3 items
    {
      orderId: orders[2].id,
      items: [
        { product_index: 1, quantity: 5000, rate_inr: 12.00, amount: 60000.00 },
        { product_index: 2, quantity: 8000, rate_inr: 13.50, amount: 108000.00 },
        { product_index: 5, quantity: 2500, rate_inr: 295.00, amount: 737500.00 }
      ]
    }
  ];

  for (const orderGroup of allOrderItems) {
    for (const item of orderGroup.items) {
      await db.run(
        `INSERT INTO order_items (id, order_id, product_id, quantity, rate_usd, amount, batch_number, mfg_date, exp_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          uuidv4(),
          orderGroup.orderId,
          products[item.product_index].id,
          item.quantity,
          item.rate_inr,
          item.amount,
          `${products[item.product_index].batch_prefix}${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`,
          '2025-01-01',
          '2027-12-31'
        ]
      );
    }
  }

  console.log('Seeded sample order with items...');

  // Seed invoices for orders
  const invoices = [
    {
      id: uuidv4(),
      invoiceNumber: 'INV-2025-001',
      orderId: orders[0].id,
      invoiceType: 'proforma',
      invoiceDate: '2025-01-16',
      dueDate: '2025-02-16',
      subtotal: 38034.65,
      igst: 0,
      drawback: 0,
      rodtep: 0,
      totalAmount: 38034.65,
      currency: 'INR',
      status: 'pending'
    },
    {
      id: uuidv4(),
      invoiceNumber: 'INV-2025-002',
      orderId: orders[1].id,
      invoiceType: 'proforma',
      invoiceDate: '2025-01-21',
      dueDate: '2025-02-21',
      subtotal: 125000.00,
      igst: 0,
      drawback: 0,
      rodtep: 0,
      totalAmount: 125000.00,
      currency: 'INR',
      status: 'pending'
    },
    {
      id: uuidv4(),
      invoiceNumber: 'INV-2025-003',
      orderId: orders[2].id,
      invoiceType: 'proforma',
      invoiceDate: '2025-01-26',
      dueDate: '2025-02-26',
      subtotal: 85000.50,
      igst: 0,
      drawback: 0,
      rodtep: 0,
      totalAmount: 85000.50,
      currency: 'INR',
      status: 'pending'
    }
  ];

  for (const invoice of invoices) {
    await db.run(
      `INSERT INTO invoices (id, invoice_number, order_id, invoice_type, invoice_date, due_date, subtotal, igst, drawback, rodtep, total_amount, currency, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [invoice.id, invoice.invoiceNumber, invoice.orderId, invoice.invoiceType, invoice.invoiceDate, invoice.dueDate, invoice.subtotal, invoice.igst, invoice.drawback, invoice.rodtep, invoice.totalAmount, invoice.currency, invoice.status]
    );
  }

  console.log(`Seeded ${invoices.length} invoices...`);

  // Seed packing lists
  const packingLists = [
    {
      id: uuidv4(),
      packingListNumber: 'PL-2025-001',
      orderId: orders[0].id,
      invoiceId: invoices[0].id,
      shippingDate: '2025-02-15',
      manufacturingSite: 'Site A - India',
      status: 'confirmed',
      totalShippers: 15,
      totalGrossWeight: 1250.5,
      totalNetWeight: 1200.0
    },
    {
      id: uuidv4(),
      packingListNumber: 'PL-2025-002',
      orderId: orders[1].id,
      invoiceId: invoices[1].id,
      shippingDate: '2025-02-20',
      manufacturingSite: 'Site A - India',
      status: 'pending',
      totalShippers: 8,
      totalGrossWeight: 850.0,
      totalNetWeight: 800.0
    },
    {
      id: uuidv4(),
      packingListNumber: 'PL-2025-003',
      orderId: orders[2].id,
      invoiceId: invoices[2].id,
      shippingDate: '2025-02-25',
      manufacturingSite: 'Site A - India',
      status: 'processing',
      totalShippers: 12,
      totalGrossWeight: 950.0,
      totalNetWeight: 900.0
    }
  ];

  for (const packingList of packingLists) {
    await db.run(
      `INSERT INTO packing_lists (id, packing_list_number, order_id, invoice_id, shipping_date, manufacturing_site, status, total_shippers, total_gross_weight, total_net_weight, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [packingList.id, packingList.packingListNumber, packingList.orderId, packingList.invoiceId, packingList.shippingDate, packingList.manufacturingSite, packingList.status, packingList.totalShippers, packingList.totalGrossWeight, packingList.totalNetWeight]
    );
  }

  console.log(`Seeded ${packingLists.length} packing lists...`);

  // Seed packing list items
  const packingListItems = [
    // Packing List 1 items
    {
      packingListId: packingLists[0].id,
      items: [
        { product_index: 0, quantity: 9854, shipperQuantity: 5, grossWeight: 450.0, netWeight: 430.0 },
        { product_index: 1, quantity: 1860, shipperQuantity: 3, grossWeight: 200.0, netWeight: 190.0 },
        { product_index: 2, quantity: 1480, shipperQuantity: 2, grossWeight: 180.0, netWeight: 175.0 },
        { product_index: 3, quantity: 16000, shipperQuantity: 3, grossWeight: 320.0, netWeight: 310.0 },
        { product_index: 4, quantity: 6500, shipperQuantity: 1, grossWeight: 80.0, netWeight: 75.0 },
        { product_index: 5, quantity: 1235, shipperQuantity: 1, grossWeight: 20.5, netWeight: 20.0 }
      ]
    },
    // Packing List 2 items
    {
      packingListId: packingLists[1].id,
      items: [
        { product_index: 0, quantity: 15000, shipperQuantity: 4, grossWeight: 680.0, netWeight: 650.0 },
        { product_index: 3, quantity: 25000, shipperQuantity: 3, grossWeight: 120.0, netWeight: 115.0 },
        { product_index: 4, quantity: 10000, shipperQuantity: 1, grossWeight: 50.0, netWeight: 35.0 }
      ]
    },
    // Packing List 3 items
    {
      packingListId: packingLists[2].id,
      items: [
        { product_index: 1, quantity: 5000, shipperQuantity: 2, grossWeight: 540.0, netWeight: 520.0 },
        { product_index: 2, quantity: 8000, shipperQuantity: 2, grossWeight: 280.0, netWeight: 270.0 },
        { product_index: 5, quantity: 2500, shipperQuantity: 8, grossWeight: 130.0, netWeight: 110.0 }
      ]
    }
  ];

  for (const packingListGroup of packingListItems) {
    for (const item of packingListGroup.items) {
      await db.run(
        `INSERT INTO packing_list_items (id, packing_list_id, product_id, quantity, shipper_quantity, gross_weight, net_weight, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        [
          uuidv4(),
          packingListGroup.packingListId,
          products[item.product_index].id,
          item.quantity,
          item.shipperQuantity,
          item.grossWeight,
          item.netWeight
        ]
      );
    }
  }

  console.log('Seeded packing list items...');

  console.log('Database seeding completed successfully!');
  process.exit(0);
}

seedDatabase().catch(console.error);