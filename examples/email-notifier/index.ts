import { OrganiselyBot, EVENT_TYPES } from '@organisely/sdk'

const bot = new OrganiselyBot({
  onEvent: async (event) => {
    if (event.event_type === EVENT_TYPES.EMAIL_RECEIVED) {
      console.log("Email received:", {
        from: event.event_data.sender,
        subject: event.event_data.subject,
        userId: event.user_id,
        timestamp: event.timestamp
      })
    }
  }
})

export default bot

if (require.main === module) {
  console.log("🚀 Email Notifier Bot is running!")
  console.log("Listening for email events...")
  console.log("When an email is received, it will log: yes")
} 