// Quick test to verify the SDK works correctly
const { RugplayClient } = require('../dist/sdk');

const client = new RugplayClient({
  url: 'wss://ws.rugplay.com/',
  autoReconnect: true,
  reconnectAttempts: 3,
  reconnectDelay: 1000,
  logEvents: true
});

console.log('🧪 Testing SDK...');

client.on('price', (event) => {
  console.log('📈 Price event:', event);
});

client.on('trade', (event) => {
  console.log('💰 Trade event:', event);
});

client.on('update', (event) => {
  console.log('🔄 Update event:', event);
});

client.connect().then(() => {
  console.log('✅ SDK test successful - connected via SDK');
  
  // Disconnect after 10 seconds
  setTimeout(() => {
    client.disconnect();
    console.log('🏁 SDK test completed');
    process.exit(0);
  }, 10000);
}).catch((error) => {
  console.error('❌ SDK test failed:', error);
  process.exit(1);
});
