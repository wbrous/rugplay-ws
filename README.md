# 🎯 Rugplay Logger

A professional TypeScript WebSocket client for connecting to Rugplay's trading API to receive, process, and export live trading events.

## ✨ Features

- 🔌 **Live WebSocket Connection** - Connects to `wss://ws.rugplay.com/`
- 📊 **Multi-format Export** - JSON, CSV, and YAML output formats
- 🔔 **Discord Integration** - Real-time trading notifications with rich embeds
- 🔄 **Auto-reconnection** - Handles network interruptions gracefully
- 📝 **TypeScript Support** - Full type safety and IntelliSense
- 🎨 **Event-driven Architecture** - Clean, modular event handling
- 📦 **SDK Ready** - Use as library or standalone application
- 🚀 **Enhanced Event Processing** - Structured, readable trade data formatting
- 🐋 **Trade Size Detection** - Automatic categorization (whale, large, medium, small, micro)
- 📈 **Specialized Events** - Coin-specific and trade-type specific event triggers
- 🎯 **Human-readable Formatting** - Numbers formatted with K/M/B suffixes and currency display

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Start monitoring
node dist/index.js
```

## Available Scripts

- `npm run build` - Compile TypeScript to JavaScript in the `dist/` folder
- `npm start` - Run the compiled JavaScript file
- `npm run dev` - Run TypeScript compiler in watch mode
- `npm run clean` - Remove the `dist/` folder

## Project Structure

```
├── src/
│   ├── index.ts                 # Main application entry point
│   ├── sdk.ts                   # SDK exports for external use
│   ├── client/
│   │   └── RugplayClient.ts     # Core WebSocket client
│   ├── configuration/
│   │   ├── websocket.ts         # WebSocket settings
│   │   └── export.ts            # Export configuration
│   ├── logger/
│   │   └── EventLogger.ts       # Export and logging functionality
│   └── types/
│       └── config.ts            # TypeScript type definitions
├── exports/                     # Generated export files
├── tests/                       # Test scripts
├── docs/                        # Documentation on other files
├── dist/                        # Compiled JavaScript output
├── package.json                 # Node.js dependencies and scripts
├── tsconfig.json                # TypeScript configuration
└── README.md                    # This file
```

## 📊 Event Structure

The WebSocket receives trading events in this format:

```json
{
  "type": "all-trades",
  "data": {
    "type": "BUY",
    "username": "trader123",
    "coinSymbol": "BTC",
    "coinName": "Bitcoin",
    "amount": 1000,
    "price": 50000,
    "totalValue": 50000000,
    "timestamp": 1749416235997,
    "userId": "123"
  }
}
```

## 🔧 Configuration

### WebSocket Settings
Edit `src/configuration/websocket.ts`:
```typescript
const webSocketConfig: WebSocketConfig = {
    url: 'wss://ws.rugplay.com/',
    reconnectAttempts: 5,
    reconnectDelay: 1000
};
```

### Export Settings
Edit `src/configuration/export.ts`:
```typescript
const exportConfig: ExportConfig = {
    file: {
        enabled: true,
        outputPath: './exports/data.json',
        format: 'json' // 'json', 'csv', or 'yaml'
    },
    discord: {
        enabled: false, // Set to true for Discord notifications
        webhookUrl: 'YOUR_DISCORD_WEBHOOK_URL',
        messageFormat: 'embed' // 'embed' or 'text'
    }
};
```

## 💻 Usage as SDK

```typescript
import { RugplayClient, exportConfig } from './src/sdk'; // change src to the folder that contains rugplay

const client = new RugplayClient({
    config: {
        url: 'wss://ws.rugplay.com/',
        reconnectAttempts: 3,
        reconnectDelay: 1000
    },
    exportConfig: exportConfig,
    autoConnect: true,
    debug: true
});

// Listen for specific trade events
client.on('all-trades', (data) => {
    console.log(`${data.type} ${data.coinSymbol}: ${data.amount} at $${data.price}`);
});
```

## 🧪 Testing

```bash
# Test export functionality
node tests/test-export.js

# Test SDK imports
node tests/test-sdk.js
```

## 📚 Documentation

Documentation as raw markdown is stored in the [docs/](./docs) directory, but formatted documentation can be found at our [current GitHub Pages deployment](https://rugplayws.gir0fa.com) (rugplayws.gir0fa.com).

---

## License

See [LICENSE](./LICENSE) for more information.
