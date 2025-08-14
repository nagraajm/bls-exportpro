import { BaseRepository } from './base.repository';
import { Product } from '../../../shared/types';

export class ProductRepository extends BaseRepository<Product> {
  constructor() {
    super('products');
  }
  
  async findByProductCode(productCode: string): Promise<Product | null> {
    return this.findOne(product => product.productCode === productCode);
  }
  
  async findByBrandName(brandName: string): Promise<Product[]> {
    return this.find(product => 
      product.brandName.toLowerCase().includes(brandName.toLowerCase())
    );
  }
  
  async findByGenericName(genericName: string): Promise<Product[]> {
    return this.find(product => 
      product.genericName.toLowerCase().includes(genericName.toLowerCase())
    );
  }
  
  async findByManufacturer(manufacturer: string): Promise<Product[]> {
    return this.find(product => product.manufacturer === manufacturer);
  }
  
  async findByBatchNumber(batchNumber: string): Promise<Product[]> {
    return this.find(product => product.batchNumber === batchNumber);
  }
}