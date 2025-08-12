import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { regulatoryService } from '../services/regulatory.service';
import { z } from 'zod';

const createDocumentSchema = z.object({
  body: z.object({
    productId: z.string().uuid(),
    documentType: z.string(),
    documentNumber: z.string(),
    country: z.string(),
    submissionDate: z.string().datetime().optional(),
    approvalDate: z.string().datetime().optional(),
    expiryDate: z.string().datetime().optional(),
    remarks: z.string().optional(),
  }),
});

const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum(['pending', 'submitted', 'under-review', 'approved', 'rejected', 'expired']),
    submissionDate: z.string().datetime().optional(),
    approvalDate: z.string().datetime().optional(),
    expiryDate: z.string().datetime().optional(),
    remarks: z.string().optional(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const createDocument = asyncHandler(async (
  req: Request<{}, {}, z.infer<typeof createDocumentSchema>['body']>,
  res: Response
) => {
  const document = await regulatoryService.createDocument({
    ...req.body,
    submissionDate: req.body.submissionDate ? new Date(req.body.submissionDate) : undefined,
    approvalDate: req.body.approvalDate ? new Date(req.body.approvalDate) : undefined,
    expiryDate: req.body.expiryDate ? new Date(req.body.expiryDate) : undefined,
  });
  
  res.status(201).json({
    status: 'success',
    data: document,
  });
});

export const getDocument = asyncHandler(async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const document = await regulatoryService.getDocument(req.params.id);
  
  res.json({
    status: 'success',
    data: document,
  });
});

export const listDocuments = asyncHandler(async (
  req: Request,
  res: Response
) => {
  const result = await regulatoryService.listDocuments({
    page: req.query.page ? Number(req.query.page) : undefined,
    limit: req.query.limit ? Number(req.query.limit) : undefined,
    productId: req.query.productId as string,
    country: req.query.country as string,
    status: req.query.status as any,
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

export const updateDocumentStatus = asyncHandler(async (
  req: Request<z.infer<typeof updateStatusSchema>['params'], {}, z.infer<typeof updateStatusSchema>['body']>,
  res: Response
) => {
  const document = await regulatoryService.updateDocumentStatus(req.params.id, {
    ...req.body,
    submissionDate: req.body.submissionDate ? new Date(req.body.submissionDate) : undefined,
    approvalDate: req.body.approvalDate ? new Date(req.body.approvalDate) : undefined,
    expiryDate: req.body.expiryDate ? new Date(req.body.expiryDate) : undefined,
  });
  
  res.json({
    status: 'success',
    data: document,
  });
});

export const getComplianceStatus = asyncHandler(async (
  req: Request,
  res: Response
) => {
  const status = await regulatoryService.getComplianceStatus();
  
  res.json({
    status: 'success',
    data: status,
  });
});