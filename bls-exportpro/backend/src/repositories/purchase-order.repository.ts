import { BaseRepository } from './base.repository';
import { PurchaseOrder } from '../../../shared/types';

export class PurchaseOrderRepository extends BaseRepository<PurchaseOrder> {
  constructor() {
    super('purchaseOrders');
  }
  
  async findBySupplierId(supplierId: string): Promise<PurchaseOrder[]> {
    return this.find(po => po.supplierId === supplierId);
  }
  
  async findByStatus(status: PurchaseOrder['status']): Promise<PurchaseOrder[]> {
    return this.find(po => po.status === status);
  }
  
  async generatePONumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.count(po => 
      po.poNumber.startsWith(`PO-${year}-`)
    );
    return `PO-${year}-${String(count + 1).padStart(5, '0')}`;
  }
}