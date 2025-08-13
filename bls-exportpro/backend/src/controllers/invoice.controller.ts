import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import { invoiceService } from '../services/invoice.service';
import { GenerateInvoiceInput, GetInvoiceInput, ListInvoicesInput, UpdateInvoiceInput, ImportInvoicesInput } from '../schemas/invoice.schema';

export const generateInvoice = asyncHandler(async (
  req: Request<{}, {}, GenerateInvoiceInput['body']>,
  res: Response,
  next: NextFunction
) => {
  const invoice = await invoiceService.generateInvoice({
    ...req.body,
    dueDate: req.body.dueDate ? new Date(req.body.dueDate) : undefined,
  });
  
  res.status(201).json({
    status: 'success',
    data: invoice,
  });
});

export const importInvoices = asyncHandler(async (
  req: Request<{}, {}, ImportInvoicesInput['body']>,
  res: Response,
  next: NextFunction
) => {
  const result = await invoiceService.importInvoices(req.body.invoices);
  
  res.status(200).json({
    status: 'success',
    data: result,
  });
});

export const getInvoice = asyncHandler(async (
  req: Request<GetInvoiceInput['params']>,
  res: Response,
  next: NextFunction
) => {
  const invoice = await invoiceService.getInvoice(req.params.id);
  
  res.json({
    status: 'success',
    data: invoice,
  });
});

export const listInvoices = asyncHandler(async (
  req: Request<{}, {}, {}, ListInvoicesInput['query']>,
  res: Response,
  next: NextFunction
) => {
  const result = await invoiceService.listInvoices(req.query);
  
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

export const updateInvoice = asyncHandler(async (
  req: Request<UpdateInvoiceInput['params'], {}, UpdateInvoiceInput['body']>,
  res: Response,
  next: NextFunction
) => {
  const updates: any = { ...req.body };
  
  if (updates.dueDate) {
    updates.dueDate = new Date(updates.dueDate);
  }
  
  const invoice = await invoiceService.updateInvoice(req.params.id, updates);
  
  res.json({
    status: 'success',
    data: invoice,
  });
});

export const deleteInvoice = asyncHandler(async (
  req: Request<GetInvoiceInput['params']>,
  res: Response,
  next: NextFunction
) => {
  await invoiceService.deleteInvoice(req.params.id);
  
  res.status(204).send();
});