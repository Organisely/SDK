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
  ADMIN: 'admin',
  ADMIN_USERS: 'admin:users',
  ADMIN_INTEGRATIONS: 'admin:integrations',
  ADMIN_SYSTEM: 'admin:system'
} as const

// Integration Types
export const INTEGRATION_TYPES = {
  OAUTH2: 'oauth2',
  BOT: 'bot',
  WEBHOOK: 'webhook'
} as const

// Integration Status
export const INTEGRATION_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  PENDING_REVIEW: 'pending_review'
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
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503
} as const

// Error Codes
export const ERROR_CODES = {
  // Authentication errors
  INVALID_API_KEY: 'invalid_api_key',
  INVALID_TOKEN: 'invalid_token',
  TOKEN_EXPIRED: 'token_expired',
  INSUFFICIENT_SCOPES: 'insufficient_scopes',
  
  // Rate limiting
  RATE_LIMITED: 'rate_limited',
  QUOTA_EXCEEDED: 'quota_exceeded',
  
  // Validation errors
  VALIDATION_ERROR: 'validation_error',
  INVALID_REQUEST: 'invalid_request',
  MISSING_REQUIRED_FIELD: 'missing_required_field',
  
  // Resource errors
  RESOURCE_NOT_FOUND: 'resource_not_found',
  RESOURCE_ALREADY_EXISTS: 'resource_already_exists',
  RESOURCE_CONFLICT: 'resource_conflict',
  
  // Integration errors
  INTEGRATION_NOT_FOUND: 'integration_not_found',
  INTEGRATION_DISABLED: 'integration_disabled',
  WEBHOOK_FAILED: 'webhook_failed',
  
  // System errors
  INTERNAL_ERROR: 'internal_error',
  SERVICE_UNAVAILABLE: 'service_unavailable',
  TIMEOUT: 'timeout',
  NETWORK_ERROR: 'network_error'
} as const

// Habit Frequencies
export const HABIT_FREQUENCIES = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  CUSTOM: 'custom'
} as const

// Calendar Event Types
export const EVENT_TYPES_CALENDAR = {
  MEETING: 'meeting',
  APPOINTMENT: 'appointment',
  REMINDER: 'reminder',
  TASK: 'task',
  CUSTOM: 'custom'
} as const

// Notification Types
export const NOTIFICATION_TYPES = {
  EMAIL: 'email',
  PUSH: 'push',
  SMS: 'sms',
  WEBHOOK: 'webhook'
} as const

// Time Zones
export const COMMON_TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney'
] as const

// Locales
export const SUPPORTED_LOCALES = [
  'en-US',
  'en-GB',
  'es-ES',
  'fr-FR',
  'de-DE',
  'it-IT',
  'pt-BR',
  'ja-JP',
  'zh-CN',
  'ko-KR'
] as const

// API Endpoints
export const API_ENDPOINTS = {
  // Users
  USERS: '/users',
  USER_PROFILE: '/users/profile',
  USER_PREFERENCES: '/users/preferences',
  
  // Habits
  HABITS: '/habits',
  HABIT_COMPLETIONS: '/habits/completions',
  HABIT_STATS: '/habits/stats',
  
  // Emails
  EMAILS: '/emails',
  EMAIL_SEND: '/emails/send',
  EMAIL_THREADS: '/emails/threads',
  
  // Calendar
  CALENDAR_EVENTS: '/calendar/events',
  CALENDAR_CALENDARS: '/calendar/calendars',
  
  // Events
  EVENTS: '/events',
  EVENTS_TRACK: '/events/track',
  EVENTS_BROADCAST: '/events/broadcast',
  
  // Integrations
  INTEGRATIONS: '/integrations',
  INTEGRATIONS_OAUTH2: '/integrations/oauth2',
  INTEGRATIONS_BOT: '/integrations/bot',
  
  // Webhooks
  WEBHOOKS: '/webhooks',
  WEBHOOKS_VERIFY: '/webhooks/verify',
  
  // OAuth
  OAUTH_AUTHORIZE: '/oauth/authorize',
  OAUTH_TOKEN: '/oauth/token',
  OAUTH_REVOKE: '/oauth/revoke',
  
  // Analytics
  ANALYTICS: '/analytics',
  ANALYTICS_HABITS: '/analytics/habits',
  ANALYTICS_PRODUCTIVITY: '/analytics/productivity'
} as const 