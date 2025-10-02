import { Pool } from 'pg';
import { Position, Trade, PnL, Wallet } from './types';

export class Database {
  private pool: Pool;

  constructor(connectionString: string) {
    this.pool = new Pool({
      connectionString,
      ssl: false,
    });
  }

  async initialize() {
    await this.createTables();
  }

  private async createTables() {
    const client = await this.pool.connect();
    
    try {
      // Positions table
      await client.query(`
        CREATE TABLE IF NOT EXISTS positions (
          id VARCHAR(255) PRIMARY KEY,
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
        )
      `);

      // Trades table
      await client.query(`
        CREATE TABLE IF NOT EXISTS trades (
          id VARCHAR(255) PRIMARY KEY,
          wallet_id VARCHAR(255) NOT NULL,
          position_id VARCHAR(255) NOT NULL,
          side VARCHAR(10) NOT NULL,
          qty DECIMAL(20, 8) NOT NULL,
          price DECIMAL(20, 8) NOT NULL,
          fee DECIMAL(20, 8) NOT NULL,
          tx_sig VARCHAR(255) NOT NULL,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // PnL table
      await client.query(`
        CREATE TABLE IF NOT EXISTS pnl (
          id SERIAL PRIMARY KEY,
          position_id VARCHAR(255) NOT NULL,
          realized_sol DECIMAL(20, 8) NOT NULL,
          realized_usd DECIMAL(20, 8) NOT NULL,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Wallets table
      await client.query(`
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
        )
      `);

      // Settings table
      await client.query(`
        CREATE TABLE IF NOT EXISTS settings (
          id SERIAL PRIMARY KEY,
          key VARCHAR(255) UNIQUE NOT NULL,
          value JSONB NOT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

    } finally {
      client.release();
    }
  }

  async createPosition(position: Omit<Position, 'createdAt' | 'updatedAt'>): Promise<Position> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(`
        INSERT INTO positions (id, wallet_id, mint, base_qty, avg_cost, tp_pct, sl_pct, trailing_pct, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *, created_at, updated_at
      `, [
        position.id, position.walletId, position.mint, position.baseQty,
        position.avgCost, position.tpPct, position.slPct, position.trailingPct, position.status
      ]);

      return this.mapPositionFromRow(result.rows[0]);
    } finally {
      client.release();
    }
  }

  async updatePosition(id: string, updates: Partial<Position>): Promise<Position> {
    const client = await this.pool.connect();
    try {
      const setClause = Object.keys(updates)
        .filter(key => key !== 'id' && key !== 'createdAt' && key !== 'updatedAt')
        .map((key, index) => `${key} = $${index + 2}`)
        .join(', ');

      const values = [id, ...Object.values(updates).filter(v => v !== undefined)];
      
      const result = await client.query(`
        UPDATE positions SET ${setClause}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *, created_at, updated_at
      `, values);

      if (result.rows.length === 0) {
        throw new Error(`Position ${id} not found`);
      }

      return this.mapPositionFromRow(result.rows[0]);
    } finally {
      client.release();
    }
  }

  async getOpenPositions(walletId?: string): Promise<Position[]> {
    const client = await this.pool.connect();
    try {
      let query = 'SELECT *, created_at, updated_at FROM positions WHERE status = $1';
      let params: any[] = ['open'];

      if (walletId) {
        query += ' AND wallet_id = $2';
        params.push(walletId);
      }

      const result = await client.query(query, params);
      return result.rows.map(row => this.mapPositionFromRow(row));
    } finally {
      client.release();
    }
  }

  async createTrade(trade: Omit<Trade, 'timestamp'>): Promise<Trade> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(`
        INSERT INTO trades (id, wallet_id, position_id, side, qty, price, fee, tx_sig)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *, timestamp
      `, [
        trade.id, trade.walletId, trade.positionId, trade.side,
        trade.qty, trade.price, trade.fee, trade.txSig
      ]);

      return this.mapTradeFromRow(result.rows[0]);
    } finally {
      client.release();
    }
  }

  async createPnL(pnl: Omit<PnL, 'timestamp'>): Promise<PnL> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(`
        INSERT INTO pnl (position_id, realized_sol, realized_usd)
        VALUES ($1, $2, $3)
        RETURNING *, timestamp
      `, [pnl.positionId, pnl.realizedSOL, pnl.realizedUSD]);

      return this.mapPnLFromRow(result.rows[0]);
    } finally {
      client.release();
    }
  }

  async updateWalletBalance(walletId: string, balance: number): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query(`
        UPDATE wallets SET balance = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [balance, walletId]);
    } finally {
      client.release();
    }
  }

  async setWalletBusy(walletId: string, busy: boolean): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query(`
        UPDATE wallets SET busy = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [busy, walletId]);
    } finally {
      client.release();
    }
  }

  async getWallets(): Promise<Wallet[]> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(`
        SELECT *, created_at, updated_at FROM wallets ORDER BY id
      `);
      return result.rows.map(row => this.mapWalletFromRow(row));
    } finally {
      client.release();
    }
  }

  private mapPositionFromRow(row: any): Position {
    return {
      id: row.id,
      walletId: row.wallet_id,
      mint: row.mint,
      baseQty: parseFloat(row.base_qty),
      avgCost: parseFloat(row.avg_cost),
      tpPct: parseFloat(row.tp_pct),
      slPct: parseFloat(row.sl_pct),
      trailingPct: parseFloat(row.trailing_pct),
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapTradeFromRow(row: any): Trade {
    return {
      id: row.id,
      walletId: row.wallet_id,
      positionId: row.position_id,
      side: row.side,
      qty: parseFloat(row.qty),
      price: parseFloat(row.price),
      fee: parseFloat(row.fee),
      txSig: row.tx_sig,
      timestamp: row.timestamp,
    };
  }

  private mapPnLFromRow(row: any): PnL {
    return {
      positionId: row.position_id,
      realizedSOL: parseFloat(row.realized_sol),
      realizedUSD: parseFloat(row.realized_usd),
      timestamp: row.timestamp,
    };
  }

  private mapWalletFromRow(row: any): Wallet {
    return {
      id: row.id,
      pubkey: row.pubkey,
      path: row.path,
      riskPctPerTrade: parseFloat(row.risk_pct_per_trade),
      balance: parseFloat(row.balance),
      busy: row.busy,
      dailyPnL: parseFloat(row.daily_pnl),
      totalPnL: parseFloat(row.total_pnl),
    };
  }
}