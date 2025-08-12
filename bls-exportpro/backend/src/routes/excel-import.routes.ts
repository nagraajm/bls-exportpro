import { Router } from 'express';
import { ExcelImportController } from '../controllers/excel-import.controller';

const router = Router();
const controller = new ExcelImportController();

// Import sample orders from Excel-like data
router.post('/sample-orders', controller.importSampleOrders.bind(controller));

export default router;