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

export type GenerateInvoiceInput = z.infer<typeof generateInvoiceSchema>;
export type GetInvoiceInput = z.infer<typeof getInvoiceSchema>;
export type ListInvoicesInput = z.infer<typeof listInvoicesSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;