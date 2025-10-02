import dotenv from 'dotenv';
import { Database } from './database';
import { SolExecutor } from './executor';
import { PriceFeed } from './prices';
import { PushNotificationService } from './push';
import { SnatcherOrchestrator } from './orchestrator';
import { createApiServer } from './api';
import { SafetySettings } from './filters';

dotenv.config();

async function main() {
  try {
    console.log('Starting Sol $natcher Orchestrator...');

    // Initialize services
    const database = new Database(process.env.PG_URL || 'postgres://snatcher:snatcherpass@localhost/snatcher');
    const executor = new SolExecutor(process.env.SOL_EXEC_URL || 'http://sol-exec:8080');
    const priceFeed = new PriceFeed();
    const pushService = new PushNotificationService(
      process.env.VAPID_PUBLIC || '',
      process.env.VAPID_PRIVATE || ''
    );

    // Safety settings
    const safetySettings: SafetySettings = {
      minLiquidityUSD: parseFloat(process.env.MIN_LIQUIDITY_USD || '50000'),
      devSupplyMaxPct: parseFloat(process.env.DEV_SUPPLY_MAX_PCT || '0.25'),
      blacklist: (process.env.BLACKLIST || '').split(',').filter(Boolean),
      requireLpLocked: true,
      requireMintAuthorityRevoked: true,
      maxCreatorSupplyPct: parseFloat(process.env.MAX_CREATOR_SUPPLY_PCT || '0.3'),
    };

    // Initialize orchestrator
    const orchestrator = new SnatcherOrchestrator(
      database,
      executor,
      priceFeed,
      pushService,
      safetySettings
    );

    await orchestrator.initialize();
    await orchestrator.start();

    // Create API server
    const app = createApiServer(orchestrator);
    const port = process.env.PORT || 3001;

    app.listen(port, () => {
      console.log(`API server running on port ${port}`);
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('Shutting down...');
      await orchestrator.stop();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('Shutting down...');
      await orchestrator.stop();
      process.exit(0);
    });

  } catch (error) {
    console.error('Failed to start orchestrator:', error);
    process.exit(1);
  }
}

main();