// Core SDK Configuration
export interface OrganiselyConfig {
  apiKey?: string
  baseUrl?: string
  userId?: string
  timeout?: number
  retries?: number
  retryDelay?: number
  userAgent?: string
  headers?: Record<string, string>
}

// Authentication
export interface AuthConfig {
  apiKey?: string
  accessToken?: string
  refreshToken?: string
  expiresAt?: number
}

// Request/Response Types
export interface ApiRequest {
  method: string
  url: string
  headers?: Record<string, string>
  body?: any
  timeout?: number
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  statusCode?: number
  headers?: Record<string, string>
  requestId?: string
}

// Pagination
export interface PaginationParams {
  page?: number
  limit?: number
  cursor?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
    nextCursor?: string
    prevCursor?: string
  }
}

// User Types
export interface OrganiselyUser {
  id: string
  email: string
  name?: string
  avatar_url?: string
  timezone?: string
  locale?: string
  created_at: string
  updated_at: string
  last_login_at?: string
  is_active: boolean
  preferences?: UserPreferences
}

export interface UserPreferences {
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
  }
  privacy: {
    share_analytics: boolean
    share_data: boolean
  }
  theme: 'light' | 'dark' | 'auto'
}

// Habit Types
export interface OrganiselyHabit {
  id: string
  name: string
  description?: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom'
  target_count: number
  current_streak: number
  longest_streak: number
  total_completions: number
  completion_rate: number
  created_at: string
  updated_at: string
  user_id: string
  category?: string
  tags?: string[]
  is_active: boolean
  reminder_time?: string
  reminder_days?: number[]
  custom_frequency?: {
    type: 'interval' | 'specific_days'
    value: any
  }
}

export interface CreateHabitRequest {
  name: string
  description?: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom'
  target_count: number
  category?: string
  tags?: string[]
  reminder_time?: string
  reminder_days?: number[]
  custom_frequency?: {
    type: 'interval' | 'specific_days'
    value: any
  }
}

export interface UpdateHabitRequest extends Partial<CreateHabitRequest> {
  is_active?: boolean
}

export interface HabitCompletion {
  id: string
  habit_id: string
  user_id: string
  completed_at: string
  notes?: string
  mood?: number
  duration?: number
}

// Email Types
export interface OrganiselyEmail {
  id: string
  subject: string
  sender: string
  recipient: string
  body: string
  html_body?: string
  is_read: boolean
  is_important: boolean
  is_archived: boolean
  received_at: string
  thread_id?: string
  labels?: string[]
  attachments?: EmailAttachment[]
  metadata?: Record<string, any>
}

export interface EmailAttachment {
  id: string
  filename: string
  content_type: string
  size: number
  url?: string
}

export interface SendEmailRequest {
  to: string | string[]
  subject: string
  body: string
  html_body?: string
  cc?: string[]
  bcc?: string[]
  reply_to?: string
  attachments?: Array<{
    filename: string
    content: string | Uint8Array
    contentType: string
  }>
  scheduled_at?: string
}

// Calendar Types
export interface OrganiselyCalendarEvent {
  id: string
  title: string
  description?: string
  start_time: string
  end_time: string
  location?: string
  attendees?: CalendarAttendee[]
  created_at: string
  updated_at: string
  user_id: string
  calendar_id?: string
  is_all_day: boolean
  recurrence?: EventRecurrence
  reminders?: EventReminder[]
  color?: string
  is_cancelled: boolean
}

export interface CalendarAttendee {
  email: string
  name?: string
  response_status: 'accepted' | 'declined' | 'pending' | 'tentative'
}

export interface EventRecurrence {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly'
  interval: number
  end_date?: string
  end_after_occurrences?: number
  days_of_week?: number[]
  day_of_month?: number
}

export interface EventReminder {
  type: 'email' | 'push' | 'sms'
  minutes_before: number
}

export interface CreateEventRequest {
  title: string
  description?: string
  start_time: string
  end_time: string
  location?: string
  attendees?: string[]
  is_all_day?: boolean
  recurrence?: EventRecurrence
  reminders?: EventReminder[]
  color?: string
}

// Integration Types
export interface OrganiselyIntegration {
  id: string
  name: string
  description?: string
  type: 'oauth2' | 'bot' | 'webhook'
  status: 'draft' | 'active' | 'inactive' | 'suspended'
  scopes: string[]
  event_triggers?: string[]
  webhook_url?: string
  created_at: string
  updated_at: string
  user_id: string
  is_public: boolean
  version: string
  config_schema?: any
  metadata?: Record<string, any>
  // New dependency fields
  extends?: string[] // Array of base integration IDs
  is_base_integration?: boolean // Whether this is a base integration
  category?: 'email' | 'calendar' | 'communication' | 'productivity' | 'custom'
  icon?: string
  documentation_url?: string
}

export interface CreateIntegrationRequest {
  name: string
  description?: string
  type: 'oauth2' | 'bot'
  scopes: string[]
  event_triggers?: string[]
  webhook_url?: string
  config_schema?: any
  is_public?: boolean
  // New dependency fields
  extends?: string[]
  is_base_integration?: boolean
  category?: 'email' | 'calendar' | 'communication' | 'productivity' | 'custom'
  icon?: string
  documentation_url?: string
}

export interface IntegrationDependency {
  base_integration_id: string
  base_integration_name: string
  required_scopes: string[]
  required_events: string[]
  optional_scopes: string[]
  optional_events: string[]
}

export interface ResolvedIntegration {
  id: string
  name: string
  type: 'oauth2' | 'bot' | 'webhook'
  all_scopes: string[] // Combined scopes from base + current
  all_events: string[] // Combined events from base + current
  dependencies: IntegrationDependency[]
  base_integrations: OrganiselyIntegration[]
  is_standalone: boolean
}

// Event Types
export interface OrganiselyEvent {
  id: string
  event_type: string
  event_data: any
  user_id?: string
  target_users?: string[]
  metadata: Record<string, any>
  timestamp: string
  created_at: string
  source?: string
  correlation_id?: string
}

export interface TrackEventRequest {
  event_type: string
  event_data?: any
  metadata?: Record<string, any>
  timestamp?: string
  correlation_id?: string
}

export interface BroadcastEventRequest {
  event_type: string
  event_data?: any
  target_users?: string[]
  metadata?: Record<string, any>
  timestamp?: string
}

// Webhook Types
export interface BotWebhookPayload {
  event: string
  data: any
  userId: string
  timestamp: string
  eventId: string
  correlationId?: string
  secret?: string
}

export interface WebhookConfig {
  secret?: string
  timeout?: number
  retries?: number
}

// OAuth Types
export interface OAuthConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  authUrl: string
  tokenUrl: string
  scopes: string[]
  state?: string
}

export interface OAuthTokenResponse {
  access_token: string
  refresh_token?: string
  expires_in: number
  token_type: string
  scope?: string
  user_id?: string
}

export interface RefreshTokenRequest {
  refresh_token: string
  client_id: string
  client_secret: string
}

// Error Types
export interface OrganiselyError extends Error {
  code: string
  statusCode?: number
  requestId?: string
  details?: any
}

export interface RateLimitInfo {
  limit: number
  remaining: number
  reset: number
  retryAfter?: number
}

// Request Options
export interface RequestOptions {
  method?: string
  body?: string
  timeout?: number
  retries?: number
  retryDelay?: number
  headers?: Record<string, string>
}

export interface RetryConfig {
  maxRetries: number
  retryDelay: number
  backoffMultiplier: number
  maxRetryDelay: number
}

// Logger Interface
export interface Logger {
  debug(message: string, ...args: any[]): void
  info(message: string, ...args: any[]): void
  warn(message: string, ...args: any[]): void
  error(message: string, ...args: any[]): void
}

// Constants
export const DEFAULT_TIMEOUT = 30000
export const DEFAULT_RETRIES = 3
export const DEFAULT_RETRY_DELAY = 1000
export const MAX_RETRY_DELAY = 30000
export const BACKOFF_MULTIPLIER = 2 