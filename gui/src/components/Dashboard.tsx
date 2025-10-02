import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Wallet, Position, SystemStatus } from '../types';
import { apiService } from '../services/api';
import { notificationService } from '../services/notifications';
import { WalletPanel } from './WalletPanel';
import { SystemOverview } from './SystemOverview';
import { Controls } from './Controls';
import { Toaster } from 'react-hot-toast';

const DashboardContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 30px;
`;

const Title = styled.h1`
  color: white;
  font-size: 3rem;
  font-weight: bold;
  margin: 0;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  background: linear-gradient(45deg, #fff, #f0f0f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.2rem;
  margin: 10px 0 0 0;
`;

const MainContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 30px;
  max-width: 1400px;
  margin: 0 auto;
`;

const WalletsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const NotificationBanner = styled(motion.div)<{ $show: boolean }>`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 20px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  display: ${props => props.$show ? 'block' : 'none'};
`;

const NotificationTitle = styled.h3`
  color: white;
  margin: 0 0 10px 0;
  font-size: 1.2rem;
`;

const NotificationText = styled.p`
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 15px 0;
  font-size: 0.9rem;
`;

const NotificationButton = styled.button`
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 0.9rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  }
`;

export const Dashboard: React.FC = () => {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNotificationBanner, setShowNotificationBanner] = useState(false);

  useEffect(() => {
    loadData();
    checkNotificationSupport();
    
    // Set up polling for real-time updates
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [walletsData, positionsData, statusData] = await Promise.all([
        apiService.getWallets(),
        apiService.getPositions(),
        apiService.getSystemStatus(),
      ]);

      setWallets(walletsData);
      setPositions(positionsData);
      setSystemStatus(statusData);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load data:', error);
      setLoading(false);
    }
  };

  const checkNotificationSupport = () => {
    if (notificationService.isSupported() && 
        notificationService.getPermissionStatus() === 'default') {
      setShowNotificationBanner(true);
    }
  };

  const enableNotifications = async () => {
    try {
      await notificationService.initialize();
      
      // Subscribe all wallets to notifications
      for (const wallet of wallets) {
        await notificationService.subscribeToWallet(wallet.id);
      }
      
      setShowNotificationBanner(false);
    } catch (error) {
      console.error('Failed to enable notifications:', error);
    }
  };

  const getWalletPosition = (walletId: string): Position | undefined => {
    return positions.find(pos => pos.walletId === walletId && pos.status === 'open');
  };

  if (loading) {
    return (
      <DashboardContainer>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          color: 'white',
          fontSize: '1.5rem'
        }}>
          Loading Sol $natcher...
        </div>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <Header>
        <Title>Sol $natcher</Title>
        <Subtitle>Autonomous Solana Sniping Bot</Subtitle>
      </Header>

      {showNotificationBanner && (
        <NotificationBanner
          $show={showNotificationBanner}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <NotificationTitle>🔔 Enable Notifications</NotificationTitle>
          <NotificationText>
            Get real-time alerts for successful entries and profitable exits. 
            Click below to enable push notifications.
          </NotificationText>
          <NotificationButton onClick={enableNotifications}>
            Enable Notifications
          </NotificationButton>
        </NotificationBanner>
      )}

      <MainContent>
        <WalletsSection>
          {wallets.map((wallet) => (
            <WalletPanel
              key={wallet.id}
              wallet={wallet}
              position={getWalletPosition(wallet.id)}
            />
          ))}
        </WalletsSection>

        <Sidebar>
          {systemStatus && (
            <SystemOverview status={systemStatus} />
          )}
          <Controls />
        </Sidebar>
      </MainContent>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            backdropFilter: 'blur(10px)',
          },
        }}
      />
    </DashboardContainer>
  );
};