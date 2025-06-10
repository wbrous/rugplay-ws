// Quick test to verify the SDK works correctly
const { RugplayClient } = require('../dist/sdk');

const client = new RugplayClient({
  config: {
    url: 'wss://ws.rugplay.com/',
    reconnectAttempts: 3,
    reconnectDelay: 1000
  },
  autoConnect: true,
  debug: true
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

// Listen for connection events instead of using connect().then()
let connected = false;
let connectionTimeout;

client.on('message', (data) => {
  if (!connected) {
    connected = true;
    console.log('✅ SDK test successful - connected via SDK');
    
    // Clear the timeout since we connected
    if (connectionTimeout) {
      clearTimeout(connectionTimeout);
    }
    
    // Disconnect after 5 seconds
    setTimeout(() => {
      client.disconnect();
      console.log('🏁 SDK test completed');
      process.exit(0);
    }, 5000);
  }
});

// Call connect (it doesn't return a promise)
client.connect();

// Set a timeout to fail the test if no connection is established
connectionTimeout = setTimeout(() => {
  if (!connected) {
    console.error('❌ SDK test failed: Connection timeout');
    process.exit(1);
  }
}, 15000); // 15 second timeout
