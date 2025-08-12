import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { repositories } from '../repositories';
import { z } from 'zod';

const createCustomerSchema = z.object({
  companyName: z.string(),
  contactPerson: z.string(),
  email: z.string().email(),
  phone: z.string(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    country: z.string(),
    postalCode: z.string(),
  }),
  taxId: z.string(),
  currency: z.enum(['USD', 'INR']),
});

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const page = req.query.page ? Number(req.query.page) : 1;
  const limit = req.query.limit ? Number(req.query.limit) : 20;
  
  const result = await repositories.customer.paginate(page, limit);
  
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

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const customer = await repositories.customer.findById(req.params.id);
  
  if (!customer) {
    res.status(404).json({
      status: 'error',
      message: 'Customer not found',
    });
    return;
  }
  
  res.json({
    status: 'success',
    data: customer,
  });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = createCustomerSchema.parse(req.body);
  const customer = await repositories.customer.create(validatedData);
  
  res.status(201).json({
    status: 'success',
    data: customer,
  });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const customer = await repositories.customer.update(req.params.id, req.body);
  
  if (!customer) {
    res.status(404).json({
      status: 'error',
      message: 'Customer not found',
    });
    return;
  }
  
  res.json({
    status: 'success',
    data: customer,
  });
});

export const deleteCustomer = asyncHandler(async (req: Request, res: Response) => {
  const deleted = await repositories.customer.delete(req.params.id);
  
  if (!deleted) {
    res.status(404).json({
      status: 'error',
      message: 'Customer not found',
    });
    return;
  }
  
  res.status(204).send();
});

export const customerController = {
  getAll,
  getById,
  create,
  update,
  delete: deleteCustomer,
};