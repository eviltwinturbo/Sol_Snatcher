import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import { Wallet, Position } from '../types';
import { apiService } from '../services/api';
import snipeAnimation from '../assets/lottie/snipe.json';
import profitAnimation from '../assets/lottie/profit.json';

const PanelContainer = styled(motion.div)<{ $walletId: string; $isBusy: boolean }>`
  background: linear-gradient(135deg, 
    ${props => props.$walletId === 'wallet1' ? '#667eea' : 
      props.$walletId === 'wallet2' ? '#f093fb' :
      props.$walletId === 'wallet3' ? '#4facfe' :
      props.$walletId === 'wallet4' ? '#43e97b' :
      props.$walletId === 'wallet5' ? '#fa709a' :
      '#ffecd2'} 0%, 
    ${props => props.$walletId === 'wallet1' ? '#764ba2' : 
      props.$walletId === 'wallet2' ? '#f5576c' :
      props.$walletId === 'wallet3' ? '#00f2fe' :
      props.$walletId === 'wallet4' ? '#38f9d7' :
      props.$walletId === 'wallet5' ? '#fee140' :
      '#fcb69f'} 100%);
  border-radius: 20px;
  padding: 20px;
  margin: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: hidden;
  min-height: 300px;
  opacity: ${props => props.$isBusy ? 0.7 : 1};
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
  }
`;

const WalletHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const WalletTitle = styled.h3`
  color: white;
  margin: 0;
  font-size: 1.5rem;
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const StatusIndicator = styled.div<{ $isBusy: boolean }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${props => props.$isBusy ? '#ff6b6b' : '#51cf66'};
  box-shadow: 0 0 10px ${props => props.$isBusy ? '#ff6b6b' : '#51cf66'};
  animation: ${props => props.$isBusy ? 'pulse 2s infinite' : 'none'};

  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
`;

const AnimationContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  z-index: 1;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-top: 20px;
  z-index: 2;
  position: relative;
`;

const InfoItem = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  padding: 15px;
  text-align: center;
`;

const InfoLabel = styled.div`
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  margin-bottom: 5px;
`;

const InfoValue = styled.div`
  color: white;
  font-size: 1.2rem;
  font-weight: bold;
`;

const PnLIndicator = styled.div<{ $isPositive: boolean }>`
  color: ${props => props.$isPositive ? '#51cf66' : '#ff6b6b'};
  font-size: 1.4rem;
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

interface WalletPanelProps {
  wallet: Wallet;
  position?: Position;
}

export const WalletPanel: React.FC<WalletPanelProps> = ({ wallet, position }) => {
  const [currentAnimation, setCurrentAnimation] = useState<any>(null);
  const [lastEvent, setLastEvent] = useState<string>('');

  useEffect(() => {
    // Play animation based on wallet status
    if (wallet.busy) {
      setCurrentAnimation(snipeAnimation);
      setLastEvent('snipe');
    } else if (wallet.totalPnL > 0) {
      setCurrentAnimation(profitAnimation);
      setLastEvent('profit');
    } else {
      setCurrentAnimation(null);
      setLastEvent('');
    }
  }, [wallet.busy, wallet.totalPnL]);

  const formatBalance = (balance: number) => {
    return `${balance.toFixed(4)} SOL`;
  };

  const formatPnL = (pnl: number) => {
    const sign = pnl >= 0 ? '+' : '';
    return `${sign}${pnl.toFixed(2)} USD`;
  };

  const formatPercentage = (percentage: number) => {
    return `${(percentage * 100).toFixed(1)}%`;
  };

  return (
    <PanelContainer
      $walletId={wallet.id}
      $isBusy={wallet.busy}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <WalletHeader>
        <WalletTitle>{wallet.id.toUpperCase()}</WalletTitle>
        <StatusIndicator $isBusy={wallet.busy} />
      </WalletHeader>

      {currentAnimation && (
        <AnimationContainer>
          <Lottie
            animationData={currentAnimation}
            loop={wallet.busy}
            autoplay={true}
            style={{ width: '100%', height: '100%' }}
          />
        </AnimationContainer>
      )}

      <InfoGrid>
        <InfoItem>
          <InfoLabel>Balance</InfoLabel>
          <InfoValue>{formatBalance(wallet.balance)}</InfoValue>
        </InfoItem>

        <InfoItem>
          <InfoLabel>Risk Per Trade</InfoLabel>
          <InfoValue>{formatPercentage(wallet.riskPctPerTrade)}</InfoValue>
        </InfoItem>

        <InfoItem>
          <InfoLabel>Daily P&L</InfoLabel>
          <PnLIndicator $isPositive={wallet.dailyPnL >= 0}>
            {formatPnL(wallet.dailyPnL)}
          </PnLIndicator>
        </InfoItem>

        <InfoItem>
          <InfoLabel>Total P&L</InfoLabel>
          <PnLIndicator $isPositive={wallet.totalPnL >= 0}>
            {formatPnL(wallet.totalPnL)}
          </PnLIndicator>
        </InfoItem>

        {position && (
          <>
            <InfoItem>
              <InfoLabel>Token</InfoLabel>
              <InfoValue>{position.mint.slice(0, 8)}...</InfoValue>
            </InfoItem>

            <InfoItem>
              <InfoLabel>Quantity</InfoLabel>
              <InfoValue>{position.baseQty.toFixed(2)}</InfoValue>
            </InfoItem>

            <InfoItem>
              <InfoLabel>Avg Cost</InfoLabel>
              <InfoValue>${position.avgCost.toFixed(6)}</InfoValue>
            </InfoItem>

            <InfoItem>
              <InfoLabel>Take Profit</InfoLabel>
              <InfoValue>{formatPercentage(position.tpPct)}</InfoValue>
            </InfoItem>
          </>
        )}
      </InfoGrid>
    </PanelContainer>
  );
};