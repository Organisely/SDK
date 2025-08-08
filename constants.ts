// API Configuration
export const ORGANISELY_API_BASE_URL = 'https://api.organisely.com/v1'
export const ORGANISELY_OAUTH_BASE_URL = 'https://organisely.com/oauth'

// SDK Version
export const SDK_VERSION = '1.0.0'

// Default Configuration
export const DEFAULT_CONFIG = {
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,
  userAgent: `Organisely-SDK/${SDK_VERSION}`,
  maxRetryDelay: 30000,
  backoffMultiplier: 2
}

// Event Types
export const EVENT_TYPES = {
  // User activity events
  USER_LOGIN: 'user.login',
  USER_LOGOUT: 'user.logout',
  USER_IDLE: 'user.idle',
  USER_ACTIVE: 'user.active',
  USER_REGISTERED: 'user.registered',
  USER_UPDATED: 'user.updated',
  
  // Habit events
  HABIT_CREATED: 'habit.created',
  HABIT_UPDATED: 'habit.updated',
  HABIT_DELETED: 'habit.deleted',
  HABIT_COMPLETED: 'habit.completed',
  HABIT_MISSED: 'habit.missed',
  HABIT_STREAK_BROKEN: 'habit.streak_broken',
  HABIT_STREAK_MILESTONE: 'habit.streak_milestone',
  HABIT_REMINDER_SENT: 'habit.reminder_sent',
  
  // Integration events
  INTEGRATION_INSTALLED: 'integration.installed',
  INTEGRATION_UNINSTALLED: 'integration.uninstalled',
  INTEGRATION_UPDATED: 'integration.updated',
  INTEGRATION_SCOPES_UPDATED: 'integration.scopes_updated',
  INTEGRATION_ERROR: 'integration.error',
  INTEGRATION_WEBHOOK_FAILED: 'integration.webhook_failed',
  
  // Email events
  EMAIL_RECEIVED: 'email.received',
  EMAIL_SENT: 'email.sent',
  EMAIL_IMPORTANT: 'email.important',
  EMAIL_UNREAD_COUNT: 'email.unread_count',
  EMAIL_ARCHIVED: 'email.archived',
  EMAIL_DELETED: 'email.deleted',
  
  // Calendar events
  CALENDAR_EVENT_CREATED: 'calendar.event_created',
  CALENDAR_EVENT_UPDATED: 'calendar.event_updated',
  CALENDAR_EVENT_DELETED: 'calendar.event_deleted',
  CALENDAR_EVENT_UPCOMING: 'calendar.event_upcoming',
  CALENDAR_EVENT_STARTED: 'calendar.event_started',
  CALENDAR_EVENT_ENDED: 'calendar.event_ended',
  CALENDAR_EVENT_MISSED: 'calendar.event_missed',
  CALENDAR_REMINDER_SENT: 'calendar.reminder_sent',
  
  // AI events
  AI_INSIGHT_GENERATED: 'ai.insight_generated',
  AI_RECOMMENDATION: 'ai.recommendation',
  AI_ACTION_COMPLETED: 'ai.action_completed',
  AI_LEARNING_UPDATED: 'ai.learning_updated',
  
  // Bot events (v2 integrations)
  BOT_TRIGGERED: 'bot.triggered',
  BOT_ACTION_COMPLETED: 'bot.action_completed',
  BOT_ERROR: 'bot.error',
  BOT_RATE_LIMITED: 'bot.rate_limited',
  
  // System events
  SYSTEM_MAINTENANCE: 'system.maintenance',
  SYSTEM_UPDATE: 'system.update',
  SYSTEM_ERROR: 'system.error'
} as const

// Scopes
export const SCOPES = {
  // Read permissions
  READ_HABITS: 'read:habits',
  READ_EMAILS: 'read:emails',
  READ_CALENDAR: 'read:calendar',
  READ_EVENTS: 'read:events',
  READ_PROFILE: 'read:profile',
  READ_INTEGRATIONS: 'read:integrations',
  READ_ANALYTICS: 'read:analytics',
  
  // Write permissions
  WRITE_HABITS: 'write:habits',
  WRITE_EMAILS: 'write:emails',
  WRITE_CALENDAR: 'write:calendar',
  WRITE_EVENTS: 'write:events',
  WRITE_PROFILE: 'write:profile',
  WRITE_INTEGRATIONS: 'write:integrations',
  
  // Admin permissions
  ADMIN_USERS: 'admin:users',
  ADMIN_INTEGRATIONS: 'admin:integrations',
  ADMIN_SYSTEM: 'admin:system',
  
  // Bot permissions
  BOT_TRIGGER: 'bot:trigger',
  BOT_ACTION: 'bot:action',
  BOT_WEBHOOK: 'bot:webhook'
} as const

// API Endpoints
export const API_ENDPOINTS = {
  // User endpoints
  USERS: '/users',
  USER_PROFILE: '/users/profile',
  USER_PREFERENCES: '/users/preferences',
  
  // Habit endpoints
  HABITS: '/habits',
  HABIT_COMPLETIONS: '/habits/:id/completions',
  HABIT_STREAKS: '/habits/:id/streaks',
  
  // Email endpoints
  EMAILS: '/emails',
  EMAIL_SEND: '/emails/send',
  EMAIL_ATTACHMENTS: '/emails/:id/attachments',
  
  // Calendar endpoints
  CALENDAR_EVENTS: '/calendar/events',
  CALENDAR_CALENDARS: '/calendar/calendars',
  CALENDAR_ATTENDEES: '/calendar/events/:id/attendees',
  
  // Integration endpoints
  INTEGRATIONS: '/integrations',
  INTEGRATION_WEBHOOKS: '/integrations/:id/webhooks',
  INTEGRATION_OAUTH: '/integrations/:id/oauth',
  
  // Event endpoints
  EVENTS: '/events',
  EVENTS_TRACK: '/events/track',
  EVENTS_BROADCAST: '/events/broadcast',
  
  // System endpoints
  HEALTH: '/health',
  VERSION: '/version',
  STATUS: '/status'
} as const

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  METHOD_NOT_ALLOWED: 405,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503
} as const

// Error Codes
export const ERROR_CODES = {
  // Authentication errors
  INVALID_API_KEY: 'INVALID_API_KEY',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  INSUFFICIENT_SCOPES: 'INSUFFICIENT_SCOPES',
  
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  
  // Resource errors
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS: 'RESOURCE_ALREADY_EXISTS',
  RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
  RATE_LIMITED: 'RATE_LIMITED',
  
  // Integration errors
  INTEGRATION_ERROR: 'INTEGRATION_ERROR',
  WEBHOOK_FAILED: 'WEBHOOK_FAILED',
  OAUTH_ERROR: 'OAUTH_ERROR',
  
  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  
  // System errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  MAINTENANCE_MODE: 'MAINTENANCE_MODE'
} as const

// Default Headers
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'User-Agent': `Organisely-SDK/${SDK_VERSION}`
} as const

// Retry Configuration
export const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
  backoffMultiplier: 2,
  maxRetryDelay: 30000
} as const

// Webhook Configuration
export const WEBHOOK_CONFIG = {
  timeout: 30000,
  maxRetries: 3,
  retryDelay: 1000
} as const

// OAuth Configuration
export const OAUTH_CONFIG = {
  stateLength: 32,
  codeVerifierLength: 128,
  pkceMethod: 'S256'
} as const 