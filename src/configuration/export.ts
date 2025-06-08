import { ExportConfig } from "../types/config";

const exportConfig: ExportConfig = {
    file: {
        enabled: true,
        outputPath: './exports/data.json',
        format: 'json'
    },

    discord: {
        enabled: true,
        webhookUrl: 'https://discord.com/api/webhooks/1381388535726342294/5eOEHemp-TAiULuX3Bhkhr_jOPL6apdQGse_kGoi6XTYTvMVBqOtERZW_BEamuFIXEi4',
        messageFormat: 'embed'
    }
};

export { exportConfig };

