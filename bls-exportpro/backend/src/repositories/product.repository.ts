import { BaseRepository } from './base.repository';
import { Product } from '../../../shared/types';
import { getDatabase } from '../config/sqlite.config';
import { v4 as uuidv4 } from 'uuid';

// Define the database schema structure
interface ProductDbRow {
  id: string;
  brand_name: string;
  generic_name: string;
  strength: string;
  unit_pack: string;
  pack_size: number;
  rate_usd: number;
  hs_code: string;
  batch_prefix: string;
  created_at: string;
}

export class ProductRepository {
  private tableName = 'products';

  async findAll(): Promise<Product[]> {
    const db = await getDatabase();
    const result = await db.all(`SELECT * FROM ${this.tableName}`);
    return result.map(this.mapRowToEntity);
  }

  async findById(id: string): Promise<Product | null> {
    const db = await getDatabase();
    const result = await db.get(`SELECT * FROM ${this.tableName} WHERE id = ?`, [id]);
    return result ? this.mapRowToEntity(result) : null;
  }

  async paginate(page: number = 1, limit: number = 20): Promise<{
    data: Product[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const db = await getDatabase();
    const offset = (page - 1) * limit;
    
    // Get total count
    const countResult = await db.get(`SELECT COUNT(*) as count FROM ${this.tableName}`);
    const total = countResult.count;
    
    // Get paginated data
    const result = await db.all(
      `SELECT * FROM ${this.tableName} ORDER BY created_at DESC LIMIT ? OFFSET ?`, 
      [limit, offset]
    );
    
    const data = result.map(this.mapRowToEntity);
    const totalPages = Math.ceil(total / limit);
    
    return { data, total, page, totalPages };
  }

  async create(data: ProductDbRow): Promise<Product> {
    const db = await getDatabase();
    
    const insertData = {
      id: data.id || uuidv4(),
      brand_name: data.brand_name,
      generic_name: data.generic_name,
      strength: data.strength,
      unit_pack: data.unit_pack,
      pack_size: data.pack_size,
      rate_usd: data.rate_usd,
      hs_code: data.hs_code,
      batch_prefix: data.batch_prefix,
      created_at: data.created_at || new Date().toISOString()
    };

    await db.run(
      `INSERT INTO ${this.tableName} (id, brand_name, generic_name, strength, unit_pack, pack_size, rate_usd, hs_code, batch_prefix, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      Object.values(insertData)
    );

    return this.mapRowToEntity(insertData);
  }

  async update(id: string, updates: Partial<ProductDbRow>): Promise<Product | null> {
    const db = await getDatabase();
    
    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), id];
    
    const result = await db.run(
      `UPDATE ${this.tableName} SET ${setClause} WHERE id = ?`,
      values
    );
    
    if (result.changes === 0) return null;
    
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const db = await getDatabase();
    const result = await db.run(`DELETE FROM ${this.tableName} WHERE id = ?`, [id]);
    return (result.changes || 0) > 0;
  }

  private mapRowToEntity(row: any): Product {
    return {
      id: row.id,
      productCode: row.batch_prefix || '',
      brandName: row.brand_name,
      genericName: row.generic_name,
      strength: row.strength,
      dosageForm: 'Tablet', // Default since not in schema
      packSize: row.unit_pack,
      manufacturer: 'N/A', // Not in schema
      hsnCode: row.hs_code,
      unitPrice: row.rate_usd,
      currency: 'USD', // Convert later
      approvalStatus: 'approved',
      createdBy: 'System',
      createdAt: row.created_at,
      updatedAt: row.created_at
    } as Product;
  }
}