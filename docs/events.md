---
layout: default
title: Event Types
nav_order: 4
---

# Event Types
{: .no_toc }

Complete reference for all WebSocket events available from the Rugplay API.

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

## Connection Events

### connect

Fired when the WebSocket connection is successfully established.

```typescript
client.on('connect', () => {
    console.log('Connected to Rugplay WebSocket');
});
```

**Data**: None

### disconnect

Fired when the WebSocket connection is lost.

```typescript
client.on('disconnect', () => {
    console.log('Disconnected from Rugplay WebSocket');
});
```

**Data**: None

### error

Fired when a WebSocket error occurs.

```typescript
client.on('error', (error) => {
    console.error('WebSocket error:', error);
});
```

**Data**: Error object

---

## Trading Events

### trade

Fired for individual trade events.

```typescript
client.on('trade', (data) => {
    console.log('Trade:', data);
});
```

**Data Structure**:
```typescript
{
    type: string;           // Event type identifier
    username: string;       // Trader's username
    amount: number;         // Number of tokens traded
    coinSymbol: string;     // Token symbol (e.g., "MOON")
    coinName: string;       // Full token name
    totalValue: number;     // Total USD value of trade
    price: number;          // Price per token
    timestamp: number;      // Unix timestamp
    userId: string;         // Unique user identifier
    tradeType: 'buy' | 'sell';  // Type of trade
}
```

**Example**:
```json
{
    "type": "trade",
    "username": "cryptotrader123",
    "amount": 1000000,
    "coinSymbol": "MOON",
    "coinName": "MoonCoin",
    "totalValue": 15.75,
    "price": 0.00001575,
    "timestamp": 1705312200000,
    "userId": "user_abc123",
    "tradeType": "buy"
}
```

### all-trades

Fired for aggregated trade information across all tokens.

```typescript
client.on('all-trades', (data) => {
    console.log('All trades update:', data);
});
```

**Data Structure**:
```typescript
{
    type: string;           // Event type identifier
    totalVolume: number;    // Total trading volume (USD)
    tradeCount: number;     // Number of trades in period
    topTokens: Array<{
        symbol: string;     // Token symbol
        volume: number;     // Trading volume
        trades: number;     // Number of trades
    }>;
    timestamp: number;      // Unix timestamp
}
```

---

## Price Events

### price

Fired when token prices are updated.

```typescript
client.on('price', (data) => {
    console.log('Price update:', data);
});
```

**Data Structure**:
```typescript
{
    symbol: string;         // Token symbol
    name: string;           // Token name
    price: number;          // Current price in USD
    priceChange24h: number; // 24h price change (%)
    volume24h: number;      // 24h trading volume
    marketCap: number;      // Market capitalization
    timestamp: number;      // Unix timestamp
    holders: number;        // Number of token holders
}
```

**Example**:
```json
{
    "symbol": "MOON",
    "name": "MoonCoin",
    "price": 0.00001575,
    "priceChange24h": 15.5,
    "volume24h": 125000.50,
    "marketCap": 1575000,
    "timestamp": 1705312200000,
    "holders": 1250
}
```

---

## Market Events

### update

Fired for general market updates and statistics.

```typescript
client.on('update', (data) => {
    console.log('Market update:', data);
});
```

**Data Structure**:
```typescript
{
    type: string;           // Update type
    data: {
        totalMarketCap: number;     // Total market cap
        totalVolume: number;        // Total trading volume
        activeTokens: number;       // Number of active tokens
        newTokens: number;          // New tokens launched today
        rugPulls: number;           // Number of rug pulls detected
    };
    timestamp: number;      // Unix timestamp
}
```

### new-token

Fired when a new token is launched on the platform.

```typescript
client.on('new-token', (data) => {
    console.log('New token launched:', data);
});
```

**Data Structure**:
```typescript
{
    symbol: string;         // Token symbol
    name: string;           // Token name
    creator: string;        // Creator's username
    initialPrice: number;   // Launch price
    initialLiquidity: number; // Initial liquidity
    contractAddress: string; // Smart contract address
    timestamp: number;      // Launch timestamp
    description?: string;   // Optional token description
}
```

---

## Alert Events

### whale-alert

Fired for large trades (whale movements).

```typescript
client.on('whale-alert', (data) => {
    console.log('Whale alert:', data);
});
```

**Data Structure**:
```typescript
{
    symbol: string;         // Token symbol
    username: string;       // Whale's username
    amount: number;         // Trade amount
    value: number;          // USD value
    tradeType: 'buy' | 'sell';
    timestamp: number;      // Trade timestamp
}
```

---

## Raw Events

### message

Fired for all incoming WebSocket messages (useful for debugging).

```typescript
client.on('message', (data) => {
    console.log('Raw message:', data);
});
```

**Data**: Raw message object from WebSocket

---

## Event Filtering

### Filter by Token Symbol

```typescript
client.on('trade', (data) => {
    if (data.coinSymbol === 'MOON') {
        console.log('MOON trade:', data);
    }
});
```

### Filter by Trade Value

```typescript
client.on('trade', (data) => {
    if (data.totalValue > 1000) {
        console.log('Large trade detected:', data);
    }
});
```

### Filter by User

```typescript
const watchedUsers = ['cryptowhale1', 'megaTrader'];

client.on('trade', (data) => {
    if (watchedUsers.includes(data.username)) {
        console.log('Watched user trade:', data);
    }
});
```

---

## Event Aggregation

### Trade Volume Tracking

```typescript
const volumeTracker = new Map<string, number>();

client.on('trade', (data) => {
    const currentVolume = volumeTracker.get(data.coinSymbol) || 0;
    volumeTracker.set(data.coinSymbol, currentVolume + data.totalValue);
});

// Log volume every minute
setInterval(() => {
    console.log('Current volumes:', Object.fromEntries(volumeTracker));
}, 60000);
```

### Price Change Monitoring

```typescript
const priceHistory = new Map<string, number>();

client.on('price', (data) => {
    const lastPrice = priceHistory.get(data.symbol);
    if (lastPrice) {
        const changePercent = ((data.price - lastPrice) / lastPrice) * 100;
        if (Math.abs(changePercent) > 10) {
            console.log(`Significant price change for ${data.symbol}: ${changePercent.toFixed(2)}%`);
        }
    }
    priceHistory.set(data.symbol, data.price);
});
```

---

## Best Practices

1. **Event Debouncing**: Use debouncing for high-frequency events to avoid overwhelming your application
2. **Error Handling**: Always include error handling in event listeners
3. **Memory Management**: Clean up event listeners when no longer needed
4. **Filtering**: Filter events at the listener level to reduce processing overhead
5. **Logging**: Use appropriate log levels for different event types
6. **Rate Limiting**: Implement rate limiting for actions triggered by events

### Example: Comprehensive Event Handler

```typescript
class RugplayEventHandler {
    private volumeTracker = new Map<string, number>();
    private lastPrices = new Map<string, number>();
    
    constructor(private client: RugplayClient) {
        this.setupEventListeners();
    }
    
    private setupEventListeners(): void {
        this.client.on('trade', this.handleTrade.bind(this));
        this.client.on('price', this.handlePriceUpdate.bind(this));
        this.client.on('rug-alert', this.handleRugAlert.bind(this));
        this.client.on('error', this.handleError.bind(this));
    }
    
    private handleTrade(data: TradeEvent): void {
        // Track volume
        const currentVolume = this.volumeTracker.get(data.coinSymbol) || 0;
        this.volumeTracker.set(data.coinSymbol, currentVolume + data.totalValue);
        
        // Alert for large trades
        if (data.totalValue > 5000) {
            console.log(`🐋 Large trade alert: ${data.username} ${data.tradeType} ${data.amount} ${data.coinSymbol} for $${data.totalValue}`);
        }
    }
    
    private handlePriceUpdate(data: PriceEvent): void {
        const lastPrice = this.lastPrices.get(data.symbol);
        if (lastPrice) {
            const changePercent = ((data.price - lastPrice) / lastPrice) * 100;
            if (changePercent > 20) {
                console.log(`🚀 Moon alert: ${data.symbol} up ${changePercent.toFixed(2)}%`);
            } else if (changePercent < -20) {
                console.log(`📉 Dump alert: ${data.symbol} down ${changePercent.toFixed(2)}%`);
            }
        }
        this.lastPrices.set(data.symbol, data.price);
    }
    
    private handleRugAlert(data: RugAlertEvent): void {
        console.warn(`🚨 RUG ALERT: ${data.symbol} - ${data.alertType} (${data.severity})`);
    }
    
    private handleError(error: Error): void {
        console.error('WebSocket error:', error);
    }
}

// Usage
const eventHandler = new RugplayEventHandler(client);
```
