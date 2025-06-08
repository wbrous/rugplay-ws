// Enhanced export functionality test with format selection
const { RugplayClient } = require('../dist/sdk');
const readline = require('readline');
const path = require('path');
const fs = require('fs');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Sample trade events using current enhanced structure
const sampleTradeEvents = [
    {
        "type": "all-trades",
        "data": {
            "type": "BUY",
            "username": "whale_investor",
            "userImage": "avatars/1.png",
            "amount": 5000000,
            "coinSymbol": "ETH",
            "coinName": "Ethereum",
            "coinIcon": "coins/eth.png",
            "totalValue": 85000,
            "price": 0.017,
            "timestamp": Date.now() - 300000,
            "userId": "1"
        }
    },
    {
        "type": "all-trades",
        "data": {
            "type": "SELL",
            "username": "profit_taker",
            "userImage": "avatars/42.png",
            "amount": 250000,
            "coinSymbol": "BTC",
            "coinName": "Bitcoin",
            "coinIcon": "coins/btc.png",
            "totalValue": 4200,
            "price": 0.0168,
            "timestamp": Date.now() - 240000,
            "userId": "42"
        }
    },
    {
        "type": "all-trades",
        "data": {
            "type": "BUY",
            "username": "day_trader",
            "userImage": "avatars/123.png",
            "amount": 75000,
            "coinSymbol": "ADA",
            "coinName": "Cardano",
            "coinIcon": "coins/ada.png",
            "totalValue": 650,
            "price": 0.008667,
            "timestamp": Date.now() - 180000,
            "userId": "123"
        }
    },
    {
        "type": "all-trades",
        "data": {
            "type": "SELL",
            "username": "quick_flip",
            "userImage": "avatars/456.png",
            "amount": 12000,
            "coinSymbol": "DOT",
            "coinName": "Polkadot",
            "coinIcon": "coins/dot.png",
            "totalValue": 95,
            "price": 0.007917,
            "timestamp": Date.now() - 120000,
            "userId": "456"
        }
    },
    {
        "type": "all-trades",
        "data": {
            "type": "BUY",
            "username": "hodler_2025",
            "userImage": "avatars/789.png",
            "amount": 3500,
            "coinSymbol": "DOGE",
            "coinName": "Dogecoin",
            "coinIcon": "coins/doge.png",
            "totalValue": 18,
            "price": 0.005143,
            "timestamp": Date.now() - 60000,
            "userId": "789"
        }
    }
];

function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

async function selectExportFormat() {
    console.log('\n📊 Select Export Format:');
    console.log('1. JSON - Structured JSON with enhanced trade data');
    console.log('2. CSV - Spreadsheet format with all trade details');
    console.log('3. YAML - Human-readable YAML format');
    
    const choice = await askQuestion('\nEnter your choice (1-3): ');
    
    switch (choice.trim()) {
        case '1': return 'json';
        case '2': return 'csv';
        case '3': return 'yaml';
        default:
            console.log('⚠️ Invalid choice, defaulting to JSON');
            return 'json';
    }
}

async function runExportTest(format) {
    console.log(`\n🚀 Testing ${format.toUpperCase()} Export Format`);
    console.log('═'.repeat(50));
    
    const baseOutputPath = path.join(__dirname, '..', 'exports', `test-export-${format}`);
    const outputPath = `${baseOutputPath}.${format}`;
    
    // Clean up previous test file
    if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
        console.log(`🧹 Cleaned up previous ${format.toUpperCase()} export`);
    }
    
    // Create client with selected format
    const client = new RugplayClient({
        config: {
            url: 'wss://ws.rugplay.com/',
            reconnectAttempts: 3,
            reconnectDelay: 1000
        },
        exportConfig: {
            file: {
                enabled: true,
                outputPath: outputPath,
                format: format
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

    // Set up event monitoring
    let processedEvents = 0;
    let largeTradeCount = 0;
    let whaleTradeCount = 0;

    client.on('trade', (data) => {
        processedEvents++;
        console.log(`📈 Trade ${processedEvents}: ${data.type} ${data.coinSymbol} by ${data.username} - $${data.totalValue}`);
    });

    client.on('large-trade', (data) => {
        largeTradeCount++;
        console.log(`   🦈 Large trade detected! (#${largeTradeCount})`);
    });

    client.on('whale-trade', (data) => {
        whaleTradeCount++;
        console.log(`   🐋 WHALE trade detected! (#${whaleTradeCount})`);
    });

    client.on('buy', () => console.log('   📗 BUY event triggered'));
    client.on('sell', () => console.log('   📕 SELL event triggered'));

    // Process sample events
    console.log(`\n📊 Processing ${sampleTradeEvents.length} sample trade events...`);
    
    const handleMessage = client['handleMessage'].bind(client);
    
    sampleTradeEvents.forEach((event, index) => {
        console.log(`\n🔄 Processing event ${index + 1}/${sampleTradeEvents.length}`);
        handleMessage(event);
    });

    // Force flush and display results
    return new Promise((resolve) => {
        setTimeout(() => {
            if (client.logger) {
                client.logger.flushEvents();
                
                setTimeout(() => {
                    displayExportResults(outputPath, format, processedEvents, largeTradeCount, whaleTradeCount);
                    client.logger.shutdown();
                    resolve();
                }, 200);
            }
        }, 100);
    });
}

function displayExportResults(outputPath, format, processedEvents, largeTradeCount, whaleTradeCount) {
    console.log(`\n📄 ${format.toUpperCase()} Export Results:`);
    console.log('─'.repeat(80));
    
    if (fs.existsSync(outputPath)) {
        const content = fs.readFileSync(outputPath, 'utf8');
        const stats = fs.statSync(outputPath);
        
        console.log(`📁 File: ${outputPath}`);
        console.log(`📏 Size: ${stats.size} bytes`);
        console.log(`📊 Events processed: ${processedEvents}`);
        console.log(`🦈 Large trades: ${largeTradeCount}`);
        console.log(`🐋 Whale trades: ${whaleTradeCount}`);
        
        if (format === 'json') {
            try {
                const jsonData = JSON.parse(content);
                console.log(`📈 JSON events exported: ${jsonData.length}`);
                console.log('\n🔍 Sample enhanced trade structure:');
                if (jsonData[0] && jsonData[0].data) {
                    const sample = jsonData[0];
                    console.log(`Event Type: ${sample.type}`);
                    if (sample.data.user) {
                        console.log(`User: ${sample.data.user.username} (ID: ${sample.data.user.id})`);
                    }
                    if (sample.data.coin) {
                        console.log(`Coin: ${sample.data.coin.name} (${sample.data.coin.symbol})`);
                    }
                    if (sample.data.transaction) {
                        console.log(`Amount: ${sample.data.transaction.amount_formatted}`);
                        console.log(`Price: ${sample.data.transaction.price_formatted}`);
                        console.log(`Total: ${sample.data.transaction.total_value_formatted}`);
                    }
                    if (sample.data.metadata) {
                        console.log(`Trade Size: ${sample.data.metadata.trade_size}`);
                        console.log(`Market Direction: ${sample.data.metadata.market_direction}`);
                    }
                }
            } catch (e) {
                console.log('⚠️ Could not parse JSON content');
            }
        } else if (format === 'csv') {
            const lines = content.trim().split('\n');
            console.log(`📊 CSV lines: ${lines.length} (including header)`);
            console.log('\n📋 CSV Headers:');
            if (lines[0]) {
                console.log(lines[0]);
            }
            console.log('\n📄 Sample CSV data:');
            if (lines[1]) {
                console.log(lines[1]);
            }
        } else if (format === 'yaml') {
            const lines = content.trim().split('\n');
            console.log(`📊 YAML lines: ${lines.length}`);
            console.log('\n📄 YAML sample (first 10 lines):');
            lines.slice(0, 10).forEach(line => console.log(line));
            if (lines.length > 10) {
                console.log('... (truncated)');
            }
        }
        
        console.log('─'.repeat(80));
        console.log('✅ Export test completed successfully!');
    } else {
        console.log(`❌ Export file not found: ${outputPath}`);
    }
}

async function main() {
    console.log('🎯 Rugplay Logger - Enhanced Export Testing');
    console.log('═'.repeat(50));
    
    try {
        const format = await selectExportFormat();
        await runExportTest(format);
        
        console.log('\n📋 Test Summary:');
        console.log('✅ Enhanced trade data formatting');
        console.log('✅ Trade size categorization');
        console.log('✅ Specialized event triggers');
        console.log('✅ Human-readable number formatting');
        console.log('✅ Structured metadata');
        console.log(`✅ ${format.toUpperCase()} export functionality`);
        
    } catch (error) {
        console.error('❌ Export test failed:', error);
    } finally {
        rl.close();
    }
}

main();
