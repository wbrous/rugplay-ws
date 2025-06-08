interface ExportConfig {
    file: {
        enabled: boolean;
        outputPath: string;
        format: 'json' | 'yaml' | 'csv';
    },

    discord: {
        enabled: boolean;
        webhookUrl: string;
        messageFormat: 'text' | 'embed';
    }
}

interface WebSocketConfig {
    url: string;
    reconnectAttempts: number;
    reconnectDelay: number;
}

export { ExportConfig, WebSocketConfig };