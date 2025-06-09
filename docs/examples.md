---
layout: default
title: Examples
nav_order: 5
---

# Examples
{: .no_toc }

Practical examples and recipes for using the Rugplay Logger in various scenarios.

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

## Basic Usage Examples

### Simple Event Logging

```typescript
import { RugplayClient } from './src/client/RugplayClient';
import { webSocketConfig } from './src/configuration/websocket';

const client = new RugplayClient({
    config: webSocketConfig,
    autoConnect: true,
    debug: true
});

// Log all trades
client.on('trade', (data) => {
    console.log(`${data.username} ${data.tradeType} ${data.amount} ${data.coinSymbol} at $${data.price}`);
});

// Log price changes
client.on('price', (data) => {
    console.log(`${data.symbol}: $${data.price} (${data.priceChange24h > 0 ? '+' : ''}${data.priceChange24h}%)`);
});
```

### File Export Only

```typescript
import { RugplayClient } from './src/client/RugplayClient';
import { webSocketConfig } from './src/configuration/websocket';

const exportConfig = {
    file: {
        enabled: true,
        outputPath: './exports/rugplay-trades.json',
        format: 'json' as const
    },
    discord: {
        enabled: false,
        webhookUrl: '',
        messageFormat: 'text' as const
    }
};

const client = new RugplayClient({
    config: webSocketConfig,
    exportConfig: exportConfig,
    autoConnect: true
});

console.log('Logging trades to file...');
```

---

## Advanced Monitoring Examples

### Whale Tracker

Track and alert on large trades from specific users or above certain thresholds.

```typescript
class WhaleTracker {
    private whaleThreshold = 10000; // $10k threshold
    private watchedWallets = new Set([
        'cryptowhale1',
        'bigtrader2',
        'moonwhale3'
    ]);
    
    constructor(private client: RugplayClient) {
        this.setupTracking();
    }
    
    private setupTracking(): void {
        this.client.on('trade', (data) => {
            if (this.isWhaleActivity(data)) {
                this.alertWhaleActivity(data);
            }
        });
    }
    
    private isWhaleActivity(trade: any): boolean {
        return trade.totalValue >= this.whaleThreshold || 
               this.watchedWallets.has(trade.username);
    }
    
    private alertWhaleActivity(trade: any): void {
        const emoji = trade.tradeType === 'buy' ? '🟢' : '🔴';
        console.log(
            `${emoji} WHALE ALERT: ${trade.username} ${trade.tradeType.toUpperCase()} ` +
            `${trade.amount.toLocaleString()} ${trade.coinSymbol} ` +
            `($${trade.totalValue.toLocaleString()})`
        );
    }
}

const whaleTracker = new WhaleTracker(client);
```

### Token Performance Monitor

Monitor specific tokens for price movements and trading activity.

```typescript
class TokenMonitor {
    private monitoredTokens = ['MOON', 'ROCKET', 'SAFE'];
    private priceHistory = new Map<string, number[]>();
    private volumeTracker = new Map<string, number>();
    
    constructor(private client: RugplayClient) {
        this.setupMonitoring();
    }
    
    private setupMonitoring(): void {
        this.client.on('price', (data) => {
            if (this.monitoredTokens.includes(data.symbol)) {
                this.trackPrice(data);
            }
        });
        
        this.client.on('trade', (data) => {
            if (this.monitoredTokens.includes(data.coinSymbol)) {
                this.trackVolume(data);
            }
        });
        
        // Report every 5 minutes
        setInterval(() => this.generateReport(), 5 * 60 * 1000);
    }
    
    private trackPrice(data: any): void {
        const history = this.priceHistory.get(data.symbol) || [];
        history.push(data.price);
        
        // Keep only last 100 price points
        if (history.length > 100) {
            history.shift();
        }
        
        this.priceHistory.set(data.symbol, history);
        
        // Check for significant moves
        if (history.length >= 2) {
            const prevPrice = history[history.length - 2];
            const change = ((data.price - prevPrice) / prevPrice) * 100;
            
            if (Math.abs(change) > 5) {
                console.log(`📊 ${data.symbol} moved ${change.toFixed(2)}% (${prevPrice} → ${data.price})`);
            }
        }
    }
    
    private trackVolume(data: any): void {
        const currentVolume = this.volumeTracker.get(data.coinSymbol) || 0;
        this.volumeTracker.set(data.coinSymbol, currentVolume + data.totalValue);
    }
    
    private generateReport(): void {
        console.log('\n📈 TOKEN PERFORMANCE REPORT');
        console.log('=' .repeat(50));
        
        for (const token of this.monitoredTokens) {
            const prices = this.priceHistory.get(token) || [];
            const volume = this.volumeTracker.get(token) || 0;
            
            if (prices.length > 0) {
                const currentPrice = prices[prices.length - 1];
                const firstPrice = prices[0];
                const change = prices.length > 1 ? 
                    ((currentPrice - firstPrice) / firstPrice) * 100 : 0;
                
                console.log(`${token}:`);
                console.log(`  Price: $${currentPrice.toFixed(8)}`);
                console.log(`  Change: ${change.toFixed(2)}%`);
                console.log(`  Volume: $${volume.toFixed(2)}`);
                console.log('');
            }
        }
        
        // Reset volume tracker
        this.volumeTracker.clear();
    }
}

const tokenMonitor = new TokenMonitor(client);
```

---

## Export Examples

### Multi-Format Data Export

Export the same data to multiple formats for different use cases.

```typescript
import { EventLogger } from './src/logger/EventLogger';

class MultiFormatExporter {
    private jsonLogger: EventLogger;
    private csvLogger: EventLogger;
    private yamlLogger: EventLogger;
    
    constructor(private client: RugplayClient) {
        this.setupLoggers();
        this.setupEventHandlers();
    }
    
    private setupLoggers(): void {
        // Detailed JSON export for analysis
        this.jsonLogger = new EventLogger({
            file: {
                enabled: true,
                outputPath: './exports/detailed-trades.json',
                format: 'json'
            },
            discord: { enabled: false, webhookUrl: '', messageFormat: 'text' }
        }, this.client);
        
        // CSV export for spreadsheet analysis
        this.csvLogger = new EventLogger({
            file: {
                enabled: true,
                outputPath: './exports/trades-summary.csv',
                format: 'csv'
            },
            discord: { enabled: false, webhookUrl: '', messageFormat: 'text' }
        }, this.client);
        
        // YAML export for configuration
        this.yamlLogger = new EventLogger({
            file: {
                enabled: true,
                outputPath: './exports/trade-config.yaml',
                format: 'yaml'
            },
            discord: { enabled: false, webhookUrl: '', messageFormat: 'text' }
        }, this.client);
    }
    
    private setupEventHandlers(): void {
        this.client.on('trade', (data) => {
            // Log full data to JSON
            this.jsonLogger.logEvent('trade', data);
            
            // Log summary to CSV
            const csvData = {
                timestamp: new Date(data.timestamp).toISOString(),
                symbol: data.coinSymbol,
                type: data.tradeType,
                amount: data.amount,
                price: data.price,
                value: data.totalValue,
                user: data.username
            };
            this.csvLogger.logEvent('trade-summary', csvData);
            
            // Log high-value trades to YAML
            if (data.totalValue > 1000) {
                this.yamlLogger.logEvent('high-value-trade', {
                    symbol: data.coinSymbol,
                    value: data.totalValue,
                    timestamp: data.timestamp
                });
            }
        });
    }
}

const exporter = new MultiFormatExporter(client);
```

### Discord Alert System

Send different types of alerts to Discord channels.

```typescript
class DiscordAlertSystem {
    private tradeLogger: EventLogger;
    private rugLogger: EventLogger;
    private whaleLogger: EventLogger;
    
    constructor(private client: RugplayClient) {
        this.setupLoggers();
        this.setupAlerts();
    }
    
    private setupLoggers(): void {
        // General trades channel
        this.tradeLogger = new EventLogger({
            file: { enabled: false, outputPath: '', format: 'json' },
            discord: {
                enabled: true,
                webhookUrl: process.env.DISCORD_TRADES_WEBHOOK!,
                messageFormat: 'embed'
            }
        }, this.client);
        
        // Rug alerts channel
        this.rugLogger = new EventLogger({
            file: { enabled: false, outputPath: '', format: 'json' },
            discord: {
                enabled: true,
                webhookUrl: process.env.DISCORD_ALERTS_WEBHOOK!,
                messageFormat: 'embed'
            }
        }, this.client);
        
        // Whale alerts channel
        this.whaleLogger = new EventLogger({
            file: { enabled: false, outputPath: '', format: 'json' },
            discord: {
                enabled: true,
                webhookUrl: process.env.DISCORD_WHALES_WEBHOOK!,
                messageFormat: 'embed'
            }
        }, this.client);
    }
    
    private setupAlerts(): void {
        this.client.on('trade', (data) => {
            if (data.totalValue > 5000) {
                this.whaleLogger.logEvent('whale-trade', {
                    title: '🐋 Whale Alert',
                    description: `${data.username} ${data.tradeType} ${data.coinSymbol}`,
                    fields: [
                        { name: 'Amount', value: data.amount.toLocaleString(), inline: true },
                        { name: 'Value', value: `$${data.totalValue.toLocaleString()}`, inline: true },
                        { name: 'Price', value: `$${data.price.toFixed(8)}`, inline: true }
                    ],
                    color: data.tradeType === 'buy' ? 0x00ff00 : 0xff0000
                });
            } else {
                this.tradeLogger.logEvent('trade', {
                    title: `${data.coinSymbol} Trade`,
                    description: `${data.username} ${data.tradeType}`,
                    fields: [
                        { name: 'Amount', value: data.amount.toLocaleString(), inline: true },
                        { name: 'Value', value: `$${data.totalValue.toFixed(2)}`, inline: true }
                    ]
                });
            }
        });
        
        this.client.on('rug-alert', (data) => {
            this.rugLogger.logEvent('rug-alert', {
                title: '🚨 RUG PULL ALERT',
                description: `Suspicious activity detected for ${data.symbol}`,
                fields: [
                    { name: 'Type', value: data.alertType, inline: true },
                    { name: 'Severity', value: data.severity.toUpperCase(), inline: true }
                ],
                color: 0xff0000
            });
        });
    }
}

const discordAlerts = new DiscordAlertSystem(client);
```

---

## Data Analysis Examples

### Trading Pattern Analysis

Analyze trading patterns and identify trends.

```typescript
class TradingAnalyzer {
    private trades: any[] = [];
    private patterns = new Map<string, any>();
    
    constructor(private client: RugplayClient) {
        this.setupAnalysis();
    }
    
    private setupAnalysis(): void {
        this.client.on('trade', (data) => {
            this.trades.push({
                ...data,
                hour: new Date(data.timestamp).getHours(),
                dayOfWeek: new Date(data.timestamp).getDay()
            });
            
            // Analyze every 100 trades
            if (this.trades.length % 100 === 0) {
                this.analyzePatterns();
            }
        });
    }
    
    private analyzePatterns(): void {
        console.log('\n📊 TRADING PATTERN ANALYSIS');
        console.log('=' .repeat(50));
        
        // Hour analysis
        const hourlyVolume = new Map<number, number>();
        const hourlyCount = new Map<number, number>();
        
        this.trades.forEach(trade => {
            const hour = trade.hour;
            hourlyVolume.set(hour, (hourlyVolume.get(hour) || 0) + trade.totalValue);
            hourlyCount.set(hour, (hourlyCount.get(hour) || 0) + 1);
        });
        
        // Find peak trading hours
        const peakHour = Array.from(hourlyVolume.entries())
            .sort((a, b) => b[1] - a[1])[0];
        
        console.log(`Peak trading hour: ${peakHour[0]}:00 ($${peakHour[1].toFixed(2)} volume)`);
        
        // Token analysis
        const tokenStats = new Map<string, { count: number, volume: number }>();
        
        this.trades.forEach(trade => {
            const stats = tokenStats.get(trade.coinSymbol) || { count: 0, volume: 0 };
            stats.count++;
            stats.volume += trade.totalValue;
            tokenStats.set(trade.coinSymbol, stats);
        });
        
        // Top tokens by volume
        const topTokens = Array.from(tokenStats.entries())
            .sort((a, b) => b[1].volume - a[1].volume)
            .slice(0, 5);
        
        console.log('\nTop tokens by volume:');
        topTokens.forEach(([symbol, stats], index) => {
            console.log(`${index + 1}. ${symbol}: $${stats.volume.toFixed(2)} (${stats.count} trades)`);
        });
        
        // Keep only recent trades (last 1000)
        if (this.trades.length > 1000) {
            this.trades = this.trades.slice(-1000);
        }
    }
}

const analyzer = new TradingAnalyzer(client);
```

### Portfolio Tracker

Track a portfolio of tokens and calculate performance.

```typescript
class PortfolioTracker {
    private portfolio = new Map<string, { amount: number, avgPrice: number }>();
    private currentPrices = new Map<string, number>();
    
    constructor(private client: RugplayClient, initialPortfolio: { symbol: string, amount: number, price: number }[]) {
        initialPortfolio.forEach(item => {
            this.portfolio.set(item.symbol, {
                amount: item.amount,
                avgPrice: item.price
            });
        });
        
        this.setupTracking();
    }
    
    private setupTracking(): void {
        this.client.on('price', (data) => {
            if (this.portfolio.has(data.symbol)) {
                this.currentPrices.set(data.symbol, data.price);
                this.updatePortfolioValue();
            }
        });
        
        this.client.on('trade', (data) => {
            if (this.portfolio.has(data.coinSymbol)) {
                console.log(`📈 Portfolio token ${data.coinSymbol} traded: ${data.tradeType} $${data.totalValue}`);
            }
        });
    }
    
    private updatePortfolioValue(): void {
        let totalValue = 0;
        let totalCost = 0;
        
        console.log('\n💼 PORTFOLIO UPDATE');
        console.log('=' .repeat(50));
        
        this.portfolio.forEach((holding, symbol) => {
            const currentPrice = this.currentPrices.get(symbol) || 0;
            const currentValue = holding.amount * currentPrice;
            const costBasis = holding.amount * holding.avgPrice;
            const pnl = currentValue - costBasis;
            const pnlPercent = (pnl / costBasis) * 100;
            
            totalValue += currentValue;
            totalCost += costBasis;
            
            console.log(`${symbol}:`);
            console.log(`  Amount: ${holding.amount.toLocaleString()}`);
            console.log(`  Avg Price: $${holding.avgPrice.toFixed(8)}`);
            console.log(`  Current Price: $${currentPrice.toFixed(8)}`);
            console.log(`  Value: $${currentValue.toFixed(2)}`);
            console.log(`  P&L: $${pnl.toFixed(2)} (${pnlPercent.toFixed(2)}%)`);
            console.log('');
        });
        
        const totalPnl = totalValue - totalCost;
        const totalPnlPercent = (totalPnl / totalCost) * 100;
        
        console.log(`Total Portfolio Value: $${totalValue.toFixed(2)}`);
        console.log(`Total P&L: $${totalPnl.toFixed(2)} (${totalPnlPercent.toFixed(2)}%)`);
    }
}

// Usage
const portfolio = new PortfolioTracker(client, [
    { symbol: 'MOON', amount: 1000000, price: 0.00001 },
    { symbol: 'ROCKET', amount: 500000, price: 0.00002 },
    { symbol: 'SAFE', amount: 2000000, price: 0.000005 }
]);
```

---

## Error Handling Examples

### Robust Connection Management

```typescript
class RobustRugplayClient {
    private client: RugplayClient;
    private reconnectCount = 0;
    private maxReconnects = 10;
    
    constructor() {
        this.createClient();
        this.setupErrorHandling();
    }
    
    private createClient(): void {
        this.client = new RugplayClient({
            config: webSocketConfig,
            exportConfig: exportConfig,
            autoConnect: true,
            debug: false
        });
    }
    
    private setupErrorHandling(): void {
        this.client.on('error', (error) => {
            console.error(`❌ WebSocket error (attempt ${this.reconnectCount}):`, error);
            this.handleReconnection();
        });
        
        this.client.on('disconnect', () => {
            console.log('🔌 Disconnected from server');
            this.handleReconnection();
        });
        
        this.client.on('connect', () => {
            console.log('✅ Connected successfully');
            this.reconnectCount = 0; // Reset counter on successful connection
        });
        
        // Handle process termination gracefully
        process.on('SIGINT', this.gracefulShutdown.bind(this));
        process.on('SIGTERM', this.gracefulShutdown.bind(this));
    }
    
    private handleReconnection(): void {
        if (this.reconnectCount >= this.maxReconnects) {
            console.error('❌ Max reconnection attempts reached. Exiting...');
            process.exit(1);
        }
        
        this.reconnectCount++;
        const delay = Math.min(1000 * Math.pow(2, this.reconnectCount), 30000); // Exponential backoff
        
        console.log(`🔄 Attempting reconnection in ${delay}ms (attempt ${this.reconnectCount}/${this.maxReconnects})`);
        
        setTimeout(() => {
            this.client.connect();
        }, delay);
    }
    
    private gracefulShutdown(): void {
        console.log('\n👋 Shutting down gracefully...');
        this.client.disconnect();
        process.exit(0);
    }
    
    public getClient(): RugplayClient {
        return this.client;
    }
}

const robustClient = new RobustRugplayClient();
const client = robustClient.getClient();
```

---

## Performance Optimization Examples

### Event Throttling

```typescript
class ThrottledEventHandler {
    private lastProcessed = new Map<string, number>();
    private throttleMs = 1000; // 1 second throttle
    
    constructor(private client: RugplayClient) {
        this.setupThrottling();
    }
    
    private setupThrottling(): void {
        this.client.on('price', (data) => {
            const key = data.symbol;
            const now = Date.now();
            const lastTime = this.lastProcessed.get(key) || 0;
            
            if (now - lastTime >= this.throttleMs) {
                this.processPriceUpdate(data);
                this.lastProcessed.set(key, now);
            }
        });
    }
    
    private processPriceUpdate(data: any): void {
        console.log(`Price update: ${data.symbol} = $${data.price}`);
    }
}

const throttledHandler = new ThrottledEventHandler(client);
```

This comprehensive documentation provides practical examples for implementing the Rugplay Logger in various real-world scenarios. Each example is production-ready and includes proper error handling and best practices.
