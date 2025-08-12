import { repositories } from '../repositories';
import { RegulatoryDocument, RegulatoryStatus } from '../../../shared/types.ts';
import { AppError } from '../middleware/error.middleware';

export class RegulatoryService {
  async createDocument(data: {
    productId: string;
    documentType: string;
    documentNumber: string;
    country: string;
    submissionDate?: Date;
    approvalDate?: Date;
    expiryDate?: Date;
    remarks?: string;
  }): Promise<RegulatoryDocument> {
    const product = await repositories.product.findById(data.productId);
    if (!product) {
      throw new AppError(404, 'Product not found');
    }
    
    let status: RegulatoryStatus = 'pending';
    if (data.approvalDate) {
      status = 'approved';
    } else if (data.submissionDate) {
      status = 'submitted';
    }
    
    if (data.expiryDate && new Date(data.expiryDate) < new Date()) {
      status = 'expired';
    }
    
    const document = await repositories.regulatory.create({
      ...data,
      status,
    });
    
    return document;
  }
  
  async getDocument(id: string): Promise<RegulatoryDocument> {
    const document = await repositories.regulatory.findById(id);
    if (!document) {
      throw new AppError(404, 'Regulatory document not found');
    }
    
    document.product = await repositories.product.findById(document.productId) || undefined;
    
    return document;
  }
  
  async listDocuments(filters: {
    page?: number;
    limit?: number;
    productId?: string;
    country?: string;
    status?: RegulatoryStatus;
  }) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    
    let predicate: ((doc: RegulatoryDocument) => boolean) | undefined;
    
    if (filters.productId || filters.country || filters.status) {
      predicate = (doc: RegulatoryDocument) => {
        let match = true;
        
        if (filters.productId && doc.productId !== filters.productId) match = false;
        if (filters.country && doc.country !== filters.country) match = false;
        if (filters.status && doc.status !== filters.status) match = false;
        
        return match;
      };
    }
    
    return repositories.regulatory.paginate(page, limit, predicate);
  }
  
  async updateDocumentStatus(id: string, data: {
    status: RegulatoryStatus;
    submissionDate?: Date;
    approvalDate?: Date;
    expiryDate?: Date;
    remarks?: string;
  }): Promise<RegulatoryDocument> {
    const document = await repositories.regulatory.findById(id);
    if (!document) {
      throw new AppError(404, 'Regulatory document not found');
    }
    
    const updated = await repositories.regulatory.update(id, data);
    if (!updated) {
      throw new AppError(500, 'Failed to update regulatory document');
    }
    
    return updated;
  }
  
  async getExpiringDocuments(days: number = 30): Promise<RegulatoryDocument[]> {
    const documents = await repositories.regulatory.findExpiring(days);
    
    for (const doc of documents) {
      doc.product = await repositories.product.findById(doc.productId) || undefined;
    }
    
    return documents;
  }
  
  async getComplianceStatus() {
    const allDocuments = await repositories.regulatory.findAll();
    
    const statusCounts = allDocuments.reduce((acc, doc) => {
      if (doc.status === 'approved' && (!doc.expiryDate || new Date(doc.expiryDate) > new Date())) {
        acc.compliant++;
      } else if (doc.status === 'pending' || doc.status === 'submitted' || doc.status === 'under-review') {
        acc.pending++;
      } else if (doc.status === 'expired' || (doc.expiryDate && new Date(doc.expiryDate) <= new Date())) {
        acc.expired++;
      }
      return acc;
    }, { compliant: 0, pending: 0, expired: 0 });
    
    const byCountry = new Map<string, { total: number; compliant: number }>();
    
    for (const doc of allDocuments) {
      const country = doc.country;
      const countryData = byCountry.get(country) || { total: 0, compliant: 0 };
      
      countryData.total++;
      if (doc.status === 'approved' && (!doc.expiryDate || new Date(doc.expiryDate) > new Date())) {
        countryData.compliant++;
      }
      
      byCountry.set(country, countryData);
    }
    
    return {
      overall: statusCounts,
      byCountry: Array.from(byCountry.entries()).map(([country, data]) => ({
        country,
        ...data,
        complianceRate: data.total > 0 ? (data.compliant / data.total) * 100 : 0,
      })),
      expiringDocuments: await this.getExpiringDocuments(30),
    };
  }
}

export const regulatoryService = new RegulatoryService();