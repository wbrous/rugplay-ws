// Test script to verify event parsing works correctly
try {
    const { RugplayClient } = require('../dist/sdk');
    console.log('✅ Successfully imported RugplayClient');
    console.log('🧪 Testing event parsing...');

// Create a test client that doesn't auto-connect
const client = new RugplayClient({
    config: {
        url: 'wss://ws.rugplay.com/',
        reconnectAttempts: 3,
        reconnectDelay: 1000
    },
    autoConnect: false,
    debug: true
});

// Test event handlers
client.on('message', (data) => {
    console.log('✅ Message handler triggered');
});

client.on('all-trades', (data) => {
    console.log('✅ All-trades handler triggered with data:', {
        type: data.type,
        username: data.username,
        coinSymbol: data.coinSymbol,
        amount: data.amount,
        price: data.price
    });
});

client.on('trade', (data) => {
    console.log('✅ Trade handler triggered');
});

client.on('price', (data) => {
    console.log('✅ Price handler triggered');
});

client.on('update', (data) => {
    console.log('✅ Update handler triggered');
});

// Simulate receiving the event structure you provided
const testEvent = {
    "type": "all-trades",
    "data": {
        "type": "BUY",
        "username": "extoci",
        "userImage": "avatars/76.png",
        "amount": 68323.23717650399,
        "coinSymbol": "BI",
        "coinName": "BisexualCoin",
        "coinIcon": "coins/bi.jpg",
        "totalValue": 123,
        "price": 0.0018054923904243742,
        "timestamp": 1749415648528,
        "userId": "76"
    }
};

console.log('\n📨 Simulating incoming event...');
console.log('Event:', JSON.stringify(testEvent, null, 2));

// Access the private handleMessage method through reflection for testing
// In a real scenario, this would come through the WebSocket
const handleMessage = client['handleMessage'].bind(client);
handleMessage(testEvent);

console.log('\n✅ Event parsing test completed!');
} catch (error) {
    console.error('❌ Error during test:', error);
}
