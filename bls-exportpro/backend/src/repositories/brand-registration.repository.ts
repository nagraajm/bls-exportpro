import { JsonBaseRepository } from './json-base.repository';
import { BrandRegistration, FPSIntegration } from '../../../shared/types/product';
import path from 'path';

export class BrandRegistrationRepository extends JsonBaseRepository<BrandRegistration> {
  constructor() {
    super(path.join(process.cwd(), 'data', 'brand-registrations.json'));
  }

  async findByBrandName(brandName: string): Promise<BrandRegistration | null> {
    const brands = await this.findAll();
    return brands.find(brand => 
      brand.brandName.toLowerCase() === brandName.toLowerCase()
    ) || null;
  }

  async findByBrandCode(brandCode: string): Promise<BrandRegistration | null> {
    const brands = await this.findAll();
    return brands.find(brand => brand.brandCode === brandCode) || null;
  }

  async findByManufacturer(manufacturerId: string): Promise<BrandRegistration[]> {
    const brands = await this.findAll();
    return brands.filter(brand => brand.manufacturerId === manufacturerId);
  }

  async findByStatus(status: BrandRegistration['status']): Promise<BrandRegistration[]> {
    const brands = await this.findAll();
    return brands.filter(brand => brand.status === status);
  }

  async findByApprovalStatus(approvalStatus: BrandRegistration['approvalWorkflow']['status']): Promise<BrandRegistration[]> {
    const brands = await this.findAll();
    return brands.filter(brand => brand.approvalWorkflow.status === approvalStatus);
  }

  async findByTherapeuticCategory(category: string): Promise<BrandRegistration[]> {
    const brands = await this.findAll();
    return brands.filter(brand => 
      brand.therapeuticCategory.toLowerCase().includes(category.toLowerCase())
    );
  }
}

export class FPSIntegrationRepository extends JsonBaseRepository<FPSIntegration> {
  constructor() {
    super(path.join(process.cwd(), 'data', 'fps-integrations.json'));
  }

  async findByBrandId(brandId: string): Promise<FPSIntegration | null> {
    const integrations = await this.findAll();
    return integrations.find(integration => integration.brandId === brandId) || null;
  }

  async findBySyncStatus(status: FPSIntegration['syncStatus']): Promise<FPSIntegration[]> {
    const integrations = await this.findAll();
    return integrations.filter(integration => integration.syncStatus === status);
  }

  async findPendingSync(): Promise<FPSIntegration[]> {
    const integrations = await this.findAll();
    const now = new Date();
    
    return integrations.filter(integration => {
      if (!integration.autoSync) return false;
      
      if (!integration.lastSyncDate) return true;
      
      const lastSync = new Date(integration.lastSyncDate);
      const syncIntervalMs = this.getSyncIntervalMs(integration.syncFrequency);
      
      return (now.getTime() - lastSync.getTime()) >= syncIntervalMs;
    });
  }

  private getSyncIntervalMs(frequency: FPSIntegration['syncFrequency']): number {
    switch (frequency) {
      case 'realtime': return 0;
      case 'hourly': return 60 * 60 * 1000;
      case 'daily': return 24 * 60 * 60 * 1000;
      default: return Infinity; // manual
    }
  }
}