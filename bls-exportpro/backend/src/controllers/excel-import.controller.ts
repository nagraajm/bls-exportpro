import { Request, Response } from 'express';
import { getDatabase } from '../config/sqlite.config';
import { v4 as uuidv4 } from 'uuid';

export class ExcelImportController {

  async importSampleOrders(req: Request, res: Response) {
    try {
      const db = await getDatabase();

      // Sample Excel-like data for multiple orders
      const sampleOrdersData = [
        {
          customerName: 'GOLDEN BRIGHT FUTURE CO., LTD.',
          orderNumber: 'ORD-2025-004',
          orderDate: '2025-02-01',
          estimatedShipmentDate: '2025-03-01',
          items: [
            { productName: 'DOLO 650', quantity: 5000 },
            { productName: 'MEPRELON-4', quantity: 8000 }
          ]
        },
        {
          customerName: 'EVERFLOW INT\'L TRADE PTE LTD',
          orderNumber: 'ORD-2025-005',
          orderDate: '2025-02-05',
          estimatedShipmentDate: '2025-03-05',
          items: [
            { productName: 'PENTOZOLE', quantity: 3000 },
            { productName: 'OMELOC-40', quantity: 4500 },
            { productName: 'ANTACID TABLETS', quantity: 1200 }
          ]
        },
        {
          customerName: 'GOLDEN BRIGHT FUTURE CO., LTD.',
          orderNumber: 'ORD-2025-006',
          orderDate: '2025-02-10',
          estimatedShipmentDate: '2025-03-10',
          items: [
            { productName: 'MEPRELON-8', quantity: 12000 },
            { productName: 'DOLO 650', quantity: 8000 }
          ]
        }
      ];

      let createdOrders = 0;
      let totalItems = 0;

      for (const orderData of sampleOrdersData) {
        // Find customer
        const customer = await db.get(
          'SELECT id FROM customers WHERE company_name = ?',
          [orderData.customerName]
        );

        if (!customer) {
          console.log(`Customer not found: ${orderData.customerName}`);
          continue;
        }

        // Check if order already exists
        const existingOrder = await db.get(
          'SELECT id FROM orders WHERE order_number = ?',
          [orderData.orderNumber]
        );

        if (existingOrder) {
          console.log(`Order already exists: ${orderData.orderNumber}`);
          continue;
        }

        const orderId = uuidv4();
        let orderTotal = 0;
        const orderItems = [];

        // Process items
        for (const itemData of orderData.items) {
          const product = await db.get(
            'SELECT * FROM products WHERE brand_name = ?',
            [itemData.productName]
          );

          if (!product) {
            console.log(`Product not found: ${itemData.productName}`);
            continue;
          }

          const amount = product.rate_usd * itemData.quantity;
          orderTotal += amount;

          orderItems.push({
            id: uuidv4(),
            orderId,
            productId: product.id,
            quantity: itemData.quantity,
            rate: product.rate_usd,
            amount,
            batchNumber: `${product.batch_prefix}${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`,
            mfgDate: '2025-01-01',
            expDate: '2027-12-31'
          });
        }

        if (orderItems.length === 0) {
          console.log(`No valid items for order: ${orderData.orderNumber}`);
          continue;
        }

        // Insert order
        await db.run(`
          INSERT INTO orders (id, customer_id, order_number, order_date, estimated_shipment_date, status, total_amount, currency)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          orderId,
          customer.id,
          orderData.orderNumber,
          orderData.orderDate,
          orderData.estimatedShipmentDate,
          'pending',
          orderTotal,
          'INR'
        ]);

        // Insert order items
        for (const item of orderItems) {
          await db.run(`
            INSERT INTO order_items (id, order_id, product_id, quantity, rate_usd, amount, batch_number, mfg_date, exp_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            item.id,
            item.orderId,
            item.productId,
            item.quantity,
            item.rate,
            item.amount,
            item.batchNumber,
            item.mfgDate,
            item.expDate
          ]);
        }

        createdOrders++;
        totalItems += orderItems.length;
      }

      res.json({
        success: true,
        message: `Successfully imported ${createdOrders} orders with ${totalItems} total items`,
        data: {
          ordersCreated: createdOrders,
          totalItems
        }
      });

    } catch (error) {
      console.error('Excel import error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to import orders from Excel data',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}