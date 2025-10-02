-- Initialize Sol $natcher database

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create positions table
CREATE TABLE IF NOT EXISTS positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id VARCHAR(255) NOT NULL,
    mint VARCHAR(255) NOT NULL,
    base_qty DECIMAL(20, 8) NOT NULL,
    avg_cost DECIMAL(20, 8) NOT NULL,
    tp_pct DECIMAL(5, 4) NOT NULL,
    sl_pct DECIMAL(5, 4) NOT NULL,
    trailing_pct DECIMAL(5, 4) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trades table
CREATE TABLE IF NOT EXISTS trades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id VARCHAR(255) NOT NULL,
    position_id UUID NOT NULL REFERENCES positions(id),
    side VARCHAR(10) NOT NULL,
    qty DECIMAL(20, 8) NOT NULL,
    price DECIMAL(20, 8) NOT NULL,
    fee DECIMAL(20, 8) NOT NULL,
    tx_sig VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create PnL table
CREATE TABLE IF NOT EXISTS pnl (
    id SERIAL PRIMARY KEY,
    position_id UUID NOT NULL REFERENCES positions(id),
    realized_sol DECIMAL(20, 8) NOT NULL,
    realized_usd DECIMAL(20, 8) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create wallets table
CREATE TABLE IF NOT EXISTS wallets (
    id VARCHAR(255) PRIMARY KEY,
    pubkey VARCHAR(255) NOT NULL,
    path VARCHAR(500) NOT NULL,
    risk_pct_per_trade DECIMAL(5, 4) NOT NULL,
    balance DECIMAL(20, 8) DEFAULT 0,
    busy BOOLEAN DEFAULT FALSE,
    daily_pnl DECIMAL(20, 8) DEFAULT 0,
    total_pnl DECIMAL(20, 8) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_positions_wallet_id ON positions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_positions_status ON positions(status);
CREATE INDEX IF NOT EXISTS idx_trades_wallet_id ON trades(wallet_id);
CREATE INDEX IF NOT EXISTS idx_trades_position_id ON trades(position_id);
CREATE INDEX IF NOT EXISTS idx_pnl_position_id ON pnl(position_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_positions_updated_at BEFORE UPDATE ON positions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON wallets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default settings
INSERT INTO settings (key, value) VALUES 
    ('min_liquidity_usd', '50000'),
    ('dev_supply_max_pct', '0.25'),
    ('max_creator_supply_pct', '0.3'),
    ('tp_pct', '0.5'),
    ('sl_pct', '0.2'),
    ('trailing_pct', '0.15'),
    ('risk_pct_per_trade', '0.15'),
    ('blacklist', '[]')
ON CONFLICT (key) DO NOTHING;