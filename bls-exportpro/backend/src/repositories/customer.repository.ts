import { BaseRepository } from './base.repository';
import { Customer } from '../../../shared/types.ts';

export class CustomerRepository extends BaseRepository<Customer> {
  constructor() {
    super('customers');
  }
  
  async findByEmail(email: string): Promise<Customer | null> {
    return this.findOne(customer => customer.email === email);
  }
  
  async findByCompanyName(companyName: string): Promise<Customer[]> {
    return this.find(customer => 
      customer.companyName.toLowerCase().includes(companyName.toLowerCase())
    );
  }
  
  async findByCountry(country: string): Promise<Customer[]> {
    return this.find(customer => customer.address.country === country);
  }
}