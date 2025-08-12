import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { purchaseOrderService } from '../services/purchase-order.service';
import { z } from 'zod';

const createPurchaseOrderSchema = z.object({
  body: z.object({
    supplierId: z.string().uuid(),
    expectedDeliveryDate: z.string().datetime(),
    items: z.array(z.object({
      productId: z.string().uuid(),
      quantity: z.number().positive(),
      unitPrice: z.number().positive(),
      requestedDeliveryDate: z.string().datetime().optional(),
    })).min(1),
    paymentTerms: z.string().optional(),
    deliveryTerms: z.string().optional(),
  }),
});

export const createPurchaseOrder = asyncHandler(async (
  req: Request<{}, {}, z.infer<typeof createPurchaseOrderSchema>['body']>,
  res: Response
) => {
  const purchaseOrder = await purchaseOrderService.createPurchaseOrder({
    ...req.body,
    expectedDeliveryDate: new Date(req.body.expectedDeliveryDate),
    items: req.body.items.map(item => ({
      ...item,
      requestedDeliveryDate: item.requestedDeliveryDate ? new Date(item.requestedDeliveryDate) : undefined,
    })),
  });
  
  res.status(201).json({
    status: 'success',
    data: purchaseOrder,
  });
});

export const getPurchaseOrder = asyncHandler(async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const purchaseOrder = await purchaseOrderService.getPurchaseOrder(req.params.id);
  
  res.json({
    status: 'success',
    data: purchaseOrder,
  });
});

export const listPurchaseOrders = asyncHandler(async (
  req: Request,
  res: Response
) => {
  const result = await purchaseOrderService.listPurchaseOrders({
    page: req.query.page ? Number(req.query.page) : undefined,
    limit: req.query.limit ? Number(req.query.limit) : undefined,
    status: req.query.status as any,
    supplierId: req.query.supplierId as string,
  });
  
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

export const updatePurchaseOrderStatus = asyncHandler(async (
  req: Request<{ id: string }, {}, { status: string }>,
  res: Response
) => {
  const purchaseOrder = await purchaseOrderService.updatePurchaseOrderStatus(
    req.params.id,
    req.body.status as any
  );
  
  res.json({
    status: 'success',
    data: purchaseOrder,
  });
});