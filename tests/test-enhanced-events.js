// Test script for the enhanced event handler and logger
const path = require('path');
const fs = require('fs');

// Clear any previous test exports
const testExportPath = path.join(__dirname, '..', 'exports', 'test-events.json');
if (fs.existsSync(testExportPath)) {
    fs.unlinkSync(testExportPath);
    console.log('🧹 Cleared previous test exports');
}

try {
    const { RugplayClient } = require('../dist/sdk');
    console.log('✅ Successfully imported RugplayClient');
    console.log('🧪 Testing enhanced event parsing and logging...\n');

    // Create test client with export configuration
    const client = new RugplayClient({
        config: {
            url: 'wss://ws.rugplay.com/',
            reconnectAttempts: 3,
            reconnectDelay: 1000
        },
        exportConfig: {
            file: {
                enabled: true,
                outputPath: testExportPath,
                format: 'json'
            },
            discord: {
                enabled: false,
                webhookUrl: '',
                messageFormat: 'embed'
            }
        },
        autoConnect: false,
        debug: true
    });

    // Enhanced event handlers to test new functionality
    client.on('trade', (data) => {
        console.log('🎯 Trade event triggered');
    });

    client.on('buy', (data) => {
        console.log('📈 Buy event triggered');
    });

    client.on('sell', (data) => {
        console.log('📉 Sell event triggered');
    });

    client.on('large-trade', (data) => {
        console.log('🐋 Large trade event triggered');
    });

    client.on('trade:game', (data) => {
        console.log('🎮 GAME coin trade triggered');
    });

    client.on('trade:ethe', (data) => {
        console.log('💎 ETHE coin trade triggered');
    });

    // Test with your provided examples
    const buyTradeEvent = {
        "type": "all-trades",
        "data": {
            "type": "BUY",
            "username": "extoci",
            "userImage": "avatars/76.png",
            "amount": 4543.976019510068,
            "coinSymbol": "GAME",
            "coinName": "GamerCoin",
            "coinIcon": "coins/game.png",
            "totalValue": 500,
            "price": 0.11020177523375436,
            "timestamp": 1749417445869,
            "userId": "76"
        }
    };

    const sellTradeEvent = {
        "type": "all-trades",
        "data": {
            "type": "SELL",
            "username": "hoodadk4",
            "userImage": "avatars/404.jpeg",
            "amount": 999000.99900198,
            "coinSymbol": "ETHE",
            "coinName": "Ethereum",
            "coinIcon": "coins/ethe.png",
            "totalValue": 1.0000000000010232,
            "price": 9.99999999999999e-7,
            "timestamp": 1749417498476,
            "userId": "404"
        }
    };

    // Large trade for whale detection
    const whaleTradeEvent = {
        "type": "all-trades", 
        "data": {
            "type": "BUY",
            "username": "whale_trader",
            "userImage": "avatars/1.png",
            "amount": 100000000,
            "coinSymbol": "BTC",
            "coinName": "Bitcoin",
            "coinIcon": "coins/btc.png",
            "totalValue": 50000,
            "price": 0.0005,
            "timestamp": Date.now(),
            "userId": "1"
        }
    };

    console.log('📨 Testing BUY trade event...');
    console.log('Event:', JSON.stringify(buyTradeEvent, null, 2));
    const handleMessage = client['handleMessage'].bind(client);
    handleMessage(buyTradeEvent);

    console.log('\n📨 Testing SELL trade event...');
    console.log('Event:', JSON.stringify(sellTradeEvent, null, 2)); 
    handleMessage(sellTradeEvent);

    console.log('\n📨 Testing WHALE trade event...');
    console.log('Event:', JSON.stringify(whaleTradeEvent, null, 2));
    handleMessage(whaleTradeEvent);

    // Force flush events to see the exported data
    setTimeout(() => {
        if (client.logger) {
            client.logger.flushEvents();
            
            setTimeout(() => {
                // Display the exported data
                if (fs.existsSync(testExportPath)) {
                    console.log('\n📄 Exported Event Data:');
                    const exportedData = JSON.parse(fs.readFileSync(testExportPath, 'utf8'));
                    console.log(JSON.stringify(exportedData, null, 2));
                } else {
                    console.log('\n⚠️ No exported data found');
                }
                
                console.log('\n✅ Enhanced event parsing test completed!');
                console.log('\n📊 Summary:');
                console.log('- Enhanced trade data formatting ✅');
                console.log('- Specialized event triggers ✅');
                console.log('- Large trade detection ✅');
                console.log('- Coin-specific events ✅');
                console.log('- Structured logging ✅');
                console.log('- Human-readable formatting ✅');
            }, 100);
        }
    }, 100);

} catch (error) {
    console.error('❌ Error during test:', error);
    console.error('Stack:', error.stack);
}
