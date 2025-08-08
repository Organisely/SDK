import { BotWebhookPayload, OrganiselyEvent, ApiResponse } from './types';
export interface BotConfig {
    webhookSecret?: string;
    onEvent?: (event: OrganiselyEvent) => void | Promise<void>;
}
export declare class OrganiselyBot {
    private webhookSecret?;
    private onEvent?;
    private mcpTools;
    constructor(config?: BotConfig);
    /**
     * Register an MCP tool for this bot
     * @param name string - Tool name
     * @param definition object - Tool definition (schema, description, etc)
     * @param handler function - Tool handler function
     */
    registerMcpTool(name: string, definition: any, handler?: Function): void;
    /**
     * Get all registered MCP tools
     */
    getRegisteredMcpTools(): Record<string, {
        definition: any;
        handler: Function;
    }>;
    handleWebhook(payload: BotWebhookPayload): Promise<ApiResponse<void>>;
    handleHabitCompleted(userId: string, habitData: any): Promise<ApiResponse<void>>;
    handleEmailReceived(userId: string, emailData: any): Promise<ApiResponse<void>>;
    handleCalendarEventUpcoming(userId: string, eventData: any): Promise<ApiResponse<void>>;
    middleware(): (req: any, res: any) => Promise<void>;
    apiHandler(req: any, res: any): Promise<any>;
}
//# sourceMappingURL=bot.d.ts.map