import { Request, Response } from 'express';
import { InvoiceGeneratorService } from '../services/invoice-generator.service';
import { getDatabase } from '../config/sqlite.config';

export class InvoiceGeneratorController {
  private invoiceService = new InvoiceGeneratorService();

  async generateInvoice(req: Request, res: Response) {
    try {
      const { orderId } = req.params;
      const { type = 'PROFORMA INVOICE' } = req.body;

      if (!orderId) {
        return res.status(400).json({
          success: false,
          message: 'Order ID is required'
        });
      }

      const result = await this.invoiceService.generateInvoice(
        orderId, 
        type as 'PROFORMA INVOICE' | 'INVOICE'
      );

      res.json({
        success: true,
        message: 'Invoice generated successfully',
        data: {
          invoiceId: result.invoiceId,
          filePath: result.filePath,
          downloadUrl: `/api/invoice-generator/download/${result.invoiceId}`
        }
      });

    } catch (error) {
      console.error('Invoice generation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate invoice',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async listInvoices(req: Request, res: Response) {
    try {
      const db = await getDatabase();
      const invoices = await db.all(`
        SELECT i.*, o.order_number, o.customer_id, c.company_name AS customer_name, c.country AS customer_country
        FROM invoices i
        LEFT JOIN orders o ON i.order_id = o.id
        LEFT JOIN customers c ON o.customer_id = c.id
        ORDER BY i.created_at DESC
      `);

      res.json({ success: true, data: invoices });
    } catch (error) {
      console.error('List invoices error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch invoices' });
    }
  }

  async listPackingLists(req: Request, res: Response) {
    try {
      const db = await getDatabase();
      const lists = await db.all(`
        SELECT pl.*, i.invoice_number, o.order_number, c.company_name AS customer_name, c.country AS customer_country
        FROM packing_lists pl
        LEFT JOIN invoices i ON pl.invoice_id = i.id
        LEFT JOIN orders o ON i.order_id = o.id
        LEFT JOIN customers c ON o.customer_id = c.id
        ORDER BY pl.created_at DESC
      `);

      res.json({ success: true, data: lists });
    } catch (error) {
      console.error('List packing lists error:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch packing lists' });
    }
  }
  async downloadInvoice(req: Request, res: Response) {
    try {
      const { invoiceId } = req.params;
      const db = await getDatabase();

      const invoice = await db.get(
        'SELECT * FROM invoices WHERE id = ?',
        [invoiceId]
      );

      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: 'Invoice not found'
        });
      }

      // For now, we'll regenerate the PDF since we don't store file paths
      // In production, you might want to store the file path in the database
      const result = await this.invoiceService.generateInvoice(
        invoice.order_id,
        invoice.invoice_type === 'proforma' ? 'PROFORMA INVOICE' : 'INVOICE'
      );

      res.download(result.filePath, `invoice_${invoice.invoice_number.replace(/[\/\\]/g, '_')}.pdf`);

    } catch (error) {
      console.error('Invoice download error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to download invoice',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async listOrders(req: Request, res: Response) {
    try {
      const db = await getDatabase();

      const orders = await db.all(`
        SELECT 
          o.*,
          c.company_name as customer_name,
          c.city as customer_city,
          c.country as customer_country,
          COUNT(oi.id) as items_count
        FROM orders o
        LEFT JOIN customers c ON o.customer_id = c.id
        LEFT JOIN order_items oi ON o.id = oi.order_id
        GROUP BY o.id
        ORDER BY o.created_at DESC
      `);

      res.json({
        success: true,
        data: orders
      });

    } catch (error) {
      console.error('List orders error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch orders',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getOrderDetails(req: Request, res: Response) {
    try {
      const { orderId } = req.params;
      const db = await getDatabase();

      const order = await db.get(`
        SELECT 
          o.*,
          c.company_name, c.contact_person, c.address, c.city, c.country, c.phone, c.email
        FROM orders o
        LEFT JOIN customers c ON o.customer_id = c.id
        WHERE o.id = ?
      `, [orderId]);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      const items = await db.all(`
        SELECT 
          oi.*,
          p.brand_name, p.generic_name, p.strength, p.unit_pack, p.hs_code
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
        ORDER BY p.brand_name
      `, [orderId]);

      res.json({
        success: true,
        data: {
          order,
          items,
          customer: {
            company_name: order.company_name,
            contact_person: order.contact_person,
            address: order.address,
            city: order.city,
            country: order.country,
            phone: order.phone,
            email: order.email
          }
        }
      });

    } catch (error) {
      console.error('Get order details error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch order details',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}