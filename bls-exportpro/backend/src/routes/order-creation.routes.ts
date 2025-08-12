import { Router } from 'express';
import { OrderCreationController } from '../controllers/order-creation.controller';

const router = Router();
const controller = new OrderCreationController();

// Get all products for order creation
router.get('/products', controller.getProducts.bind(controller));

// Get all customers for order creation
router.get('/customers', controller.getCustomers.bind(controller));

// Create new order
router.post('/create', controller.createOrder.bind(controller));

export default router;