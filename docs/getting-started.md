---
layout: default
title: Getting Started
nav_order: 2
---

# Getting Started
{: .no_toc }

Quick guide to get up and running with the Rugplay Logger.

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

## Installation

### Prerequisites

- **Node.js** 18.0 or higher
- **npm** or **bun** package manager
- **TypeScript** (included as dev dependency)

### Clone and Install

```bash
# Clone the repository
git clone https://github.com/your-username/rugplay-logger.git
cd rugplay-logger

# Install dependencies
npm install

# Or using bun
bun install
```

### Build the Project

```bash
# Build TypeScript to JavaScript
npm run build

# Or using bun
bun run build
```

---

## Quick Start

### 1. Basic Setup

The simplest way to start logging Rugplay events:

```typescript
import { RugplayClient } from './src/client/RugplayClient';
import { webSocketConfig } from './src/configuration/websocket';

const client = new RugplayClient({
    config: webSocketConfig,
    autoConnect: true,
    debug: true
});

// Log all trade events
client.on('trade', (data) => {
    console.log(`Trade: ${data.username} ${data.tradeType} ${data.coinSymbol}`);
});

console.log('🚀 Rugplay Logger started!');
```

### 2. Running the Application

```bash
# Using npm
npm start

# Using bun for faster startup
npm run bun-start

# Development mode with auto-reload
npm run dev
```

### 3. Verify Connection

You should see output similar to:

```
🚀 Starting Rugplay Logger...
✅ Connected to Rugplay WebSocket
📨 Trade: trader123 buy MOON
📨 Trade: cryptowhale sell ROCKET
```

---

## Configuration

### Environment Setup

Create a `.env` file in the project root:

```bash
# WebSocket Configuration
WEBSOCKET_URL=wss://ws.rugplay.com/
RECONNECT_ATTEMPTS=5
RECONNECT_DELAY=1000

# Export Configuration
FILE_EXPORT_ENABLED=true
EXPORT_PATH=./exports/rugplay-data.json
EXPORT_FORMAT=json

# Discord Integration (optional)
DISCORD_ENABLED=false
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK_URL
DISCORD_FORMAT=embed

# Logging
DEBUG_MODE=true
```

### Update Configuration Files

Edit the configuration files to match your needs:

**WebSocket Configuration** (`src/configuration/websocket.ts`):
```typescript
const webSocketConfig: WebSocketConfig = {
    url: process.env.WEBSOCKET_URL || 'wss://ws.rugplay.com/',
    reconnectAttempts: parseInt(process.env.RECONNECT_ATTEMPTS || '5'),
    reconnectDelay: parseInt(process.env.RECONNECT_DELAY || '1000')
};
```

**Export Configuration** (`src/configuration/export.ts`):
```typescript
const exportConfig: ExportConfig = {
    file: {
        enabled: process.env.FILE_EXPORT_ENABLED === 'true',
        outputPath: process.env.EXPORT_PATH || './exports/data.json',
        format: (process.env.EXPORT_FORMAT as any) || 'json'
    },
    discord: {
        enabled: process.env.DISCORD_ENABLED === 'true',
        webhookUrl: process.env.DISCORD_WEBHOOK_URL || '',
        messageFormat: (process.env.DISCORD_FORMAT as any) || 'embed'
    }
};
```

---

## First Steps

### 1. Monitor Specific Tokens

```typescript
const watchedTokens = ['MOON', 'ROCKET', 'SAFE'];

client.on('trade', (data) => {
    if (watchedTokens.includes(data.coinSymbol)) {
        console.log(`🎯 Watched token trade: ${data.coinSymbol} - $${data.totalValue}`);
    }
});

client.on('price', (data) => {
    if (watchedTokens.includes(data.symbol)) {
        console.log(`💲 ${data.symbol} price: $${data.price} (${data.priceChange24h}%)`);
    }
});
```

### 2. Set Up Alerts

```typescript
// Large trade alerts
client.on('trade', (data) => {
    if (data.totalValue > 1000) {
        console.log(`🚨 Large trade: ${data.username} - $${data.totalValue.toLocaleString()}`);
    }
});

// Price spike alerts
let lastPrices = new Map();

client.on('price', (data) => {
    const lastPrice = lastPrices.get(data.symbol);
    if (lastPrice) {
        const change = ((data.price - lastPrice) / lastPrice) * 100;
        if (change > 20) {
            console.log(`🚀 Price spike: ${data.symbol} up ${change.toFixed(2)}%`);
        }
    }
    lastPrices.set(data.symbol, data.price);
});
```

### 3. Enable Data Export

```typescript
import { exportConfig } from './src/configuration/export';

const client = new RugplayClient({
    config: webSocketConfig,
    exportConfig: exportConfig, // Enable automatic data export
    autoConnect: true
});
```

This will automatically save all events to files in the format you configured.

---

## Common Use Cases

### Trading Bot Integration

```typescript
class TradingSignalGenerator {
    constructor(private client: RugplayClient) {
        this.setupSignals();
    }
    
    private setupSignals(): void {
        // Volume spike detection
        this.client.on('trade', (data) => {
            if (data.totalValue > 5000) {
                this.generateSignal('VOLUME_SPIKE', data);
            }
        });
        
        // Price movement tracking
        this.client.on('price', (data) => {
            if (Math.abs(data.priceChange24h) > 15) {
                this.generateSignal('PRICE_MOVEMENT', data);
            }
        });
    }
    
    private generateSignal(type: string, data: any): void {
        console.log(`🤖 Trading Signal: ${type}`, data);
        // Integrate with your trading bot here
    }
}

const signalGenerator = new TradingSignalGenerator(client);
```

### Research and Analytics

```typescript
class DataCollector {
    private trades: any[] = [];
    private prices: any[] = [];
    
    constructor(private client: RugplayClient) {
        this.setupCollection();
    }
    
    private setupCollection(): void {
        this.client.on('trade', (data) => {
            this.trades.push({
                timestamp: new Date(),
                symbol: data.coinSymbol,
                type: data.tradeType,
                amount: data.amount,
                price: data.price,
                value: data.totalValue
            });
        });
        
        // Export data every hour for analysis
        setInterval(() => {
            this.exportData();
        }, 60 * 60 * 1000);
    }
    
    private exportData(): void {
        console.log(`📊 Collected ${this.trades.length} trades and ${this.prices.length} price updates`);
        // Export to your preferred analytics platform
    }
}

const collector = new DataCollector(client);
```

---

## Troubleshooting

### Connection Issues

If you're having trouble connecting:

1. **Check the WebSocket URL**: Ensure `wss://ws.rugplay.com/` is accessible
2. **Firewall/Proxy**: Make sure WebSocket connections aren't blocked
3. **Network**: Try from a different network if issues persist

```typescript
client.on('error', (error) => {
    console.error('Connection error:', error);
});

client.on('disconnect', () => {
    console.log('Disconnected - will attempt reconnection');
});
```

### Performance Issues

For high-frequency trading data:

1. **Enable buffering** in EventLogger
2. **Filter events** to reduce processing load
3. **Use efficient data structures** for tracking

```typescript
// Filter only high-value trades
client.on('trade', (data) => {
    if (data.totalValue > 100) { // Only process trades > $100
        // Your processing logic
    }
});
```

### Memory Usage

For long-running processes:

```typescript
// Implement data cleanup
setInterval(() => {
    // Clear old data to prevent memory leaks
    if (this.trades.length > 10000) {
        this.trades = this.trades.slice(-5000); // Keep only recent 5000
    }
}, 30 * 60 * 1000); // Every 30 minutes
```

---

## Next Steps

1. **Read the [API Reference]({{ site.baseurl }}{% link api.md %})** for detailed documentation
2. **Explore [Configuration Options]({{ site.baseurl }}{% link configuration.md %})** for advanced setup
3. **Check out [Examples]({{ site.baseurl }}{% link examples.md %})** for real-world use cases
4. **Learn about [Event Types]({{ site.baseurl }}{% link events.md %})** to understand available data

---

## Getting Help

- **Issues**: Report bugs or request features on [GitHub Issues](https://github.com/your-username/rugplay-logger/issues)
- **Discussions**: Join discussions on [GitHub Discussions](https://github.com/your-username/rugplay-logger/discussions)
- **Discord**: Join our community Discord server for real-time help
