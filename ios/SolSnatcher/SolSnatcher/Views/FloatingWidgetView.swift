import SwiftUI

struct FloatingWidgetView: View {
    @StateObject private var viewModel = SolSnatcherViewModel()
    @Environment(\.presentationMode) var presentationMode
    @State private var isExpanded = false
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Header
                HStack {
                    Text("Sol $natcher")
                        .font(.headline)
                        .fontWeight(.bold)
                    
                    Spacer()
                    
                    Button(action: {
                        isExpanded.toggle()
                    }) {
                        Image(systemName: isExpanded ? "chevron.up" : "chevron.down")
                    }
                    
                    Button(action: {
                        presentationMode.wrappedValue.dismiss()
                    }) {
                        Image(systemName: "xmark")
                    }
                }
                .padding()
                .background(Color(.systemGray6))
                
                // System Status (Always visible)
                if let status = viewModel.systemStatus {
                    SystemStatusRow(status: status)
                        .padding(.horizontal)
                        .padding(.bottom, 8)
                }
                
                // Expandable Content
                if isExpanded {
                    ScrollView {
                        LazyVStack(spacing: 8) {
                            ForEach(viewModel.wallets) { wallet in
                                FloatingWalletCard(
                                    wallet: wallet,
                                    position: viewModel.getWalletPosition(walletId: wallet.id)
                                )
                            }
                        }
                        .padding(.horizontal)
                    }
                    .transition(.opacity.combined(with: .move(edge: .top)))
                }
                
                Spacer()
            }
            .navigationBarHidden(true)
            .onAppear {
                viewModel.loadData()
            }
        }
    }
}

struct SystemStatusRow: View {
    let status: SystemStatus
    
    var body: some View {
        HStack {
            VStack {
                Text("\(status.wallets)")
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundColor(.blue)
                Text("Wallets")
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            VStack {
                Text("\(status.activePositions)")
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundColor(.blue)
                Text("Active")
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            VStack {
                Text("\(status.busyWallets)")
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundColor(.red)
                Text("Busy")
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            VStack {
                Text("\(status.totalPnL >= 0 ? "+" : "")\(status.totalPnL, specifier: "%.2f")")
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundColor(status.totalPnL >= 0 ? .green : .red)
                Text("P&L")
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }
        }
        .padding(.vertical, 8)
    }
}

struct FloatingWalletCard: View {
    let wallet: Wallet
    let position: Position?
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(wallet.id.uppercased())
                    .font(.caption)
                    .fontWeight(.bold)
                
                Spacer()
                
                Circle()
                    .fill(wallet.busy ? Color.red : Color.green)
                    .frame(width: 8, height: 8)
            }
            
            HStack {
                VStack(alignment: .leading) {
                    Text("Balance")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                    Text("\(wallet.balance, specifier: "%.4f") SOL")
                        .font(.caption)
                        .fontWeight(.medium)
                }
                
                Spacer()
                
                VStack(alignment: .center) {
                    Text("Daily P&L")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                    Text("\(wallet.dailyPnL >= 0 ? "+" : "")\(wallet.dailyPnL, specifier: "%.2f")")
                        .font(.caption)
                        .fontWeight(.medium)
                        .foregroundColor(wallet.dailyPnL >= 0 ? .green : .red)
                }
                
                Spacer()
                
                VStack(alignment: .trailing) {
                    Text("Total P&L")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                    Text("\(wallet.totalPnL >= 0 ? "+" : "")\(wallet.totalPnL, specifier: "%.2f")")
                        .font(.caption)
                        .fontWeight(.medium)
                        .foregroundColor(wallet.totalPnL >= 0 ? .green : .red)
                }
            }
            
            if let position = position {
                HStack {
                    Text("Token: \(String(position.mint.prefix(8)))...")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                    
                    Spacer()
                    
                    Text("Qty: \(position.baseQty, specifier: "%.2f")")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }
            }
        }
        .padding(8)
        .background(Color(.systemGray6))
        .cornerRadius(8)
    }
}

struct FloatingWidgetView_Previews: PreviewProvider {
    static var previews: some View {
        FloatingWidgetView()
    }
}