import { Router } from 'express';
import * as orderController from '../controllers/order.controller';
import { validate } from '../middleware/validate.middleware';
import {
  createOrderSchema,
  updateOrderSchema,
  getOrderSchema,
  listOrdersSchema,
} from '../schemas/order.schema';

const router = Router();

router.post(
  '/create',
  validate(createOrderSchema),
  orderController.createOrder
);

router.get(
  '/list',
  validate(listOrdersSchema),
  orderController.listOrders
);

router.get(
  '/:id',
  validate(getOrderSchema),
  orderController.getOrder
);

router.put(
  '/:id',
  validate(updateOrderSchema),
  orderController.updateOrder
);

router.delete(
  '/:id',
  validate(getOrderSchema),
  orderController.deleteOrder
);

export default router;