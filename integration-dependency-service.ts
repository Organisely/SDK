import { 
  OrganiselyIntegration, 
  IntegrationDependency, 
  ResolvedIntegration,
  CreateIntegrationRequest 
} from './types'
import { SCOPES, EVENT_TYPES } from './constants'

export class IntegrationDependencyService {
  private integrations: Map<string, OrganiselyIntegration> = new Map()

  constructor() {
    this.initializeBaseIntegrations()
  }

  // Initialize base integrations
  private initializeBaseIntegrations() {
    const baseIntegrations: OrganiselyIntegration[] = [
      {
        id: 'email-base',
        name: 'Email',
        description: 'Base email integration providing core email functionality',
        type: 'oauth2',
        status: 'active',
        scopes: [SCOPES.READ_EMAILS, SCOPES.WRITE_EMAILS],
        event_triggers: [EVENT_TYPES.EMAIL_RECEIVED, EVENT_TYPES.EMAIL_SENT],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: 'system',
        is_public: true,
        version: '1.0.0',
        is_base_integration: true,
        category: 'email',
        icon: '📧',
        documentation_url: 'https://organisely.com/docs/integrations/email'
      },
      {
        id: 'calendar-base',
        name: 'Calendar',
        description: 'Base calendar integration providing core calendar functionality',
        type: 'oauth2',
        status: 'active',
        scopes: [SCOPES.READ_CALENDAR, SCOPES.WRITE_CALENDAR],
        event_triggers: [
          EVENT_TYPES.CALENDAR_EVENT_CREATED,
          EVENT_TYPES.CALENDAR_EVENT_UPDATED,
          EVENT_TYPES.CALENDAR_EVENT_DELETED
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: 'system',
        is_public: true,
        version: '1.0.0',
        is_base_integration: true,
        category: 'calendar',
        icon: '📅',
        documentation_url: 'https://organisely.com/docs/integrations/calendar'
      },
      {
        id: 'habits-base',
        name: 'Habits',
        description: 'Base habits integration providing core habit tracking functionality',
        type: 'oauth2',
        status: 'active',
        scopes: [SCOPES.READ_HABITS, SCOPES.WRITE_HABITS],
        event_triggers: [
          EVENT_TYPES.HABIT_CREATED,
          EVENT_TYPES.HABIT_COMPLETED,
          EVENT_TYPES.HABIT_STREAK_MILESTONE
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: 'system',
        is_public: true,
        version: '1.0.0',
        is_base_integration: true,
        category: 'productivity',
        icon: '🎯',
        documentation_url: 'https://organisely.com/docs/integrations/habits'
      }
    ]

    baseIntegrations.forEach(integration => {
      this.integrations.set(integration.id, integration)
    })
  }

  // Add an integration to the service
  addIntegration(integration: OrganiselyIntegration): void {
    this.integrations.set(integration.id, integration)
  }

  // Get an integration by ID
  getIntegration(id: string): OrganiselyIntegration | undefined {
    return this.integrations.get(id)
  }

  // Resolve all dependencies for an integration
  resolveIntegration(integrationId: string): ResolvedIntegration | null {
    const integration = this.integrations.get(integrationId)
    if (!integration) return null

    const dependencies: IntegrationDependency[] = []
    const baseIntegrations: OrganiselyIntegration[] = []
    const allScopes = new Set(integration.scopes)
    const allEvents = new Set(integration.event_triggers || [])

    // Resolve base integrations
    if (integration.extends && integration.extends.length > 0) {
      for (const baseId of integration.extends) {
        const baseIntegration = this.integrations.get(baseId)
        if (baseIntegration) {
          baseIntegrations.push(baseIntegration)
          
          // Add base integration scopes and events
          baseIntegration.scopes.forEach(scope => allScopes.add(scope))
          if (baseIntegration.event_triggers) {
            baseIntegration.event_triggers.forEach(event => allEvents.add(event))
          }

          // Create dependency info
          dependencies.push({
            base_integration_id: baseIntegration.id,
            base_integration_name: baseIntegration.name,
            required_scopes: baseIntegration.scopes,
            required_events: baseIntegration.event_triggers || [],
            optional_scopes: [],
            optional_events: []
          })
        }
      }
    }

    return {
      id: integration.id,
      name: integration.name,
      type: integration.type,
      all_scopes: Array.from(allScopes),
      all_events: Array.from(allEvents),
      dependencies,
      base_integrations: baseIntegrations,
      is_standalone: baseIntegrations.length === 0
    }
  }

  // Check if an integration can be installed (all dependencies satisfied)
  canInstall(integrationId: string, userScopes: string[]): boolean {
    const resolved = this.resolveIntegration(integrationId)
    if (!resolved) return false

    // Check if user has all required scopes
    const hasAllScopes = resolved.all_scopes.every(scope => 
      userScopes.includes(scope)
    )

    return hasAllScopes
  }

  // Get all base integrations
  getBaseIntegrations(): OrganiselyIntegration[] {
    return Array.from(this.integrations.values())
      .filter(integration => integration.is_base_integration)
  }

  // Get integrations that extend a specific base integration
  getExtensions(baseIntegrationId: string): OrganiselyIntegration[] {
    return Array.from(this.integrations.values())
      .filter(integration => 
        integration.extends && 
        integration.extends.includes(baseIntegrationId)
      )
  }

  // Create a new integration that extends a base integration
  createExtension(
    baseIntegrationId: string,
    extensionConfig: Partial<CreateIntegrationRequest>
  ): CreateIntegrationRequest {
    const baseIntegration = this.integrations.get(baseIntegrationId)
    if (!baseIntegration) {
      throw new Error(`Base integration ${baseIntegrationId} not found`)
    }

    return {
      name: extensionConfig.name || `Extended ${baseIntegration.name}`,
      description: extensionConfig.description || `Extension of ${baseIntegration.name}`,
      type: extensionConfig.type || 'oauth2',
      scopes: extensionConfig.scopes || [],
      event_triggers: extensionConfig.event_triggers || [],
      webhook_url: extensionConfig.webhook_url,
      config_schema: extensionConfig.config_schema,
      is_public: extensionConfig.is_public || false,
      extends: [baseIntegrationId],
      is_base_integration: false,
      category: extensionConfig.category || baseIntegration.category,
      icon: extensionConfig.icon,
      documentation_url: extensionConfig.documentation_url
    }
  }

  // Validate integration dependencies
  validateDependencies(integration: CreateIntegrationRequest): {
    valid: boolean
    errors: string[]
    warnings: string[]
  } {
    const errors: string[] = []
    const warnings: string[] = []

    if (integration.extends && integration.extends.length > 0) {
      for (const baseId of integration.extends) {
        const baseIntegration = this.integrations.get(baseId)
        if (!baseIntegration) {
          errors.push(`Base integration ${baseId} not found`)
        } else if (!baseIntegration.is_base_integration) {
          errors.push(`${baseId} is not a base integration`)
        } else {
          // Check for scope conflicts
          const conflictingScopes = integration.scopes.filter(scope => 
            baseIntegration.scopes.includes(scope)
          )
          if (conflictingScopes.length > 0) {
            warnings.push(`Scopes ${conflictingScopes.join(', ')} are already provided by base integration ${baseId}`)
          }

          // Check for event conflicts
          const conflictingEvents = integration.event_triggers?.filter(event => 
            baseIntegration.event_triggers?.includes(event)
          ) || []
          if (conflictingEvents.length > 0) {
            warnings.push(`Events ${conflictingEvents.join(', ')} are already provided by base integration ${baseId}`)
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }
} 