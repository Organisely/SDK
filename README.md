# Organisely SDK

The official SDK for building integrations and bots with Organisely.

## Installation

```bash
npm install @organisely/sdk
```

## Quick Start

### Basic Client Usage

```typescript
import { OrganiselyClient } from '@organisely/sdk'

const client = new OrganiselyClient({
  apiKey: 'your-api-key',
  userId: 'user-id'
})

// Get user habits
const habits = await client.getHabits()
console.log(habits.data)

// Create a new habit
const newHabit = await client.createHabit({
  name: 'Daily Exercise',
  description: '30 minutes of exercise',
  frequency: 'daily',
  target_count: 1
})
```

### Bot Integration

```typescript
import { OrganiselyBot, EVENT_TYPES } from '@organisely/sdk'

const bot = new OrganiselyBot({
  webhookSecret: 'your-webhook-secret',
  onEvent: async (event) => {
    console.log('Received event:', event.event_type)
    
    if (event.event_type === EVENT_TYPES.HABIT_COMPLETED) {
      // Handle habit completion
      await sendCongratulations(event.user_id)
    }
  }
})

// Express.js middleware
app.use(bot.middleware())

// Or Next.js API route
export default async function handler(req, res) {
  await bot.apiHandler(req, res)
}
```

### OAuth2 Integration

```typescript
import { OrganiselyOAuth } from '@organisely/sdk'

const oauth = new OrganiselyOAuth({
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
  redirectUri: 'https://your-app.com/oauth/callback',
  authUrl: 'https://organisely.com/oauth/authorize',
  tokenUrl: 'https://organisely.com/oauth/token',
  scopes: ['read:habits', 'write:habits']
})

// Generate authorization URL
const authUrl = oauth.generateAuthUrl('state-parameter')

// Exchange code for token
const tokenResponse = await oauth.exchangeCodeForToken('authorization-code')
```

## API Reference

### OrganiselyClient

Main client for interacting with Organisely APIs.

#### Constructor

```typescript
new OrganiselyClient(config: OrganiselyConfig)
```

**Config options:**
- `apiKey?: string` - Your API key for authentication
- `baseUrl?: string` - Base URL for API calls (defaults to production)
- `userId?: string` - Default user ID for operations

#### Methods

##### User Management
- `getCurrentUser()` - Get current user profile
- `getUser(userId: string)` - Get specific user profile

##### Habits
- `getHabits(userId?: string)` - Get user habits
- `createHabit(habit: Partial<OrganiselyHabit>, userId?: string)` - Create new habit
- `updateHabit(habitId: string, updates: Partial<OrganiselyHabit>)` - Update habit
- `deleteHabit(habitId: string)` - Delete habit

##### Emails
- `getEmails(userId?: string)` - Get user emails
- `sendEmail(email: Partial<OrganiselyEmail>, userId?: string)` - Send email

##### Calendar
- `getCalendarEvents(userId?: string)` - Get calendar events
- `createCalendarEvent(event: Partial<OrganiselyCalendarEvent>, userId?: string)` - Create event

##### Events
- `trackEvent(eventType: string, eventData: any, userId?: string)` - Track custom event
- `broadcastEvent(eventType: string, eventData: any, targetUsers?: string[])` - Broadcast event

### OrganiselyBot

Bot SDK for handling webhooks and events.

#### Constructor

```typescript
new OrganiselyBot(config: BotConfig)
```

**Config options:**
- `webhookSecret?: string` - Secret for webhook validation
- `onEvent?: (event: OrganiselyEvent) => void | Promise<void>` - Event handler

#### Methods

- `handleWebhook(payload: BotWebhookPayload)` - Handle incoming webhook
- `middleware()` - Express.js middleware
- `apiHandler(req, res)` - Next.js API route handler

### OrganiselyOAuth

OAuth2 SDK for authentication flows.

#### Constructor

```typescript
new OrganiselyOAuth(config: OAuthConfig)
```

**Config options:**
- `clientId: string` - OAuth client ID
- `clientSecret: string` - OAuth client secret
- `redirectUri: string` - Redirect URI
- `authUrl: string` - Authorization URL
- `tokenUrl: string` - Token URL
- `scopes: string[]` - Requested scopes

#### Methods

- `generateAuthUrl(state?: string)` - Generate authorization URL
- `exchangeCodeForToken(code: string)` - Exchange code for token
- `refreshToken(refreshToken: string)` - Refresh access token
- `revokeToken(token: string, tokenType?: string)` - Revoke token
- `validateToken(accessToken: string)` - Validate token

## Event Types

```typescript
import { EVENT_TYPES } from '@organisely/sdk'

// User events
EVENT_TYPES.USER_LOGIN
EVENT_TYPES.USER_LOGOUT
EVENT_TYPES.USER_IDLE
EVENT_TYPES.USER_ACTIVE

// Habit events
EVENT_TYPES.HABIT_CREATED
EVENT_TYPES.HABIT_COMPLETED
EVENT_TYPES.HABIT_MISSED
EVENT_TYPES.HABIT_STREAK_BROKEN
EVENT_TYPES.HABIT_STREAK_MILESTONE

// Email events
EVENT_TYPES.EMAIL_RECEIVED
EVENT_TYPES.EMAIL_IMPORTANT
EVENT_TYPES.EMAIL_UNREAD_COUNT

// Calendar events
EVENT_TYPES.CALENDAR_EVENT_UPCOMING
EVENT_TYPES.CALENDAR_EVENT_STARTED
EVENT_TYPES.CALENDAR_EVENT_MISSED

// AI events
EVENT_TYPES.AI_INSIGHT_GENERATED
EVENT_TYPES.AI_RECOMMENDATION
EVENT_TYPES.AI_ACTION_COMPLETED
```

## Scopes

```typescript
import { SCOPES } from '@organisely/sdk'

// Read permissions
SCOPES.READ_HABITS
SCOPES.READ_EMAILS
SCOPES.READ_CALENDAR
SCOPES.READ_EVENTS
SCOPES.READ_PROFILE

// Write permissions
SCOPES.WRITE_HABITS
SCOPES.WRITE_EMAILS
SCOPES.WRITE_CALENDAR
SCOPES.WRITE_EVENTS
SCOPES.WRITE_PROFILE

// Admin permissions
SCOPES.ADMIN
```

## Examples

### Complete Bot Example

```typescript
import { OrganiselyBot, EVENT_TYPES } from '@organisely/sdk'

const bot = new OrganiselyBot({
  onEvent: async (event) => {
    switch (event.event_type) {
      case EVENT_TYPES.HABIT_COMPLETED:
        await handleHabitCompleted(event)
        break
      case EVENT_TYPES.EMAIL_IMPORTANT:
        await handleImportantEmail(event)
        break
      case EVENT_TYPES.CALENDAR_EVENT_UPCOMING:
        await handleUpcomingEvent(event)
        break
    }
  }
})

async function handleHabitCompleted(event) {
  const { user_id, event_data } = event
  console.log(`User ${user_id} completed habit: ${event_data.habitName}`)
  
  // Send congratulations
  await sendNotification(user_id, `Great job completing ${event_data.habitName}!`)
}

// Express.js setup
app.post('/webhook', bot.middleware())
```

### Complete OAuth2 Example

```typescript
import { OrganiselyOAuth } from '@organisely/sdk'

const oauth = new OrganiselyOAuth({
  clientId: process.env.ORGANISELY_CLIENT_ID,
  clientSecret: process.env.ORGANISELY_CLIENT_SECRET,
  redirectUri: 'https://your-app.com/oauth/callback',
  authUrl: 'https://organisely.com/oauth/authorize',
  tokenUrl: 'https://organisely.com/oauth/token',
  scopes: [SCOPES.READ_HABITS, SCOPES.WRITE_HABITS]
})

// Step 1: Redirect user to authorization
app.get('/auth', (req, res) => {
  const authUrl = oauth.generateAuthUrl('random-state')
  res.redirect(authUrl)
})

// Step 2: Handle callback
app.get('/oauth/callback', async (req, res) => {
  const { code, state } = req.query
  
  const tokenResponse = await oauth.exchangeCodeForToken(code)
  
  if (tokenResponse.success) {
    // Store tokens securely
    await storeTokens(req.user.id, tokenResponse.data)
    res.redirect('/dashboard')
  } else {
    res.status(400).json({ error: tokenResponse.error })
  }
})
```

## Error Handling

All SDK methods return a consistent response format:

```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
```

```typescript
const result = await client.getHabits()

if (result.success) {
  console.log('Habits:', result.data)
} else {
  console.error('Error:', result.error)
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

- Documentation: https://organisely.com/docs
- Issues: https://github.com/organisely/sdk/issues
- Email: support@organisely.com 