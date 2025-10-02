#!/usr/bin/env node

const webpush = require('web-push');

console.log('Generating VAPID keys for Sol $natcher...\n');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('VAPID Keys Generated:');
console.log('===================');
console.log(`Public Key:  ${vapidKeys.publicKey}`);
console.log(`Private Key: ${vapidKeys.privateKey}\n`);

console.log('Add these to your .env file:');
console.log('============================');
console.log(`VAPID_PUBLIC=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE=${vapidKeys.privateKey}\n`);

console.log('⚠️  Keep your private key secure and never share it publicly!');