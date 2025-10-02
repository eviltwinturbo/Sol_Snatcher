# Sol $natcher Project Structure

This document provides a comprehensive overview of the project structure and organization.

## 📁 Root Directory Structure

```
sol-snatcher/
├── README.md                          # Main project documentation
├── DEPLOYMENT.md                      # Deployment guide
├── PROJECT_STRUCTURE.md               # This file
├── docker-compose.yml                 # Docker Compose configuration
├── .env.example                       # Environment variables template
├── sol-exec/                          # Rust Solana execution service
├── orchestrator/                       # Node.js orchestrator service
├── gui/                               # React web interface
├── android/                           # Android mobile app
├── ios/                               # iOS mobile app
├── infra/                             # Infrastructure configuration
├── wallets/                           # Wallet configuration
├── systemd/                           # Systemd service files
└── scripts/                           # Deployment and utility scripts
```

## 🔧 Core Services

### sol-exec/ (Rust Service)
```
sol-exec/
├── Cargo.toml                         # Rust dependencies
├── Dockerfile                         # Container configuration
├── src/
│   ├── lib.rs                         # Core library implementation
│   └── main.rs                        # Service entry point
└── target/                            # Build artifacts (generated)
```

**Purpose**: High-performance Solana transaction execution
- Real-time DEX event monitoring
- Transaction building and simulation
- Multi-wallet management
- RPC failover and health checks

### orchestrator/ (Node.js Service)
```
orchestrator/
├── package.json                       # Node.js dependencies
├── tsconfig.json                      # TypeScript configuration
├── Dockerfile                         # Container configuration
├── src/
│   ├── index.ts                       # Service entry point
│   ├── types.ts                       # TypeScript type definitions
│   ├── database.ts                    # PostgreSQL database layer
│   ├── executor.ts                    # Sol-exec service client
│   ├── filters.ts                     # Safety filters and risk management
│   ├── prices.ts                      # Price feed management
│   ├── push.ts                        # Web Push notification service
│   ├── orchestrator.ts                # Main orchestration logic
│   └── api.ts                         # REST API endpoints
└── dist/                              # Compiled JavaScript (generated)
```

**Purpose**: Trading strategy orchestration and coordination
- Multi-wallet trading coordination
- Safety filter implementation
- Risk management and position tracking
- Web Push notification management
- REST API for web and mobile clients

### gui/ (React Web Interface)
```
gui/
├── package.json                       # React dependencies
├── Dockerfile                         # Container configuration
├── public/
│   ├── index.html                     # HTML template
│   ├── manifest.json                  # PWA manifest
│   ├── sw.js                          # Service worker
│   └── sounds/                        # Audio assets
│       ├── entry.mp3                  # Entry sound effect
│       ├── success.mp3                # Success sound effect
│       └── alert.mp3                  # Alert sound effect
├── src/
│   ├── App.tsx                        # Main React component
│   ├── App.css                        # Global styles
│   ├── index.tsx                      # React entry point
│   ├── types.ts                       # TypeScript definitions
│   ├── services/
│   │   ├── api.ts                     # API service client
│   │   └── notifications.ts           # Notification service
│   ├── components/
│   │   ├── Dashboard.tsx              # Main dashboard
│   │   ├── WalletPanel.tsx            # Individual wallet panel
│   │   ├── SystemOverview.tsx         # System status overview
│   │   └── Controls.tsx                # Trading controls
│   └── assets/
│       └── lottie/                    # Animation assets
│           ├── snipe.json             # Snipe animation
│           └── profit.json            # Profit animation
└── build/                             # Production build (generated)
```

**Purpose**: Web-based trading dashboard
- Real-time wallet and position monitoring
- Animated trading interface with Lottie
- Sound effects for trading events
- Web Push notification support
- Responsive design for desktop and mobile

## 📱 Mobile Applications

### android/ (Android App)
```
android/
├── app/
│   ├── build.gradle                   # Android build configuration
│   ├── src/main/
│   │   ├── AndroidManifest.xml        # Android app manifest
│   │   ├── java/com/solsnatcher/
│   │   │   ├── SolSnatcherApplication.kt    # Application class
│   │   │   ├── MainActivity.kt             # Main activity
│   │   │   ├── FloatingWidgetActivity.kt    # Floating widget activity
│   │   │   ├── data/
│   │   │   │   ├── model/                  # Data models
│   │   │   │   │   ├── Wallet.kt
│   │   │   │   │   ├── Position.kt
│   │   │   │   │   └── SystemStatus.kt
│   │   │   │   ├── api/
│   │   │   │   │   └── SolSnatcherApi.kt
│   │   │   │   └── repository/
│   │   │   │       └── SolSnatcherRepository.kt
│   │   │   ├── ui/
│   │   │   │   ├── viewmodel/
│   │   │   │   │   ├── MainViewModel.kt
│   │   │   │   │   └── FloatingWidgetViewModel.kt
│   │   │   │   ├── screens/
│   │   │   │   │   ├── DashboardScreen.kt
│   │   │   │   │   ├── FloatingWidgetScreen.kt
│   │   │   │   │   └── SettingsScreen.kt
│   │   │   │   └── components/
│   │   │   │       ├── WalletCard.kt
│   │   │   │       ├── FloatingWalletCard.kt
│   │   │   │       ├── SystemStatusCard.kt
│   │   │   │       └── FloatingSystemStatus.kt
│   │   │   └── service/
│   │   │       ├── FloatingWidgetService.kt
│   │   │       └── DataSyncService.kt
│   │   └── res/                       # Android resources
└── gradle/                            # Gradle configuration
```

**Purpose**: Android mobile application with floating widgets
- Native Android app with Kotlin
- Floating widget for always-on-top monitoring
- Real-time data synchronization
- Push notification support
- Expandable/collapsible interface

### ios/ (iOS App)
```
ios/
└── SolSnatcher/
    ├── SolSnatcher.xcodeproj/         # Xcode project
    │   └── project.pbxproj            # Project configuration
    └── SolSnatcher/
        ├── SolSnatcherApp.swift       # SwiftUI app entry point
        ├── ContentView.swift          # Main content view
        ├── SolSnatcher.entitlements   # App entitlements
        ├── Models/
        │   └── Wallet.swift           # Data models
        ├── Services/
        │   └── APIService.swift       # API service client
        ├── ViewModels/
        │   └── SolSnatcherViewModel.swift  # View model
        └── Views/
            ├── WalletCard.swift       # Wallet card component
            ├── SystemStatusCard.swift # System status component
            └── FloatingWidgetView.swift # Floating widget view
```

**Purpose**: iOS mobile application with floating interface
- Native iOS app with SwiftUI
- Floating interface for monitoring
- Real-time data synchronization
- Push notification support
- Expandable/collapsible interface

## 🏗️ Infrastructure

### infra/ (Infrastructure Configuration)
```
infra/
├── nginx.conf                         # Nginx reverse proxy configuration
└── init.sql                           # PostgreSQL initialization script
```

**Purpose**: Infrastructure and deployment configuration
- Nginx reverse proxy with SSL termination
- Rate limiting and security headers
- PostgreSQL database initialization
- Static file serving and caching

### systemd/ (System Service)
```
systemd/
└── sol-snatcher.service              # Systemd service configuration
```

**Purpose**: System service management
- Automatic startup on boot
- Service restart policies
- Dependency management
- Log management

## 💰 Wallet Management

### wallets/ (Wallet Configuration)
```
wallets/
├── README.md                          # Wallet setup documentation
└── registry.json                      # Wallet registry configuration
```

**Purpose**: Wallet configuration and management
- Multi-wallet registry
- Risk parameter configuration
- Security guidelines
- Setup instructions

## 🛠️ Scripts and Utilities

### scripts/ (Deployment Scripts)
```
scripts/
├── deploy.sh                          # Main deployment script
├── generate-vapid-keys.js             # VAPID key generation
└── setup-wallets.js                   # Wallet setup automation
```

**Purpose**: Deployment automation and utilities
- Automated deployment process
- VAPID key generation for notifications
- Wallet setup automation
- Environment configuration

## 🐳 Docker Configuration

### Container Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   nginx:alpine  │    │   gui:react     │    │ orchestrator:ts │
│   (Port 80/443) │────│   (Port 3000)   │────│   (Port 3001)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │
                                │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  sol-exec:rust  │    │ redis:alpine    │    │ postgres:15     │
│   (Port 8080)   │────│   (Port 6379)   │────│   (Port 5432)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📊 Data Flow

### Trading Flow
```
1. DEX Event Detection (sol-exec)
   ↓
2. Safety Filter Check (orchestrator)
   ↓
3. Position Sizing (orchestrator)
   ↓
4. Transaction Simulation (sol-exec)
   ↓
5. Transaction Execution (sol-exec)
   ↓
6. Position Tracking (orchestrator)
   ↓
7. Exit Management (orchestrator)
   ↓
8. P&L Recording (orchestrator)
```

### Data Storage
```
┌─────────────────┐    ┌─────────────────┐
│   PostgreSQL    │    │      Redis      │
│                 │    │                 │
│ • Positions     │    │ • Price Cache   │
│ • Trades        │    │ • Pub/Sub       │
│ • P&L Records   │    │ • Session Data  │
│ • Wallets       │    │ • Rate Limiting │
│ • Settings      │    │                 │
└─────────────────┘    └─────────────────┘
```

## 🔒 Security Considerations

### Container Security
- Non-root user execution
- Read-only filesystems where possible
- Minimal attack surface
- Regular security updates

### Network Security
- HTTPS with TLS 1.2/1.3
- Rate limiting and DDoS protection
- Input validation and sanitization
- Secure headers and CORS policies

### Wallet Security
- Private keys in secure containers
- No shared keystore
- Hot wallet limits
- Regular security audits

## 📈 Monitoring and Observability

### Health Checks
- Service health endpoints
- Database connectivity
- RPC endpoint status
- Wallet balance monitoring

### Metrics Collection
- Latency histograms
- Fill rates and success rates
- Error counts and types
- Per-wallet P&L tracking

### Logging
- Structured logging
- Log aggregation
- Error tracking
- Performance monitoring

## 🚀 Deployment Options

### Development
```bash
docker compose -f docker-compose.dev.yml up -d
```

### Production
```bash
docker compose up -d
sudo systemctl enable sol-snatcher.service
```

### Mobile App Deployment
- Android: Google Play Store
- iOS: Apple App Store
- Enterprise: Direct distribution

## 📝 Development Workflow

### Local Development
1. Clone repository
2. Install dependencies
3. Configure environment
4. Start development services
5. Run tests
6. Build and deploy

### CI/CD Pipeline
1. Code commit
2. Automated testing
3. Security scanning
4. Build artifacts
5. Deploy to staging
6. Deploy to production

---

This project structure provides a comprehensive, scalable, and maintainable architecture for autonomous Solana trading with full mobile app support.