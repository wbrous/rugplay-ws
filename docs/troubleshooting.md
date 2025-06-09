---
layout: default
title: Troubleshooting
nav_order: 6
---

# Troubleshooting
{: .no_toc }

Common issues and solutions for the Rugplay Logger.

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

## Connection Issues

### WebSocket Connection Failed

**Problem**: Cannot connect to the Rugplay WebSocket server.

**Symptoms**:
```
❌ WebSocket error: Connection failed
🔄 Attempting reconnection...
```

**Solutions**:

1. **Check Internet Connection**:
   ```bash
   # Test basic connectivity
   ping google.com
   
   # Test WebSocket endpoint (if available)
   curl -v "wss://ws.rugplay.com/"
   ```

2. **Verify WebSocket URL**:
   ```typescript
   // Check your configuration
   const webSocketConfig: WebSocketConfig = {
       url: 'wss://ws.rugplay.com/', // Ensure this is correct
       reconnectAttempts: 5,
       reconnectDelay: 1000
   };
   ```

3. **Firewall/Proxy Issues**:
   - Check if your firewall blocks WebSocket connections
   - If behind a corporate proxy, configure proxy settings
   - Try from a different network

4. **Server Status**:
   - Check if Rugplay's WebSocket service is operational
   - Look for maintenance announcements

### Frequent Disconnections

**Problem**: Connection drops frequently and reconnects.

**Symptoms**:
```
✅ Connected successfully
🔌 Disconnected from server
🔄 Attempting reconnection in 1000ms
```

**Solutions**:

1. **Increase Reconnection Settings**:
   ```typescript
   const webSocketConfig: WebSocketConfig = {
       url: 'wss://ws.rugplay.com/',
       reconnectAttempts: 10, // Increase attempts
       reconnectDelay: 2000   // Increase delay
   };
   ```

2. **Implement Exponential Backoff**:
   ```typescript
   class RobustClient {
       private reconnectCount = 0;
       
       private getReconnectDelay(): number {
           return Math.min(1000 * Math.pow(2, this.reconnectCount), 30000);
       }
   }
   ```

3. **Network Stability**:
   - Use a stable internet connection
   - Consider running on a VPS for better stability

---

## Performance Issues

### High Memory Usage

**Problem**: Application memory usage grows over time.

**Symptoms**:
- Slow performance after running for hours
- System running out of memory

**Solutions**:

1. **Implement Data Cleanup**:
   ```typescript
   class MemoryManager {
       private trades: any[] = [];
       private maxEntries = 10000;
       
       addTrade(trade: any): void {
           this.trades.push(trade);
           
           // Cleanup old entries
           if (this.trades.length > this.maxEntries) {
               this.trades = this.trades.slice(-this.maxEntries / 2);
           }
       }
   }
   ```

2. **Use Event Filtering**:
   ```typescript
   // Only process high-value trades
   client.on('trade', (data) => {
       if (data.totalValue > 100) { // Filter threshold
           this.processTrade(data);
       }
   });
   ```

3. **Monitor Memory Usage**:
   ```typescript
   setInterval(() => {
       const usage = process.memoryUsage();
       console.log(`Memory: ${Math.round(usage.heapUsed / 1024 / 1024)}MB`);
   }, 60000); // Log every minute
   ```

### Slow Event Processing

**Problem**: Events are processed slowly, causing backlog.

**Solutions**:

1. **Optimize Event Handlers**:
   ```typescript
   // Avoid heavy processing in event handlers
   client.on('trade', (data) => {
       // Queue for background processing instead
       this.eventQueue.push(data);
   });
   
   // Process queue in batches
   setInterval(() => {
       this.processEventBatch();
   }, 1000);
   ```

2. **Use Worker Threads**:
   ```typescript
   import { Worker, isMainThread, parentPort } from 'worker_threads';
   
   if (isMainThread) {
       // Main thread handles WebSocket
       const worker = new Worker(__filename);
       
       client.on('trade', (data) => {
           worker.postMessage(data);
       });
   } else {
       // Worker thread processes data
       parentPort?.on('message', (data) => {
           // Heavy processing here
       });
   }
   ```

---

## Export Issues

### File Export Not Working

**Problem**: Events are not being saved to files.

**Solutions**:

1. **Check Export Configuration**:
   ```typescript
   const exportConfig: ExportConfig = {
       file: {
           enabled: true, // Ensure this is true
           outputPath: './exports/data.json',
           format: 'json'
       },
       // ...
   };
   ```

2. **Verify Directory Permissions**:
   ```bash
   # On Windows
   mkdir exports
   
   # Check if directory is writable
   echo "test" > exports/test.txt
   ```

3. **Check File Path**:
   ```typescript
   import path from 'path';
   import fs from 'fs';
   
   const outputDir = path.dirname(exportConfig.file.outputPath);
   if (!fs.existsSync(outputDir)) {
       fs.mkdirSync(outputDir, { recursive: true });
   }
   ```

### Discord Export Failing

**Problem**: Events are not being sent to Discord.

**Symptoms**:
```
❌ Discord export failed: 401 Unauthorized
❌ Discord export failed: Invalid webhook URL
```

**Solutions**:

1. **Verify Webhook URL**:
   ```typescript
   // Test webhook manually
   const testWebhook = async () => {
       const response = await fetch(webhookUrl, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({
               content: 'Test message from Rugplay Logger'
           })
       });
       console.log('Webhook test:', response.status);
   };
   ```

2. **Check Discord Permissions**:
   - Ensure the webhook URL is correct
   - Verify the webhook hasn't been deleted
   - Check if the channel still exists

3. **Rate Limiting**:
   ```typescript
   class DiscordRateLimiter {
       private lastSent = 0;
       private minInterval = 2000; // 2 seconds between messages
       
       canSend(): boolean {
           const now = Date.now();
           if (now - this.lastSent >= this.minInterval) {
               this.lastSent = now;
               return true;
           }
           return false;
       }
   }
   ```

---

## TypeScript Issues

### Build Errors

**Problem**: TypeScript compilation fails.

**Common Errors and Solutions**:

1. **Module Resolution**:
   ```typescript
   // Error: Cannot find module './types/config'
   // Solution: Check file paths and extensions
   import { WebSocketConfig } from '../types/config'; // Correct path
   ```

2. **Type Errors**:
   ```typescript
   // Error: Property 'coinSymbol' does not exist on type 'any'
   // Solution: Define proper interfaces
   interface TradeEvent {
       coinSymbol: string;
       username: string;
       amount: number;
       // ... other properties
   }
   ```

3. **Missing Dependencies**:
   ```bash
   # Install missing type definitions
   npm install --save-dev @types/node @types/ws
   ```

### Runtime Type Issues

**Problem**: Runtime errors due to unexpected data types.

**Solutions**:

1. **Add Runtime Validation**:
   ```typescript
   function validateTradeEvent(data: any): data is TradeEvent {
       return (
           typeof data.coinSymbol === 'string' &&
           typeof data.username === 'string' &&
           typeof data.amount === 'number'
       );
   }
   
   client.on('trade', (data) => {
       if (validateTradeEvent(data)) {
           // Safe to use typed data
           console.log(data.coinSymbol);
       } else {
           console.error('Invalid trade data:', data);
       }
   });
   ```

2. **Use Type Guards**:
   ```typescript
   function isValidPrice(value: any): value is number {
       return typeof value === 'number' && !isNaN(value) && value > 0;
   }
   ```

---

## Environment Issues

### Node.js Version Problems

**Problem**: Compatibility issues with Node.js version.

**Solutions**:

1. **Check Node.js Version**:
   ```bash
   node --version
   # Should be 18.0 or higher
   ```

2. **Use Node Version Manager**:
   ```bash
   # Install nvm (Node Version Manager)
   # Windows: Download from github.com/coreybutler/nvm-windows
   
   # Install and use Node 18
   nvm install 18
   nvm use 18
   ```

### Package Installation Issues

**Problem**: npm install fails or packages are missing.

**Solutions**:

1. **Clear npm Cache**:
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Use Different Registry**:
   ```bash
   # If default registry is slow/blocked
   npm install --registry https://registry.npmjs.org/
   ```

3. **Check for Permission Issues**:
   ```bash
   # On Windows, run as administrator if needed
   # On Unix systems, avoid using sudo with npm
   ```

---

## Debugging

### Enable Debug Mode

```typescript
const client = new RugplayClient({
    config: webSocketConfig,
    exportConfig: exportConfig,
    autoConnect: true,
    debug: true // Enable debug logging
});
```

### Add Custom Logging

```typescript
class Logger {
    static debug(message: string, data?: any): void {
        if (process.env.DEBUG_MODE === 'true') {
            console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`, data || '');
        }
    }
    
    static error(message: string, error?: any): void {
        console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error || '');
    }
}

// Usage
Logger.debug('Processing trade event', tradeData);
Logger.error('Failed to export data', error);
```

### Monitor WebSocket Messages

```typescript
client.on('message', (rawData) => {
    console.log('Raw WebSocket message:', rawData);
});
```

### Performance Monitoring

```typescript
class PerformanceMonitor {
    private eventCounts = new Map<string, number>();
    private startTime = Date.now();
    
    track(eventType: string): void {
        const count = this.eventCounts.get(eventType) || 0;
        this.eventCounts.set(eventType, count + 1);
    }
    
    report(): void {
        const uptime = Date.now() - this.startTime;
        console.log(`Uptime: ${Math.round(uptime / 1000)}s`);
        
        this.eventCounts.forEach((count, event) => {
            const rate = (count / uptime) * 1000;
            console.log(`${event}: ${count} events (${rate.toFixed(2)}/s)`);
        });
    }
}
```

---

## Getting Help

If you can't resolve your issue:

1. **Check GitHub Issues**: Search for similar problems and solutions
2. **Enable Debug Mode**: Gather detailed logs before reporting
3. **Provide Environment Info**: Include Node.js version, OS, and error messages
4. **Create Minimal Reproduction**: Simplify your code to isolate the issue

### Issue Template

When reporting bugs, include:

```
**Environment:**
- OS: Windows 11 / macOS / Linux
- Node.js version: 18.17.0
- Package version: 1.0.0

**Configuration:**
```yaml
# Your configuration here
```

**Error Message:**
```
Paste full error message and stack trace
```

**Steps to Reproduce:**
1. Step one
2. Step two
3. ...

**Expected Behavior:**
What you expected to happen

**Actual Behavior:**
What actually happened
```
