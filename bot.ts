import { BotWebhookPayload, OrganiselyEvent, ApiResponse } from './types'
import { EVENT_TYPES } from './constants'
import { randomUUID } from 'crypto'

export interface BotConfig {
  webhookSecret?: string
  onEvent?: (event: OrganiselyEvent) => void | Promise<void>
}

export class OrganiselyBot {
  private webhookSecret?: string
  private onEvent?: (event: OrganiselyEvent) => void | Promise<void>

  constructor(config: BotConfig = {}) {
    this.webhookSecret = config.webhookSecret
    this.onEvent = config.onEvent
  }

  async handleWebhook(payload: BotWebhookPayload): Promise<ApiResponse<void>> {
    try {
      // Validate webhook secret if provided
      if (this.webhookSecret && payload.secret !== this.webhookSecret) {
        return {
          success: false,
          error: 'Invalid webhook secret'
        }
      }

      // Create Organisely event from webhook payload
      const event: OrganiselyEvent = {
        id: randomUUID(),
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
      }

      // Call custom event handler if provided
      if (this.onEvent) {
        await this.onEvent(event)
      }

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async handleHabitCompleted(userId: string, habitData: any): Promise<ApiResponse<void>> {
    return this.handleWebhook({
      event: EVENT_TYPES.HABIT_COMPLETED,
      data: habitData,
      userId,
      timestamp: new Date().toISOString(),
      eventId: randomUUID()
    })
  }

  async handleEmailReceived(userId: string, emailData: any): Promise<ApiResponse<void>> {
    return this.handleWebhook({
      event: EVENT_TYPES.EMAIL_RECEIVED,
      data: emailData,
      userId,
      timestamp: new Date().toISOString(),
      eventId: randomUUID()
    })
  }

  async handleCalendarEventUpcoming(userId: string, eventData: any): Promise<ApiResponse<void>> {
    return this.handleWebhook({
      event: EVENT_TYPES.CALENDAR_EVENT_UPCOMING,
      data: eventData,
      userId,
      timestamp: new Date().toISOString(),
      eventId: randomUUID()
    })
  }

  // Express.js middleware
  middleware() {
    return async (req: any, res: any) => {
      try {
        const result = await this.handleWebhook(req.body)
        res.status(result.success ? 200 : 400).json(result)
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'Internal server error'
        })
      }
    }
  }

  // Next.js API handler
  async apiHandler(req: any, res: any) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
      const result = await this.handleWebhook(req.body)
      res.status(result.success ? 200 : 400).json(result)
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }
} 