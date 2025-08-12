import { Router } from 'express';
import productRoutes from './products';
import customerRoutes from './customers';
import excelRoutes from './excel.routes';
import misReportsRoutes from './mis-reports.routes';
import invoiceGeneratorRoutes from './invoice-generator.routes';

const router = Router();

router.use('/products', productRoutes);
router.use('/customers', customerRoutes);
router.use('/excel', excelRoutes);
router.use('/mis-reports', misReportsRoutes);
router.use('/invoices', invoiceGeneratorRoutes);

export default router;