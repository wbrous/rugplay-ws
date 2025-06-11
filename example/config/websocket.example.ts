import { WebSocketConfig } from '../types/config';

const webSocketConfig: WebSocketConfig = {
    url: 'wss://ws.rugplay.com/',
    reconnectAttempts: 5,
    reconnectDelay: 1000
};

export { webSocketConfig };
