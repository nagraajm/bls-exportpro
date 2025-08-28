import { BaseRepository } from './base.repository';
import { ProductPricing } from '../../../shared/types/product';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export class ProductPricingRepository extends BaseRepository<ProductPricing> {
  private dataFilePath: string;

  constructor() {
    super('product-pricing');
    this.dataFilePath = join(process.cwd(), 'data', 'product-pricing.json');
    this.ensureDataFile();
  }

  private ensureDataFile(): void {
    try {
      readFileSync(this.dataFilePath);
    } catch (error) {
      writeFileSync(this.dataFilePath, '[]', 'utf8');
    }
  }

  protected loadData(): ProductPricing[] {
    try {
      const data = readFileSync(this.dataFilePath, 'utf8');
      const parsed = JSON.parse(data);
      return parsed.map((item: any) => ({
        ...item,
        effectiveFrom: new Date(item.effectiveFrom),
        effectiveTo: item.effectiveTo ? new Date(item.effectiveTo) : undefined,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt)
      }));
    } catch (error) {
      return [];
    }
  }

  protected saveData(data: ProductPricing[]): void {
    writeFileSync(this.dataFilePath, JSON.stringify(data, null, 2));
  }

  async findByProductId(
    productId: string, 
    page: number = 1, 
    limit: number = 20
  ): Promise<{ data: ProductPricing[], total: number, page: number, totalPages: number }> {
    const allData = this.loadData();
    const filtered = allData
      .filter(pricing => pricing.productId === productId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const data = filtered.slice(startIndex, startIndex + limit);

    return { data, total, page, totalPages };
  }

  async getActivePricing(
    productId: string, 
    priceType?: 'selling' | 'procurement' | 'market'
  ): Promise<ProductPricing[]> {
    const allData = this.loadData();
    const now = new Date();
    
    return allData.filter(pricing => 
      pricing.productId === productId &&
      pricing.isActive &&
      pricing.effectiveFrom <= now &&
      (!pricing.effectiveTo || pricing.effectiveTo >= now) &&
      (!priceType || pricing.priceType === priceType)
    ).sort((a, b) => b.effectiveFrom.getTime() - a.effectiveFrom.getTime());
  }

  async deactivatePrevious(productId: string, priceType: 'selling' | 'procurement' | 'market'): Promise<void> {
    const allData = this.loadData();
    const updated = allData.map(pricing => 
      pricing.productId === productId && pricing.priceType === priceType && pricing.isActive
        ? { ...pricing, isActive: false, updatedAt: new Date() }
        : pricing
    );
    this.saveData(updated);
  }

  async create(data: ProductPricing): Promise<ProductPricing> {
    const allData = this.loadData();
    const newPricing = {
      ...data,
      id: data.id || uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    allData.push(newPricing);
    this.saveData(allData);
    return newPricing;
  }

  async update(id: string, updates: Partial<ProductPricing>): Promise<ProductPricing | null> {
    const allData = this.loadData();
    const index = allData.findIndex(item => item.id === id);
    
    if (index === -1) return null;
    
    const updated = {
      ...allData[index],
      ...updates,
      updatedAt: new Date()
    };
    
    allData[index] = updated;
    this.saveData(allData);
    return updated;
  }

  async findById(id: string): Promise<ProductPricing | null> {
    const allData = this.loadData();
    return allData.find(item => item.id === id) || null;
  }

  async delete(id: string): Promise<boolean> {
    const allData = this.loadData();
    const initialLength = allData.length;
    const filtered = allData.filter(item => item.id !== id);
    
    if (filtered.length === initialLength) return false;
    
    this.saveData(filtered);
    return true;
  }
}