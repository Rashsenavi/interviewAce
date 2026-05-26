-- PayHere Payment Integration Migration
-- Run this in Supabase SQL Editor if drizzle-kit push fails due to SSL issues

-- 1. Add payout_status enum
DO $$ BEGIN
  CREATE TYPE payout_status AS ENUM ('pending', 'processing', 'paid', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. Add new columns to payments table
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS payhere_order_id VARCHAR(100),
  ADD COLUMN IF NOT EXISTS payhere_raw_status INTEGER;

-- 3. Create interviewer_earnings table
CREATE TABLE IF NOT EXISTS interviewer_earnings (
  id SERIAL PRIMARY KEY,
  interviewer_id INTEGER NOT NULL REFERENCES interviewers(id) ON DELETE CASCADE,
  session_id INTEGER NOT NULL UNIQUE REFERENCES interview_sessions(id) ON DELETE CASCADE,
  payment_id INTEGER REFERENCES payments(id),
  gross_amount DECIMAL(12,2) NOT NULL,
  commission_deducted DECIMAL(12,2) NOT NULL,
  net_earning DECIMAL(12,2) NOT NULL,
  session_duration_hours DECIMAL(5,2),
  payout_month VARCHAR(7),
  payout_id INTEGER,
  earned_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Create interviewer_payouts table
CREATE TABLE IF NOT EXISTS interviewer_payouts (
  id SERIAL PRIMARY KEY,
  interviewer_id INTEGER NOT NULL REFERENCES interviewers(id) ON DELETE CASCADE,
  payout_month VARCHAR(7) NOT NULL,
  total_sessions INTEGER NOT NULL DEFAULT 0,
  total_hours DECIMAL(8,2) NOT NULL DEFAULT 0,
  gross_amount DECIMAL(12,2) NOT NULL,
  commission_deducted DECIMAL(12,2) NOT NULL,
  net_payout_amount DECIMAL(12,2) NOT NULL,
  payout_status payout_status DEFAULT 'pending',
  bank_account_number VARCHAR(50),
  released_by_admin_id INTEGER REFERENCES admins(id),
  released_at TIMESTAMP,
  auto_released BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. Add foreign key from interviewer_earnings.payout_id → interviewer_payouts.id
ALTER TABLE interviewer_earnings
  ADD CONSTRAINT fk_earnings_payout
  FOREIGN KEY (payout_id) REFERENCES interviewer_payouts(id)
  ON DELETE SET NULL;

-- Verify
SELECT 'Migration complete ✅' AS status;
