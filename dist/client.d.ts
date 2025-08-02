import { OrganiselyConfig, ApiResponse, OrganiselyUser, OrganiselyHabit, OrganiselyEmail, OrganiselyCalendarEvent, OrganiselyIntegration, CreateHabitRequest, UpdateHabitRequest, SendEmailRequest, CreateEventRequest, TrackEventRequest, BroadcastEventRequest, PaginationParams, PaginatedResponse, Logger, RateLimitInfo } from './types';
export declare class OrganiselyClient {
    private config;
    private logger;
    private retryConfig;
    private rateLimitInfo?;
    constructor(config?: OrganiselyConfig);
    setLogger(logger: Logger): void;
    setApiKey(apiKey: string): void;
    setUserId(userId: string): void;
    getRateLimitInfo(): RateLimitInfo | undefined;
    private request;
    private parseResponse;
    private createError;
    private getErrorCode;
    private shouldNotRetry;
    private calculateRetryDelay;
    private sleep;
    private generateRequestId;
    private updateRateLimitInfo;
    private extractHeaders;
    getCurrentUser(): Promise<ApiResponse<OrganiselyUser>>;
    getUser(userId: string): Promise<ApiResponse<OrganiselyUser>>;
    updateUser(userId: string, updates: Partial<OrganiselyUser>): Promise<ApiResponse<OrganiselyUser>>;
    getHabits(userId?: string, params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<OrganiselyHabit>>>;
    getHabit(habitId: string): Promise<ApiResponse<OrganiselyHabit>>;
    createHabit(habit: CreateHabitRequest, userId?: string): Promise<ApiResponse<OrganiselyHabit>>;
    updateHabit(habitId: string, updates: UpdateHabitRequest): Promise<ApiResponse<OrganiselyHabit>>;
    deleteHabit(habitId: string): Promise<ApiResponse<void>>;
    completeHabit(habitId: string, notes?: string): Promise<ApiResponse<void>>;
    getEmails(userId?: string, params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<OrganiselyEmail>>>;
    getEmail(emailId: string): Promise<ApiResponse<OrganiselyEmail>>;
    sendEmail(email: SendEmailRequest, userId?: string): Promise<ApiResponse<OrganiselyEmail>>;
    getCalendarEvents(userId?: string, params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<OrganiselyCalendarEvent>>>;
    getCalendarEvent(eventId: string): Promise<ApiResponse<OrganiselyCalendarEvent>>;
    createCalendarEvent(event: CreateEventRequest, userId?: string): Promise<ApiResponse<OrganiselyCalendarEvent>>;
    updateCalendarEvent(eventId: string, updates: Partial<CreateEventRequest>): Promise<ApiResponse<OrganiselyCalendarEvent>>;
    deleteCalendarEvent(eventId: string): Promise<ApiResponse<void>>;
    trackEvent(event: TrackEventRequest, userId?: string): Promise<ApiResponse<void>>;
    broadcastEvent(event: BroadcastEventRequest): Promise<ApiResponse<void>>;
    getIntegrations(userId?: string): Promise<ApiResponse<OrganiselyIntegration[]>>;
    getIntegration(integrationId: string): Promise<ApiResponse<OrganiselyIntegration>>;
    healthCheck(): Promise<ApiResponse<{
        status: string;
        timestamp: string;
    }>>;
    getApiVersion(): Promise<ApiResponse<{
        version: string;
        features: string[];
    }>>;
}
//# sourceMappingURL=client.d.ts.map