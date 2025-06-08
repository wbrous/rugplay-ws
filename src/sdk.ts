// Rugplay Logger SDK
// Main exports for external use

export { RugplayClient, RugplayClientOptions, RugplayEvent } from './client/RugplayClient';
export { EventLogger, LogEvent } from './logger/EventLogger';
export { webSocketConfig } from './configuration/websocket';
export { exportConfig } from './configuration/export';
export { WebSocketConfig, ExportConfig } from './types/config';

// Re-export for convenience
import { RugplayClient } from './client/RugplayClient';
export default RugplayClient;