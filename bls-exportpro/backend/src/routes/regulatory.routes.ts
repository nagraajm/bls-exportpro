import { Router } from 'express';
import * as regulatoryController from '../controllers/regulatory.controller';

const router = Router();

router.post('/', regulatoryController.createDocument);
router.get('/status', regulatoryController.getComplianceStatus);
router.get('/', regulatoryController.listDocuments);
router.get('/:id', regulatoryController.getDocument);
router.patch('/:id/status', regulatoryController.updateDocumentStatus);

export default router;