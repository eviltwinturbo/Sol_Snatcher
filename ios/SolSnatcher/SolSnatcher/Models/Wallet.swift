import Foundation

struct Wallet: Identifiable, Codable {
    let id: String
    let pubkey: String
    let path: String
    let riskPctPerTrade: Double
    let balance: Double
    let busy: Bool
    let dailyPnL: Double
    let totalPnL: Double
}

struct Position: Identifiable, Codable {
    let id: String
    let walletId: String
    let mint: String
    let baseQty: Double
    let avgCost: Double
    let tpPct: Double
    let slPct: Double
    let trailingPct: Double
    let status: String
    let createdAt: String
    let updatedAt: String
}

struct SystemStatus: Codable {
    let wallets: Int
    let activePositions: Int
    let busyWallets: Int
    let totalBalance: Double
    let totalPnL: Double
}