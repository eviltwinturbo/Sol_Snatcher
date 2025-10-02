use sol_exec::{SolExecutor, SwapIntent, TokenLaunch};
use std::env;
use tokio;
use serde_json;
use std::fs;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    env_logger::init();
    
    let rpc_endpoints = env::var("RPC_ENDPOINTS")
        .unwrap_or_else(|_| "https://api.mainnet-beta.solana.com".to_string())
        .split(',')
        .map(|s| s.trim().to_string())
        .collect();

    let executor = SolExecutor::new(rpc_endpoints)?;
    
    // Load wallet registry
    let wallet_registry_path = env::var("WALLET_REGISTRY")
        .unwrap_or_else(|_| "wallets/registry.json".to_string());
    
    if let Ok(registry_data) = fs::read_to_string(&wallet_registry_path) {
        let wallets: Vec<serde_json::Value> = serde_json::from_str(&registry_data)?;
        
        for wallet_config in wallets {
            if let (Some(id), Some(path)) = (
                wallet_config.get("id").and_then(|v| v.as_str()),
                wallet_config.get("path").and_then(|v| v.as_str())
            ) {
                if let Ok(keypair_data) = fs::read_to_string(path) {
                    let keypair_bytes: Vec<u8> = serde_json::from_str(&keypair_data)?;
                    let keypair = solana_sdk::signature::Keypair::from_bytes(&keypair_bytes)?;
                    executor.add_wallet(id.to_string(), keypair).await?;
                    println!("Loaded wallet: {}", id);
                }
            }
        }
    }

    println!("Sol Executor started successfully");
    
    // Keep the service running
    tokio::signal::ctrl_c().await?;
    println!("Shutting down...");
    
    Ok(())
}