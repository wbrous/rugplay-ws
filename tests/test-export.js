// Test script to verify export functionality
const { RugplayClient, EventLogger, exportConfig } = require('../dist/sdk');

console.log('🧪 Testing Export Functionality...\n');

// Test 1: EventLogger standalone
console.log('📁 Test 1: EventLogger standalone');
const logger = new EventLogger(exportConfig, 5); // Small buffer for quick testing

// Simulate some trade events
const testEvents = [
    {
        type: "BUY",
        username: "trader1",
        coinSymbol: "BTC",
        coinName: "Bitcoin",
        amount: 1000,
        price: 50000,
        totalValue: 50000000,
        timestamp: Date.now(),
        userId: "123"
    },
    {
        type: "SELL",
        username: "trader2",
        coinSymbol: "ETH",
        coinName: "Ethereum",
        amount: 500,
        price: 3000,
        totalValue: 1500000,
        timestamp: Date.now(),
        userId: "456"
    }
];

testEvents.forEach((event, index) => {
    logger.logEvent('all-trades', event);
    console.log(`✅ Logged event ${index + 1}: ${event.type} ${event.coinSymbol}`);
});

// Force flush
logger.flushEvents();
console.log('📁 Events flushed to file\n');

// Test 2: Client with export enabled
console.log('📡 Test 2: Client with export enabled');
const client = new RugplayClient({
    config: {
        url: 'wss://ws.rugplay.com/',
        reconnectAttempts: 3,
        reconnectDelay: 1000
    },
    exportConfig: exportConfig,
    autoConnect: false,
    debug: false
});

// Simulate receiving events through the client
const testClientEvent = {
    "type": "all-trades",
    "data": {
        "type": "BUY",
        "username": "testuser",
        "coinSymbol": "TEST",
        "coinName": "TestCoin",
        "amount": 12345,
        "price": 0.001234,
        "totalValue": 15.24,
        "timestamp": Date.now(),
        "userId": "789"
    }
};

// Access the private handleMessage method for testing
const handleMessage = client['handleMessage'].bind(client);
handleMessage(testClientEvent);

console.log('✅ Event processed through client');

// Test CSV export format
const csvConfig = {
    file: {
        enabled: true,
        outputPath: './exports/data.csv',
        format: 'csv'
    },
    discord: {
        enabled: false,
        webhookUrl: '',
        messageFormat: 'embed'
    }
};

console.log('\n📊 Test 3: CSV Export');
const csvLogger = new EventLogger(csvConfig, 2);

testEvents.forEach((event, index) => {
    csvLogger.logEvent('all-trades', event);
    console.log(`✅ Logged event ${index + 1} for CSV: ${event.type} ${event.coinSymbol}`);
});

csvLogger.flushEvents();
csvLogger.shutdown();
console.log('📊 CSV export completed');

// Clean shutdown
setTimeout(() => {
    logger.shutdown();
    client.disconnect();
    console.log('\n🏁 Export test completed!');
    console.log('Check the exports/ folder for generated files.');
}, 1000);
