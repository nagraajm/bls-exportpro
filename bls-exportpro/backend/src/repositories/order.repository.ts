import { BaseRepository } from './base.repository';
import { Order } from '../../../shared/types.ts';

export class OrderRepository extends BaseRepository<Order> {
  constructor() {
    super('orders');
  }
  
  async findByCustomerId(customerId: string): Promise<Order[]> {
    return this.find(order => order.customerId === customerId);
  }
  
  async findByStatus(status: Order['status']): Promise<Order[]> {
    return this.find(order => order.status === status);
  }
  
  async findByDateRange(startDate: Date, endDate: Date): Promise<Order[]> {
    return this.find(order => {
      const orderDate = new Date(order.orderDate);
      return orderDate >= startDate && orderDate <= endDate;
    });
  }
  
  async generateOrderNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.count(order => 
      order.orderNumber.startsWith(`ORD-${year}-`)
    );
    return `ORD-${year}-${String(count + 1).padStart(5, '0')}`;
  }
}