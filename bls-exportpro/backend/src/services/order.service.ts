import { repositories } from '../repositories';
import { Order, OrderItem, OrderStatus } from '../../../shared/types';
import { calculateOrderTotals } from '../utils/calculations';
import { AppError } from '../middleware/error.middleware';

export class OrderService {
  async createOrder(data: {
    customerId: string;
    deliveryDate?: Date;
    items: Array<Omit<OrderItem, 'product' | 'totalPrice'>>;
    currency: 'USD' | 'INR';
    exchangeRate?: number;
    shippingMarks?: string;
    specialInstructions?: string;
  }): Promise<Order> {
    const customer = await repositories.customer.findById(data.customerId);
    if (!customer) {
      throw new AppError(404, 'Customer not found');
    }
    
    const itemsWithTotal: OrderItem[] = [];
    
    for (const item of data.items) {
      const product = await repositories.product.findById(item.productId);
      if (!product) {
        throw new AppError(404, `Product ${item.productId} not found`);
      }
      
      itemsWithTotal.push({
        ...item,
        totalPrice: item.quantity * item.unitPrice,
      });
    }
    
    const calculations = calculateOrderTotals(itemsWithTotal, data.currency);
    const orderNumber = await repositories.order.generateOrderNumber();
    
    const order = await repositories.order.create({
      orderNumber,
      customerId: data.customerId,
      orderDate: new Date(),
      deliveryDate: data.deliveryDate,
      status: 'draft' as OrderStatus,
      items: itemsWithTotal,
      ...calculations,
      currency: data.currency,
      exchangeRate: data.exchangeRate,
      shippingMarks: data.shippingMarks,
      specialInstructions: data.specialInstructions,
    });
    
    return order;
  }
  
  async getOrder(id: string): Promise<Order> {
    const order = await repositories.order.findById(id);
    if (!order) {
      throw new AppError(404, 'Order not found');
    }
    
    order.customer = await repositories.customer.findById(order.customerId) || undefined;
    
    for (const item of order.items) {
      item.product = await repositories.product.findById(item.productId) || undefined;
    }
    
    return order;
  }
  
  async listOrders(filters: {
    page?: number;
    limit?: number;
    status?: OrderStatus;
    customerId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    
    let predicate: ((order: Order) => boolean) | undefined;
    
    if (filters.status || filters.customerId || filters.startDate || filters.endDate) {
      predicate = (order: Order) => {
        let match = true;
        
        if (filters.status && order.status !== filters.status) match = false;
        if (filters.customerId && order.customerId !== filters.customerId) match = false;
        if (filters.startDate) {
          const orderDate = new Date(order.orderDate);
          const startDate = new Date(filters.startDate);
          if (orderDate < startDate) match = false;
        }
        if (filters.endDate) {
          const orderDate = new Date(order.orderDate);
          const endDate = new Date(filters.endDate);
          if (orderDate > endDate) match = false;
        }
        
        return match;
      };
    }
    
    return repositories.order.paginate(page, limit, predicate);
  }
  
  async updateOrder(id: string, updates: Partial<Order>): Promise<Order> {
    const order = await repositories.order.findById(id);
    if (!order) {
      throw new AppError(404, 'Order not found');
    }
    
    if (updates.items) {
      const calculations = calculateOrderTotals(updates.items, order.currency);
      Object.assign(updates, calculations);
    }
    
    const updatedOrder = await repositories.order.update(id, updates);
    if (!updatedOrder) {
      throw new AppError(500, 'Failed to update order');
    }
    
    return updatedOrder;
  }
  
  async deleteOrder(id: string): Promise<void> {
    const deleted = await repositories.order.delete(id);
    if (!deleted) {
      throw new AppError(404, 'Order not found');
    }
  }
  
  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    return this.updateOrder(id, { status });
  }
}

export const orderService = new OrderService();