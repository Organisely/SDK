"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganiselyClient = void 0;
const types_1 = require("./types");
const constants_1 = require("./constants");
// Default logger implementation
class DefaultLogger {
    debug(message, ...args) {
        if (process.env.NODE_ENV === 'development') {
            console.debug(`[Organisely SDK] ${message}`, ...args);
        }
    }
    info(message, ...args) {
        console.info(`[Organisely SDK] ${message}`, ...args);
    }
    warn(message, ...args) {
        console.warn(`[Organisely SDK] ${message}`, ...args);
    }
    error(message, ...args) {
        console.error(`[Organisely SDK] ${message}`, ...args);
    }
}
// Custom error class
class OrganiselySDKError extends Error {
    code;
    statusCode;
    requestId;
    details;
    constructor(message, code, statusCode, requestId, details) {
        super(message);
        this.name = 'OrganiselySDKError';
        this.code = code;
        this.statusCode = statusCode;
        this.requestId = requestId;
        this.details = details;
    }
}
class OrganiselyClient {
    config;
    logger;
    retryConfig;
    rateLimitInfo;
    constructor(config = {}) {
        this.config = {
            apiKey: config.apiKey || '',
            baseUrl: config.baseUrl || constants_1.ORGANISELY_API_BASE_URL,
            userId: config.userId || '',
            timeout: config.timeout || constants_1.DEFAULT_CONFIG.timeout,
            retries: config.retries || constants_1.DEFAULT_CONFIG.retries,
            retryDelay: config.retryDelay || constants_1.DEFAULT_CONFIG.retryDelay,
            userAgent: config.userAgent || constants_1.DEFAULT_CONFIG.userAgent,
            headers: config.headers || {}
        };
        this.logger = new DefaultLogger();
        this.retryConfig = {
            maxRetries: this.config.retries,
            retryDelay: this.config.retryDelay,
            backoffMultiplier: types_1.BACKOFF_MULTIPLIER,
            maxRetryDelay: types_1.MAX_RETRY_DELAY
        };
        this.logger.debug('OrganiselyClient initialized', {
            baseUrl: this.config.baseUrl,
            timeout: this.config.timeout,
            retries: this.config.retries
        });
    }
    // Set logger
    setLogger(logger) {
        this.logger = logger;
    }
    // Set API key
    setApiKey(apiKey) {
        this.config.apiKey = apiKey;
        this.logger.debug('API key updated');
    }
    // Set user ID
    setUserId(userId) {
        this.config.userId = userId;
        this.logger.debug('User ID updated', { userId });
    }
    // Get rate limit info
    getRateLimitInfo() {
        return this.rateLimitInfo;
    }
    // Main request method with retries and error handling
    async request(endpoint, options = {}) {
        const url = `${this.config.baseUrl}${endpoint}`;
        const requestId = this.generateRequestId();
        const headers = {
            'Content-Type': 'application/json',
            'User-Agent': this.config.userAgent,
            'X-Request-ID': requestId,
            'X-SDK-Version': constants_1.SDK_VERSION,
            ...this.config.headers,
            ...options.headers
        };
        if (this.config.apiKey) {
            headers['Authorization'] = `Bearer ${this.config.apiKey}`;
        }
        const requestOptions = {
            headers,
            ...options
        };
        let lastError = null;
        let attempt = 0;
        while (attempt <= this.retryConfig.maxRetries) {
            try {
                this.logger.debug(`Making request (attempt ${attempt + 1})`, {
                    method: requestOptions.method || 'GET',
                    url,
                    requestId
                });
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), options.timeout || this.config.timeout);
                const response = await fetch(url, {
                    ...requestOptions,
                    signal: controller.signal
                });
                clearTimeout(timeoutId);
                // Update rate limit info
                this.updateRateLimitInfo(response.headers);
                const responseData = await this.parseResponse(response);
                if (response.ok) {
                    this.logger.debug('Request successful', {
                        statusCode: response.status,
                        requestId
                    });
                    return {
                        success: true,
                        data: responseData,
                        statusCode: response.status,
                        headers: this.extractHeaders(response.headers),
                        requestId
                    };
                }
                else {
                    const error = this.createError(response.status, responseData, requestId);
                    // Don't retry on certain status codes
                    if (this.shouldNotRetry(response.status)) {
                        throw error;
                    }
                    lastError = error;
                }
            }
            catch (error) {
                lastError = error;
                // Don't retry on network errors or timeouts
                if (error instanceof TypeError || error.name === 'AbortError') {
                    throw new OrganiselySDKError('Network error or timeout', constants_1.ERROR_CODES.NETWORK_ERROR, undefined, requestId);
                }
            }
            attempt++;
            if (attempt <= this.retryConfig.maxRetries) {
                const delay = this.calculateRetryDelay(attempt);
                this.logger.debug(`Retrying in ${delay}ms`, { attempt, requestId });
                await this.sleep(delay);
            }
        }
        // All retries exhausted
        this.logger.error('All retries exhausted', {
            attempts: attempt,
            requestId,
            lastError: lastError?.message
        });
        throw lastError || new OrganiselySDKError('Request failed after all retries', constants_1.ERROR_CODES.INTERNAL_ERROR, undefined, requestId);
    }
    // Parse response
    async parseResponse(response) {
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
            return response.json();
        }
        if (contentType?.includes('text/')) {
            return response.text();
        }
        return response.arrayBuffer();
    }
    // Create error from response
    createError(statusCode, data, requestId) {
        const errorCode = this.getErrorCode(statusCode, data);
        const message = data?.error || data?.message || `HTTP ${statusCode}`;
        return new OrganiselySDKError(message, errorCode, statusCode, requestId, data);
    }
    // Get error code from status code and response data
    getErrorCode(statusCode, data) {
        if (data?.code)
            return data.code;
        switch (statusCode) {
            case constants_1.HTTP_STATUS.UNAUTHORIZED:
                return constants_1.ERROR_CODES.INVALID_API_KEY;
            case constants_1.HTTP_STATUS.FORBIDDEN:
                return constants_1.ERROR_CODES.INSUFFICIENT_SCOPES;
            case constants_1.HTTP_STATUS.NOT_FOUND:
                return constants_1.ERROR_CODES.RESOURCE_NOT_FOUND;
            case constants_1.HTTP_STATUS.TOO_MANY_REQUESTS:
                return constants_1.ERROR_CODES.RATE_LIMITED;
            case constants_1.HTTP_STATUS.UNPROCESSABLE_ENTITY:
                return constants_1.ERROR_CODES.VALIDATION_ERROR;
            case constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR:
                return constants_1.ERROR_CODES.INTERNAL_ERROR;
            case constants_1.HTTP_STATUS.SERVICE_UNAVAILABLE:
                return constants_1.ERROR_CODES.SERVICE_UNAVAILABLE;
            default:
                return constants_1.ERROR_CODES.INTERNAL_ERROR;
        }
    }
    // Check if request should not be retried
    shouldNotRetry(statusCode) {
        const nonRetryableStatuses = [
            constants_1.HTTP_STATUS.BAD_REQUEST,
            constants_1.HTTP_STATUS.UNAUTHORIZED,
            constants_1.HTTP_STATUS.FORBIDDEN,
            constants_1.HTTP_STATUS.NOT_FOUND,
            constants_1.HTTP_STATUS.METHOD_NOT_ALLOWED,
            constants_1.HTTP_STATUS.UNPROCESSABLE_ENTITY
        ];
        return nonRetryableStatuses.includes(statusCode);
    }
    // Calculate retry delay with exponential backoff
    calculateRetryDelay(attempt) {
        const delay = this.retryConfig.retryDelay * Math.pow(this.retryConfig.backoffMultiplier, attempt - 1);
        return Math.min(delay, this.retryConfig.maxRetryDelay);
    }
    // Sleep utility
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    // Generate request ID
    generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    // Update rate limit info from headers
    updateRateLimitInfo(headers) {
        const limit = headers.get('X-RateLimit-Limit');
        const remaining = headers.get('X-RateLimit-Remaining');
        const reset = headers.get('X-RateLimit-Reset');
        const retryAfter = headers.get('Retry-After');
        if (limit && remaining && reset) {
            this.rateLimitInfo = {
                limit: parseInt(limit),
                remaining: parseInt(remaining),
                reset: parseInt(reset),
                retryAfter: retryAfter ? parseInt(retryAfter) : undefined
            };
        }
    }
    // Extract headers
    extractHeaders(headers) {
        const result = {};
        headers.forEach((value, key) => {
            result[key] = value;
        });
        return result;
    }
    // User Management
    async getCurrentUser() {
        return this.request(constants_1.API_ENDPOINTS.USER_PROFILE);
    }
    async getUser(userId) {
        return this.request(`${constants_1.API_ENDPOINTS.USERS}/${userId}`);
    }
    async updateUser(userId, updates) {
        return this.request(`${constants_1.API_ENDPOINTS.USERS}/${userId}`, {
            method: 'PATCH',
            body: JSON.stringify(updates)
        });
    }
    // Habit Management
    async getHabits(userId, params) {
        const targetUserId = userId || this.config.userId;
        if (!targetUserId) {
            throw new OrganiselySDKError('User ID is required', constants_1.ERROR_CODES.MISSING_REQUIRED_FIELD);
        }
        const queryParams = new URLSearchParams({
            user_id: targetUserId,
            ...(params?.page && { page: params.page.toString() }),
            ...(params?.limit && { limit: params.limit.toString() }),
            ...(params?.cursor && { cursor: params.cursor })
        });
        return this.request(`${constants_1.API_ENDPOINTS.HABITS}?${queryParams}`);
    }
    async getHabit(habitId) {
        return this.request(`${constants_1.API_ENDPOINTS.HABITS}/${habitId}`);
    }
    async createHabit(habit, userId) {
        const targetUserId = userId || this.config.userId;
        if (!targetUserId) {
            throw new OrganiselySDKError('User ID is required', constants_1.ERROR_CODES.MISSING_REQUIRED_FIELD);
        }
        return this.request(constants_1.API_ENDPOINTS.HABITS, {
            method: 'POST',
            body: JSON.stringify({ ...habit, user_id: targetUserId })
        });
    }
    async updateHabit(habitId, updates) {
        return this.request(`${constants_1.API_ENDPOINTS.HABITS}/${habitId}`, {
            method: 'PATCH',
            body: JSON.stringify(updates)
        });
    }
    async deleteHabit(habitId) {
        return this.request(`${constants_1.API_ENDPOINTS.HABITS}/${habitId}`, {
            method: 'DELETE'
        });
    }
    async completeHabit(habitId, notes) {
        return this.request(`${constants_1.API_ENDPOINTS.HABIT_COMPLETIONS}`, {
            method: 'POST',
            body: JSON.stringify({ habit_id: habitId, notes })
        });
    }
    // Email Management
    async getEmails(userId, params) {
        const targetUserId = userId || this.config.userId;
        if (!targetUserId) {
            throw new OrganiselySDKError('User ID is required', constants_1.ERROR_CODES.MISSING_REQUIRED_FIELD);
        }
        const queryParams = new URLSearchParams({
            user_id: targetUserId,
            ...(params?.page && { page: params.page.toString() }),
            ...(params?.limit && { limit: params.limit.toString() }),
            ...(params?.cursor && { cursor: params.cursor })
        });
        return this.request(`${constants_1.API_ENDPOINTS.EMAILS}?${queryParams}`);
    }
    async getEmail(emailId) {
        return this.request(`${constants_1.API_ENDPOINTS.EMAILS}/${emailId}`);
    }
    async sendEmail(email, userId) {
        const targetUserId = userId || this.config.userId;
        if (!targetUserId) {
            throw new OrganiselySDKError('User ID is required', constants_1.ERROR_CODES.MISSING_REQUIRED_FIELD);
        }
        return this.request(constants_1.API_ENDPOINTS.EMAIL_SEND, {
            method: 'POST',
            body: JSON.stringify({ ...email, user_id: targetUserId })
        });
    }
    // Calendar Management
    async getCalendarEvents(userId, params) {
        const targetUserId = userId || this.config.userId;
        if (!targetUserId) {
            throw new OrganiselySDKError('User ID is required', constants_1.ERROR_CODES.MISSING_REQUIRED_FIELD);
        }
        const queryParams = new URLSearchParams({
            user_id: targetUserId,
            ...(params?.page && { page: params.page.toString() }),
            ...(params?.limit && { limit: params.limit.toString() }),
            ...(params?.cursor && { cursor: params.cursor })
        });
        return this.request(`${constants_1.API_ENDPOINTS.CALENDAR_EVENTS}?${queryParams}`);
    }
    async getCalendarEvent(eventId) {
        return this.request(`${constants_1.API_ENDPOINTS.CALENDAR_EVENTS}/${eventId}`);
    }
    async createCalendarEvent(event, userId) {
        const targetUserId = userId || this.config.userId;
        if (!targetUserId) {
            throw new OrganiselySDKError('User ID is required', constants_1.ERROR_CODES.MISSING_REQUIRED_FIELD);
        }
        return this.request(constants_1.API_ENDPOINTS.CALENDAR_EVENTS, {
            method: 'POST',
            body: JSON.stringify({ ...event, user_id: targetUserId })
        });
    }
    async updateCalendarEvent(eventId, updates) {
        return this.request(`${constants_1.API_ENDPOINTS.CALENDAR_EVENTS}/${eventId}`, {
            method: 'PATCH',
            body: JSON.stringify(updates)
        });
    }
    async deleteCalendarEvent(eventId) {
        return this.request(`${constants_1.API_ENDPOINTS.CALENDAR_EVENTS}/${eventId}`, {
            method: 'DELETE'
        });
    }
    // Event Tracking
    async trackEvent(event, userId) {
        const targetUserId = userId || this.config.userId;
        if (!targetUserId) {
            throw new OrganiselySDKError('User ID is required', constants_1.ERROR_CODES.MISSING_REQUIRED_FIELD);
        }
        return this.request(constants_1.API_ENDPOINTS.EVENTS_TRACK, {
            method: 'POST',
            body: JSON.stringify({ ...event, user_id: targetUserId })
        });
    }
    async broadcastEvent(event) {
        const userId = this.config.userId;
        if (!userId) {
            throw new OrganiselySDKError('User ID is required', constants_1.ERROR_CODES.MISSING_REQUIRED_FIELD);
        }
        return this.request(constants_1.API_ENDPOINTS.EVENTS_BROADCAST, {
            method: 'POST',
            body: JSON.stringify({ ...event, user_id: userId })
        });
    }
    // Integration Management
    async getIntegrations(userId) {
        const targetUserId = userId || this.config.userId;
        if (!targetUserId) {
            throw new OrganiselySDKError('User ID is required', constants_1.ERROR_CODES.MISSING_REQUIRED_FIELD);
        }
        const queryParams = new URLSearchParams({ user_id: targetUserId });
        return this.request(`${constants_1.API_ENDPOINTS.INTEGRATIONS}?${queryParams}`);
    }
    async getIntegration(integrationId) {
        return this.request(`${constants_1.API_ENDPOINTS.INTEGRATIONS}/${integrationId}`);
    }
    // Utility methods
    async healthCheck() {
        return this.request('/health');
    }
    async getApiVersion() {
        return this.request('/version');
    }
}
exports.OrganiselyClient = OrganiselyClient;
//# sourceMappingURL=client.js.map