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

## Core Events

### message

Fired for all incoming WebSocket messages (useful for debugging and raw message handling).

```typescript
client.on('message', (data) => {
    console.log('Raw message:', data);
});
```

**Data**: Raw message object from WebSocket

---

## Trading Events

The Rugplay WebSocket primarily provides trade events through the `all-trades` stream. The client automatically processes these and triggers multiple specialized events.

### trade

Fired for all individual trade events after processing from the `all-trades` stream.

```typescript
client.on('trade', (data) => {
    console.log('Trade:', data);
});
```

**Raw Data Structure** (from WebSocket):
```typescript
{
    type: "BUY" | "SELL";   // Trade direction
    username: string;       // Trader's username  
    userId: string;         // Unique user identifier
    amount: number;         // Number of tokens traded
    coinSymbol: string;     // Token symbol (e.g., "MOON")
    coinName: string;       // Full token name
    coinIcon?: string;      // Token icon path
    userImage?: string;     // User avatar path
    totalValue: number;     // Total USD value of trade
    price: number;          // Price per token in USD
    timestamp: number;      // Unix timestamp
}
```

**Example Raw Trade**:
```json
{
    "type": "BUY",
    "username": "cryptotrader123",
    "userId": "user_abc123",
    "amount": 1000000,
    "coinSymbol": "MOON",
    "coinName": "MoonCoin",
    "coinIcon": "images/coins/moon.png",
    "userImage": "images/users/trader123.jpg",
    "totalValue": 15.75,
    "price": 0.00001575,
    "timestamp": 1705312200000
}
```

### buy

Fired specifically for buy trades (when `type === "BUY"`).

```typescript
client.on('buy', (data) => {
    console.log('Buy order:', data);
});
```

**Data**: Same structure as trade event, but only for BUY orders

### sell

Fired specifically for sell trades (when `type === "SELL"`).

```typescript
client.on('sell', (data) => {
    console.log('Sell order:', data);
});
```

**Data**: Same structure as trade event, but only for SELL orders

### whale-trade

Fired for large trades with a total value of $100,000 or more.

```typescript
client.on('whale-trade', (data) => {
    console.log('Whale trade detected:', data);
});
```

**Data**: Same structure as trade event, but only for trades ≥ $100K

### Token-Specific Trade Events

The client automatically creates coin-specific events using the pattern `trade:{symbol}` (lowercase).

```typescript
// Listen for trades of a specific token
client.on('trade:moon', (data) => {
    console.log('MOON token trade:', data);
});

client.on('trade:doge', (data) => {
    console.log('DOGE token trade:', data);
});
```

**Data**: Same structure as trade event, filtered by coin symbol

---

## Formatted Events (For Logging)

When using the EventLogger, trades are automatically formatted with enhanced structure for better readability and analysis.

### Formatted Trade Structure

The EventLogger receives trades in this enhanced format:

```typescript
{
    type: "trade",
    data: {
        // Basic trade information
        trade_type: "BUY" | "SELL",
        action: "buy" | "sell",
        
        // User information
        user: {
            id: string,
            username: string,
            avatar_url: string | null  // Full URL to avatar
        },
        
        // Coin information
        coin: {
            symbol: string,
            name: string,
            icon_url: string | null    // Full URL to coin icon
        },
        
        // Transaction details
        transaction: {
            amount: number,
            amount_formatted: string,      // e.g., "1.5M", "250K"
            price_per_unit: number,
            price_formatted: string,       // e.g., "$0.00001575"
            total_value: number,
            total_value_formatted: string  // e.g., "$15.75"
        },
        
        // Timing
        timestamp: number,
        timestamp_iso: string,         // ISO 8601 format
        timestamp_human: string,       // Localized format
        
        // Metadata
        metadata: {
            event_source: "rugplay",
            event_type: "trade",
            market_direction: "bullish" | "bearish",
            trade_size: "micro" | "small" | "medium" | "large" | "whale",
            processed_at: string       // ISO timestamp of processing
        }
    }
}
```

**Trade Size Categories**:
- `whale`: ≥ $100,000
- `large`: ≥ $10,000
- `medium`: ≥ $1,000  
- `small`: ≥ $100
- `micro`: < $100

---

## Price Events

### price

Fired when trade data contains price information (automatically triggered for trades).

```typescript
client.on('price', (data) => {
    console.log('Price update:', data);
});
```

**Data**: Same as trade event data, but specifically when price field is present

---

## General Events

### update

Fired for any structured data received from the WebSocket (general catch-all event).

```typescript
client.on('update', (data) => {
    console.log('General update:', data);
});
```

**Data**: Any structured message data from the WebSocket

---

## Connection Events

The RugplayClient handles connection internally, but you can monitor connection status:

### Connection Status Methods

```typescript
// Check if connected
const isConnected = client.isConnected();

// Get current status
const status = client.getStatus(); 
// Returns: 'connecting' | 'connected' | 'closing' | 'disconnected'
```

### Internal Connection Handling

The client automatically:
- Connects on instantiation (unless `autoConnect: false`)
- Reconnects on connection loss (with exponential backoff)
- Sends subscription messages on connection
- Handles ping/pong keepalive messages

**Subscription Messages Sent**:
```json
{ "type": "subscribe", "channel": "trades:all" }
{ "type": "subscribe", "channel": "trades:large" }  
{ "type": "set_coin", "coinSymbol": "@global" }
```

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
    
    private handleError(error: Error): void {
        console.error('WebSocket error:', error);
    }
}

// Usage
const eventHandler = new RugplayEventHandler(client);
```

---

## Event Usage Examples

### Basic Trade Monitoring

```typescript
import { RugplayClient } from 'rugplay-websocket-sdk';

const client = new RugplayClient({
    config: {
        url: 'wss://rugplay.com/ws',
        reconnectAttempts: 5,
        reconnectDelay: 1000
    },
    debug: true
});

// Monitor all trades
client.on('trade', (data) => {
    console.log(`${data.type}: ${data.username} traded ${data.amount} ${data.coinSymbol} for $${data.totalValue}`);
});

// Monitor only large trades
client.on('whale-trade', (data) => {
    console.log(`🐋 WHALE ALERT: ${data.username} ${data.type.toLowerCase()}s $${data.totalValue} worth of ${data.coinSymbol}`);
});

// Monitor specific tokens
client.on('trade:doge', (data) => {
    console.log(`DOGE trade: $${data.totalValue}`);
});
```

### Advanced Event Handling

```typescript
class TradingBot {
    private volumeTracker = new Map<string, number>();
    private tradeCount = new Map<string, number>();
    
    constructor(private client: RugplayClient) {
        this.setupEventListeners();
    }
    
    private setupEventListeners(): void {
        // Track volume by token
        this.client.on('trade', (data) => {
            const symbol = data.coinSymbol;
            const currentVolume = this.volumeTracker.get(symbol) || 0;
            const currentCount = this.tradeCount.get(symbol) || 0;
            
            this.volumeTracker.set(symbol, currentVolume + data.totalValue);
            this.tradeCount.set(symbol, currentCount + 1);
            
            // Alert on high activity
            if (currentCount > 0 && currentCount % 10 === 0) {
                console.log(`High activity: ${symbol} has ${currentCount} trades with $${currentVolume.toFixed(2)} volume`);
            }
        });
        
        // Separate buy/sell tracking
        this.client.on('buy', (data) => {
            if (data.totalValue > 1000) {
                console.log(`💰 Large buy: $${data.totalValue} of ${data.coinSymbol}`);
            }
        });
        
        this.client.on('sell', (data) => {
            if (data.totalValue > 1000) {
                console.log(`💸 Large sell: $${data.totalValue} of ${data.coinSymbol}`);
            }
        });
    }
    
    public getStats(): any {
        return {
            volumes: Object.fromEntries(this.volumeTracker),
            tradeCounts: Object.fromEntries(this.tradeCount)
        };
    }
}

// Usage
const bot = new TradingBot(client);

// Get stats every minute
setInterval(() => {
    console.log('Trading Stats:', bot.getStats());
}, 60000);
```

### Debugging and Monitoring

```typescript
// Enable debug logging
const client = new RugplayClient({
    config: { /* ... */ },
    debug: true  // Enables detailed console logging
});

// Monitor all raw WebSocket messages
client.on('message', (rawData) => {
    console.log('Raw WebSocket message:', rawData);
});

// Check connection status
setInterval(() => {
    const status = client.getStatus();
    const isConnected = client.isConnected();
    console.log(`Connection status: ${status} (connected: ${isConnected})`);
}, 5000);
```
