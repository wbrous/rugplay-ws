# Rugplay Logger SDK

A TypeScript SDK for connecting to and logging events from the Rugplay WebSocket API.

## Installation

```bash
npm install
npm run build
```

## Quick Start

### Basic Usage

```typescript
import { RugplayClient } from './src/sdk';

const client = new RugplayClient({
    config: {
        url: 'wss://ws.rugplay.com/',
        reconnectAttempts: 3,
        reconnectDelay: 1000
    },
    autoConnect: true,
    debug: true
});

// Listen for events
client.on('message', (data) => {
    console.log('Raw message received:', data);
});

client.on('all-trades', (data) => {
    console.log('Trade event:', {
        type: data.type,
        username: data.username,
        amount: data.amount,
        coinSymbol: data.coinSymbol,
        coinName: data.coinName,
        totalValue: data.totalValue,
        price: data.price,
        timestamp: new Date(data.timestamp).toISOString(),
        userId: data.userId
    });
});

client.on('trade', (data) => {
    console.log('Trade event (processed):', data);
});

client.on('price', (data) => {
    console.log('Price update:', data);
});
```

### Using Pre-configured WebSocket Settings

```typescript
import { RugplayClient, webSocketConfig } from './src/sdk';

const client = new RugplayClient({
    config: webSocketConfig,
    autoConnect: true,
    debug: true
});
```

## Event Structure

The Rugplay WebSocket sends events with the following structure:

```json
{
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
}
```

## API Reference

### RugplayClient

#### Constructor Options

```typescript
interface RugplayClientOptions {
    config: WebSocketConfig;    // WebSocket configuration
    autoConnect?: boolean;      // Auto-connect on instantiation (default: true)
    debug?: boolean;           // Enable debug logging (default: false)
}
```

#### Methods

- `connect()` - Manually connect to the WebSocket
- `disconnect()` - Disconnect from the WebSocket
- `on(eventName, handler)` - Register an event handler
- `off(eventName, handler?)` - Remove an event handler
- `send(data)` - Send data to the server
- `isConnected()` - Check connection status
- `getStatus()` - Get detailed connection status

#### Events

The client automatically parses incoming JSON messages and triggers appropriate events:

- `message` - All raw messages from the server
- `all-trades` - Trade events with full trade data
- `trade` - Processed trade events
- `price` - Price update events
- `update` - General update events

You can also listen for any custom event type that matches the `type` field in incoming messages.

## Configuration

### WebSocket Configuration

```typescript
interface WebSocketConfig {
    url: string;                // WebSocket URL (e.g., 'wss://ws.rugplay.com/')
    reconnectAttempts: number;  // Number of reconnection attempts (default: 3)
    reconnectDelay: number;     // Delay between reconnections in ms (default: 1000)
}
```

### Export Configuration

```typescript
interface ExportConfig {
    file: {
        enabled: boolean;        // Enable file exports
        outputPath: string;      // Output file path
        format: 'json' | 'yaml' | 'csv';  // Export format
    };
    discord: {
        enabled: boolean;        // Enable Discord webhooks
        webhookUrl: string;      // Discord webhook URL
        messageFormat: 'text' | 'embed';  // Message format
    };
}
```

## Example Trade Event Data

When you listen for `all-trades` events, you'll receive data like this:

```typescript
{
  type: "BUY",
  username: "extoci",
  userImage: "avatars/76.png",
  amount: 68323.23717650399,
  coinSymbol: "BI",
  coinName: "BisexualCoin",
  coinIcon: "coins/bi.jpg",
  totalValue: 123,
  price: 0.0018054923904243742,
  timestamp: 1749415648528,
  userId: "76"
}
```

## Development

### Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run the compiled application
- `npm run dev` - Run TypeScript compiler in watch mode
- `npm run clean` - Clean the dist folder

### Project Structure

```
src/
├── client/
│   └── RugplayClient.ts     # Main WebSocket client class
├── configuration/
│   ├── auth.ts              # Authentication configuration
│   └── export.ts            # Export configuration
├── types/
│   └── config.ts            # TypeScript interfaces
├── logger/
│   └── EventLogger.ts       # Event logging utilities
├── index.ts                 # Main application entry point
└── sdk.ts                   # SDK exports
```

## License

ISC
