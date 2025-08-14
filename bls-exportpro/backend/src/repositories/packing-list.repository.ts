import { BaseRepository } from './base.repository';
import { PackingList } from '../../../shared/types';

export class PackingListRepository extends BaseRepository<PackingList> {
  constructor() {
    // SQLite table name is snake_case
    super('packing_lists');
  }
  
  async findByOrderId(orderId: string): Promise<PackingList[]> {
    return this.find(packingList => packingList.orderId === orderId);
  }
  
  async findByInvoiceId(invoiceId: string): Promise<PackingList[]> {
    return this.find(packingList => packingList.invoiceId === invoiceId);
  }
  
  async generatePackingListNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.count(packingList => 
      packingList.packingListNumber.startsWith(`PL-${year}-`)
    );
    return `PL-${year}-${String(count + 1).padStart(5, '0')}`;
  }
}