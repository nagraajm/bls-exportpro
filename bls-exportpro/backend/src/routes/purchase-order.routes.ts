import { Router } from 'express';
import * as purchaseOrderController from '../controllers/purchase-order.controller';

const router = Router();

router.post('/create', purchaseOrderController.createPurchaseOrder);
router.get('/', purchaseOrderController.listPurchaseOrders);
router.get('/:id', purchaseOrderController.getPurchaseOrder);
router.patch('/:id/status', purchaseOrderController.updatePurchaseOrderStatus);

export default router;