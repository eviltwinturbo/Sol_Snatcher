import SwiftUI

struct ContentView: View {
    @StateObject private var viewModel = SolSnatcherViewModel()
    @State private var showingFloatingWidget = false
    
    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                // Header
                VStack {
                    Text("Sol $natcher")
                        .font(.largeTitle)
                        .fontWeight(.bold)
                        .foregroundColor(.primary)
                    
                    Text("Autonomous Solana Sniping Bot")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                .padding(.top)
                
                // System Status Card
                SystemStatusCard(status: viewModel.systemStatus)
                
                // Start Floating Widget Button
                Button(action: {
                    showingFloatingWidget = true
                }) {
                    HStack {
                        Image(systemName: "rectangle.and.pencil.and.ellipsis")
                        Text("Start Floating Widget")
                            .fontWeight(.semibold)
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.blue)
                    .foregroundColor(.white)
                    .cornerRadius(12)
                }
                .padding(.horizontal)
                
                // Wallets Section
                VStack(alignment: .leading, spacing: 12) {
                    Text("Wallets")
                        .font(.title2)
                        .fontWeight(.bold)
                        .padding(.horizontal)
                    
                    ScrollView {
                        LazyVStack(spacing: 8) {
                            ForEach(viewModel.wallets) { wallet in
                                WalletCard(wallet: wallet)
                            }
                        }
                        .padding(.horizontal)
                    }
                }
                
                Spacer()
            }
            .navigationBarHidden(true)
            .onAppear {
                viewModel.loadData()
            }
        }
        .sheet(isPresented: $showingFloatingWidget) {
            FloatingWidgetView()
        }
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}