-- Table to track task posting payments
CREATE TABLE IF NOT EXISTS task_posting_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  payment_intent_id TEXT NOT NULL UNIQUE,
  amount INTEGER NOT NULL, -- Amount in cents
  status TEXT NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed')),
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL, -- Link to task once created
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_task_posting_payments_user_id ON task_posting_payments(user_id);
CREATE INDEX idx_task_posting_payments_payment_intent_id ON task_posting_payments(payment_intent_id);
CREATE INDEX idx_task_posting_payments_status ON task_posting_payments(status);

-- RLS policies
ALTER TABLE task_posting_payments ENABLE ROW LEVEL SECURITY;

-- Users can view their own payments
CREATE POLICY "Users can view their own payments"
  ON task_posting_payments
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can insert/update (via webhook)
CREATE POLICY "Service role can manage payments"
  ON task_posting_payments
  FOR ALL
  USING (auth.role() = 'service_role');

-- Updated at trigger
CREATE TRIGGER update_task_posting_payments_updated_at
  BEFORE UPDATE ON task_posting_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
