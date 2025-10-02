import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { SystemStatus } from '../types';

const OverviewContainer = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 25px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
`;

const Title = styled.h2`
  color: white;
  margin: 0 0 20px 0;
  font-size: 1.5rem;
  font-weight: bold;
  text-align: center;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
`;

const StatItem = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 15px;
  text-align: center;
`;

const StatValue = styled.div`
  color: white;
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
`;

const PnLIndicator = styled.div<{ $isPositive: boolean }>`
  color: ${props => props.$isPositive ? '#51cf66' : '#ff6b6b'};
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 5px;
`;

const ActivityIndicator = styled.div`
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
`;

const ActivityTitle = styled.h3`
  color: white;
  margin: 0 0 15px 0;
  font-size: 1.1rem;
`;

const ActivityItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding: 8px 0;
`;

const ActivityLabel = styled.span`
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
`;

const ActivityValue = styled.span`
  color: white;
  font-weight: bold;
  font-size: 0.9rem;
`;

interface SystemOverviewProps {
  status: SystemStatus;
}

export const SystemOverview: React.FC<SystemOverviewProps> = ({ status }) => {
  const formatBalance = (balance: number) => {
    return `${balance.toFixed(4)} SOL`;
  };

  const formatPnL = (pnl: number) => {
    const sign = pnl >= 0 ? '+' : '';
    return `${sign}${pnl.toFixed(2)} USD`;
  };

  const getPnLColor = (pnl: number) => {
    return pnl >= 0 ? '#51cf66' : '#ff6b6b';
  };

  return (
    <OverviewContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Title>System Overview</Title>
      
      <StatsGrid>
        <StatItem>
          <StatValue>{status.wallets}</StatValue>
          <StatLabel>Total Wallets</StatLabel>
        </StatItem>
        
        <StatItem>
          <StatValue>{status.activePositions}</StatValue>
          <StatLabel>Active Positions</StatLabel>
        </StatItem>
        
        <StatItem>
          <StatValue>{status.busyWallets}</StatValue>
          <StatLabel>Busy Wallets</StatLabel>
        </StatItem>
        
        <StatItem>
          <StatValue>{formatBalance(status.totalBalance)}</StatValue>
          <StatLabel>Total Balance</StatLabel>
        </StatItem>
      </StatsGrid>

      <ActivityIndicator>
        <ActivityTitle>Performance</ActivityTitle>
        
        <ActivityItem>
          <ActivityLabel>Total P&L</ActivityLabel>
          <ActivityValue style={{ color: getPnLColor(status.totalPnL) }}>
            {formatPnL(status.totalPnL)}
          </ActivityValue>
        </ActivityItem>
        
        <ActivityItem>
          <ActivityLabel>Success Rate</ActivityLabel>
          <ActivityValue>
            {status.wallets > 0 ? 
              `${((status.wallets - status.busyWallets) / status.wallets * 100).toFixed(1)}%` : 
              '0%'
            }
          </ActivityValue>
        </ActivityItem>
        
        <ActivityItem>
          <ActivityLabel>Avg Position Size</ActivityLabel>
          <ActivityValue>
            {status.wallets > 0 ? 
              `${(status.totalBalance / status.wallets).toFixed(4)} SOL` : 
              '0 SOL'
            }
          </ActivityValue>
        </ActivityItem>
      </ActivityIndicator>
    </OverviewContainer>
  );
};