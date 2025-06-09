---
layout: default
title: Home
nav_order: 1
description: "Rugplay Logger - A TypeScript WebSocket client for logging and exporting Rugplay trading events."
permalink: /
---

# Rugplay Logger
{: .fs-9 }

A powerful TypeScript WebSocket client for real-time logging and exporting of Rugplay trading events with support for file exports and Discord notifications.
{: .fs-6 .fw-300 }

[Quick Start](#quick-start){: .btn .btn-primary .fs-5 .mb-4 .mb-md-0 .mr-2 }
[View on GitHub](https://github.com/wbrous/rugplay-ws){: .btn .fs-5 .mb-4 .mb-md-0 }

---

## Features

- **Real-time WebSocket Connection**: Connect to Rugplay's WebSocket API for live trading data
- **Event Logging**: Comprehensive logging of all trading events with timestamps
- **Multiple Export Formats**: Export data to JSON, YAML, or CSV formats
- **Discord Integration**: Send trading alerts directly to Discord via webhooks
- **Auto-reconnection**: Robust connection handling with automatic reconnection
- **TypeScript Support**: Full TypeScript implementation with type safety
- **Event-driven Architecture**: Subscribe to specific events with custom handlers
- **Dark Mode Support**: Toggle between light and dark themes for comfortable viewing

{: .note }
> **💡 Theme Toggle**: Look for the theme toggle button in the top-right corner to switch between light and dark modes. Your preference will be saved automatically!

## Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/your-repo/rugplay-logger.git
cd rugplay-logger

# Install dependencies
npm install

# Build the project
npm run build

# Run the logger
npm start
```

### Basic Usage

```typescript
import { RugplayClient } from './src/client/RugplayClient';
import { webSocketConfig } from './src/configuration/websocket';
import { exportConfig } from './src/configuration/export';

// Create client with auto-connect
const client = new RugplayClient({
    config: webSocketConfig,
    exportConfig: exportConfig,
    autoConnect: true,
    debug: false
});

// Listen for trade events
client.on('trade', (data) => {
    console.log('New trade:', data);
});

// Listen for price updates
client.on('price', (data) => {
    console.log('Price update:', data);
});
```

## Project Structure

```
src/
├── client/           # WebSocket client implementation
├── configuration/    # Configuration files
├── logger/          # Event logging system
├── types/           # TypeScript type definitions
├── index.ts         # Main entry point
└── sdk.ts           # SDK exports

docs/                # Documentation (Jekyll)
exports/             # Generated export files
tests/               # Test files
```

## Documentation

- [API Reference]({{ site.baseurl }}{% link api.md %}) - Complete API documentation
- [Configuration]({{ site.baseurl }}{% link configuration.md %}) - Setup and configuration guide
- [Event Types]({{ site.baseurl }}{% link events.md %}) - Available WebSocket events
- [Examples]({{ site.baseurl }}{% link examples.md %}) - Usage examples and recipes

---

## License

This project is licensed under the GNU License. See the [LICENSE](LICENSE) file for details.
