import express from 'express';
import cors from 'cors';
import { SnatcherOrchestrator } from './orchestrator';
import { TokenLaunch } from './types';

export function createApiServer(orchestrator: SnatcherOrchestrator): express.Application {
  const app = express();
  
  app.use(cors());
  app.use(express.json());

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  // Get all wallets
  app.get('/api/wallets', (req, res) => {
    const wallets = orchestrator.getAllWallets();
    res.json(wallets);
  });

  // Get wallet status
  app.get('/api/wallets/:walletId', (req, res) => {
    const wallet = orchestrator.getWalletStatus(req.params.walletId);
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }
    res.json(wallet);
  });

  // Get active positions
  app.get('/api/positions', (req, res) => {
    const walletId = req.query.walletId as string;
    const positions = orchestrator.getActivePositions(walletId);
    res.json(positions);
  });

  // Simulate token launch (for testing)
  app.post('/api/simulate-launch', async (req, res) => {
    try {
      const launch: TokenLaunch = req.body;
      await orchestrator.simulateTokenLaunch(launch);
      res.json({ success: true, message: 'Token launch simulated' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to simulate launch' });
    }
  });

  // Push notification subscription
  app.post('/api/push/subscribe', async (req, res) => {
    try {
      const { walletId, subscription } = req.body;
      // This would be handled by the push service
      res.json({ success: true, message: 'Subscription created' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create subscription' });
    }
  });

  // Get system status
  app.get('/api/status', (req, res) => {
    const wallets = orchestrator.getAllWallets();
    const positions = orchestrator.getActivePositions();
    
    res.json({
      wallets: wallets.length,
      activePositions: positions.length,
      busyWallets: wallets.filter(w => w.busy).length,
      totalBalance: wallets.reduce((sum, w) => sum + w.balance, 0),
      totalPnL: wallets.reduce((sum, w) => sum + w.totalPnL, 0),
    });
  });

  return app;
}