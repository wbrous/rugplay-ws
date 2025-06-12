import { ExportConfig } from "../types/config";

const exportConfig: ExportConfig = {
    file: {
        enabled: true,
        outputPath: './exports/data.json',
        format: 'json'
    },

    discord: {
        enabled: true,
        webhookUrl: 'https://discord.com/api/webhooks/1382493341609885706/oQO6naMOuliLCL2SBTAiH56n84ORY9NIKnqmfmpm5WMJ-evyy_rQDwi96lWJe1sFEKXv',
        messageFormat: 'embed'
    }
};

export { exportConfig };

