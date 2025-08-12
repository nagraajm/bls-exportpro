import path from 'path';
import fs from 'fs/promises';

export class FileDatabase {
  private dataDir: string;
  
  constructor() {
    this.dataDir = process.env.DATA_DIR || path.join(process.cwd(), 'data');
    this.initializeDataDir();
  }
  
  private async initializeDataDir() {
    try {
      await fs.access(this.dataDir);
    } catch {
      await fs.mkdir(this.dataDir, { recursive: true });
    }
  }
  
  async readJson<T>(filename: string): Promise<T[]> {
    const filePath = path.join(this.dataDir, `${filename}.json`);
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }
  
  async writeJson<T>(filename: string, data: T[]): Promise<void> {
    const filePath = path.join(this.dataDir, `${filename}.json`);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  }
  
  async appendJson<T>(filename: string, item: T): Promise<void> {
    const data = await this.readJson<T>(filename);
    data.push(item);
    await this.writeJson(filename, data);
  }
  
  async updateJson<T extends { id: string }>(
    filename: string,
    id: string,
    updates: Partial<T>
  ): Promise<T | null> {
    const data = await this.readJson<T>(filename);
    const index = data.findIndex(item => item.id === id);
    
    if (index === -1) return null;
    
    data[index] = { ...data[index], ...updates };
    await this.writeJson(filename, data);
    
    return data[index];
  }
  
  async deleteJson<T extends { id: string }>(
    filename: string,
    id: string
  ): Promise<boolean> {
    const data = await this.readJson<T>(filename);
    const filteredData = data.filter(item => item.id !== id);
    
    if (data.length === filteredData.length) return false;
    
    await this.writeJson(filename, filteredData);
    return true;
  }
  
  async findById<T extends { id: string }>(
    filename: string,
    id: string
  ): Promise<T | null> {
    const data = await this.readJson<T>(filename);
    return data.find(item => item.id === id) || null;
  }
  
  async find<T>(
    filename: string,
    predicate: (item: T) => boolean
  ): Promise<T[]> {
    const data = await this.readJson<T>(filename);
    return data.filter(predicate);
  }
}

export const db = new FileDatabase();