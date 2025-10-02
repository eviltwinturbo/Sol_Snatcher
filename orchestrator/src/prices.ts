import { EventEmitter } from 'events';
import axios from 'axios';

export interface PriceUpdate {
  mint: string;
  price: number;
  timestamp: number;
  volume24h: number;
  change24h: number;
}

export class PriceFeed extends EventEmitter {
  private subscriptions: Map<string, boolean> = new Map();
  private priceCache: Map<string, PriceUpdate> = new Map();
  private updateInterval: NodeJS.Timeout | null = null;
  private readonly updateFrequency = 1000; // 1 second

  constructor() {
    super();
    this.startPriceUpdates();
  }

  subscribe(mint: string): void {
    this.subscriptions.set(mint, true);
    console.log(`Subscribed to price updates for ${mint}`);
  }

  unsubscribe(mint: string): void {
    this.subscriptions.delete(mint);
    console.log(`Unsubscribed from price updates for ${mint}`);
  }

  getPrice(mint: string): PriceUpdate | null {
    return this.priceCache.get(mint) || null;
  }

  private startPriceUpdates(): void {
    this.updateInterval = setInterval(async () => {
      await this.updatePrices();
    }, this.updateFrequency);
  }

  private async updatePrices(): Promise<void> {
    const mints = Array.from(this.subscriptions.keys());
    
    if (mints.length === 0) return;

    try {
      // In production, this would call Jupiter API or similar
      // For now, we'll simulate price updates
      for (const mint of mints) {
        const priceUpdate = await this.fetchPrice(mint);
        if (priceUpdate) {
          this.priceCache.set(mint, priceUpdate);
          this.emit('priceUpdate', priceUpdate);
        }
      }
    } catch (error) {
      console.error('Failed to update prices:', error);
    }
  }

  private async fetchPrice(mint: string): Promise<PriceUpdate | null> {
    try {
      // Mock price data - in production, integrate with Jupiter API
      const basePrice = 0.001;
      const volatility = 0.05; // 5% volatility
      const randomChange = (Math.random() - 0.5) * volatility;
      const price = basePrice * (1 + randomChange);
      
      const volume24h = Math.random() * 1000000; // Random volume
      const change24h = (Math.random() - 0.5) * 0.2; // Random 24h change

      return {
        mint,
        price,
        timestamp: Date.now(),
        volume24h,
        change24h,
      };
    } catch (error) {
      console.error(`Failed to fetch price for ${mint}:`, error);
      return null;
    }
  }

  // Real Jupiter API integration would look like this:
  private async fetchPriceFromJupiter(mint: string): Promise<PriceUpdate | null> {
    try {
      const response = await axios.get(`https://price.jup.ag/v4/price?ids=${mint}`, {
        timeout: 5000,
      });

      const priceData = response.data.data[mint];
      if (!priceData) return null;

      return {
        mint,
        price: priceData.price,
        timestamp: Date.now(),
        volume24h: priceData.volume24h || 0,
        change24h: priceData.change24h || 0,
      };
    } catch (error) {
      console.error(`Jupiter API error for ${mint}:`, error);
      return null;
    }
  }

  destroy(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.removeAllListeners();
    this.subscriptions.clear();
    this.priceCache.clear();
  }
}

export const priceFeed = new PriceFeed();