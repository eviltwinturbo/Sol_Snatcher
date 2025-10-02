import SwiftUI

struct SystemStatusCard: View {
    let status: SystemStatus?
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("System Status")
                .font(.title2)
                .fontWeight(.bold)
            
            if let status = status {
                HStack {
                    VStack {
                        Text("\(status.wallets)")
                            .font(.title)
                            .fontWeight(.bold)
                            .foregroundColor(.blue)
                        Text("Wallets")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    
                    Spacer()
                    
                    VStack {
                        Text("\(status.activePositions)")
                            .font(.title)
                            .fontWeight(.bold)
                            .foregroundColor(.blue)
                        Text("Active")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    
                    Spacer()
                    
                    VStack {
                        Text("\(status.busyWallets)")
                            .font(.title)
                            .fontWeight(.bold)
                            .foregroundColor(.red)
                        Text("Busy")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    
                    Spacer()
                    
                    VStack {
                        Text("\(status.totalPnL >= 0 ? "+" : "")\(status.totalPnL, specifier: "%.2f")")
                            .font(.title)
                            .fontWeight(.bold)
                            .foregroundColor(status.totalPnL >= 0 ? .green : .red)
                        Text("P&L")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
            } else {
                HStack {
                    Spacer()
                    ProgressView()
                    Spacer()
                }
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
    }
}

struct SystemStatusCard_Previews: PreviewProvider {
    static var previews: some View {
        SystemStatusCard(status: SystemStatus(
            wallets: 6,
            activePositions: 2,
            busyWallets: 1,
            totalBalance: 9.5,
            totalPnL: 2.5
        ))
        .padding()
    }
}