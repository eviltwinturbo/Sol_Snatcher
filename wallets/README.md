# Wallet Configuration

This directory contains the wallet configuration files for Sol $natcher.

## Security Warning

⚠️ **CRITICAL**: These wallet files contain private keys and should be kept secure at all times.

## Setup Instructions

1. **Generate Wallets**: Use Solana CLI or your preferred wallet generator to create 6 wallets
2. **Update Registry**: Edit `registry.json` with the correct public keys and paths
3. **Store Keypairs**: Place the private key files in the `/secure/wallets/` directory
4. **Set Permissions**: Ensure only the service user can read these files (600 permissions)

## File Structure

```
wallets/
├── registry.json          # Wallet registry with public keys and settings
├── w1.json               # Private key for wallet1 (create this)
├── w2.json               # Private key for wallet2 (create this)
├── w3.json               # Private key for wallet3 (create this)
├── w4.json               # Private key for wallet4 (create this)
├── w5.json               # Private key for wallet5 (create this)
└── w6.json               # Private key for wallet6 (create this)
```

## Key Format

Each wallet file should contain the private key as a JSON array of bytes:

```json
[123, 45, 67, 89, ...]
```

## Security Best Practices

- Use separate wallets for different risk levels
- Regularly rotate wallet keys
- Monitor wallet balances and transactions
- Use hardware wallets for cold storage of large amounts
- Never commit private keys to version control

## Risk Management

- Each wallet has a configurable risk percentage per trade
- Set appropriate risk levels based on wallet balance and risk tolerance
- Monitor daily P&L and adjust risk parameters accordingly