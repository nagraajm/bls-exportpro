import { PurchaseOrder } from '../../../shared/types';
import { repositories } from '../repositories';

export class PurchaseOrderService {
  async getPurchaseOrder(id: string): Promise<PurchaseOrder> {
    const purchaseOrder = await repositories.purchaseOrder.findById(id);
    
    if (!purchaseOrder) {
      throw new Error('Purchase order not found');
    }
    
    // Load supplier data
    if (purchaseOrder.supplierId) {
      purchaseOrder.supplier = await repositories.supplier.findById(purchaseOrder.supplierId) || undefined;
    }
    
    // Load product details for items
    for (const item of purchaseOrder.items) {
      if (item.productId) {
        item.product = await repositories.product.findById(item.productId) || undefined;
      }
    }
    
    return purchaseOrder;
  }
  
  async listPurchaseOrders(query: any = {}): Promise<{ data: PurchaseOrder[]; total: number; page: number; totalPages: number }> {
    const purchaseOrders = await repositories.purchaseOrder.findAll();
    const page = query.page || 1;
    const limit = query.limit || 20;
    const start = (page - 1) * limit;
    const end = start + limit;
    
    // Load related data
    const paginatedData = purchaseOrders.slice(start, end);
    for (const po of paginatedData) {
      if (po.supplierId) {
        po.supplier = await repositories.supplier.findById(po.supplierId) || undefined;
      }
    }
    
    return {
      data: paginatedData,
      total: purchaseOrders.length,
      page,
      totalPages: Math.ceil(purchaseOrders.length / limit)
    };
  }
  
  async createPurchaseOrder(data: any): Promise<PurchaseOrder> {
    const poNumber = await this.generatePONumber();
    
    const purchaseOrder = await repositories.purchaseOrder.create({
      ...data,
      poNumber,
      status: data.status || 'draft'
    });
    
    return this.getPurchaseOrder(purchaseOrder.id);
  }
  
  async updatePurchaseOrderStatus(id: string, status: string): Promise<PurchaseOrder> {
    const updated = await repositories.purchaseOrder.update(id, { 
      status: status as any 
    });
    
    if (!updated) {
      throw new Error('Purchase order not found');
    }
    
    return this.getPurchaseOrder(id);
  }
  
  private async generatePONumber(): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const purchaseOrders = await repositories.purchaseOrder.findAll();
    const count = purchaseOrders.filter(po => 
      po.poNumber?.startsWith(`PO-${year}`)
    ).length + 1;
    
    return `PO-${year}-${String(count).padStart(5, '0')}`;
  }
}

export const purchaseOrderService = new PurchaseOrderService();