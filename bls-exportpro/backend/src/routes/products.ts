import { Router } from 'express';
import { productController } from '../controllers/product.controller';
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

// Public routes (all authenticated users can view)
router.get('/', productController.getAll);
router.get('/:id', productController.getById);

// Admin routes for pending approvals
router.get('/admin/pending-approvals', productController.getPendingApprovals);

// Create/Update routes (admin/manager only)
router.post('/', productController.create);
router.put('/:id', productController.update);

// Approval routes (admin only)
router.patch('/:id/approve', productController.approve);
router.patch('/:id/reject', productController.reject);

// Delete route (admin only)
router.delete('/:id', productController.delete);

export default router;