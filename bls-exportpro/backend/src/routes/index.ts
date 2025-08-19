import { Router } from 'express';
import productRoutes from './products';
import customerRoutes from './customers';
import orderRoutes from './order.routes';
import excelRoutes from './excel.routes';
import misReportsRoutes from './mis-reports.routes';
import invoiceGeneratorRoutes from './invoice-generator.routes';
import invoiceRoutes from './invoice.routes';
import packingListRoutes from './packing-list.routes';
import orderCreationRoutes from './order-creation.routes';
import dashboardRoutes from './dashboard.routes';

const router = Router();

router.use('/products', productRoutes);
router.use('/customers', customerRoutes);
router.use('/orders', orderRoutes);
router.use('/excel', excelRoutes);
router.use('/mis-reports', misReportsRoutes);
router.use('/invoice-generator', invoiceGeneratorRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/packing-lists', packingListRoutes);
router.use('/order-creation', orderCreationRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
