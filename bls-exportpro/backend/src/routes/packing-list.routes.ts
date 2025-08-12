import { Router } from 'express';
import * as packingListController from '../controllers/packing-list.controller';

const router = Router();

router.post('/generate', packingListController.generatePackingList);
router.get('/', packingListController.listPackingLists);
router.get('/:id', packingListController.getPackingList);

export default router;