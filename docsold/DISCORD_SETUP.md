# Discord Webhook Setup (Optional)

If you want to send trading events to Discord, follow these steps:

## 1. Create a Discord Webhook

1. Go to your Discord server
2. Right-click on the channel where you want to receive notifications
3. Select "Edit Channel" → "Integrations" → "Webhooks"
4. Click "Create Webhook"
5. Copy the webhook URL

## 2. Update Export Configuration

Edit `src/configuration/export.ts`:

```typescript
const exportConfig: ExportConfig = {
    file: {
        enabled: true,
        outputPath: './exports/data.json',
        format: 'json' // or 'csv' or 'yaml'
    },

    discord: {
        enabled: true, // Enable Discord notifications
        webhookUrl: 'YOUR_DISCORD_WEBHOOK_URL_HERE',
        messageFormat: 'embed' // or 'text'
    }
};
```

## 3. Example Discord Messages

### Embed Format
Rich embedded messages with colors, fields, and thumbnails:
- 🟢 Green for BUY trades
- 🔴 Red for SELL trades
- User avatar thumbnails
- Formatted trade details

### Text Format
Simple text messages:
```
🟢 **BUY** BTC | User: trader123 | Amount: 1,000 | Price: $50,000 | Total: $50,000,000
```

## Security Note
⚠️ **Never commit your webhook URL to version control!** 
Consider using environment variables:

```typescript
webhookUrl: process.env.DISCORD_WEBHOOK_URL || '',
```
