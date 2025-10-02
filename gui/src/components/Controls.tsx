import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

const ControlsContainer = styled(motion.div)`
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

const ControlGroup = styled.div`
  margin-bottom: 20px;
`;

const ControlLabel = styled.label`
  display: block;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  margin-bottom: 8px;
`;

const ControlInput = styled.input`
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 0.9rem;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
  
  &:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.2);
  }
`;

const ControlSelect = styled.select`
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 0.9rem;
  
  &:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.2);
  }
  
  option {
    background: #333;
    color: white;
  }
`;

const ControlButton = styled.button`
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  font-size: 0.9rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 10px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const TestLaunchForm = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 15px;
  margin-top: 15px;
`;

const TestLaunchTitle = styled.h3`
  color: white;
  margin: 0 0 15px 0;
  font-size: 1.1rem;
`;

export const Controls: React.FC = () => {
  const [testLaunch, setTestLaunch] = useState({
    mint: '',
    poolAddress: '',
    dex: 'Raydium',
    liquidityUSD: 100000,
    creatorAddress: '',
    lpLocked: true,
    mintAuthorityRevoked: true,
    devSupplyPct: 0.1,
  });

  const handleSimulateLaunch = async () => {
    if (!testLaunch.mint || !testLaunch.poolAddress) {
      toast.error('Please fill in mint and pool address');
      return;
    }

    try {
      await apiService.simulateLaunch({
        ...testLaunch,
        timestamp: Date.now(),
        flags: [],
      });
      toast.success('Test launch simulated successfully!');
    } catch (error) {
      toast.error('Failed to simulate launch');
    }
  };

  const handleEmergencyStop = () => {
    toast.error('Emergency stop not implemented yet');
  };

  const handleRefreshData = () => {
    window.location.reload();
  };

  return (
    <ControlsContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Title>Controls</Title>

      <ControlGroup>
        <ControlButton onClick={handleRefreshData}>
          🔄 Refresh Data
        </ControlButton>
      </ControlGroup>

      <ControlGroup>
        <ControlButton 
          onClick={handleEmergencyStop}
          style={{ background: 'linear-gradient(45deg, #ff6b6b, #ee5a24)' }}
        >
          🚨 Emergency Stop
        </ControlButton>
      </ControlGroup>

      <TestLaunchForm>
        <TestLaunchTitle>Test Launch</TestLaunchTitle>
        
        <ControlGroup>
          <ControlLabel>Token Mint</ControlLabel>
          <ControlInput
            type="text"
            placeholder="Enter token mint address"
            value={testLaunch.mint}
            onChange={(e) => setTestLaunch({ ...testLaunch, mint: e.target.value })}
          />
        </ControlGroup>

        <ControlGroup>
          <ControlLabel>Pool Address</ControlLabel>
          <ControlInput
            type="text"
            placeholder="Enter pool address"
            value={testLaunch.poolAddress}
            onChange={(e) => setTestLaunch({ ...testLaunch, poolAddress: e.target.value })}
          />
        </ControlGroup>

        <ControlGroup>
          <ControlLabel>DEX</ControlLabel>
          <ControlSelect
            value={testLaunch.dex}
            onChange={(e) => setTestLaunch({ ...testLaunch, dex: e.target.value })}
          >
            <option value="Raydium">Raydium</option>
            <option value="Orca">Orca</option>
            <option value="Meteora">Meteora</option>
            <option value="Jupiter">Jupiter</option>
          </ControlSelect>
        </ControlGroup>

        <ControlGroup>
          <ControlLabel>Liquidity (USD)</ControlLabel>
          <ControlInput
            type="number"
            placeholder="Enter liquidity amount"
            value={testLaunch.liquidityUSD}
            onChange={(e) => setTestLaunch({ ...testLaunch, liquidityUSD: parseFloat(e.target.value) })}
          />
        </ControlGroup>

        <ControlGroup>
          <ControlLabel>Creator Address</ControlLabel>
          <ControlInput
            type="text"
            placeholder="Enter creator address"
            value={testLaunch.creatorAddress}
            onChange={(e) => setTestLaunch({ ...testLaunch, creatorAddress: e.target.value })}
          />
        </ControlGroup>

        <ControlButton onClick={handleSimulateLaunch}>
          🚀 Simulate Launch
        </ControlButton>
      </TestLaunchForm>
    </ControlsContainer>
  );
};