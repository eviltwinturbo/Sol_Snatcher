import Foundation
import Combine

class SolSnatcherViewModel: ObservableObject {
    @Published var wallets: [Wallet] = []
    @Published var positions: [Position] = []
    @Published var systemStatus: SystemStatus?
    @Published var isLoading = false
    @Published var error: String?
    
    private let apiService = APIService.shared
    private var cancellables = Set<AnyCancellable>()
    private var timer: Timer?
    
    init() {
        startPeriodicRefresh()
    }
    
    deinit {
        timer?.invalidate()
    }
    
    func loadData() {
        isLoading = true
        error = nil
        
        let walletsPublisher = apiService.getWallets()
        let positionsPublisher = apiService.getPositions()
        let statusPublisher = apiService.getSystemStatus()
        
        Publishers.Zip3(walletsPublisher, positionsPublisher, statusPublisher)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.error = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] wallets, positions, status in
                    self?.wallets = wallets
                    self?.positions = positions
                    self?.systemStatus = status
                }
            )
            .store(in: &cancellables)
    }
    
    private func startPeriodicRefresh() {
        timer = Timer.scheduledTimer(withTimeInterval: 5.0, repeats: true) { [weak self] _ in
            self?.loadData()
        }
    }
    
    func getWalletPosition(walletId: String) -> Position? {
        return positions.first { $0.walletId == walletId && $0.status == "open" }
    }
}