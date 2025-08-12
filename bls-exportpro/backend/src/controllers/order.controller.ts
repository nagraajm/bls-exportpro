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

export const deleteOrder = asyncHandler(async (
  req: Request<GetOrderInput['params']>,
  res: Response,
  next: NextFunction
) => {
  await orderService.deleteOrder(req.params.id);
  
  res.status(204).send();
});