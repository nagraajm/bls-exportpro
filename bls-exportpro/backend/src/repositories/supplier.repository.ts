import { BaseRepository } from './base.repository';
import { Supplier } from '../../../shared/types.ts';

export class SupplierRepository extends BaseRepository<Supplier> {
  constructor() {
    super('suppliers');
  }
  
  async findByEmail(email: string): Promise<Supplier | null> {
    return this.findOne(supplier => supplier.email === email);
  }
  
  async findByCompanyName(companyName: string): Promise<Supplier[]> {
    return this.find(supplier => 
      supplier.companyName.toLowerCase().includes(companyName.toLowerCase())
    );
  }
}