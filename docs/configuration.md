---
layout: default
title: Configuration
nav_order: 3
---

# Configuration
{: .no_toc }

Learn how to configure the Rugplay Logger for your specific needs.

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

## WebSocket Configuration

The WebSocket configuration controls how the client connects to the Rugplay server.

### Default Configuration

```typescript
// src/configuration/websocket.ts
import { WebSocketConfig } from '../types/config';

const webSocketConfig: WebSocketConfig = {
    url: 'wss://ws.rugplay.com/',
    reconnectAttempts: 5,
    reconnectDelay: 1000
};
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `url` | `string` | `'wss://ws.rugplay.com/'` | WebSocket server URL |
| `reconnectAttempts` | `number` | `5` | Maximum number of reconnection attempts |
| `reconnectDelay` | `number` | `1000` | Delay between reconnection attempts in milliseconds |

### Custom WebSocket Configuration

```typescript
import { WebSocketConfig } from './src/types/config';

const customWebSocketConfig: WebSocketConfig = {
    url: 'wss://custom-rugplay-server.com/',
    reconnectAttempts: 10,
    reconnectDelay: 2000
};

const client = new RugplayClient({
    config: customWebSocketConfig,
    // ... other options
});
```

---

## Export Configuration

The export configuration controls how events are logged and exported to various destinations.

### Default Configuration

```typescript
// src/configuration/export.ts
import { ExportConfig } from "../types/config";

const exportConfig: ExportConfig = {
    file: {
        enabled: true,
        outputPath: './exports/data.json',
        format: 'json'
    },
    discord: {
        enabled: true,
        webhookUrl: 'https://discord.com/api/webhooks/YOUR_WEBHOOK_URL',
        messageFormat: 'embed'
    }
};
```

### File Export Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | `boolean` | `true` | Enable/disable file export |
| `outputPath` | `string` | `'./exports/data.json'` | Path where export files will be saved |
| `format` | `'json' \| 'yaml' \| 'csv'` | `'json'` | Export file format |

#### Supported Export Formats

**JSON Format**
```json
[
  {
    "timestamp": "2024-01-15T10:30:00.000Z",
    "type": "trade",
    "data": {
      "username": "trader123",
      "amount": 1000,
      "coinSymbol": "MOON",
      "price": 0.00001
    },
    "metadata": {
      "source": "rugplay-logger",
      "version": "1.0.0"
    }
  }
]
```

**YAML Format**
```yaml
- timestamp: '2024-01-15T10:30:00.000Z'
  type: trade
  data:
    username: trader123
    amount: 1000
    coinSymbol: MOON
    price: 0.00001
  metadata:
    source: rugplay-logger
    version: 1.0.0
```

**CSV Format**
```csv
timestamp,type,username,amount,coinSymbol,price
2024-01-15T10:30:00.000Z,trade,trader123,1000,MOON,0.00001
```

### Discord Export Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | `boolean` | `true` | Enable/disable Discord export |
| `webhookUrl` | `string` | - | Discord webhook URL for sending messages |
| `messageFormat` | `'text' \| 'embed'` | `'embed'` | Format for Discord messages |

#### Setting up Discord Webhook

1. Go to your Discord server settings
2. Navigate to **Integrations** → **Webhooks**
3. Click **Create Webhook**
4. Copy the webhook URL
5. Update your export configuration:

```typescript
const exportConfig: ExportConfig = {
    // ... file config
    discord: {
        enabled: true,
        webhookUrl: 'https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN',
        messageFormat: 'embed'
    }
};
```

#### Discord Message Formats

**Embed Format** (Recommended)
Rich embed messages with structured information and color coding.

**Text Format**
Simple text messages for basic notifications.

---

## Environment Variables

You can use environment variables to configure sensitive information:

```typescript
// src/configuration/export.ts
const exportConfig: ExportConfig = {
    file: {
        enabled: process.env.FILE_EXPORT_ENABLED === 'true',
        outputPath: process.env.EXPORT_PATH || './exports/data.json',
        format: (process.env.EXPORT_FORMAT as 'json' | 'yaml' | 'csv') || 'json'
    },
    discord: {
        enabled: process.env.DISCORD_ENABLED === 'true',
        webhookUrl: process.env.DISCORD_WEBHOOK_URL || '',
        messageFormat: (process.env.DISCORD_FORMAT as 'text' | 'embed') || 'embed'
    }
};
```

### Environment Variables Reference

| Variable | Type | Description |
|----------|------|-------------|
| `FILE_EXPORT_ENABLED` | `boolean` | Enable file export |
| `EXPORT_PATH` | `string` | Export file path |
| `EXPORT_FORMAT` | `string` | Export format (json/yaml/csv) |
| `DISCORD_ENABLED` | `boolean` | Enable Discord export |
| `DISCORD_WEBHOOK_URL` | `string` | Discord webhook URL |
| `DISCORD_FORMAT` | `string` | Discord message format (text/embed) |

### .env File Example

```bash
# WebSocket Configuration
WEBSOCKET_URL=wss://ws.rugplay.com/

# File Export
FILE_EXPORT_ENABLED=true
EXPORT_PATH=./exports/rugplay-data.json
EXPORT_FORMAT=json

# Discord Export
DISCORD_ENABLED=true
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK_URL
DISCORD_FORMAT=embed

# Logging
DEBUG_MODE=false
```

---

## Advanced Configuration

### Custom Event Logger

You can create custom event loggers with specific configurations:

```typescript
import { EventLogger } from './src/logger/EventLogger';

const customExportConfig: ExportConfig = {
    file: {
        enabled: true,
        outputPath: './custom-exports/trades.csv',
        format: 'csv'
    },
    discord: {
        enabled: false,
        webhookUrl: '',
        messageFormat: 'text'
    }
};

const customLogger = new EventLogger(customExportConfig, client, 50);
```

### Multiple Export Destinations

You can create multiple loggers for different export destinations:

```typescript
// JSON logger for detailed data
const jsonLogger = new EventLogger({
    file: { enabled: true, outputPath: './exports/detailed.json', format: 'json' },
    discord: { enabled: false, webhookUrl: '', messageFormat: 'text' }
}, client);

// CSV logger for analysis
const csvLogger = new EventLogger({
    file: { enabled: true, outputPath: './exports/analysis.csv', format: 'csv' },
    discord: { enabled: false, webhookUrl: '', messageFormat: 'text' }
}, client);

// Discord logger for alerts
const discordLogger = new EventLogger({
    file: { enabled: false, outputPath: '', format: 'json' },
    discord: { enabled: true, webhookUrl: process.env.DISCORD_WEBHOOK_URL!, messageFormat: 'embed' }
}, client);
```

### Configuration Validation

```typescript
function validateConfig(config: ExportConfig): boolean {
    if (config.file.enabled && !config.file.outputPath) {
        throw new Error('File export enabled but no output path specified');
    }
    
    if (config.discord.enabled && !config.discord.webhookUrl) {
        throw new Error('Discord export enabled but no webhook URL specified');
    }
    
    const validFormats = ['json', 'yaml', 'csv'];
    if (!validFormats.includes(config.file.format)) {
        throw new Error(`Invalid file format: ${config.file.format}`);
    }
    
    return true;
}

// Use validation before creating client
try {
    validateConfig(exportConfig);
    const client = new RugplayClient({
        config: webSocketConfig,
        exportConfig: exportConfig
    });
} catch (error) {
    console.error('Configuration error:', error.message);
}
```

---

## Best Practices

1. **Use Environment Variables**: Store sensitive data like webhook URLs in environment variables
2. **Choose Appropriate Export Formats**: Use JSON for detailed logging, CSV for data analysis
3. **Buffer Size**: Adjust buffer size based on expected event volume
4. **File Rotation**: Implement file rotation for long-running applications
5. **Error Handling**: Always include error handling for configuration validation
6. **Performance**: Disable unnecessary export options to improve performance
