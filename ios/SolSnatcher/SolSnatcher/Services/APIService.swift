import Foundation
import Combine

class APIService: ObservableObject {
    static let shared = APIService()
    
    private let baseURL = "http://localhost:3001/api"
    private let session = URLSession.shared
    
    private init() {}
    
    func getWallets() -> AnyPublisher<[Wallet], Error> {
        guard let url = URL(string: "\(baseURL)/wallets") else {
            return Fail(error: APIError.invalidURL)
                .eraseToAnyPublisher()
        }
        
        return session.dataTaskPublisher(for: url)
            .map(\.data)
            .decode(type: [Wallet].self, decoder: JSONDecoder())
            .eraseToAnyPublisher()
    }
    
    func getPositions(walletId: String? = nil) -> AnyPublisher<[Position], Error> {
        var urlString = "\(baseURL)/positions"
        if let walletId = walletId {
            urlString += "?walletId=\(walletId)"
        }
        
        guard let url = URL(string: urlString) else {
            return Fail(error: APIError.invalidURL)
                .eraseToAnyPublisher()
        }
        
        return session.dataTaskPublisher(for: url)
            .map(\.data)
            .decode(type: [Position].self, decoder: JSONDecoder())
            .eraseToAnyPublisher()
    }
    
    func getSystemStatus() -> AnyPublisher<SystemStatus, Error> {
        guard let url = URL(string: "\(baseURL)/status") else {
            return Fail(error: APIError.invalidURL)
                .eraseToAnyPublisher()
        }
        
        return session.dataTaskPublisher(for: url)
            .map(\.data)
            .decode(type: SystemStatus.self, decoder: JSONDecoder())
            .eraseToAnyPublisher()
    }
}

enum APIError: Error {
    case invalidURL
    case noData
    case decodingError
}