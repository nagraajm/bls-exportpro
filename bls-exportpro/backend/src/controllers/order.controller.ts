import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import { orderService } from '../services/order.service';
import { CreateOrderInput, UpdateOrderInput, GetOrderInput, ListOrdersInput } from '../schemas/order.schema';

export const createOrder = asyncHandler(async (
  req: Request<{}, {}, CreateOrderInput['body']>,
  res: Response,
  next: NextFunction
) => {
  const order = await orderService.createOrder({
    ...req.body,
    deliveryDate: req.body.deliveryDate ? new Date(req.body.deliveryDate) : undefined,
    items: req.body.items.map(item => ({
      ...item,
      expiryDate: new Date(item.expiryDate),
    })),
  });
  
  res.status(201).json({
    status: 'success',
    data: order,
  });
});

export const getOrder = asyncHandler(async (
  req: Request<GetOrderInput['params']>,
  res: Response,
  next: NextFunction
) => {
  const order = await orderService.getOrder(req.params.id);
  
  res.json({
    status: 'success',
    data: order,
  });
});

export const listOrders = asyncHandler(async (
  req: Request<{}, {}, {}, ListOrdersInput['query']>,
  res: Response,
  next: NextFunction
) => {
  const result = await orderService.listOrders(req.query);
  
  res.json({
    status: 'success',
    data: result.data,
    pagination: {
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
    },
  });
});

export const updateOrder = asyncHandler(async (
  req: Request<UpdateOrderInput['params'], {}, UpdateOrderInput['body']>,
  res: Response,
  next: NextFunction
) => {
  const updates: any = { ...req.body };
  
  if (updates.deliveryDate) {
    updates.deliveryDate = new Date(updates.deliveryDate);
  }
  
  if (updates.items) {
    updates.items = updates.items.map((item: any) => ({
      ...item,
      expiryDate: new Date(item.expiryDate),
    }));
  }
  
  const order = await orderService.updateOrder(req.params.id, updates);
  
  res.json({
    status: 'success',
    data: order,
  });
});

export const updateOrderStatus = asyncHandler(async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
    res.status(400).json({
      status: 'error',
      message: 'Invalid status value'
    });
    return;
  }

  try {
    // For now, update the order using a simple SQLite update
    // In a full implementation, you'd use the orderService
    const { getDatabase } = require('../config/sqlite.config');
    const db = await getDatabase();
    
    const result = await db.run(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, id]
    );

    if (result.changes === 0) {
      res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
      return;
    }

    res.json({
      status: 'success',
      message: 'Order status updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to update order status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export const deleteOrder = asyncHandler(async (
  req: Request<GetOrderInput['params']>,
  res: Response,
  next: NextFunction
) => {
  await orderService.deleteOrder(req.params.id);
  
  res.status(204).send();
});