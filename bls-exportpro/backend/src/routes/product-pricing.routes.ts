import { Router } from 'express';
import { pricingController } from '../controllers/product-pricing.controller';
// import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Temporarily disable authentication for testing
// router.use(authenticate);

// Mock user for testing
router.use((req, res, next) => {
  req.user = {
    id: 'test-user-1',
    username: 'testadmin',
    email: 'admin@test.com',
    role: 'admin'
  };
  next();
});

// Get pricing history for a product
router.get('/product/:productId/history', pricingController.getPricingHistory);

// Get active pricing for a product
router.get('/product/:productId/active', pricingController.getActivePricing);

// Create new pricing (admin/manager only)
router.post('/', pricingController.createPricing);

// Update existing pricing (admin/manager only)
router.put('/:id', pricingController.updatePricing);

// Approve pricing (admin only)
router.patch('/:id/approve', pricingController.approvePricing);

export default router;