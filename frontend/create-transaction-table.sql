-- Create transaction_history table for bridge transactions
CREATE TABLE IF NOT EXISTS transaction_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_address TEXT NOT NULL,
    amount TEXT NOT NULL,
    token_address TEXT NOT NULL,
    source_network INTEGER NOT NULL,
    destination_network INTEGER NOT NULL,
    transaction_hash TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_transaction_history_user_address ON transaction_history(user_address);
CREATE INDEX IF NOT EXISTS idx_transaction_history_status ON transaction_history(status);
CREATE INDEX IF NOT EXISTS idx_transaction_history_created_at ON transaction_history(created_at);
CREATE INDEX IF NOT EXISTS idx_transaction_history_transaction_hash ON transaction_history(transaction_hash);
CREATE INDEX IF NOT EXISTS idx_transaction_history_networks ON transaction_history(source_network, destination_network);

-- Enable Row Level Security (RLS)
ALTER TABLE transaction_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user access
-- Users can view their own transactions
CREATE POLICY "Users can view own transactions" ON transaction_history
    FOR SELECT USING (auth.uid()::text = user_address);

-- Users can insert their own transactions
CREATE POLICY "Users can insert own transactions" ON transaction_history
    FOR INSERT WITH CHECK (auth.uid()::text = user_address);

-- Users can update their own transactions
CREATE POLICY "Users can update own transactions" ON transaction_history
    FOR UPDATE USING (auth.uid()::text = user_address);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at on row updates
CREATE TRIGGER update_transaction_history_updated_at 
    BEFORE UPDATE ON transaction_history 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON transaction_history TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated; 