import { z } from 'zod';

export const orderItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().positive(),
  unitPrice: z.number().positive(),
  batchNumber: z.string(),
  expiryDate: z.string().datetime(),
});

export const createOrderSchema = z.object({
  body: z.object({
    customerId: z.string().uuid(),
    deliveryDate: z.string().datetime().optional(),
    items: z.array(orderItemSchema).min(1),
    currency: z.enum(['USD', 'INR']),
    exchangeRate: z.number().positive().optional(),
    shippingMarks: z.string().optional(),
    specialInstructions: z.string().optional(),
  }),
});

export const updateOrderSchema = z.object({
  body: z.object({
    deliveryDate: z.string().datetime().optional(),
    status: z.enum(['draft', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']).optional(),
    items: z.array(orderItemSchema).min(1).optional(),
    shippingMarks: z.string().optional(),
    specialInstructions: z.string().optional(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const getOrderSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const listOrdersSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    status: z.enum(['draft', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']).optional(),
    customerId: z.string().uuid().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
export type GetOrderInput = z.infer<typeof getOrderSchema>;
export type ListOrdersInput = z.infer<typeof listOrdersSchema>;