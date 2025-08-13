import { getDatabase } from '../config/sqlite.config';
import { v4 as uuidv4 } from 'uuid';

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export abstract class BaseRepository<T extends BaseEntity> {
  constructor(protected tableName: string) {}
  
  async findAll(): Promise<T[]> {
    const db = await getDatabase();
    const result = await db.all(`SELECT * FROM ${this.tableName}`);
    return result.map(this.mapRowToEntity);
  }
  
  async findById(id: string): Promise<T | null> {
    const db = await getDatabase();
    const result = await db.get(`SELECT * FROM ${this.tableName} WHERE id = ?`, [id]);
    return result ? this.mapRowToEntity(result) : null;
  }
  
  async find(predicate: (item: T) => boolean): Promise<T[]> {
    const items = await this.findAll();
    return items.filter(predicate);
  }
  
  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    const now = new Date();
    const entity = {
      ...data,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    } as T;
    
    const db = await getDatabase();
    const columns = Object.keys(entity).join(', ');
    const placeholders = Object.keys(entity).map(() => '?').join(', ');
    const values = Object.values(entity);
    
    await db.run(
      `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders})`,
      values
    );
    
    return entity;
  }
  
  async update(id: string, data: Partial<Omit<T, 'id' | 'createdAt'>>): Promise<T | null> {
    const updates = {
      ...data,
      updatedAt: new Date(),
    };
    
    const db = await getDatabase();
    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), id];
    
    const result = await db.run(
      `UPDATE ${this.tableName} SET ${setClause} WHERE id = ?`,
      values
    );
    
    if (!result || (result as any).changes === 0) return null;
    
    return this.findById(id);
  }
  
  async delete(id: string): Promise<boolean> {
    const db = await getDatabase();
    const result = await db.run(`DELETE FROM ${this.tableName} WHERE id = ?`, [id]);
    return ((result as any)?.changes ?? 0) > 0;
  }
  
  async findOne(predicate: (item: T) => boolean): Promise<T | null> {
    const results = await this.find(predicate);
    return results[0] || null;
  }
  
  async count(predicate?: (item: T) => boolean): Promise<number> {
    const items = await this.findAll();
    if (!predicate) return items.length;
    return items.filter(predicate).length;
  }
  
  async paginate(
    page: number = 1,
    limit: number = 20,
    predicate?: (item: T) => boolean
  ): Promise<{
    data: T[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    let items = await this.findAll();
    if (predicate) {
      items = items.filter(predicate);
    }
    
    const total = items.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const data = items.slice(start, start + limit);
    
    return { data, total, page, totalPages };
  }
  
  protected mapRowToEntity(row: any): T {
    // Convert SQLite row to entity format
    return {
      ...row,
      createdAt: row.created_at ? new Date(row.created_at) : new Date(),
      updatedAt: row.updated_at ? new Date(row.updated_at) : new Date(),
    } as T;
  }
}