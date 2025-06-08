import fs from 'fs';
import path from 'path';
import { ExportConfig } from '../types/config';

interface LogEvent {
    timestamp: string;
    type: string;
    data: any;
    metadata?: {
        source: string;
        version: string;
    };
}

class EventLogger {
    private config: ExportConfig;
    private eventBuffer: LogEvent[] = [];
    private bufferSize: number = 100;
    private flushInterval: number = 5000; // 5 seconds
    private flushTimer: NodeJS.Timeout | null = null;

    constructor(config: ExportConfig, bufferSize: number = 100) {
        this.config = config;
        this.bufferSize = bufferSize;
        this.ensureExportDirectory();
        this.startFlushTimer();
    }

    /**
     * Log an event for export
     */
    public logEvent(eventType: string, eventData: any): void {
        const logEvent: LogEvent = {
            timestamp: new Date().toISOString(),
            type: eventType,
            data: eventData,
            metadata: {
                source: 'rugplay-logger',
                version: '1.0.0'
            }
        };

        this.eventBuffer.push(logEvent);

        // Auto-flush if buffer is full
        if (this.eventBuffer.length >= this.bufferSize) {
            this.flushEvents();
        }

        // Send to Discord if enabled
        if (this.config.discord.enabled && this.config.discord.webhookUrl) {
            this.sendToDiscord(logEvent);
        }
    }

    /**
     * Flush events to file
     */
    public flushEvents(): void {
        if (this.eventBuffer.length === 0 || !this.config.file.enabled) {
            return;
        }

        try {
            const outputPath = path.resolve(this.config.file.outputPath);
            
            switch (this.config.file.format) {
                case 'json':
                    this.writeJSONFile(outputPath);
                    break;
                case 'csv':
                    this.writeCSVFile(outputPath);
                    break;
                case 'yaml':
                    this.writeYAMLFile(outputPath);
                    break;
                default:
                    console.warn(`Unsupported export format: ${this.config.file.format}`);
            }

            console.log(`📁 Exported ${this.eventBuffer.length} events to ${outputPath}`);
            this.eventBuffer = [];
        } catch (error) {
            console.error('❌ Error flushing events:', error);
        }
    }

    /**
     * Graceful shutdown - flush remaining events
     */
    public shutdown(): void {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
            this.flushTimer = null;
        }
        this.flushEvents();
    }

    /**
     * Write events to JSON file (append mode)
     */
    private writeJSONFile(outputPath: string): void {
        let existingData: LogEvent[] = [];

        // Read existing data if file exists
        if (fs.existsSync(outputPath)) {
            try {
                const fileContent = fs.readFileSync(outputPath, 'utf8');
                existingData = JSON.parse(fileContent);
                if (!Array.isArray(existingData)) {
                    existingData = [];
                }
            } catch (error) {
                console.warn('⚠️ Could not parse existing JSON file, starting fresh');
                existingData = [];
            }
        }

        // Append new events
        const allEvents = [...existingData, ...this.eventBuffer];
        
        // Write back to file
        fs.writeFileSync(outputPath, JSON.stringify(allEvents, null, 2), 'utf8');
    }    /**
     * Write events to CSV file (append mode)
     */
    private writeCSVFile(outputPath: string): void {
        const csvPath = outputPath.replace(/\.json$/, '.csv');
        
        // Create header if file doesn't exist
        if (!fs.existsSync(csvPath)) {
            const header = 'timestamp,event_type,trade_type,username,user_id,coin_symbol,coin_name,amount,amount_formatted,price,price_formatted,total_value,total_value_formatted,trade_size,market_direction\n';
            fs.writeFileSync(csvPath, header, 'utf8');
        }

        // Convert events to CSV rows
        const csvRows = this.eventBuffer.map(event => {
            const data = event.data;
            
            // Handle different event types
            if (event.type === 'trade' && data.user && data.coin && data.transaction) {
                // New formatted trade data
                return [
                    event.timestamp,
                    event.type,
                    data.trade_type || '',
                    data.user.username || '',
                    data.user.id || '',
                    data.coin.symbol || '',
                    data.coin.name || '',
                    data.transaction.amount || '',
                    data.transaction.amount_formatted || '',
                    data.transaction.price_per_unit || '',
                    data.transaction.price_formatted || '',
                    data.transaction.total_value || '',
                    data.transaction.total_value_formatted || '',
                    data.metadata?.trade_size || '',
                    data.metadata?.market_direction || ''
                ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
            } else {
                // Legacy format fallback
                return [
                    event.timestamp,
                    event.type,
                    data.type || '',
                    data.username || '',
                    data.userId || '',
                    data.coinSymbol || '',
                    data.coinName || '',
                    data.amount || '',
                    '',
                    data.price || '',
                    '',
                    data.totalValue || '',
                    '',
                    '',
                    ''
                ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
            }
        }).join('\n') + '\n';

        // Append to file
        fs.appendFileSync(csvPath, csvRows, 'utf8');
    }

    /**
     * Write events to YAML file (append mode)
     */
    private writeYAMLFile(outputPath: string): void {
        const yamlPath = outputPath.replace(/\.json$/, '.yaml');
        
        // Simple YAML formatting (without external dependencies)
        const yamlContent = this.eventBuffer.map(event => {
            return [
                `- timestamp: "${event.timestamp}"`,
                `  type: "${event.type}"`,
                `  data:`,
                ...Object.entries(event.data).map(([key, value]) => 
                    `    ${key}: ${typeof value === 'string' ? `"${value}"` : value}`
                )
            ].join('\n');
        }).join('\n');

        // Append to file
        if (fs.existsSync(yamlPath)) {
            fs.appendFileSync(yamlPath, '\n' + yamlContent, 'utf8');
        } else {
            fs.writeFileSync(yamlPath, yamlContent, 'utf8');
        }
    }

    /**
     * Send event to Discord webhook
     */
    private async sendToDiscord(event: LogEvent): Promise<void> {
        if (!this.config.discord.webhookUrl) return;

        try {
            const payload = this.config.discord.messageFormat === 'embed' 
                ? this.createDiscordEmbed(event)
                : this.createDiscordText(event);

            const response = await fetch(this.config.discord.webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                console.warn(`⚠️ Discord webhook failed: ${response.status}`);
            }
        } catch (error) {
            console.warn('⚠️ Error sending to Discord:', error);
        }
    }    /**
     * Create Discord embed payload
     */
    private createDiscordEmbed(event: LogEvent): any {
        const data = event.data;
        
        // Handle formatted trade events
        if (event.type === 'trade' && data.user && data.coin && data.transaction) {
            const color = data.trade_type === 'BUY' ? 0x00ff00 : 0xff0000; // Green for buy, red for sell
            const emoji = data.trade_type === 'BUY' ? '🟢' : '🔴';
            
            return {
                embeds: [{
                    title: `${emoji} ${data.trade_type} Trade - ${data.coin.symbol}`,
                    color: color,
                    timestamp: event.timestamp,
                    fields: [
                        { name: 'User', value: `${data.user.username} (ID: ${data.user.id})`, inline: true },
                        { name: 'Coin', value: `${data.coin.name} (${data.coin.symbol})`, inline: true },
                        { name: 'Trade Size', value: data.metadata?.trade_size?.toUpperCase() || 'Unknown', inline: true },
                        { name: 'Amount', value: data.transaction.amount_formatted || data.transaction.amount?.toLocaleString(), inline: true },
                        { name: 'Price per Unit', value: data.transaction.price_formatted || `$${data.transaction.price_per_unit?.toFixed(6)}`, inline: true },
                        { name: 'Total Value', value: data.transaction.total_value_formatted || `$${data.transaction.total_value}`, inline: true }
                    ],
                    thumbnail: data.user.avatar_url ? { url: data.user.avatar_url } : undefined,
                    footer: {
                        text: `Market: ${data.metadata?.market_direction || 'Unknown'} | ${data.timestamp_human || 'Unknown time'}`
                    }
                }]
            };
        }
        
        // Fallback for legacy format
        const color = data.type === 'BUY' ? 0x00ff00 : 0xff0000;
        
        return {
            embeds: [{
                title: `${data.type} Trade - ${data.coinSymbol}`,
                color: color,
                timestamp: event.timestamp,
                fields: [
                    { name: 'User', value: data.username, inline: true },
                    { name: 'Coin', value: `${data.coinName} (${data.coinSymbol})`, inline: true },
                    { name: 'Amount', value: data.amount?.toLocaleString(), inline: true },
                    { name: 'Price', value: `$${data.price?.toFixed(6)}`, inline: true },
                    { name: 'Total Value', value: `$${data.totalValue}`, inline: true },
                    { name: 'User ID', value: data.userId, inline: true }
                ],
                thumbnail: data.userImage ? { url: `https://rugplay.com/${data.userImage}` } : undefined
            }]
        };
    }

    /**
     * Create Discord text payload
     */
    private createDiscordText(event: LogEvent): any {
        const data = event.data;
        
        // Handle formatted trade events
        if (event.type === 'trade' && data.user && data.coin && data.transaction) {
            const emoji = data.trade_type === 'BUY' ? '🟢' : '🔴';
            const sizeEmoji = this.getTradeEmoji(data.metadata?.trade_size);
            
            return {
                content: `${emoji}${sizeEmoji} **${data.trade_type}** ${data.coin.symbol} | User: **${data.user.username}** | Amount: **${data.transaction.amount_formatted}** | Price: **${data.transaction.price_formatted}** | Total: **${data.transaction.total_value_formatted}**`
            };
        }
        
        // Fallback for legacy format
        const emoji = data.type === 'BUY' ? '🟢' : '🔴';
        
        return {
            content: `${emoji} **${data.type}** ${data.coinSymbol} | User: ${data.username} | Amount: ${data.amount?.toLocaleString()} | Price: $${data.price?.toFixed(6)} | Total: $${data.totalValue}`
        };
    }

    /**
     * Get emoji based on trade size
     */
    private getTradeEmoji(tradeSize: string): string {
        switch (tradeSize) {
            case 'whale': return '🐋';
            case 'large': return '🦈';
            case 'medium': return '🐟';
            case 'small': return '🐠';
            case 'micro': return '🦐';
            default: return '';
        }
    }

    /**
     * Ensure export directory exists
     */
    private ensureExportDirectory(): void {
        if (!this.config.file.enabled) return;

        const outputDir = path.dirname(path.resolve(this.config.file.outputPath));
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
    }

    /**
     * Start automatic flush timer
     */
    private startFlushTimer(): void {
        this.flushTimer = setInterval(() => {
            this.flushEvents();
        }, this.flushInterval);
    }
}

export { EventLogger, LogEvent };