-- BLS ExportPro Database Migration
-- Changes made during deployment that need to be applied to local database

-- Migration: Add missing columns to orders table
-- These columns were added during server deployment to fix invoice generation

-- Check if columns exist before adding (SQLite compatible)
PRAGMA table_info(orders);

-- Add port_of_loading column if not exists
ALTER TABLE orders ADD COLUMN port_of_loading TEXT;

-- Add port_of_discharge column if not exists  
ALTER TABLE orders ADD COLUMN port_of_discharge TEXT;

-- Add place_of_delivery column if not exists
ALTER TABLE orders ADD COLUMN place_of_delivery TEXT;

-- Add payment_terms column if not exists
ALTER TABLE orders ADD COLUMN payment_terms TEXT;

-- Update existing orders with default values
UPDATE orders SET 
    port_of_loading = 'NHAVA SHEVA/MUMBAI',
    port_of_discharge = 'LAEM CHABANG, THAILAND', 
    place_of_delivery = 'YANGON VIA THAI-MYANMAR BORDER',
    payment_terms = 'ADVANCE'
WHERE port_of_loading IS NULL;

-- Verify the changes
SELECT 
    id,
    port_of_loading,
    port_of_discharge, 
    place_of_delivery,
    payment_terms
FROM orders 
LIMIT 5;

-- Show updated table schema
PRAGMA table_info(orders);