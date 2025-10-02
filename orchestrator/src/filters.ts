import { TokenLaunch } from './types';

export interface SafetySettings {
  minLiquidityUSD: number;
  devSupplyMaxPct: number;
  blacklist: string[];
  requireLpLocked: boolean;
  requireMintAuthorityRevoked: boolean;
  maxCreatorSupplyPct: number;
}

export function passesSafetyFilters(launch: TokenLaunch, settings: SafetySettings): boolean {
  // Check liquidity threshold
  if (launch.liquidityUSD < settings.minLiquidityUSD) {
    console.log(`Launch ${launch.mint} failed liquidity check: ${launch.liquidityUSD} < ${settings.minLiquidityUSD}`);
    return false;
  }

  // Check dev supply percentage
  if (launch.devSupplyPct > settings.devSupplyMaxPct) {
    console.log(`Launch ${launch.mint} failed dev supply check: ${launch.devSupplyPct} > ${settings.devSupplyMaxPct}`);
    return false;
  }

  // Check blacklist
  if (settings.blacklist.includes(launch.mint)) {
    console.log(`Launch ${launch.mint} is blacklisted`);
    return false;
  }

  // Check LP lock status
  if (settings.requireLpLocked && !launch.lpLocked) {
    console.log(`Launch ${launch.mint} failed LP lock check`);
    return false;
  }

  // Check mint authority revocation
  if (settings.requireMintAuthorityRevoked && !launch.mintAuthorityRevoked) {
    console.log(`Launch ${launch.mint} failed mint authority check`);
    return false;
  }

  // Check creator supply percentage
  if (launch.devSupplyPct > settings.maxCreatorSupplyPct) {
    console.log(`Launch ${launch.mint} failed creator supply check: ${launch.devSupplyPct} > ${settings.maxCreatorSupplyPct}`);
    return false;
  }

  // Check for suspicious flags
  const suspiciousFlags = ['honeypot', 'rug_pull', 'scam', 'fake'];
  const hasSuspiciousFlags = launch.flags.some(flag => 
    suspiciousFlags.some(suspicious => flag.toLowerCase().includes(suspicious))
  );

  if (hasSuspiciousFlags) {
    console.log(`Launch ${launch.mint} has suspicious flags: ${launch.flags.join(', ')}`);
    return false;
  }

  console.log(`Launch ${launch.mint} passed all safety filters`);
  return true;
}

export function calculateRiskScore(launch: TokenLaunch): number {
  let riskScore = 0;

  // Liquidity risk (lower liquidity = higher risk)
  if (launch.liquidityUSD < 100000) riskScore += 3;
  else if (launch.liquidityUSD < 500000) riskScore += 2;
  else if (launch.liquidityUSD < 1000000) riskScore += 1;

  // Dev supply risk (higher dev supply = higher risk)
  if (launch.devSupplyPct > 0.5) riskScore += 3;
  else if (launch.devSupplyPct > 0.3) riskScore += 2;
  else if (launch.devSupplyPct > 0.1) riskScore += 1;

  // LP lock risk
  if (!launch.lpLocked) riskScore += 2;

  // Mint authority risk
  if (!launch.mintAuthorityRevoked) riskScore += 2;

  // Age risk (newer tokens are riskier)
  const ageHours = (Date.now() - launch.timestamp) / (1000 * 60 * 60);
  if (ageHours < 1) riskScore += 2;
  else if (ageHours < 6) riskScore += 1;

  return Math.min(riskScore, 10); // Cap at 10
}

export function getRecommendedSlippage(riskScore: number): number {
  // Higher risk = higher slippage tolerance
  if (riskScore >= 8) return 0.15; // 15%
  if (riskScore >= 6) return 0.10; // 10%
  if (riskScore >= 4) return 0.08; // 8%
  if (riskScore >= 2) return 0.05; // 5%
  return 0.03; // 3%
}

export function getRecommendedPositionSize(balance: number, riskScore: number): number {
  // Higher risk = smaller position size
  const baseRiskPct = 0.15; // 15% base risk
  
  if (riskScore >= 8) return balance * baseRiskPct * 0.5; // 7.5%
  if (riskScore >= 6) return balance * baseRiskPct * 0.7; // 10.5%
  if (riskScore >= 4) return balance * baseRiskPct * 0.8; // 12%
  if (riskScore >= 2) return balance * baseRiskPct * 0.9; // 13.5%
  return balance * baseRiskPct; // 15%
}