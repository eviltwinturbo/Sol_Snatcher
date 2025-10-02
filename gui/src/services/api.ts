import axios from 'axios';
import { Wallet, Position, SystemStatus } from '../types';

const API_BASE = process.env.REACT_APP_API_BASE || '/api';

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE;
  }

  async getWallets(): Promise<Wallet[]> {
    const response = await axios.get(`${this.baseURL}/wallets`);
    return response.data;
  }

  async getWallet(walletId: string): Promise<Wallet> {
    const response = await axios.get(`${this.baseURL}/wallets/${walletId}`);
    return response.data;
  }

  async getPositions(walletId?: string): Promise<Position[]> {
    const params = walletId ? { walletId } : {};
    const response = await axios.get(`${this.baseURL}/positions`, { params });
    return response.data;
  }

  async getSystemStatus(): Promise<SystemStatus> {
    const response = await axios.get(`${this.baseURL}/status`);
    return response.data;
  }

  async simulateLaunch(launch: any): Promise<void> {
    await axios.post(`${this.baseURL}/simulate-launch`, launch);
  }

  async subscribeToNotifications(walletId: string, subscription: any): Promise<void> {
    await axios.post(`${this.baseURL}/push/subscribe`, {
      walletId,
      subscription,
    });
  }

  async getVapidPublicKey(): Promise<string> {
    const response = await axios.get(`${this.baseURL}/push/vapid-public-key`);
    return response.data.publicKey;
  }
}

export const apiService = new ApiService();