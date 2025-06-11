// @ts-ignore
import { ExportConfig } from "../types/config";

const exportConfig: ExportConfig = {
    file: {
        enabled: true,
        outputPath: './exports/data.json',
        format: 'json'
    },

    discord: {
        enabled: false,
        webhookUrl: '',
        messageFormat: 'embed'
    }
};

export { exportConfig };

