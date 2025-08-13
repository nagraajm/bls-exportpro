import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

let db: Database | null = null;

export async function initDatabase(): Promise<Database> {
  if (db) return db;

  const dbPath = path.join(__dirname, '../../data/pharma.db');
  
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Create tables
  await createTables();
  return db;
}

async function createTables() {
  if (!db) return;

  // Products table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      brand_name TEXT NOT NULL,
      generic_name TEXT NOT NULL,
      strength TEXT,
      unit_pack TEXT,
      pack_size INTEGER,
      rate_usd REAL,
      hs_code TEXT,
      batch_prefix TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Customers table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      company_name TEXT NOT NULL,
      contact_person TEXT,
      address TEXT,
      city TEXT,
      country TEXT,
      phone TEXT,
      email TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Orders table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      customer_id TEXT,
      order_number TEXT UNIQUE,
      order_date DATE,
      estimated_shipment_date DATE,
      status TEXT DEFAULT 'pending',
      total_amount REAL,
      currency TEXT DEFAULT 'USD',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    )
  `);

  // Order items table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT,
      product_id TEXT,
      quantity INTEGER,
      rate_usd REAL,
      amount REAL,
      batch_number TEXT,
      mfg_date DATE,
      exp_date DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  // Invoices table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      order_id TEXT,
      invoice_number TEXT UNIQUE,
      invoice_date DATE,
      invoice_type TEXT, -- 'proforma', 'commercial'
      due_date DATE,
      subtotal REAL,
      igst REAL DEFAULT 0,
      drawback REAL DEFAULT 0,
      rodtep REAL DEFAULT 0,
      total_amount REAL,
      currency TEXT DEFAULT 'USD',
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id)
    )
  `);

  // Packing lists table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS packing_lists (
      id TEXT PRIMARY KEY,
      packing_list_number TEXT UNIQUE,
      order_id TEXT,
      invoice_id TEXT,
      shipping_date DATE,
      manufacturing_site TEXT,
      status TEXT DEFAULT 'pending',
      total_shippers INTEGER,
      total_gross_weight REAL,
      total_net_weight REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (invoice_id) REFERENCES invoices(id)
    )
  `);

  // Packing list items table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS packing_list_items (
      id TEXT PRIMARY KEY,
      packing_list_id TEXT,
      product_id TEXT,
      quantity INTEGER,
      shipper_quantity INTEGER,
      gross_weight REAL,
      net_weight REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (packing_list_id) REFERENCES packing_lists(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);
}

export async function getDatabase(): Promise<Database> {
  if (!db) {
    return await initDatabase();
  }
  return db;
}

export async function closeDatabase() {
  if (db) {
    await db.close();
    db = null;
  }
}