---
layout: default
title: API Reference
nav_order: 2
---

# API Reference
{: .no_toc }

Complete API documentation for the Rugplay Logger SDK.

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

## RugplayClient

The main client class for connecting to the Rugplay WebSocket API.

### Constructor

```typescript
new RugplayClient(options: RugplayClientOptions)
```

#### RugplayClientOptions

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `config` | `WebSocketConfig` | Yes | - | WebSocket connection configuration |
| `exportConfig` | `ExportConfig` | No | - | Export configuration for logging |
| `autoConnect` | `boolean` | No | `true` | Whether to automatically connect on instantiation |
| `debug` | `boolean` | No | `false` | Enable debug logging |

### Methods

#### connect()

Establishes a connection to the Rugplay WebSocket server.

```typescript
client.connect(): void
```

#### disconnect()

Disconnects from the WebSocket server and cleans up resources.

```typescript
client.disconnect(): void
```

#### on(eventName, handler)

Registers an event handler for the specified event.

```typescript
client.on(eventName: string, handler: (data: any) => void): void
```

**Parameters:**
- `eventName` - The name of the event to listen for
- `handler` - The callback function to execute when the event is received

**Available Events:**
- `connect` - Fired when connection is established
- `disconnect` - Fired when connection is lost
- `message` - Fired for all incoming messages
- `trade` - Fired for trade events
- `price` - Fired for price updates
- `all-trades` - Fired for all trades events
- `update` - Fired for general updates
- `error` - Fired when an error occurs

#### off(eventName, handler)

Removes an event handler.

```typescript
client.off(eventName: string, handler?: (data: any) => void): void
```

**Parameters:**
- `eventName` - The name of the event
- `handler` - Optional specific handler to remove. If not provided, all handlers for the event are removed

### Example

```typescript
import { RugplayClient } from './src/client/RugplayClient';
import { webSocketConfig } from './src/configuration/websocket';

const client = new RugplayClient({
    config: webSocketConfig,
    autoConnect: true,
    debug: true
});

client.on('trade', (data) => {
    console.log('Trade received:', data);
});

client.on('connect', () => {
    console.log('Connected to Rugplay WebSocket');
});

client.on('error', (error) => {
    console.error('WebSocket error:', error);
});
```

---

## EventLogger

Handles logging and exporting of events to various formats and destinations.

### Constructor

```typescript
new EventLogger(config: ExportConfig, client: RugplayClient, bufferSize?: number)
```

**Parameters:**
- `config` - Export configuration
- `client` - Reference to the RugplayClient instance
- `bufferSize` - Optional buffer size for batching events (default: 100)

### Methods

#### logEvent(eventType, eventData)

Logs an event for export.

```typescript
logger.logEvent(eventType: string, eventData: any): void
```

#### flushEvents()

Manually flush buffered events to configured destinations.

```typescript
logger.flushEvents(): void
```

#### shutdown()

Gracefully shutdown the logger and flush remaining events.

```typescript
logger.shutdown(): void
```

### Example

```typescript
import { EventLogger } from './src/logger/EventLogger';
import { exportConfig } from './src/configuration/export';

const logger = new EventLogger(exportConfig, client, 50);

// Events are automatically logged when received by the client
// Manual logging can also be done:
logger.logEvent('custom-event', { data: 'example' });
```

---

## Configuration Types

### WebSocketConfig

Configuration for WebSocket connection.

```typescript
interface WebSocketConfig {
    url: string;                    // WebSocket server URL
    reconnectAttempts: number;      // Maximum reconnection attempts
    reconnectDelay: number;         // Delay between reconnection attempts (ms)
}
```

### ExportConfig

Configuration for event export functionality.

```typescript
interface ExportConfig {
    file: {
        enabled: boolean;           // Enable file export
        outputPath: string;         // Output file path
        format: 'json' | 'yaml' | 'csv';  // Export format
    };
    discord: {
        enabled: boolean;           // Enable Discord export
        webhookUrl: string;         // Discord webhook URL
        messageFormat: 'text' | 'embed';  // Message format
    };
}
```

---

## Event Data Structures

### Trade Event

```typescript
interface TradeEvent {
    type: string;           // Event type
    username: string;       // Trader username
    amount: number;         // Trade amount
    coinSymbol: string;     // Coin symbol
    coinName: string;       // Coin name
    totalValue: number;     // Total trade value
    price: number;          // Price per unit
    timestamp: number;      // Unix timestamp
    userId: string;         // User ID
}
```

### Price Event

```typescript
interface PriceEvent {
    symbol: string;         // Coin symbol
    price: number;          // Current price
    change: number;         // Price change
    timestamp: number;      // Unix timestamp
}
```

### Log Event

```typescript
interface LogEvent {
    timestamp: string;      // ISO timestamp
    type: string;           // Event type
    data: any;              // Event data
    metadata?: {
        source: string;     // Source identifier
        version: string;    // Version information
    };
}
```

---

## Error Handling

The RugplayClient includes built-in error handling and automatic reconnection logic. Errors are emitted as `error` events and can be handled using event listeners:

```typescript
client.on('error', (error) => {
    console.error('Client error:', error);
    // Handle error appropriately
});

client.on('disconnect', () => {
    console.log('Disconnected from server');
    // Connection will automatically attempt to reconnect
});
```

---

## SDK Exports

The main SDK file (`src/sdk.ts`) exports all necessary components:

```typescript
// Main exports
export { RugplayClient, RugplayClientOptions, RugplayEvent } from './client/RugplayClient';
export { EventLogger, LogEvent } from './logger/EventLogger';
export { webSocketConfig } from './configuration/websocket';
export { exportConfig } from './configuration/export';
export { WebSocketConfig, ExportConfig } from './types/config';

// Default export
import { RugplayClient } from './client/RugplayClient';
export default RugplayClient;
```
