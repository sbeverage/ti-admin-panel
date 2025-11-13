-- One-Time Gifts Feature - Database Migration
-- Run this migration to set up the one-time gifts feature

BEGIN;

-- Create one_time_gifts table
CREATE TABLE IF NOT EXISTS one_time_gifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  beneficiary_id UUID NOT NULL REFERENCES beneficiaries(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  currency VARCHAR(3) DEFAULT 'USD',
  
  -- Payment Information
  stripe_payment_intent_id VARCHAR(255) UNIQUE,
  stripe_charge_id VARCHAR(255),
  payment_method_type VARCHAR(50),
  payment_method_last4 VARCHAR(4),
  payment_method_brand VARCHAR(50),
  
  -- Status Tracking
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  failure_reason TEXT,
  
  -- Processing Fees
  processing_fee DECIMAL(10,2) DEFAULT 0,
  net_amount DECIMAL(10,2) NOT NULL,
  user_covered_fees BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  donor_message TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP,
  failed_at TIMESTAMP,
  refunded_at TIMESTAMP,
  refund_amount DECIMAL(10,2),
  
  -- Admin Notes
  admin_notes TEXT,
  
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_one_time_gifts_user ON one_time_gifts(user_id);
CREATE INDEX IF NOT EXISTS idx_one_time_gifts_beneficiary ON one_time_gifts(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_one_time_gifts_status ON one_time_gifts(status);
CREATE INDEX IF NOT EXISTS idx_one_time_gifts_created ON one_time_gifts(created_at);
CREATE INDEX IF NOT EXISTS idx_one_time_gifts_stripe_payment_intent ON one_time_gifts(stripe_payment_intent_id);

-- Add columns to beneficiaries table
ALTER TABLE beneficiaries 
  ADD COLUMN IF NOT EXISTS total_one_time_gifts DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS one_time_gifts_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_one_time_gift_at TIMESTAMP;

-- Add columns to users table
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS total_one_time_gifts_given DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS one_time_gifts_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_one_time_gift_at TIMESTAMP;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_one_time_gifts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS one_time_gifts_updated_at ON one_time_gifts;
CREATE TRIGGER one_time_gifts_updated_at
  BEFORE UPDATE ON one_time_gifts
  FOR EACH ROW
  EXECUTE FUNCTION update_one_time_gifts_updated_at();

COMMIT;

