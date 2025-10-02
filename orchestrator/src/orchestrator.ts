import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { Database } from './database';
import { SolExecutor } from './executor';
import { PriceFeed } from './prices';
import { PushNotificationService } from './push';
import { passesSafetyFilters, calculateRiskScore, getRecommendedSlippage, getRecommendedPositionSize } from './filters';
import { TokenLaunch, SnipeIntent, Position, Trade, Wallet, SafetySettings } from './types';

export class SnatcherOrchestrator extends EventEmitter {
  private database: Database;
  private executor: SolExecutor;
  private priceFeed: PriceFeed;
  private pushService: PushNotificationService;
  private wallets: Map<string, Wallet> = new Map();
  private activePositions: Map<string, Position> = new Map();
  private settings: SafetySettings;
  private isRunning: boolean = false;

  constructor(
    database: Database,
    executor: SolExecutor,
    priceFeed: PriceFeed,
    pushService: PushNotificationService,
    settings: SafetySettings
  ) {
    super();
    this.database = database;
    this.executor = executor;
    this.priceFeed = priceFeed;
    this.pushService = pushService;
    this.settings = settings;
    
    this.setupEventHandlers();
  }

  async initialize(): Promise<void> {
    await this.database.initialize();
    await this.loadWallets();
    await this.loadActivePositions();
    this.startWalletEngines();
  }

  private async loadWallets(): Promise<void> {
    const wallets = await this.database.getWallets();
    for (const wallet of wallets) {
      this.wallets.set(wallet.id, wallet);
      console.log(`Loaded wallet: ${wallet.id} (${wallet.pubkey})`);
    }
  }

  private async loadActivePositions(): Promise<void> {
    const positions = await this.database.getOpenPositions();
    for (const position of positions) {
      this.activePositions.set(position.id, position);
      this.priceFeed.subscribe(position.mint);
      console.log(`Loaded active position: ${position.id} for ${position.mint}`);
    }
  }

  private startWalletEngines(): void {
    for (const wallet of this.wallets.values()) {
      this.startWalletEngine(wallet);
    }
  }

  private startWalletEngine(wallet: Wallet): void {
    console.log(`Starting engine for wallet ${wallet.id}`);
    
    // Listen for new token launches
    this.on('tokenLaunch', async (launch: TokenLaunch) => {
      await this.handleTokenLaunch(wallet, launch);
    });

    // Listen for price updates for active positions
    this.priceFeed.on('priceUpdate', async (priceUpdate) => {
      await this.handlePriceUpdate(wallet, priceUpdate);
    });
  }

  private async handleTokenLaunch(wallet: Wallet, launch: TokenLaunch): Promise<void> {
    if (wallet.busy) {
      console.log(`Wallet ${wallet.id} is busy, skipping launch ${launch.mint}`);
      return;
    }

    if (!passesSafetyFilters(launch, this.settings)) {
      console.log(`Launch ${launch.mint} failed safety filters`);
      return;
    }

    const riskScore = calculateRiskScore(launch);
    const recommendedSlippage = getRecommendedSlippage(riskScore);
    const walletBalance = await this.executor.getWalletBalance(wallet.id);
    const recommendedSize = getRecommendedPositionSize(walletBalance, riskScore);

    if (recommendedSize < 0.01) { // Minimum 0.01 SOL
      console.log(`Position size too small for wallet ${wallet.id}: ${recommendedSize}`);
      return;
    }

    const intent: SnipeIntent = {
      mint: launch.mint,
      route: `SOL->${launch.mint}`,
      walletId: wallet.id,
      sizeSOL: recommendedSize,
      maxSlippagePct: recommendedSlippage,
      mode: riskScore > 6 ? 'conservative' : riskScore > 3 ? 'balanced' : 'aggressive',
    };

    await this.executeSnipe(wallet, intent);
  }

  private async executeSnipe(wallet: Wallet, intent: SnipeIntent): Promise<void> {
    try {
      console.log(`Executing snipe for wallet ${wallet.id} on ${intent.mint}`);
      
      // Set wallet as busy
      await this.executor.setWalletBusy(wallet.id, true);
      wallet.busy = true;

      // Simulate the swap
      const simResult = await this.executor.simulateSwap(intent);
      if (!simResult.ok) {
        console.log(`Simulation failed for ${intent.mint}: ${simResult.error}`);
        await this.executor.setWalletBusy(wallet.id, false);
        wallet.busy = false;
        return;
      }

      // Pre-sign the transaction
      const transaction = await this.executor.preSignSwap(wallet.id, intent);
      
      // Submit the transaction
      const submitResult = await this.executor.submitTransaction(transaction);
      if (!submitResult.confirmed) {
        console.log(`Transaction failed for ${intent.mint}: ${submitResult.error}`);
        await this.executor.setWalletBusy(wallet.id, false);
        wallet.busy = false;
        return;
      }

      // Create position
      const position: Omit<Position, 'createdAt' | 'updatedAt'> = {
        id: uuidv4(),
        walletId: wallet.id,
        mint: intent.mint,
        baseQty: submitResult.fillQty,
        avgCost: submitResult.fillPrice,
        tpPct: 0.5, // 50% take profit
        slPct: 0.2, // 20% stop loss
        trailingPct: 0.15, // 15% trailing stop
        status: 'open',
      };

      const createdPosition = await this.database.createPosition(position);
      this.activePositions.set(createdPosition.id, createdPosition);

      // Create trade record
      const trade: Omit<Trade, 'timestamp'> = {
        id: uuidv4(),
        walletId: wallet.id,
        positionId: createdPosition.id,
        side: 'buy',
        qty: submitResult.fillQty,
        price: submitResult.fillPrice,
        fee: 0.0005, // Mock fee
        txSig: submitResult.signature,
      };

      await this.database.createTrade(trade);

      // Subscribe to price updates
      this.priceFeed.subscribe(intent.mint);

      // Send notification
      await this.pushService.notify(wallet.id, {
        title: 'Sol $natcher: Entry Filled',
        body: `${intent.mint} ${submitResult.fillQty} @ ${submitResult.fillPrice}`,
        data: { positionId: createdPosition.id, walletId: wallet.id },
      });

      console.log(`Successfully opened position ${createdPosition.id} for wallet ${wallet.id}`);

    } catch (error) {
      console.error(`Error executing snipe for wallet ${wallet.id}:`, error);
      await this.executor.setWalletBusy(wallet.id, false);
      wallet.busy = false;
    }
  }

  private async handlePriceUpdate(wallet: Wallet, priceUpdate: any): Promise<void> {
    const walletPositions = Array.from(this.activePositions.values())
      .filter(pos => pos.walletId === wallet.id && pos.status === 'open');

    for (const position of walletPositions) {
      if (position.mint === priceUpdate.mint) {
        await this.checkExitConditions(wallet, position, priceUpdate.price);
      }
    }
  }

  private async checkExitConditions(wallet: Wallet, position: Position, currentPrice: number): Promise<void> {
    const tpPrice = position.avgCost * (1 + position.tpPct);
    const slPrice = position.avgCost * (1 - position.slPct);
    
    let shouldExit = false;
    let exitReason = '';

    if (currentPrice >= tpPrice) {
      shouldExit = true;
      exitReason = 'take_profit';
    } else if (currentPrice <= slPrice) {
      shouldExit = true;
      exitReason = 'stop_loss';
    }

    if (shouldExit) {
      await this.executeExit(wallet, position, currentPrice, exitReason);
    }
  }

  private async executeExit(wallet: Wallet, position: Position, exitPrice: number, reason: string): Promise<void> {
    try {
      console.log(`Executing exit for position ${position.id} (${reason})`);

      const sellIntent: SnipeIntent = {
        mint: position.mint,
        route: `${position.mint}->SOL`,
        walletId: wallet.id,
        sizeSOL: position.baseQty,
        maxSlippagePct: 0.1, // 10% slippage for exits
        mode: 'aggressive',
      };

      // Pre-sign sell transaction
      const transaction = await this.executor.preSignSwap(wallet.id, sellIntent);
      
      // Submit sell transaction
      const submitResult = await this.executor.submitTransaction(transaction);
      if (!submitResult.confirmed) {
        console.log(`Exit transaction failed for position ${position.id}: ${submitResult.error}`);
        return;
      }

      // Calculate P&L
      const realizedSOL = (submitResult.fillQty * submitResult.fillPrice) - (position.baseQty * position.avgCost);
      const realizedUSD = realizedSOL * 100; // Mock USD conversion

      // Update position status
      await this.database.updatePosition(position.id, { status: 'closed' });
      this.activePositions.delete(position.id);

      // Create trade record
      const trade: Omit<Trade, 'timestamp'> = {
        id: uuidv4(),
        walletId: wallet.id,
        positionId: position.id,
        side: 'sell',
        qty: submitResult.fillQty,
        price: submitResult.fillPrice,
        fee: 0.0005, // Mock fee
        txSig: submitResult.signature,
      };

      await this.database.createTrade(trade);

      // Create P&L record
      await this.database.createPnL({
        positionId: position.id,
        realizedSOL,
        realizedUSD,
      });

      // Unsubscribe from price updates
      this.priceFeed.unsubscribe(position.mint);

      // Set wallet as not busy
      await this.executor.setWalletBusy(wallet.id, false);
      wallet.busy = false;

      // Send notification
      await this.pushService.notify(wallet.id, {
        title: 'Sol $natcher: Profit Realized',
        body: `+${realizedUSD.toFixed(2)} USD (${realizedSOL.toFixed(4)} SOL) - ${reason}`,
        data: { positionId: position.id, walletId: wallet.id, pnl: realizedUSD },
      });

      console.log(`Successfully closed position ${position.id} with P&L: ${realizedUSD} USD`);

    } catch (error) {
      console.error(`Error executing exit for position ${position.id}:`, error);
    }
  }

  async start(): Promise<void> {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('Snatcher Orchestrator started');
  }

  async stop(): Promise<void> {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    this.priceFeed.destroy();
    console.log('Snatcher Orchestrator stopped');
  }

  // Public methods for external control
  async simulateTokenLaunch(launch: TokenLaunch): Promise<void> {
    this.emit('tokenLaunch', launch);
  }

  getWalletStatus(walletId: string): Wallet | undefined {
    return this.wallets.get(walletId);
  }

  getAllWallets(): Wallet[] {
    return Array.from(this.wallets.values());
  }

  getActivePositions(walletId?: string): Position[] {
    const positions = Array.from(this.activePositions.values());
    return walletId ? positions.filter(pos => pos.walletId === walletId) : positions;
  }
}