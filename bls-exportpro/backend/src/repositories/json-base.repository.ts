import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export abstract class JsonBaseRepository<T extends BaseEntity> {
  constructor(protected filePath: string) {}

  private async readData(): Promise<T[]> {
    try {
      if (!fs.existsSync(this.filePath)) {
        await this.writeData([]);
        return [];
      }
      
      const data = await fs.promises.readFile(this.filePath, 'utf-8');
      const parsed = JSON.parse(data);
      
      // Convert date strings to Date objects
      return parsed.map((item: any) => ({
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt)
      }));
    } catch (error) {
      console.error(`Error reading data from ${this.filePath}:`, error);
      return [];
    }
  }

  private async writeData(data: T[]): Promise<void> {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        await fs.promises.mkdir(dir, { recursive: true });
      }
      
      await fs.promises.writeFile(
        this.filePath, 
        JSON.stringify(data, null, 2), 
        'utf-8'
      );
    } catch (error) {
      console.error(`Error writing data to ${this.filePath}:`, error);
      throw error;
    }
  }

  async findAll(): Promise<T[]> {
    return await this.readData();
  }

  async findById(id: string): Promise<T | null> {
    const data = await this.readData();
    return data.find(item => item.id === id) || null;
  }

  async find(predicate: (item: T) => boolean): Promise<T[]> {
    const data = await this.readData();
    return data.filter(predicate);
  }

  async findOne(predicate: (item: T) => boolean): Promise<T | null> {
    const results = await this.find(predicate);
    return results[0] || null;
  }

  async create(entity: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    const data = await this.readData();
    const now = new Date();
    const newEntity = {
      ...entity,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now
    } as T;

    data.push(newEntity);
    await this.writeData(data);
    return newEntity;
  }

  async update(id: string, updates: Partial<Omit<T, 'id' | 'createdAt'>>): Promise<T | null> {
    const data = await this.readData();
    const index = data.findIndex(item => item.id === id);
    
    if (index === -1) return null;

    const updatedEntity = {
      ...data[index],
      ...updates,
      updatedAt: new Date()
    } as T;

    data[index] = updatedEntity;
    await this.writeData(data);
    return updatedEntity;
  }

  async delete(id: string): Promise<boolean> {
    const data = await this.readData();
    const index = data.findIndex(item => item.id === id);
    
    if (index === -1) return false;

    data.splice(index, 1);
    await this.writeData(data);
    return true;
  }

  async count(predicate?: (item: T) => boolean): Promise<number> {
    const data = await this.readData();
    if (!predicate) return data.length;
    return data.filter(predicate).length;
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
    let data = await this.readData();
    if (predicate) {
      data = data.filter(predicate);
    }
    
    const total = data.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const resultData = data.slice(start, start + limit);
    
    return { data: resultData, total, page, totalPages };
  }
}