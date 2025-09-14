import { BrandRegistrationRepository, FPSIntegrationRepository } from '../repositories/brand-registration.repository';
import { BrandRegistration, FPSIntegration } from '../../../shared/types/product';
import { v4 as uuidv4 } from 'uuid';

export class BrandRegistrationService {
  private brandRegistrationRepo: BrandRegistrationRepository;
  private fpsIntegrationRepo: FPSIntegrationRepository;

  constructor() {
    this.brandRegistrationRepo = new BrandRegistrationRepository();
    this.fpsIntegrationRepo = new FPSIntegrationRepository();
  }

  async createBrandRegistration(data: Omit<BrandRegistration, 'id' | 'createdAt' | 'updatedAt'>): Promise<BrandRegistration> {
    // Check if brand name already exists
    const existingBrand = await this.brandRegistrationRepo.findByBrandName(data.brandName);
    if (existingBrand) {
      throw new Error('Brand name already exists');
    }

    // Check if brand code already exists
    const existingCode = await this.brandRegistrationRepo.findByBrandCode(data.brandCode);
    if (existingCode) {
      throw new Error('Brand code already exists');
    }

    const brandRegistration: BrandRegistration = {
      ...data,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const created = await this.brandRegistrationRepo.create(brandRegistration);

    // Create FPS integration record if FPS details are provided
    if (data.fpsDetails) {
      await this.createFPSIntegration({
        brandId: created.id,
        fpsSystemId: data.fpsDetails.fpsNumber,
        syncStatus: 'pending',
        autoSync: true,
        syncFrequency: 'daily',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    return created;
  }

  async updateBrandRegistration(id: string, data: Partial<BrandRegistration>): Promise<BrandRegistration> {
    const existing = await this.brandRegistrationRepo.findById(id);
    if (!existing) {
      throw new Error('Brand registration not found');
    }

    // Check for duplicate brand name if being updated
    if (data.brandName && data.brandName !== existing.brandName) {
      const existingBrand = await this.brandRegistrationRepo.findByBrandName(data.brandName);
      if (existingBrand && existingBrand.id !== id) {
        throw new Error('Brand name already exists');
      }
    }

    // Check for duplicate brand code if being updated
    if (data.brandCode && data.brandCode !== existing.brandCode) {
      const existingCode = await this.brandRegistrationRepo.findByBrandCode(data.brandCode);
      if (existingCode && existingCode.id !== id) {
        throw new Error('Brand code already exists');
      }
    }

    const updated = await this.brandRegistrationRepo.update(id, {
      ...data,
      updatedAt: new Date()
    });

    if (!updated) {
      throw new Error('Failed to update brand registration');
    }

    // Update FPS integration if FPS details changed
    if (data.fpsDetails) {
      const fpsIntegration = await this.fpsIntegrationRepo.findByBrandId(id);
      if (fpsIntegration) {
        await this.fpsIntegrationRepo.update(fpsIntegration.id, {
          fpsSystemId: data.fpsDetails.fpsNumber,
          syncStatus: 'outdated',
          updatedAt: new Date()
        });
      }
    }

    return updated;
  }

  async getBrandRegistration(id: string): Promise<BrandRegistration | null> {
    return await this.brandRegistrationRepo.findById(id);
  }

  async getAllBrandRegistrations(): Promise<BrandRegistration[]> {
    return await this.brandRegistrationRepo.findAll();
  }

  async getBrandRegistrationsByManufacturer(manufacturerId: string): Promise<BrandRegistration[]> {
    return await this.brandRegistrationRepo.findByManufacturer(manufacturerId);
  }

  async getBrandRegistrationsByStatus(status: BrandRegistration['status']): Promise<BrandRegistration[]> {
    return await this.brandRegistrationRepo.findByStatus(status);
  }

  async getBrandRegistrationsByApprovalStatus(approvalStatus: BrandRegistration['approvalWorkflow']['status']): Promise<BrandRegistration[]> {
    return await this.brandRegistrationRepo.findByApprovalStatus(approvalStatus);
  }

  async searchBrandRegistrations(query: {
    brandName?: string;
    genericName?: string;
    therapeuticCategory?: string;
    status?: BrandRegistration['status'];
    approvalStatus?: BrandRegistration['approvalWorkflow']['status'];
  }): Promise<BrandRegistration[]> {
    let brands = await this.brandRegistrationRepo.findAll();

    if (query.brandName) {
      brands = brands.filter(brand => 
        brand.brandName.toLowerCase().includes(query.brandName!.toLowerCase())
      );
    }

    if (query.genericName) {
      brands = brands.filter(brand => 
        brand.genericName.toLowerCase().includes(query.genericName!.toLowerCase())
      );
    }

    if (query.therapeuticCategory) {
      brands = brands.filter(brand => 
        brand.therapeuticCategory.toLowerCase().includes(query.therapeuticCategory!.toLowerCase())
      );
    }

    if (query.status) {
      brands = brands.filter(brand => brand.status === query.status);
    }

    if (query.approvalStatus) {
      brands = brands.filter(brand => brand.approvalWorkflow.status === query.approvalStatus);
    }

    return brands;
  }

  async deleteBrandRegistration(id: string): Promise<void> {
    const existing = await this.brandRegistrationRepo.findById(id);
    if (!existing) {
      throw new Error('Brand registration not found');
    }

    // Delete associated FPS integration
    const fpsIntegration = await this.fpsIntegrationRepo.findByBrandId(id);
    if (fpsIntegration) {
      await this.fpsIntegrationRepo.delete(fpsIntegration.id);
    }

    await this.brandRegistrationRepo.delete(id);
  }

  async approveBrandRegistration(id: string, approvedBy: string): Promise<BrandRegistration | null> {
    const existing = await this.brandRegistrationRepo.findById(id);
    if (!existing) {
      throw new Error('Brand registration not found');
    }

    return await this.brandRegistrationRepo.update(id, {
      approvalWorkflow: {
        status: 'approved' as const,
        approvedBy,
        approvalDate: new Date(),
        rejectionReason: undefined
      },
      status: 'active' as const,
      updatedAt: new Date()
    });
  }

  async rejectBrandRegistration(id: string, rejectionReason: string): Promise<BrandRegistration | null> {
    const existing = await this.brandRegistrationRepo.findById(id);
    if (!existing) {
      throw new Error('Brand registration not found');
    }

    return await this.brandRegistrationRepo.update(id, {
      approvalWorkflow: {
        status: 'rejected' as const,
        approvedBy: undefined,
        approvalDate: undefined,
        rejectionReason
      },
      updatedAt: new Date()
    });
  }

  // FPS Integration methods
  async createFPSIntegration(data: Omit<FPSIntegration, 'id'>): Promise<FPSIntegration> {
    const integration: FPSIntegration = {
      ...data,
      id: uuidv4()
    };

    return await this.fpsIntegrationRepo.create(integration);
  }

  async getFPSIntegration(brandId: string): Promise<FPSIntegration | null> {
    return await this.fpsIntegrationRepo.findByBrandId(brandId);
  }

  async syncWithFPS(brandId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const integration = await this.fpsIntegrationRepo.findByBrandId(brandId);
      if (!integration) {
        throw new Error('FPS integration not found for brand');
      }

      // TODO: Implement actual FPS API integration
      // This is a placeholder for the actual integration logic
      
      await this.fpsIntegrationRepo.update(integration.id, {
        syncStatus: 'synced',
        lastSyncDate: new Date(),
        syncErrors: undefined,
        updatedAt: new Date()
      });

      return { success: true };
    } catch (error) {
      const integration = await this.fpsIntegrationRepo.findByBrandId(brandId);
      if (integration) {
        await this.fpsIntegrationRepo.update(integration.id, {
          syncStatus: 'failed',
          syncErrors: [error instanceof Error ? error.message : 'Unknown error'],
          updatedAt: new Date()
        });
      }

      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async syncAllPendingFPS(): Promise<void> {
    const pendingIntegrations = await this.fpsIntegrationRepo.findPendingSync();
    
    for (const integration of pendingIntegrations) {
      await this.syncWithFPS(integration.brandId);
    }
  }
}