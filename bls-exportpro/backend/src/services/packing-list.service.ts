import { PackingList } from '../../../shared/types';
import { repositories } from '../repositories';

export class PackingListService {
  async getPackingList(id: string): Promise<PackingList> {
    const packingList = await repositories.packingList.findById(id);
    
    if (!packingList) {
      throw new Error('Packing list not found');
    }
    
    // Load related data
    if (packingList.orderId) {
      packingList.order = await repositories.order.findById(packingList.orderId) || undefined;
      if (packingList.order?.customerId) {
        packingList.order.customer = await repositories.customer.findById(packingList.order.customerId) || undefined;
      }
    }
    
    // Load product details for items
    for (const item of packingList.items) {
      if (item.productId) {
        item.product = await repositories.product.findById(item.productId) || undefined;
      }
    }
    
    return packingList;
  }
  
  async getPackingListByOrderId(orderId: string): Promise<PackingList | null> {
    const packingLists = await repositories.packingList.findAll();
    return packingLists.find(pl => pl.orderId === orderId) || null;
  }
  
  async generatePackingList(data: any): Promise<PackingList> {
    // Generate a packing list number
    const packingListNumber = await this.generatePackingListNumber();
    
    const packingList = await repositories.packingList.create({
      ...data,
      packingListNumber
    });
    
    return this.getPackingList(packingList.id);
  }
  
  async listPackingLists(query: any = {}): Promise<{ data: PackingList[]; total: number; page: number; totalPages: number }> {
    const packingLists = await repositories.packingList.findAll();
    const page = query.page || 1;
    const limit = query.limit || 20;
    const start = (page - 1) * limit;
    const end = start + limit;
    
    // Load related data for each packing list
    const paginatedData = packingLists.slice(start, end);
    for (const pl of paginatedData) {
      if (pl.orderId) {
        pl.order = await repositories.order.findById(pl.orderId) || undefined;
      }
    }
    
    return {
      data: paginatedData,
      total: packingLists.length,
      page,
      totalPages: Math.ceil(packingLists.length / limit)
    };
  }
  
  private async generatePackingListNumber(): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const packingLists = await repositories.packingList.findAll();
    const count = packingLists.filter(pl => 
      pl.packingListNumber?.startsWith(`PL-${year}`)
    ).length + 1;
    
    return `PL-${year}-${String(count).padStart(5, '0')}`;
  }
}

export const packingListService = new PackingListService();