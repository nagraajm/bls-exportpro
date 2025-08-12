import { BaseRepository } from './base.repository';
import { RegulatoryDocument } from '../../../shared/types.ts';

export class RegulatoryRepository extends BaseRepository<RegulatoryDocument> {
  constructor() {
    super('regulatoryDocuments');
  }
  
  async findByProductId(productId: string): Promise<RegulatoryDocument[]> {
    return this.find(doc => doc.productId === productId);
  }
  
  async findByCountry(country: string): Promise<RegulatoryDocument[]> {
    return this.find(doc => doc.country === country);
  }
  
  async findByStatus(status: RegulatoryDocument['status']): Promise<RegulatoryDocument[]> {
    return this.find(doc => doc.status === status);
  }
  
  async findExpiring(days: number = 30): Promise<RegulatoryDocument[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    return this.find(doc => {
      if (!doc.expiryDate) return false;
      const expiry = new Date(doc.expiryDate);
      return expiry <= futureDate && expiry >= new Date();
    });
  }
}