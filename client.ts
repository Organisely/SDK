import { 
  OrganiselyConfig, 
  ApiResponse, 
  OrganiselyUser, 
  OrganiselyHabit, 
  OrganiselyEmail, 
  OrganiselyCalendarEvent,
  OrganiselyIntegration,
  OrganiselyEvent,
  CreateHabitRequest,
  UpdateHabitRequest,
  SendEmailRequest,
  CreateEventRequest,
  TrackEventRequest,
  BroadcastEventRequest,
  PaginationParams,
  PaginatedResponse,
  RequestOptions,
  RetryConfig,
  Logger,
  OrganiselyError,
  RateLimitInfo,
  DEFAULT_TIMEOUT,
  DEFAULT_RETRIES,
  DEFAULT_RETRY_DELAY,
  MAX_RETRY_DELAY,
  BACKOFF_MULTIPLIER
} from './types'
import { 
  EVENT_TYPES, 
  SCOPES,
  ORGANISELY_API_BASE_URL,
  SDK_VERSION,
  DEFAULT_CONFIG,
  API_ENDPOINTS,
  HTTP_STATUS,
  ERROR_CODES
} from './constants'

// Default logger implementation
class DefaultLogger implements Logger {
  debug(message: string, ...args: any[]): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[Organisely SDK] ${message}`, ...args)
    }
  }

  info(message: string, ...args: any[]): void {
    console.info(`[Organisely SDK] ${message}`, ...args)
  }

  warn(message: string, ...args: any[]): void {
    console.warn(`[Organisely SDK] ${message}`, ...args)
  }

  error(message: string, ...args: any[]): void {
    console.error(`[Organisely SDK] ${message}`, ...args)
  }
}

// Custom error class
class OrganiselySDKError extends Error implements OrganiselyError {
  code: string
  statusCode?: number
  requestId?: string
  details?: any

  constructor(message: string, code: string, statusCode?: number, requestId?: string, details?: any) {
    super(message)
    this.name = 'OrganiselySDKError'
    this.code = code
    this.statusCode = statusCode
    this.requestId = requestId
    this.details = details
  }
}

export class OrganiselyClient {
  private config: Required<OrganiselyConfig>
  private logger: Logger
  private retryConfig: RetryConfig
  private rateLimitInfo?: RateLimitInfo

  constructor(config: OrganiselyConfig = {}) {
    this.config = {
      apiKey: config.apiKey || '',
      baseUrl: config.baseUrl || ORGANISELY_API_BASE_URL,
      userId: config.userId || '',
      timeout: config.timeout || DEFAULT_CONFIG.timeout,
      retries: config.retries || DEFAULT_CONFIG.retries,
      retryDelay: config.retryDelay || DEFAULT_CONFIG.retryDelay,
      userAgent: config.userAgent || DEFAULT_CONFIG.userAgent,
      headers: config.headers || {}
    }

    this.logger = new DefaultLogger()
    this.retryConfig = {
      maxRetries: this.config.retries,
      retryDelay: this.config.retryDelay,
      backoffMultiplier: BACKOFF_MULTIPLIER,
      maxRetryDelay: MAX_RETRY_DELAY
    }

    this.logger.debug('OrganiselyClient initialized', { 
      baseUrl: this.config.baseUrl,
      timeout: this.config.timeout,
      retries: this.config.retries
    })
  }

  // Set logger
  setLogger(logger: Logger): void {
    this.logger = logger
  }

  // Set API key
  setApiKey(apiKey: string): void {
    this.config.apiKey = apiKey
    this.logger.debug('API key updated')
  }

  // Set user ID
  setUserId(userId: string): void {
    this.config.userId = userId
    this.logger.debug('User ID updated', { userId })
  }

  // Get rate limit info
  getRateLimitInfo(): RateLimitInfo | undefined {
    return this.rateLimitInfo
  }

  // Main request method with retries and error handling
  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.config.baseUrl}${endpoint}`
    const requestId = this.generateRequestId()
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': this.config.userAgent,
      'X-Request-ID': requestId,
      'X-SDK-Version': SDK_VERSION,
      ...this.config.headers,
      ...options.headers
    }

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`
    }

    const requestOptions: any = {
      headers,
      ...options
    }

    let lastError: Error | null = null
    let attempt = 0

    while (attempt <= this.retryConfig.maxRetries) {
      try {
        this.logger.debug(`Making request (attempt ${attempt + 1})`, { 
          method: requestOptions.method || 'GET',
          url,
          requestId 
        })

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), options.timeout || this.config.timeout)

        const response = await fetch(url, {
          ...requestOptions,
          signal: controller.signal
        })

        clearTimeout(timeoutId)

        // Update rate limit info
        this.updateRateLimitInfo(response.headers)

        const responseData = await this.parseResponse(response)

        if (response.ok) {
          this.logger.debug('Request successful', { 
            statusCode: response.status,
            requestId 
          })

          return {
            success: true,
            data: responseData,
            statusCode: response.status,
            headers: this.extractHeaders(response.headers),
            requestId
          }
        } else {
          const error = this.createError(response.status, responseData, requestId)
          
          // Don't retry on certain status codes
          if (this.shouldNotRetry(response.status)) {
            throw error
          }
          
          lastError = error
        }
      } catch (error: any) {
        lastError = error
        
        // Don't retry on network errors or timeouts
        if (error instanceof TypeError || error.name === 'AbortError') {
          throw new OrganiselySDKError(
            'Network error or timeout',
            ERROR_CODES.NETWORK_ERROR,
            undefined,
            requestId
          )
        }
      }

      attempt++
      
      if (attempt <= this.retryConfig.maxRetries) {
        const delay = this.calculateRetryDelay(attempt)
        this.logger.debug(`Retrying in ${delay}ms`, { attempt, requestId })
        await this.sleep(delay)
      }
    }

    // All retries exhausted
    this.logger.error('All retries exhausted', { 
      attempts: attempt,
      requestId,
      lastError: lastError?.message 
    })

    throw lastError || new OrganiselySDKError(
      'Request failed after all retries',
      ERROR_CODES.INTERNAL_ERROR,
      undefined,
      requestId
    )
  }

  // Parse response
  private async parseResponse(response: Response): Promise<any> {
    const contentType = response.headers.get('content-type')
    
    if (contentType?.includes('application/json')) {
      return response.json()
    }
    
    if (contentType?.includes('text/')) {
      return response.text()
    }
    
    return response.arrayBuffer()
  }

  // Create error from response
  private createError(statusCode: number, data: any, requestId: string): OrganiselySDKError {
    const errorCode = this.getErrorCode(statusCode, data)
    const message = data?.error || data?.message || `HTTP ${statusCode}`
    
    return new OrganiselySDKError(
      message,
      errorCode,
      statusCode,
      requestId,
      data
    )
  }

  // Get error code from status code and response data
  private getErrorCode(statusCode: number, data: any): string {
    if (data?.code) return data.code
    
    switch (statusCode) {
      case HTTP_STATUS.UNAUTHORIZED:
        return ERROR_CODES.INVALID_API_KEY
      case HTTP_STATUS.FORBIDDEN:
        return ERROR_CODES.INSUFFICIENT_SCOPES
      case HTTP_STATUS.NOT_FOUND:
        return ERROR_CODES.RESOURCE_NOT_FOUND
      case HTTP_STATUS.TOO_MANY_REQUESTS:
        return ERROR_CODES.RATE_LIMITED
      case HTTP_STATUS.UNPROCESSABLE_ENTITY:
        return ERROR_CODES.VALIDATION_ERROR
      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
        return ERROR_CODES.INTERNAL_ERROR
      case HTTP_STATUS.SERVICE_UNAVAILABLE:
        return ERROR_CODES.SERVICE_UNAVAILABLE
      default:
        return ERROR_CODES.INTERNAL_ERROR
    }
  }

  // Check if request should not be retried
  private shouldNotRetry(statusCode: number): boolean {
    const nonRetryableStatuses = [
      HTTP_STATUS.BAD_REQUEST,
      HTTP_STATUS.UNAUTHORIZED,
      HTTP_STATUS.FORBIDDEN,
      HTTP_STATUS.NOT_FOUND,
      HTTP_STATUS.METHOD_NOT_ALLOWED,
      HTTP_STATUS.UNPROCESSABLE_ENTITY
    ]
    return nonRetryableStatuses.includes(statusCode as any)
  }

  // Calculate retry delay with exponential backoff
  private calculateRetryDelay(attempt: number): number {
    const delay = this.retryConfig.retryDelay * Math.pow(this.retryConfig.backoffMultiplier, attempt - 1)
    return Math.min(delay, this.retryConfig.maxRetryDelay)
  }

  // Sleep utility
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Generate request ID
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Update rate limit info from headers
  private updateRateLimitInfo(headers: Headers): void {
    const limit = headers.get('X-RateLimit-Limit')
    const remaining = headers.get('X-RateLimit-Remaining')
    const reset = headers.get('X-RateLimit-Reset')
    const retryAfter = headers.get('Retry-After')

    if (limit && remaining && reset) {
      this.rateLimitInfo = {
        limit: parseInt(limit),
        remaining: parseInt(remaining),
        reset: parseInt(reset),
        retryAfter: retryAfter ? parseInt(retryAfter) : undefined
      }
    }
  }

  // Extract headers
  private extractHeaders(headers: Headers): Record<string, string> {
    const result: Record<string, string> = {}
    headers.forEach((value, key) => {
      result[key] = value
    })
    return result
  }

  // User Management
  async getCurrentUser(): Promise<ApiResponse<OrganiselyUser>> {
    return this.request<OrganiselyUser>(API_ENDPOINTS.USER_PROFILE)
  }

  async getUser(userId: string): Promise<ApiResponse<OrganiselyUser>> {
    return this.request<OrganiselyUser>(`${API_ENDPOINTS.USERS}/${userId}`)
  }

  async updateUser(userId: string, updates: Partial<OrganiselyUser>): Promise<ApiResponse<OrganiselyUser>> {
    return this.request<OrganiselyUser>(`${API_ENDPOINTS.USERS}/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    })
  }

  // Habit Management
  async getHabits(userId?: string, params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<OrganiselyHabit>>> {
    const targetUserId = userId || this.config.userId
    if (!targetUserId) {
      throw new OrganiselySDKError(
        'User ID is required',
        ERROR_CODES.MISSING_REQUIRED_FIELD
      )
    }

    const queryParams = new URLSearchParams({
      user_id: targetUserId,
      ...(params?.page && { page: params.page.toString() }),
      ...(params?.limit && { limit: params.limit.toString() }),
      ...(params?.cursor && { cursor: params.cursor })
    })

    return this.request<PaginatedResponse<OrganiselyHabit>>(`${API_ENDPOINTS.HABITS}?${queryParams}`)
  }

  async getHabit(habitId: string): Promise<ApiResponse<OrganiselyHabit>> {
    return this.request<OrganiselyHabit>(`${API_ENDPOINTS.HABITS}/${habitId}`)
  }

  async createHabit(habit: CreateHabitRequest, userId?: string): Promise<ApiResponse<OrganiselyHabit>> {
    const targetUserId = userId || this.config.userId
    if (!targetUserId) {
      throw new OrganiselySDKError(
        'User ID is required',
        ERROR_CODES.MISSING_REQUIRED_FIELD
      )
    }

    return this.request<OrganiselyHabit>(API_ENDPOINTS.HABITS, {
      method: 'POST',
      body: JSON.stringify({ ...habit, user_id: targetUserId })
    })
  }

  async updateHabit(habitId: string, updates: UpdateHabitRequest): Promise<ApiResponse<OrganiselyHabit>> {
    return this.request<OrganiselyHabit>(`${API_ENDPOINTS.HABITS}/${habitId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    })
  }

  async deleteHabit(habitId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`${API_ENDPOINTS.HABITS}/${habitId}`, {
      method: 'DELETE'
    })
  }

  async completeHabit(habitId: string, notes?: string): Promise<ApiResponse<void>> {
    return this.request<void>(`${API_ENDPOINTS.HABIT_COMPLETIONS}`, {
      method: 'POST',
      body: JSON.stringify({ habit_id: habitId, notes })
    })
  }

  // Email Management
  async getEmails(userId?: string, params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<OrganiselyEmail>>> {
    const targetUserId = userId || this.config.userId
    if (!targetUserId) {
      throw new OrganiselySDKError(
        'User ID is required',
        ERROR_CODES.MISSING_REQUIRED_FIELD
      )
    }

    const queryParams = new URLSearchParams({
      user_id: targetUserId,
      ...(params?.page && { page: params.page.toString() }),
      ...(params?.limit && { limit: params.limit.toString() }),
      ...(params?.cursor && { cursor: params.cursor })
    })

    return this.request<PaginatedResponse<OrganiselyEmail>>(`${API_ENDPOINTS.EMAILS}?${queryParams}`)
  }

  async getEmail(emailId: string): Promise<ApiResponse<OrganiselyEmail>> {
    return this.request<OrganiselyEmail>(`${API_ENDPOINTS.EMAILS}/${emailId}`)
  }

  async sendEmail(email: SendEmailRequest, userId?: string): Promise<ApiResponse<OrganiselyEmail>> {
    const targetUserId = userId || this.config.userId
    if (!targetUserId) {
      throw new OrganiselySDKError(
        'User ID is required',
        ERROR_CODES.MISSING_REQUIRED_FIELD
      )
    }

    return this.request<OrganiselyEmail>(API_ENDPOINTS.EMAIL_SEND, {
      method: 'POST',
      body: JSON.stringify({ ...email, user_id: targetUserId })
    })
  }

  // Calendar Management
  async getCalendarEvents(userId?: string, params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<OrganiselyCalendarEvent>>> {
    const targetUserId = userId || this.config.userId
    if (!targetUserId) {
      throw new OrganiselySDKError(
        'User ID is required',
        ERROR_CODES.MISSING_REQUIRED_FIELD
      )
    }

    const queryParams = new URLSearchParams({
      user_id: targetUserId,
      ...(params?.page && { page: params.page.toString() }),
      ...(params?.limit && { limit: params.limit.toString() }),
      ...(params?.cursor && { cursor: params.cursor })
    })

    return this.request<PaginatedResponse<OrganiselyCalendarEvent>>(`${API_ENDPOINTS.CALENDAR_EVENTS}?${queryParams}`)
  }

  async getCalendarEvent(eventId: string): Promise<ApiResponse<OrganiselyCalendarEvent>> {
    return this.request<OrganiselyCalendarEvent>(`${API_ENDPOINTS.CALENDAR_EVENTS}/${eventId}`)
  }

  async createCalendarEvent(event: CreateEventRequest, userId?: string): Promise<ApiResponse<OrganiselyCalendarEvent>> {
    const targetUserId = userId || this.config.userId
    if (!targetUserId) {
      throw new OrganiselySDKError(
        'User ID is required',
        ERROR_CODES.MISSING_REQUIRED_FIELD
      )
    }

    return this.request<OrganiselyCalendarEvent>(API_ENDPOINTS.CALENDAR_EVENTS, {
      method: 'POST',
      body: JSON.stringify({ ...event, user_id: targetUserId })
    })
  }

  async updateCalendarEvent(eventId: string, updates: Partial<CreateEventRequest>): Promise<ApiResponse<OrganiselyCalendarEvent>> {
    return this.request<OrganiselyCalendarEvent>(`${API_ENDPOINTS.CALENDAR_EVENTS}/${eventId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    })
  }

  async deleteCalendarEvent(eventId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`${API_ENDPOINTS.CALENDAR_EVENTS}/${eventId}`, {
      method: 'DELETE'
    })
  }

  // Event Tracking
  async trackEvent(event: TrackEventRequest, userId?: string): Promise<ApiResponse<void>> {
    const targetUserId = userId || this.config.userId
    if (!targetUserId) {
      throw new OrganiselySDKError(
        'User ID is required',
        ERROR_CODES.MISSING_REQUIRED_FIELD
      )
    }

    return this.request<void>(API_ENDPOINTS.EVENTS_TRACK, {
      method: 'POST',
      body: JSON.stringify({ ...event, user_id: targetUserId })
    })
  }

  async broadcastEvent(event: BroadcastEventRequest): Promise<ApiResponse<void>> {
    const userId = this.config.userId
    if (!userId) {
      throw new OrganiselySDKError(
        'User ID is required',
        ERROR_CODES.MISSING_REQUIRED_FIELD
      )
    }

    return this.request<void>(API_ENDPOINTS.EVENTS_BROADCAST, {
      method: 'POST',
      body: JSON.stringify({ ...event, user_id: userId })
    })
  }

  // Integration Management
  async getIntegrations(userId?: string): Promise<ApiResponse<OrganiselyIntegration[]>> {
    const targetUserId = userId || this.config.userId
    if (!targetUserId) {
      throw new OrganiselySDKError(
        'User ID is required',
        ERROR_CODES.MISSING_REQUIRED_FIELD
      )
    }

    const queryParams = new URLSearchParams({ user_id: targetUserId })
    return this.request<OrganiselyIntegration[]>(`${API_ENDPOINTS.INTEGRATIONS}?${queryParams}`)
  }

  async getIntegration(integrationId: string): Promise<ApiResponse<OrganiselyIntegration>> {
    return this.request<OrganiselyIntegration>(`${API_ENDPOINTS.INTEGRATIONS}/${integrationId}`)
  }

  // Utility methods
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.request<{ status: string; timestamp: string }>('/health')
  }

  async getApiVersion(): Promise<ApiResponse<{ version: string; features: string[] }>> {
    return this.request<{ version: string; features: string[] }>('/version')
  }
} 