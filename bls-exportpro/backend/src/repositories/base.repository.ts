import { db } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export abstract class BaseRepository<T extends BaseEntity> {
  constructor(protected collectionName: string) {}
  
  async findAll(): Promise<T[]> {
    return db.readJson<T>(this.collectionName);
  }
  
  async findById(id: string): Promise<T | null> {
    return db.findById<T>(this.collectionName, id);
  }
  
  async find(predicate: (item: T) => boolean): Promise<T[]> {
    return db.find<T>(this.collectionName, predicate);
  }
  
  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    const now = new Date();
    const entity = {
      ...data,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    } as T;
    
    await db.appendJson(this.collectionName, entity);
    return entity;
  }
  
  async update(id: string, data: Partial<Omit<T, 'id' | 'createdAt'>>): Promise<T | null> {
    const updates = {
      ...data,
      updatedAt: new Date(),
    };
    
    return db.updateJson<T>(this.collectionName, id, updates as Partial<T>);
  }
  
  async delete(id: string): Promise<boolean> {
    return db.deleteJson<T>(this.collectionName, id);
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
}