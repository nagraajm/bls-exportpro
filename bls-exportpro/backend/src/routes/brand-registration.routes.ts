import { Router } from 'express';
import {
  createBrandRegistration,
  getAllBrandRegistrations,
  getBrandRegistration,
  updateBrandRegistration,
  deleteBrandRegistration,
  searchBrandRegistrations,
  getBrandRegistrationsByManufacturer,
  getBrandRegistrationsByStatus,
  getBrandRegistrationsByApprovalStatus,
  approveBrandRegistration,
  rejectBrandRegistration,
  getFPSIntegration,
  syncWithFPS,
  syncAllFPS
} from '../controllers/brand-registration.controller';

const router = Router();

// Main CRUD operations
router.post('/', createBrandRegistration);
router.get('/', getAllBrandRegistrations);
router.get('/search', searchBrandRegistrations);
router.get('/:id', getBrandRegistration);
router.put('/:id', updateBrandRegistration);
router.delete('/:id', deleteBrandRegistration);

// Filter operations
router.get('/manufacturer/:manufacturerId', getBrandRegistrationsByManufacturer);
router.get('/status/:status', getBrandRegistrationsByStatus);
router.get('/approval-status/:approvalStatus', getBrandRegistrationsByApprovalStatus);

// Approval workflow
router.patch('/:id/approve', approveBrandRegistration);
router.patch('/:id/reject', rejectBrandRegistration);

// FPS Integration
router.get('/:brandId/fps-integration', getFPSIntegration);
router.post('/:brandId/sync-fps', syncWithFPS);
router.post('/sync-all-fps', syncAllFPS);

export default router;