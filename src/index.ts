import { RugplayClient } from './client/RugplayClient';
import { webSocketConfig } from './configuration/websocket';
import { exportConfig } from './configuration/export';

function main(): void {
    console.log('🚀 Starting Rugplay Logger...');    // Create the Rugplay client with debug enabled and export configuration
    const client = new RugplayClient({
        config: webSocketConfig,
        exportConfig: exportConfig,
        autoConnect: true,
        debug: false
    });
    
    // DEBUG: Uncomment these lines to enable additional event logging

    // client.on('message', (data) => {
    //     console.log('📨 Raw message received:', data);
    // });

    // client.on('all-trades', (data) => {
    //     console.log('💰 All-trades event:', {
    //         type: data.type,
    //         username: data.username,
    //         amount: data.amount,
    //         coinSymbol: data.coinSymbol,
    //         coinName: data.coinName,
    //         totalValue: data.totalValue,
    //         price: data.price,
    //         timestamp: new Date(data.timestamp).toISOString(),
    //         userId: data.userId
    //     });
    // });

    // client.on('update', (data) => {
    //     console.log('🔄 Update received:', data);
    // });

    // client.on('trade', (data) => {
    //     console.log('💰 Trade event:', data);
    // });

    // client.on('price', (data) => {
    //     console.log('💲 Price update:', data);
    // });

    // Handle graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n👋 Shutting down gracefully...');
        client.disconnect();
        process.exit(0);
    });

    process.on('SIGTERM', () => {
        console.log('\n👋 Received SIGTERM, shutting down...');
        client.disconnect();
        process.exit(0);
    });

    // Keep the process alive
    console.log('✅ Client initialized. Listening for events...');
    console.log('Press Ctrl+C to stop');
}

// Run the main function
main();

