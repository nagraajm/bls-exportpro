import { Router } from 'express';
import {
  getPorts,
  getShippingMethods,
  getIncoterms,
  getExchangeRates,
  getPaymentTerms
} from '../controllers/export-config.controller';

const router = Router();

router.get('/ports', getPorts);
router.get('/shipping-methods', getShippingMethods);
router.get('/incoterms', getIncoterms);
router.get('/exchange-rates', getExchangeRates);
router.get('/payment-terms', getPaymentTerms);

export default router;