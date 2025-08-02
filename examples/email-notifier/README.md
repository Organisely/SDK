# Organisely Email Notifier Bot

A simple bot that logs "yes" whenever you receive an email in Organisely.

## Features

- ✅ Listens for email received events
- ✅ Logs "yes" to console when email arrives
- ✅ Shows email details (sender, subject, timestamp)
- ✅ Easy to extend and customize

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the bot:**
   ```bash
   npm start
   ```

3. **For development:**
   ```bash
   npm run dev
   ```

## How it works

This bot uses the Organisely SDK to listen for `email.received` events. When an email arrives in your Organisely inbox, the bot will:

1. Receive the webhook from Organisely
2. Check if it's an email event
3. Log "yes" to the console
4. Display email details

## Configuration

To use this bot with Organisely:

1. Create a new V2 Bot integration in Organisely
2. Set the webhook URL to your bot's endpoint
3. Enable the `email.received` event trigger
4. Add the `read:emails` scope

## Example Output

```
🚀 Email Notifier Bot is running!
Listening for email events...
When an email is received, it will log: yes

yes
Email received: {
  from: "sender@example.com",
  subject: "Hello from Organisely",
  userId: "user-123",
  timestamp: "2024-01-15T10:30:00Z"
}
```

## Extending the Bot

You can easily extend this bot to:
- Send notifications to Discord/Slack
- Store emails in a database
- Trigger other actions based on email content
- Filter emails by sender or subject

## License

MIT 