#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Setting up Solana wallets for Sol $natcher...\n');

const walletsDir = path.join(__dirname, '..', 'wallets');
const secureWalletsDir = '/secure/wallets';

// Ensure wallets directory exists
if (!fs.existsSync(walletsDir)) {
    fs.mkdirSync(walletsDir, { recursive: true });
}

console.log('Generating 6 Solana wallets...\n');

const wallets = [];

for (let i = 1; i <= 6; i++) {
    console.log(`Generating wallet ${i}...`);
    
    try {
        // Generate keypair
        const output = execSync(`solana-keygen new --no-bip39-passphrase --silent --outfile ${walletsDir}/w${i}.json`, {
            encoding: 'utf8'
        });
        
        // Extract public key
        const keypairData = JSON.parse(fs.readFileSync(path.join(walletsDir, `w${i}.json`), 'utf8'));
        const publicKey = Buffer.from(keypairData).toString('base64');
        
        wallets.push({
            id: `wallet${i}`,
            pubkey: publicKey,
            path: `${secureWalletsDir}/w${i}.json`,
            riskPctPerTrade: 0.15
        });
        
        console.log(`✓ Wallet ${i} generated: ${publicKey.substring(0, 20)}...`);
        
    } catch (error) {
        console.error(`✗ Failed to generate wallet ${i}:`, error.message);
    }
}

// Update registry.json
const registryPath = path.join(walletsDir, 'registry.json');
fs.writeFileSync(registryPath, JSON.stringify(wallets, null, 2));

console.log('\n✓ Wallet registry updated');
console.log(`✓ Registry saved to: ${registryPath}`);

console.log('\nNext steps:');
console.log('===========');
console.log('1. Copy wallet files to secure location:');
console.log(`   sudo mkdir -p ${secureWalletsDir}`);
console.log(`   sudo cp ${walletsDir}/*.json ${secureWalletsDir}/`);
console.log('2. Set proper permissions:');
console.log(`   sudo chmod 600 ${secureWalletsDir}/*.json`);
console.log('3. Update .env file with wallet registry path');
console.log('4. Fund your wallets with SOL for trading');

console.log('\n⚠️  Security Warning:');
console.log('===================');
console.log('• Keep private keys secure');
console.log('• Never commit private keys to version control');
console.log('• Use strong passwords for production');
console.log('• Consider using hardware wallets for large amounts');