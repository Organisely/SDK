"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganiselyBot = void 0;
const constants_1 = require("./constants");
const crypto_1 = require("crypto");
class OrganiselyBot {
    webhookSecret;
    onEvent;
    mcpTools = {};
    constructor(config = {}) {
        this.webhookSecret = config.webhookSecret;
        this.onEvent = config.onEvent;
    }
    /**
     * Register an MCP tool for this bot
     * @param name string - Tool name
     * @param definition object - Tool definition (schema, description, etc)
     * @param handler function - Tool handler function
     */
    registerMcpTool(name, definition, handler) {
        this.mcpTools[name] = { definition, handler: handler || (() => { }) };
    }
    /**
     * Get all registered MCP tools
     */
    getRegisteredMcpTools() {
        return this.mcpTools;
    }
    async handleWebhook(payload) {
        try {
            // Validate webhook secret if provided
            if (this.webhookSecret && payload.secret !== this.webhookSecret) {
                return {
                    success: false,
                    error: 'Invalid webhook secret'
                };
            }
            // Create Organisely event from webhook payload
            const event = {
                id: (0, crypto_1.randomUUID)(),
                event_type: payload.event,
                event_data: payload.data,
                user_id: payload.userId,
                metadata: {
                    source: 'webhook',
                    correlation_id: payload.correlationId
                },
                timestamp: payload.timestamp,
                created_at: new Date().toISOString(),
                source: 'bot',
                correlation_id: payload.correlationId
            };
            // Call custom event handler if provided
            if (this.onEvent) {
                await this.onEvent(event);
            }
            return { success: true };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    async handleHabitCompleted(userId, habitData) {
        return this.handleWebhook({
            event: constants_1.EVENT_TYPES.HABIT_COMPLETED,
            data: habitData,
            userId,
            timestamp: new Date().toISOString(),
            eventId: (0, crypto_1.randomUUID)()
        });
    }
    async handleEmailReceived(userId, emailData) {
        return this.handleWebhook({
            event: constants_1.EVENT_TYPES.EMAIL_RECEIVED,
            data: emailData,
            userId,
            timestamp: new Date().toISOString(),
            eventId: (0, crypto_1.randomUUID)()
        });
    }
    async handleCalendarEventUpcoming(userId, eventData) {
        return this.handleWebhook({
            event: constants_1.EVENT_TYPES.CALENDAR_EVENT_UPCOMING,
            data: eventData,
            userId,
            timestamp: new Date().toISOString(),
            eventId: (0, crypto_1.randomUUID)()
        });
    }
    // Express.js middleware
    middleware() {
        return async (req, res) => {
            try {
                const result = await this.handleWebhook(req.body);
                res.status(result.success ? 200 : 400).json(result);
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    error: 'Internal server error'
                });
            }
        };
    }
    // Next.js API handler
    async apiHandler(req, res) {
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }
        try {
            const result = await this.handleWebhook(req.body);
            res.status(result.success ? 200 : 400).json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
}
exports.OrganiselyBot = OrganiselyBot;
//# sourceMappingURL=bot.js.map