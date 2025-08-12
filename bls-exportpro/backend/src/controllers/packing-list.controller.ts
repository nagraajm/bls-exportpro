import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { packingListService } from '../services/packing-list.service';
import { z } from 'zod';

const generatePackingListSchema = z.object({
  body: z.object({
    orderId: z.string().uuid(),
    invoiceId: z.string().uuid().optional(),
    items: z.array(z.object({
      productId: z.string().uuid(),
      quantity: z.number().positive(),
      packagesCount: z.number().positive(),
      grossWeight: z.number().positive(),
      netWeight: z.number().positive(),
      dimensions: z.string().optional(),
      batchNumber: z.string(),
    })).min(1),
    containerNumber: z.string().optional(),
    sealNumber: z.string().optional(),
    shippingMarks: z.string(),
  }),
});

export const generatePackingList = asyncHandler(async (
  req: Request<{}, {}, z.infer<typeof generatePackingListSchema>['body']>,
  res: Response
) => {
  const packingList = await packingListService.generatePackingList(req.body);
  
  res.status(201).json({
    status: 'success',
    data: packingList,
  });
});

export const getPackingList = asyncHandler(async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const packingList = await packingListService.getPackingList(req.params.id);
  
  res.json({
    status: 'success',
    data: packingList,
  });
});

export const listPackingLists = asyncHandler(async (
  req: Request,
  res: Response
) => {
  const result = await packingListService.listPackingLists({
    page: req.query.page ? Number(req.query.page) : undefined,
    limit: req.query.limit ? Number(req.query.limit) : undefined,
    orderId: req.query.orderId as string,
    invoiceId: req.query.invoiceId as string,
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