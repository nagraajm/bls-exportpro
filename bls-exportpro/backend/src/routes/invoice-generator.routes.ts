import { Router } from 'express';
import { InvoiceGeneratorController } from '../controllers/invoice-generator.controller';

const router = Router();
const controller = new InvoiceGeneratorController();

// Get all orders for invoice generation
router.get('/orders', controller.listOrders.bind(controller));
router.get('/invoices', controller.listInvoices.bind(controller));
router.get('/packing-lists', controller.listPackingLists.bind(controller));

// Get specific order details
router.get('/orders/:orderId', controller.getOrderDetails.bind(controller));

// Generate invoice for an order
router.post('/orders/:orderId/generate', controller.generateInvoice.bind(controller));

// Download generated invoice
router.get('/download/:invoiceId', controller.downloadInvoice.bind(controller));

export default router;