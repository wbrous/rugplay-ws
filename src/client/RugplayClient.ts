import { WebSocketConfig, ExportConfig } from '../types/config';
import { EventLogger } from '../logger/EventLogger';

interface RugplayClientOptions {
    config: WebSocketConfig;
    exportConfig?: ExportConfig;
    autoConnect?: boolean;
    debug?: boolean;
}

interface RugplayEvent {
    eventName: string;
    data: any;
    timestamp: Date;
}

class RugplayClient {
    private ws: WebSocket | null = null;
    private config: WebSocketConfig;
    private debug: boolean;
    private eventHandlers: Map<string, ((data: any) => void)[]> = new Map();
    private reconnectAttempts: number = 0;
    private reconnectTimer: Timer | null = null;
    private logger: EventLogger | null = null;

    constructor(options: RugplayClientOptions) {
        this.config = options.config;
        this.debug = options.debug || false;
        
        // Initialize logger if export config is provided
        if (options.exportConfig) {
            this.logger = new EventLogger(options.exportConfig);
        }
        
        if (options.autoConnect !== false) {
            this.connect();
        }
    }

    /**
     * Connect to the Rugplay WebSocket server
     */
    public connect(): void {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.log('Already connected');
            return;
        }

        this.log(`Connecting to ${this.config.url}...`);

        try {
            this.ws = new WebSocket(this.config.url);
            this.setupEventListeners();
        } catch (error) {
            this.log('Failed to create WebSocket connection:', error);
            this.scheduleReconnect();
        }
    }    /**
     * Disconnect from the WebSocket server
     */
    public disconnect(): void {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }

        if (this.ws) {
            this.log('Disconnecting...');
            this.ws.close();
            this.ws = null;
        }
        
        // Shutdown logger to flush remaining events
        if (this.logger) {
            this.logger.shutdown();
        }
        
        this.reconnectAttempts = 0;
    }

    /**
     * Register an event handler
     */
    public on(eventName: string, handler: (data: any) => void): void {
        if (!this.eventHandlers.has(eventName)) {
            this.eventHandlers.set(eventName, []);
        }
        this.eventHandlers.get(eventName)!.push(handler);
    }

    /**
     * Remove an event handler
     */
    public off(eventName: string, handler?: (data: any) => void): void {
        if (handler) {
            const handlers = this.eventHandlers.get(eventName);
            if (handlers) {
                const index = handlers.indexOf(handler);
                if (index > -1) {
                    handlers.splice(index, 1);
                }
            }
        } else {
            this.eventHandlers.delete(eventName);
        }
    }

    /**
     * Send data to the server
     */
    public send(data: any): void {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            const message = typeof data === 'string' ? data : JSON.stringify(data);
            this.log(`Sending:`, data);
            this.ws.send(message);
        } else {
            this.log('Cannot send - not connected');
        }
    }

    /**
     * Check if client is connected
     */
    public isConnected(): boolean {
        return this.ws?.readyState === WebSocket.OPEN;
    }

    /**
     * Get connection status
     */
    public getStatus(): string {
        if (!this.ws) return 'disconnected';
        
        switch (this.ws.readyState) {
            case WebSocket.CONNECTING: return 'connecting';
            case WebSocket.OPEN: return 'connected';
            case WebSocket.CLOSING: return 'closing';
            case WebSocket.CLOSED: return 'disconnected';
            default: return 'unknown';
        }
    }

    /**
     * Setup WebSocket event listeners
     */
    private setupEventListeners(): void {
        if (!this.ws) return;

        this.ws.onopen = () => {
            this.log('✅ Connected to Rugplay WebSocket');
            this.reconnectAttempts = 0;
            
            // Send subscription request to start receiving data
            this.subscribeToData();
        };

        this.ws.onmessage = (event) => {
            this.log(`📥 Raw message received:`, event.data);

            try {
                const data = JSON.parse(event.data);
                this.log(`📥 Parsed message:`, JSON.stringify(data, null, 2));
                this.handleMessage(data);
            } catch (error) {
                this.log(`⚠️ Failed to parse JSON, treating as raw message:`, error);
                // Handle non-JSON messages
                this.handleMessage({ raw: event.data });
            }
        };

        this.ws.onclose = (event) => {
            this.log(`❌ WebSocket closed: ${event.code} - ${event.reason}`);
            this.scheduleReconnect();
        };

        this.ws.onerror = (error) => {
            this.log(`⚠️ WebSocket error:`, error);
        };
    }    
    
    /**
     * Handle incoming messages and trigger appropriate event handlers
     */
    private handleMessage(data: any): void {
        this.log(`🔧 Processing message with type: ${data.type || 'unknown'}`);
        
        // Trigger 'message' event for all messages
        this.triggerEvent('message', data);

        // Handle structured events with type and data fields
        if (data.type && data.data) {
            const eventType = data.type;
            const eventData = data.data;

            this.log(`🎯 Structured event detected - Type: ${eventType}`);

            // Handle ping/keepalive separately
            if (eventType === "ping") {
                this.handleKeepalive();
                return; // Don't log ping events
            }

            // Process and format the event data before logging
            const formattedEvent = this.formatEventData(eventType, eventData);
            
            // Log the formatted event if logger is enabled
            if (this.logger && formattedEvent) {
                this.log(`📝 Logging formatted event: ${formattedEvent.type}`);
                this.logger.logEvent(formattedEvent.type, formattedEvent.data);
            }
            
            // Trigger event with the specific type (use original data for handlers)
            this.triggerEvent(eventType, eventData);
            
            // Trigger specialized events based on event type
            this.handleSpecializedEvents(eventType, eventData);
            
        } else {
            this.log(`🔧 Processing unstructured message:`, data);

            if (data.raw) data = data.raw;

            // Fallback for other message structures
            if (data.type) {
                this.triggerEvent(data.type, data);
            }
            
            if (data.event) {
                this.triggerEvent(data.event, data);
            }
        }
    }

    /**
     * Format event data for logging with better structure and readability
     */
    private formatEventData(eventType: string, eventData: any): { type: string, data: any } | null {
        switch (eventType) {
            case 'all-trades':
                return this.formatTradeEvent(eventData);
            
            default:
                // For unknown event types, return as-is with some basic formatting
                return {
                    type: eventType,
                    data: {
                        ...eventData,
                        formatted_timestamp: eventData.timestamp ? new Date(eventData.timestamp).toISOString() : null,
                        event_source: 'rugplay'
                    }
                };
        }
    }

    /**
     * Format trade events with enhanced readability and structure
     */
    private formatTradeEvent(tradeData: any): { type: string, data: any } {
        const trade = {
            // Basic trade information
            trade_type: tradeData.type, // BUY or SELL
            action: tradeData.type?.toLowerCase(), // buy or sell
            
            // User information
            user: {
                id: tradeData.userId,
                username: tradeData.username,
                avatar_url: tradeData.userImage ? `https://rugplay.com/${tradeData.userImage}` : null
            },
            
            // Coin information
            coin: {
                symbol: tradeData.coinSymbol,
                name: tradeData.coinName,
                icon_url: tradeData.coinIcon ? `https://rugplay.com/${tradeData.coinIcon}` : null
            },
            
            // Transaction details
            transaction: {
                amount: tradeData.amount,
                amount_formatted: tradeData.amount ? this.formatNumber(tradeData.amount) : null,
                price_per_unit: tradeData.price,
                price_formatted: tradeData.price ? `$${tradeData.price.toFixed(8)}` : null,
                total_value: tradeData.totalValue,
                total_value_formatted: tradeData.totalValue ? `$${tradeData.totalValue.toFixed(2)}` : null
            },
            
            // Timing
            timestamp: tradeData.timestamp,
            timestamp_iso: tradeData.timestamp ? new Date(tradeData.timestamp).toISOString() : null,
            timestamp_human: tradeData.timestamp ? new Date(tradeData.timestamp).toLocaleString() : null,
            
            // Metadata
            metadata: {
                event_source: 'rugplay',
                event_type: 'trade',
                market_direction: tradeData.type === 'BUY' ? 'bullish' : 'bearish',
                trade_size: this.categorizeTradeSize(tradeData.totalValue),
                processed_at: new Date().toISOString()
            }
        };

        return {
            type: 'trade',
            data: trade
        };
    }

    /**
     * Handle specialized events based on type
     */
    private handleSpecializedEvents(eventType: string, eventData: any): void {
        switch (eventType) {
            case 'all-trades':
                this.log(`💰 ${eventData.type} Trade: ${eventData.username} ${eventData.type?.toLowerCase()}s ${this.formatNumber(eventData.amount)} ${eventData.coinSymbol} for $${eventData.totalValue}`);
                
                // Trigger trade event
                this.triggerEvent('trade', eventData);
                
                // Trigger buy/sell specific events
                if (eventData.type === 'BUY') {
                    this.triggerEvent('buy', eventData);
                } else if (eventData.type === 'SELL') {
                    this.triggerEvent('sell', eventData);
                }
                
                // Trigger coin-specific events
                if (eventData.coinSymbol) {
                    this.triggerEvent(`trade:${eventData.coinSymbol.toLowerCase()}`, eventData);
                }
                
                // Trigger large trade events (over $1000)
                if (eventData.totalValue && eventData.totalValue > 1000) {
                    this.triggerEvent('large-trade', eventData);
                }
                
                break;
        }
        
        // Trigger general update event for any structured data
        this.triggerEvent('update', eventData);
        
        // If the data contains price information, trigger price event
        if (eventData.price !== undefined) {
            this.triggerEvent('price', eventData);
        }
    }

    /**
     * Format numbers for better readability
     */
    private formatNumber(num: number): string {
        if (num >= 1e9) {
            return (num / 1e9).toFixed(2) + 'B';
        } else if (num >= 1e6) {
            return (num / 1e6).toFixed(2) + 'M';
        } else if (num >= 1e3) {
            return (num / 1e3).toFixed(2) + 'K';
        } else {
            return num.toLocaleString();
        }
    }

    /**
     * Categorize trade size for metadata
     */
    private categorizeTradeSize(totalValue: number): string {
        if (totalValue >= 10000) return 'whale';
        if (totalValue >= 1000) return 'large';
        if (totalValue >= 100) return 'medium';
        if (totalValue >= 10) return 'small';
        return 'micro';
    }

    /**
     * Handle ping message from server.
     */
    private handleKeepalive(): void {
        this.log('💓 Received keepalive/ping message');
        
        // Send pong response if the server expects it
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            const pongMessage = JSON.stringify({ type: 'pong' });
            this.log('💓 Sending pong response:', pongMessage);
            this.ws.send(pongMessage);
        }
    }

    /**
     * Trigger event handlers for a specific event
     */
    private triggerEvent(eventName: string, data: any): void {
        const handlers = this.eventHandlers.get(eventName);
        if (handlers) {
            handlers.forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    this.log(`Error in event handler for ${eventName}:`, error);
                }
            });
        }
    }

    /**
     * Schedule a reconnection attempt
     */
    private scheduleReconnect(): void {
        if (this.reconnectAttempts >= this.config.reconnectAttempts) {
            this.log(`❌ Max reconnection attempts (${this.config.reconnectAttempts}) reached`);
            return;
        }

        this.reconnectAttempts++;
        const delay = this.config.reconnectDelay * this.reconnectAttempts;
        
        this.log(`🔄 Scheduling reconnect attempt ${this.reconnectAttempts}/${this.config.reconnectAttempts} in ${delay}ms`);
        
        this.reconnectTimer = setTimeout(() => {
            this.connect();
        }, delay);
    }

    /**
     * Debug logging
     */
    private log(message: string, ...args: any[]): void {
        if (this.debug) {
            const timestamp = new Date().toISOString();
            console.log(`[${timestamp}] [RugplayClient] ${message}`, ...args);
        }
    }

    /**
     * Subscribe to data streams after connection
     */
    private subscribeToData(): void {
        this.log('📡 Sending subscription requests...');
        
        // Send the exact subscription messages that the server expects
        const subscriptionMessages = [
            { type: 'subscribe', channel: 'trades:all' },
            { type: 'subscribe', channel: 'trades:large' },
            { type: 'set_coin', coinSymbol: '@global' }
        ];

        subscriptionMessages.forEach((msg, index) => {
            setTimeout(() => {
                this.log(`📡 Sending subscription message ${index + 1}:`, msg);
                this.send(msg);
            }, index * 100); // Stagger the requests by 100ms
        });
    }
}

export { RugplayClient, RugplayClientOptions, RugplayEvent };
