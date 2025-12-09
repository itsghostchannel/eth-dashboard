-- Initialize database schema for Ethereum Block Dashboard
-- This file is automatically executed when the PostgreSQL container starts

-- Create indexes for better query performance
-- These will be created after Prisma migration

-- Block indexes
-- CREATE INDEX IF NOT EXISTS idx_blocks_timestamp ON blocks(timestamp);
-- CREATE INDEX IF NOT EXISTS idx_blocks_miner ON blocks(miner);
-- CREATE INDEX IF NOT EXISTS idx_blocks_gas_used ON blocks(gas_used);

-- Transaction indexes
-- CREATE INDEX IF NOT EXISTS idx_transactions_block_hash ON transactions(block_hash);
-- CREATE INDEX IF NOT EXISTS idx_transactions_from_address ON transactions(from_address);
-- CREATE INDEX IF NOT EXISTS idx_transactions_to_address ON transactions(to_address);
-- CREATE INDEX IF NOT EXISTS idx_transactions_value ON transactions(value);
-- CREATE INDEX IF NOT EXISTS idx_transactions_gas_price ON transactions(gas_price);