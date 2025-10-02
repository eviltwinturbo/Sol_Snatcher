# Sol $natcher Deployment Guide

This guide covers deploying Sol $natcher on Azure VM with full production setup.

## 🏗️ Infrastructure Requirements

### Azure VM Specifications

- **Size**: Standard D8s v5 (8 vCPUs, 32 GB RAM)
- **OS**: Ubuntu 22.04 LTS
- **Storage**: 256 GB SSD
- **Network**: Accelerated networking enabled
- **Ports**: 80, 443, 22 (SSH)

### Resource Requirements

- **CPU**: 4+ cores recommended
- **RAM**: 8+ GB recommended
- **Storage**: 100+ GB SSD
- **Network**: Stable internet connection
- **Bandwidth**: High bandwidth for RPC calls

## 🚀 Deployment Steps

### 1. Provision Azure VM

```bash
# Create resource group
az group create --name sol-snatcher-rg --location eastus

# Create VM
az vm create \
  --resource-group sol-snatcher-rg \
  --name sol-snatcher-vm \
  --image Ubuntu2204 \
  --size Standard_D8s_v5 \
  --admin-username azureuser \
  --generate-ssh-keys \
  --accelerated-networking true \
  --public-ip-sku Standard
```

### 2. Configure VM

```bash
# Connect to VM
ssh azureuser@<vm-ip>

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install additional tools
sudo apt install -y git curl wget htop nginx certbot python3-certbot-nginx
```

### 3. Clone Repository

```bash
# Clone the repository
git clone <repository-url>
cd sol-snatcher

# Set up environment
cp .env.example .env
```

### 4. Configure Environment

Edit `.env` file:

```bash
# Production RPC endpoints
RPC_ENDPOINTS=https://api.mainnet-beta.solana.com,https://solana-api.projectserum.com,https://rpc.ankr.com/solana

# Database configuration
POSTGRES_USER=snatcher
POSTGRES_PASSWORD=<strong-password>
POSTGRES_DB=snatcher
PG_URL=postgres://snatcher:<strong-password>@postgres/snatcher

# Redis configuration
REDIS_URL=redis://redis:6379

# Trading parameters
MIN_LIQUIDITY_USD=50000
DEV_SUPPLY_MAX_PCT=0.25
MAX_CREATOR_SUPPLY_PCT=0.3
TP_PCT=0.5
SL_PCT=0.2
TRAILING_PCT=0.15

# Generate VAPID keys
npx web-push generate-vapid-keys
# Add the generated keys to .env

# Blacklist (comma-separated)
BLACKLIST=
```

### 5. Setup SSL Certificate

```bash
# Install SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 6. Configure Wallets

```bash
# Create secure wallet directory
sudo mkdir -p /secure/wallets
sudo chown -R $USER:$USER /secure/wallets
chmod 700 /secure/wallets

# Generate wallets (example with Solana CLI)
solana-keygen new --outfile /secure/wallets/w1.json
solana-keygen new --outfile /secure/wallets/w2.json
solana-keygen new --outfile /secure/wallets/w3.json
solana-keygen new --outfile /secure/wallets/w4.json
solana-keygen new --outfile /secure/wallets/w5.json
solana-keygen new --outfile /secure/wallets/w6.json

# Update registry.json with public keys
# Extract public keys and update the registry
```

### 7. Deploy Services

```bash
# Build and start services
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f
```

### 8. Setup Systemd Service

```bash
# Copy systemd service file
sudo cp systemd/sol-snatcher.service /etc/systemd/system/

# Enable and start service
sudo systemctl enable sol-snatcher.service
sudo systemctl start sol-snatcher.service

# Check status
sudo systemctl status sol-snatcher.service
```

### 9. Configure Firewall

```bash
# Configure UFW
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 10. Setup Monitoring

```bash
# Install monitoring tools
sudo apt install -y htop iotop nethogs

# Setup log rotation
sudo nano /etc/logrotate.d/sol-snatcher
```

## 📱 Mobile App Deployment

### Android App

#### Build Release APK

```bash
cd android
./gradlew assembleRelease

# Sign APK (if needed)
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.keystore app-release-unsigned.apk alias_name
```

#### Deploy to Google Play Store

1. Create Google Play Console account
2. Upload signed APK
3. Configure app listing
4. Submit for review

### iOS App

#### Build for App Store

```bash
cd ios/SolSnatcher
xcodebuild -scheme SolSnatcher -configuration Release archive
```

#### Deploy to App Store

1. Create Apple Developer account
2. Upload to App Store Connect
3. Configure app listing
4. Submit for review

## 🔧 Configuration

### Nginx Configuration

The nginx configuration includes:
- SSL/TLS termination
- Rate limiting
- Security headers
- Gzip compression
- Static file serving

### Database Configuration

PostgreSQL is configured with:
- Connection pooling
- Query optimization
- Backup scheduling
- Monitoring

### Redis Configuration

Redis is configured for:
- Memory optimization
- Persistence
- Clustering (if needed)
- Monitoring

## 📊 Monitoring Setup

### Health Checks

```bash
# Check service health
curl https://your-domain.com/health

# Check database
docker compose exec postgres pg_isready

# Check Redis
docker compose exec redis redis-cli ping
```

### Log Monitoring

```bash
# View logs
docker compose logs -f orchestrator
docker compose logs -f sol-exec
docker compose logs -f gui

# Setup log aggregation (optional)
# Install ELK stack or similar
```

### Performance Monitoring

```bash
# Monitor system resources
htop
iotop
nethogs

# Monitor Docker resources
docker stats
```

## 🔒 Security Hardening

### Container Security

```bash
# Run containers as non-root
# Use read-only filesystems where possible
# Limit container capabilities
# Use security profiles
```

### Network Security

```bash
# Configure firewall rules
sudo ufw status

# Use VPN for management access
# Implement IP whitelisting
# Enable DDoS protection
```

### Application Security

- Regular security updates
- Vulnerability scanning
- Code analysis
- Penetration testing

## 🚨 Troubleshooting

### Common Issues

1. **Service Won't Start**
   ```bash
   # Check logs
   docker compose logs
   
   # Check system resources
   free -h
   df -h
   ```

2. **Database Connection Issues**
   ```bash
   # Check PostgreSQL
   docker compose exec postgres pg_isready
   
   # Check connection string
   echo $PG_URL
   ```

3. **Wallet Issues**
   ```bash
   # Check wallet files
   ls -la /secure/wallets/
   
   # Check permissions
   stat /secure/wallets/w1.json
   ```

4. **Mobile App Issues**
   - Check API endpoint configuration
   - Verify network connectivity
   - Check app permissions

### Recovery Procedures

1. **Service Recovery**
   ```bash
   # Restart services
   docker compose restart
   
   # Rebuild if needed
   docker compose down
   docker compose up -d --build
   ```

2. **Database Recovery**
   ```bash
   # Restore from backup
   docker compose exec postgres pg_restore -d snatcher backup.sql
   ```

3. **Wallet Recovery**
   - Restore from secure backup
   - Update registry.json
   - Restart services

## 📈 Scaling

### Horizontal Scaling

- Multiple orchestrator instances
- Load balancer configuration
- Database clustering
- Redis clustering

### Vertical Scaling

- Increase VM size
- Add more memory
- Upgrade storage
- Optimize configurations

## 🔄 Backup Strategy

### Database Backups

```bash
# Daily backup script
#!/bin/bash
docker compose exec postgres pg_dump -U snatcher snatcher > backup_$(date +%Y%m%d).sql
```

### Wallet Backups

- Encrypted wallet backups
- Multiple backup locations
- Regular backup testing
- Secure key management

### Configuration Backups

- Version control
- Configuration management
- Change tracking
- Rollback procedures

## 📞 Support

For deployment support:
- Check logs first
- Review configuration
- Test connectivity
- Contact support team

---

**Production Deployment Complete** ✅