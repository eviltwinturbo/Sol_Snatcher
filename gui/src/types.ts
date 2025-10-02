export interface Wallet {
  id: string;
  pubkey: string;
  path: string;
  riskPctPerTrade: number;
  balance: number;
  busy: boolean;
  dailyPnL: number;
  totalPnL: number;
}

export interface Position {
  id: string;
  walletId: string;
  mint: string;
  baseQty: number;
  avgCost: number;
  tpPct: number;
  slPct: number;
  trailingPct: number;
  status: 'open' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export interface SystemStatus {
  wallets: number;
  activePositions: number;
  busyWallets: number;
  totalBalance: number;
  totalPnL: number;
}

export interface NotificationSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}