import SwiftUI

struct WalletCard: View {
    let wallet: Wallet
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text(wallet.id.uppercased())
                    .font(.headline)
                    .fontWeight(.bold)
                
                Spacer()
                
                Circle()
                    .fill(wallet.busy ? Color.red : Color.green)
                    .frame(width: 12, height: 12)
            }
            
            HStack {
                VStack(alignment: .leading) {
                    Text("Balance")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Text("\(wallet.balance, specifier: "%.4f") SOL")
                        .font(.subheadline)
                        .fontWeight(.medium)
                }
                
                Spacer()
                
                VStack(alignment: .center) {
                    Text("Daily P&L")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Text("\(wallet.dailyPnL >= 0 ? "+" : "")\(wallet.dailyPnL, specifier: "%.2f") USD")
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .foregroundColor(wallet.dailyPnL >= 0 ? .green : .red)
                }
                
                Spacer()
                
                VStack(alignment: .trailing) {
                    Text("Total P&L")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Text("\(wallet.totalPnL >= 0 ? "+" : "")\(wallet.totalPnL, specifier: "%.2f") USD")
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .foregroundColor(wallet.totalPnL >= 0 ? .green : .red)
                }
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
    }
}

struct WalletCard_Previews: PreviewProvider {
    static var previews: some View {
        WalletCard(wallet: Wallet(
            id: "wallet1",
            pubkey: "ABC123...",
            path: "/path/to/wallet",
            riskPctPerTrade: 0.15,
            balance: 1.5,
            busy: false,
            dailyPnL: 0.25,
            totalPnL: 1.2
        ))
        .padding()
    }
}