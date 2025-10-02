import axios from 'axios';
import { SwapIntent, SimResult, SubmitResult } from './types';

export class SolExecutor {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://sol-exec:8080') {
    this.baseUrl = baseUrl;
  }

  async simulateSwap(intent: SwapIntent): Promise<SimResult> {
    try {
      const response = await axios.post(`${this.baseUrl}/simulate`, intent, {
        timeout: 5000,
      });
      return response.data;
    } catch (error) {
      console.error('Simulation failed:', error);
      return {
        ok: false,
        expectedOutput: 0,
        priceImpact: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async preSignSwap(walletId: string, intent: SwapIntent): Promise<string> {
    try {
      const response = await axios.post(`${this.baseUrl}/pre-sign`, {
        walletId,
        intent,
      }, {
        timeout: 10000,
      });
      return response.data.transaction;
    } catch (error) {
      console.error('Pre-signing failed:', error);
      throw error;
    }
  }

  async submitTransaction(transaction: string): Promise<SubmitResult> {
    try {
      const response = await axios.post(`${this.baseUrl}/submit`, {
        transaction,
      }, {
        timeout: 30000,
      });
      return response.data;
    } catch (error) {
      console.error('Transaction submission failed:', error);
      return {
        signature: '',
        confirmed: false,
        fillQty: 0,
        fillPrice: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getWalletBalance(walletId: string): Promise<number> {
    try {
      const response = await axios.get(`${this.baseUrl}/wallet/${walletId}/balance`, {
        timeout: 5000,
      });
      return response.data.balance;
    } catch (error) {
      console.error('Failed to get wallet balance:', error);
      return 0;
    }
  }

  async setWalletBusy(walletId: string, busy: boolean): Promise<void> {
    try {
      await axios.post(`${this.baseUrl}/wallet/${walletId}/busy`, {
        busy,
      }, {
        timeout: 5000,
      });
    } catch (error) {
      console.error('Failed to set wallet busy status:', error);
    }
  }

  async getWalletStatus(walletId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/wallet/${walletId}/status`, {
        timeout: 5000,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get wallet status:', error);
      return null;
    }
  }
}