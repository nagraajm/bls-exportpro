import { Request, Response } from 'express';
import { getDatabase } from '../config/sqlite.config';
import { v4 as uuidv4 } from 'uuid';

export class OrderCreationController {

  async getProducts(req: Request, res: Response) {
    try {
      const db = await getDatabase();
      const products = await db.all('SELECT * FROM products ORDER BY brand_name');
      
      res.json({
        success: true,
        data: products
      });
    } catch (error) {
      console.error('Get products error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch products',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getCustomers(req: Request, res: Response) {
    try {
      const db = await getDatabase();
      const customers = await db.all('SELECT * FROM customers ORDER BY company_name');
      
      res.json({
        success: true,
        data: customers
      });
    } catch (error) {
      console.error('Get customers error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch customers',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async createOrder(req: Request, res: Response) {
    try {
      const { customerId, orderNumber, orderDate, estimatedShipmentDate, items } = req.body;

      if (!customerId || !orderNumber || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: customerId, orderNumber, and items'
        });
      }

      const db = await getDatabase();
      const orderId = uuidv4();

      // Calculate total amount
      let totalAmount = 0;
      const orderItems = [];

      for (const item of items) {
        if (!item.productId || !item.quantity || item.quantity <= 0) {
          return res.status(400).json({
            success: false,
            message: 'Each item must have productId and positive quantity'
          });
        }

        // Get product details
        const product = await db.get('SELECT * FROM products WHERE id = ?', [item.productId]);
        if (!product) {
          return res.status(404).json({
            success: false,
            message: `Product with ID ${item.productId} not found`
          });
        }

        const amount = product.rate_usd * item.quantity;
        totalAmount += amount;

        orderItems.push({
          id: uuidv4(),
          orderId,
          productId: item.productId,
          quantity: item.quantity,
          rate: product.rate_usd,
          amount,
          batchNumber: item.batchNumber || `${product.batch_prefix}${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`,
          mfgDate: item.mfgDate || '2025-01-01',
          expDate: item.expDate || '2027-12-31'
        });
      }

      // Insert order
      await db.run(`
        INSERT INTO orders (id, customer_id, order_number, order_date, estimated_shipment_date, status, total_amount, currency)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        orderId,
        customerId,
        orderNumber,
        orderDate || new Date().toISOString().split('T')[0],
        estimatedShipmentDate,
        'pending',
        totalAmount,
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

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: {
          orderId,
          orderNumber,
          totalAmount,
          itemsCount: orderItems.length
        }
      });

    } catch (error) {
      console.error('Create order error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create order',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}