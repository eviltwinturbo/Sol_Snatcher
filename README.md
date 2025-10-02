# Sol $natcher - Autonomous Solana Sniping Bot

A fully autonomous Solana sniping bot with animated GUI, Chrome desktop notifications, and multi-wallet execution (up to 6 wallets in parallel). Features Android and iOS apps with floating widgets for real-time monitoring.

## 🚀 Features

- **Ultra-low latency detection**: Real-time DEX program events, pre-signed transactions, immediate submission
- **Smart safety filters**: Honeypot checks, mint authority revoked, LP burn/lock verified, minimum liquidity, dev wallet concentration caps, blacklist
- **Adaptive execution**: Dynamic slippage and capital scaling, immediate TP/SL/trailing stops
- **Full autonomy**: Watchdogs, circuit breakers, health probes, RPC failover
- **Animated GUI + sounds**: Live telemetry, Lottie animations, sound cues for entries/profits, per-wallet panels
- **Chrome notifications**: Web Push for realized profit and status updates
- **Multi-wallet**: Trade out of up to 6 wallets simultaneously, each isolated and able to run different tokens
- **Mobile apps**: Android and iOS apps with floating widgets for current holdings, wallet balance, and open positions

## 🏗️ Architecture

### Core Services

- **sol-exec (Rust)**: Solana client, event subscriptions, transaction building/simulation/submission/confirmation
- **snatcher-orchestrator (Node/TS)**: Strategy logic, safety filters, risk management, multi-wallet scheduling, Web Push server
- **snatcher-gui (React)**: Animated dashboard with per-wallet panels, controls, live telemetry, sound effects
- **Redis**: Low-latency pub/sub channels, caching
- **Postgres**: Durable storage for positions, trades, P&L, settings, wallet registry, audit logs
- **Nginx**: HTTPS reverse proxy for GUI/API, static assets, service worker

### Mobile Apps

- **Android App**: Native Android app with floating widgets, real-time updates, notification support
- **iOS App**: Native iOS app with floating widgets, real-time updates, notification support

## 📱 Mobile Apps

### Android App Features

- **Floating Widget**: Always-on-top widget showing wallet status and positions
- **Real-time Updates**: Live data refresh every 5 seconds
- **Notification Support**: Push notifications for trades and alerts
- **Expandable Interface**: Collapsible widget to save screen space
- **Multiple Wallet Support**: View all 6 wallets simultaneously

### iOS App Features

- **Floating Widget**: iOS-compatible floating interface
- **Real-time Updates**: Live data refresh every 5 seconds
- **Notification Support**: Push notifications for trades and alerts
- **Expandable Interface**: Collapsible widget to save screen space
- **Multiple Wallet Support**: View all 6 wallets simultaneously

## 🛠️ Tech Stack

- **Backend**: Rust (sol-exec), Node.js/TypeScript (orchestrator)
- **Frontend**: React/TypeScript (web GUI)
- **Mobile**: Kotlin (Android), Swift (iOS)
- **Database**: PostgreSQL, Redis
- **Infrastructure**: Docker Compose, Nginx, systemd
- **Deployment**: Azure VM, Docker containers

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 20+
- Rust 1.75+
- Android Studio (for Android app)
- Xcode (for iOS app)

### 1. Clone and Setup

```bash
git clone <repository-url>
cd sol-snatcher
cp .env.example .env
```

### 2. Configure Environment

Edit `.env` file with your settings:

```bash
# Solana RPC Endpoints
RPC_ENDPOINTS=https://api.mainnet-beta.solana.com,https://solana-api.projectserum.com

# Wallet Configuration
WALLET_REGISTRY=/secure/wallets/registry.json

# Database
POSTGRES_USER=snatcher
POSTGRES_PASSWORD=snatcherpass
POSTGRES_DB=snatcher

# Trading Parameters
MIN_LIQUIDITY_USD=50000
DEV_SUPPLY_MAX_PCT=0.25
TP_PCT=0.5
SL_PCT=0.2
TRAILING_PCT=0.15

# Notifications
VAPID_PUBLIC=your_vapid_public_key_here
VAPID_PRIVATE=your_vapid_private_key_here
```

### 3. Setup Wallets

1. Generate 6 Solana wallets
2. Update `wallets/registry.json` with public keys
3. Place private key files in `wallets/` directory
4. Set proper permissions (600)

### 4. Generate VAPID Keys

```bash
npx web-push generate-vapid-keys
```

### 5. Deploy Services

```bash
# Build and start all services
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f
```

### 6. Access Web Interface

Open your browser to `https://localhost` (or your server IP)

### 7. Build Mobile Apps

#### Android App

```bash
cd android
./gradlew assembleRelease
```

#### iOS App

```bash
cd ios/SolSnatcher
xcodebuild -scheme SolSnatcher -configuration Release
```

## 📊 Usage

### Web Interface

1. **Dashboard**: View all wallets, positions, and system status
2. **Controls**: Adjust risk parameters, simulate launches, emergency stop
3. **Notifications**: Enable push notifications for real-time alerts

### Mobile Apps

1. **Install**: Install the Android/iOS app
2. **Permissions**: Grant notification and overlay permissions
3. **Floating Widget**: Tap "Start Floating Widget" to begin monitoring
4. **Real-time Updates**: Widget automatically refreshes every 5 seconds

### Trading Parameters

- **Min Liquidity**: Minimum USD liquidity required for token launches
- **Dev Supply Max**: Maximum percentage of supply held by developers
- **Take Profit**: Percentage profit target for automatic exits
- **Stop Loss**: Percentage loss limit for automatic exits
- **Trailing Stop**: Percentage for trailing stop orders

## 🔒 Security

### Wallet Security

- Private keys stored in secure, isolated containers
- No shared keystore between wallets
- Hot wallet limits and monitoring
- Regular security audits recommended

### Network Security

- HTTPS with TLS 1.2/1.3
- Rate limiting and DDoS protection
- Input validation and sanitization
- Secure headers and CORS policies

### Operational Security

- Non-root containers
- Minimal attack surface
- Regular updates and patches
- Monitoring and alerting

## 📈 Monitoring

### Health Checks

- Service health endpoints
- Database connectivity
- RPC endpoint status
- Wallet balance monitoring

### Metrics

- Latency histograms
- Fill rates and success rates
- Error counts and types
- Per-wallet P&L tracking

### Alerts

- Service failures
- High drawdown alerts
- Price feed gaps
- RPC endpoint issues

## 🛠️ Development

### Local Development

```bash
# Start development environment
docker compose -f docker-compose.dev.yml up -d

# Run tests
npm test
cargo test

# Build for production
docker compose build
```

### API Endpoints

- `GET /api/wallets` - Get all wallets
- `GET /api/positions` - Get active positions
- `GET /api/status` - Get system status
- `POST /api/simulate-launch` - Simulate token launch
- `POST /api/push/subscribe` - Subscribe to notifications

## 📱 Mobile Development

### Android Development

- **Language**: Kotlin
- **UI**: Jetpack Compose
- **Architecture**: MVVM with Hilt
- **Networking**: Retrofit + OkHttp
- **Floating Window**: System Alert Window permission

### iOS Development

- **Language**: Swift
- **UI**: SwiftUI
- **Architecture**: MVVM with Combine
- **Networking**: URLSession
- **Floating Interface**: Custom overlay implementation

## 🚨 Troubleshooting

### Common Issues

1. **Wallet Connection Failed**
   - Check RPC endpoints
   - Verify wallet permissions
   - Check network connectivity

2. **Database Connection Issues**
   - Verify PostgreSQL is running
   - Check connection string
   - Verify database exists

3. **Mobile App Not Updating**
   - Check API endpoint configuration
   - Verify network permissions
   - Check notification permissions

### Logs

```bash
# View all logs
docker compose logs -f

# View specific service logs
docker compose logs -f orchestrator
docker compose logs -f sol-exec
docker compose logs -f gui
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Disclaimer

This software is for educational and research purposes only. Trading cryptocurrencies involves substantial risk of loss and is not suitable for all investors. The high degree of leverage can work against you as well as for you. Before deciding to trade cryptocurrencies, you should carefully consider your investment objectives, level of experience, and risk appetite. The possibility exists that you could sustain a loss of some or all of your initial investment and therefore you should not invest money that you cannot afford to lose.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Join our Discord community
- Check the documentation wiki

---

**Sol $natcher** - Autonomous Solana Sniping Bot with Mobile Apps