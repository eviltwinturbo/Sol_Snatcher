export interface TokenLaunch {
  mint: string;
  poolAddress: string;
  dex: string;
  timestamp: number;
  liquidityUSD: number;
  creatorAddress: string;
  lpLocked: boolean;
  mintAuthorityRevoked: boolean;
  devSupplyPct: number;
  flags: string[];
}

export interface SnipeIntent {
  mint: string;
  route: string;
  walletId: string;
  sizeSOL: number;
  maxSlippagePct: number;
  mode: 'aggressive' | 'balanced' | 'conservative';
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
  createdAt: Date;
  updatedAt: Date;
}

export interface Trade {
  id: string;
  walletId: string;
  positionId: string;
  side: 'buy' | 'sell';
  qty: number;
  price: number;
  fee: number;
  txSig: string;
  timestamp: Date;
}

export interface PnL {
  positionId: string;
  realizedSOL: number;
  realizedUSD: number;
  timestamp: Date;
}

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

export interface Settings {
  rpcEndpoints: string[];
  wallets: Wallet[];
  riskPctPerTrade: number;
  minLiquidityUSD: number;
  devSupplyMaxPct: number;
  blacklist: string[];
  tpPct: number;
  slPct: number;
  trailingPct: number;
  notificationVAPIDKeys: {
    public: string;
    private: string;
  };
}

export interface SimResult {
  ok: boolean;
  expectedOutput: number;
  priceImpact: number;
  error?: string;
}

export interface SubmitResult {
  signature: string;
  confirmed: boolean;
  fillQty: number;
  fillPrice: number;
  error?: string;
}

export interface NotificationPayload {
  title: string;
  body: string;
  data?: any;
}