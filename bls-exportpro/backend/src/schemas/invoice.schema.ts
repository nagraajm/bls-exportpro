import { z } from 'zod';

export const generateInvoiceSchema = z.object({
  body: z.object({
    orderId: z.string().uuid(),
    invoiceType: z.enum(['proforma', 'pre-shipment', 'post-shipment']),
    dueDate: z.string().datetime().optional(),
    termsAndConditions: z.string().optional(),
  }),
});

export const getInvoiceSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const listInvoicesSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    invoiceType: z.enum(['proforma', 'pre-shipment', 'post-shipment']).optional(),
    orderId: z.string().uuid().optional(),
  }),
});

export const updateInvoiceSchema = z.object({
  body: z.object({
    dueDate: z.string().datetime().optional(),
    termsAndConditions: z.string().optional(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const importInvoicesSchema = z.object({
  body: z.object({
    invoices: z.array(z.object({
      invoiceNumber: z.string().min(1, 'Invoice number is required'),
      invoiceType: z.enum(['proforma', 'pre-shipment', 'post-shipment']),
      customerName: z.string().min(1, 'Customer name is required'),
      customerCountry: z.string().min(1, 'Customer country is required'),
      invoiceDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
      dueDate: z.string().datetime().optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
      totalAmount: z.number().positive('Total amount must be positive'),
      currency: z.enum(['USD', 'INR']),
      status: z.enum(['draft', 'pending', 'paid', 'overdue', 'cancelled']).optional().default('pending'),
      items: z.array(z.object({
        productName: z.string().min(1, 'Product name is required'),
        quantity: z.number().positive('Quantity must be positive'),
        unitPrice: z.number().positive('Unit price must be positive'),
        totalPrice: z.number().positive('Total price must be positive'),
      })).optional().default([]),
    })),
  }),
});

export type GenerateInvoiceInput = z.infer<typeof generateInvoiceSchema>;
export type GetInvoiceInput = z.infer<typeof getInvoiceSchema>;
export type ListInvoicesInput = z.infer<typeof listInvoicesSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
export type ImportInvoicesInput = z.infer<typeof importInvoicesSchema>;