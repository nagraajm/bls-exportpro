import { repositories } from '../repositories';
import { DashboardMetrics } from '../../../shared/types.ts';

export class DashboardService {
  async getMetrics(): Promise<DashboardMetrics> {
    const orders = await repositories.order.findAll();
    const products = await repositories.product.findAll();
    
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'draft' || o.status === 'confirmed').length;
    const completedOrders = orders.filter(o => o.status === 'delivered').length;
    
    const totalRevenue = orders.reduce((acc, order) => {
      if (order.currency === 'USD') {
        acc.USD += order.totalAmount;
      } else {
        acc.INR += order.totalAmount;
      }
      return acc;
    }, { USD: 0, INR: 0 });
    
    const productSales = new Map<string, { name: string; quantity: number; revenue: number }>();
    
    for (const order of orders) {
      for (const item of order.items) {
        const product = await repositories.product.findById(item.productId);
        if (product) {
          const key = item.productId;
          const existing = productSales.get(key) || { 
            name: product.brandName, 
            quantity: 0, 
            revenue: 0 
          };
          
          existing.quantity += item.quantity;
          existing.revenue += item.totalPrice;
          productSales.set(key, existing);
        }
      }
    }
    
    const topProducts = Array.from(productSales.entries())
      .map(([productId, data]) => ({
        productId,
        productName: data.name,
        quantity: data.quantity,
        revenue: data.revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
    
    const monthlyData = new Map<string, { orders: number; revenue: number }>();
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData.set(monthKey, { orders: 0, revenue: 0 });
    }
    
    for (const order of orders) {
      const orderDate = new Date(order.orderDate);
      const monthKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
      
      if (monthlyData.has(monthKey)) {
        const data = monthlyData.get(monthKey)!;
        data.orders++;
        data.revenue += order.totalAmount;
      }
    }
    
    const monthlyTrend = Array.from(monthlyData.entries()).map(([month, data]) => ({
      month,
      orders: data.orders,
      revenue: data.revenue,
    }));
    
    const regulatoryCompliance = {
      compliant: 0,
      pending: 0,
      expired: 0,
    };
    
    return {
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue,
      topProducts,
      monthlyTrend,
      regulatoryCompliance,
    };
  }
}

export const dashboardService = new DashboardService();