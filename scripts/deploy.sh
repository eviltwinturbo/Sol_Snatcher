#!/bin/bash

# Sol $natcher Deployment Script
# This script automates the deployment process

set -e

echo "🚀 Sol $natcher Deployment Script"
echo "=================================="

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo "❌ This script should not be run as root"
   exit 1
fi

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    exit 1
fi

echo "✅ Prerequisites check passed"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration before continuing"
    echo "   Press Enter when ready to continue..."
    read
fi

# Generate VAPID keys if not present
if ! grep -q "VAPID_PUBLIC=" .env || grep -q "your_vapid_public_key_here" .env; then
    echo "🔑 Generating VAPID keys..."
    node scripts/generate-vapid-keys.js
    
    echo "📝 Please update your .env file with the generated VAPID keys"
    echo "   Press Enter when ready to continue..."
    read
fi

# Setup wallets if not present
if [ ! -f wallets/registry.json ] || [ ! -s wallets/registry.json ]; then
    echo "💰 Setting up wallets..."
    if command -v solana-keygen &> /dev/null; then
        node scripts/setup-wallets.js
    else
        echo "⚠️  Solana CLI not found. Please install it and run:"
        echo "   node scripts/setup-wallets.js"
        echo "   Press Enter when ready to continue..."
        read
    fi
fi

# Create secure directories
echo "📁 Creating secure directories..."
sudo mkdir -p /secure/wallets
sudo chown -R $USER:$USER /secure/wallets
chmod 700 /secure/wallets

# Copy wallet files if they exist
if [ -d wallets ] && [ "$(ls -A wallets/*.json 2>/dev/null)" ]; then
    echo "📋 Copying wallet files..."
    cp wallets/*.json /secure/wallets/
    chmod 600 /secure/wallets/*.json
fi

# Build and start services
echo "🔨 Building and starting services..."
docker compose build
docker compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check service health
echo "🏥 Checking service health..."
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ Orchestrator service is healthy"
else
    echo "❌ Orchestrator service is not responding"
fi

if curl -f http://localhost:8080/health > /dev/null 2>&1; then
    echo "✅ Sol-exec service is healthy"
else
    echo "❌ Sol-exec service is not responding"
fi

# Setup systemd service
echo "⚙️  Setting up systemd service..."
sudo cp systemd/sol-snatcher.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable sol-snatcher.service

echo "🎉 Deployment completed!"
echo "======================"
echo ""
echo "Services are running:"
echo "• Web GUI: http://localhost"
echo "• API: http://localhost/api"
echo "• Health Check: http://localhost/health"
echo ""
echo "To manage services:"
echo "• Start: sudo systemctl start sol-snatcher"
echo "• Stop: sudo systemctl stop sol-snatcher"
echo "• Status: sudo systemctl status sol-snatcher"
echo "• Logs: docker compose logs -f"
echo ""
echo "📱 Mobile Apps:"
echo "• Android: Build and install from android/ directory"
echo "• iOS: Build and install from ios/ directory"
echo ""
echo "⚠️  Remember to:"
echo "• Fund your wallets with SOL"
echo "• Configure your trading parameters"
echo "• Test with small amounts first"
echo "• Monitor your positions regularly"