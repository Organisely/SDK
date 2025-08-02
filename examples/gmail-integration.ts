import { IntegrationDependencyService } from '../integration-dependency-service'
import { CreateIntegrationRequest } from '../types'
import { SCOPES, EVENT_TYPES } from '../constants'

// Example: Creating a Gmail integration that extends the email base
export function createGmailIntegration(): CreateIntegrationRequest {
  const dependencyService = new IntegrationDependencyService()
  
  return dependencyService.createExtension('email-base', {
    name: 'Gmail',
    description: 'Gmail integration with advanced features like labels, filters, and drafts',
    type: 'oauth2',
    scopes: [
      // Gmail-specific scopes
      'https://www.googleapis.com/auth/gmail.labels',
      'https://www.googleapis.com/auth/gmail.drafts',
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/gmail.settings.basic'
    ],
    event_triggers: [
      // Gmail-specific events
      'gmail.label_changed',
      'gmail.draft_created',
      'gmail.filter_applied',
      'gmail.thread_archived'
    ],
    category: 'email',
    icon: '📨',
    documentation_url: 'https://organisely.com/docs/integrations/gmail',
    config_schema: {
      type: 'object',
      properties: {
        client_id: {
          type: 'string',
          description: 'Google OAuth2 Client ID'
        },
        client_secret: {
          type: 'string',
          description: 'Google OAuth2 Client Secret'
        },
        labels_to_sync: {
          type: 'array',
          items: { type: 'string' },
          description: 'Gmail labels to sync with Organisely'
        },
        auto_archive: {
          type: 'boolean',
          description: 'Automatically archive processed emails'
        }
      },
      required: ['client_id', 'client_secret']
    }
  })
}

// Example: Creating an Outlook integration that extends the email base
export function createOutlookIntegration(): CreateIntegrationRequest {
  const dependencyService = new IntegrationDependencyService()
  
  return dependencyService.createExtension('email-base', {
    name: 'Outlook',
    description: 'Microsoft Outlook integration with calendar and contacts',
    type: 'oauth2',
    scopes: [
      // Outlook-specific scopes
      'https://graph.microsoft.com/User.Read',
      'https://graph.microsoft.com/Mail.ReadWrite',
      'https://graph.microsoft.com/Calendars.ReadWrite',
      'https://graph.microsoft.com/Contacts.ReadWrite'
    ],
    event_triggers: [
      // Outlook-specific events
      'outlook.meeting_created',
      'outlook.contact_updated',
      'outlook.folder_changed',
      'outlook.rules_applied'
    ],
    category: 'email',
    icon: '📧',
    documentation_url: 'https://organisely.com/docs/integrations/outlook',
    config_schema: {
      type: 'object',
      properties: {
        client_id: {
          type: 'string',
          description: 'Microsoft OAuth2 Client ID'
        },
        client_secret: {
          type: 'string',
          description: 'Microsoft OAuth2 Client Secret'
        },
        tenant_id: {
          type: 'string',
          description: 'Azure AD Tenant ID'
        },
        sync_calendar: {
          type: 'boolean',
          description: 'Sync Outlook calendar events'
        },
        sync_contacts: {
          type: 'boolean',
          description: 'Sync Outlook contacts'
        }
      },
      required: ['client_id', 'client_secret', 'tenant_id']
    }
  })
}

// Example usage
export function demonstrateDependencies() {
  const dependencyService = new IntegrationDependencyService()
  
  // Create Gmail integration
  const gmailIntegration = createGmailIntegration()
  console.log('Gmail Integration:', gmailIntegration)
  
  // Validate dependencies
  const validation = dependencyService.validateDependencies(gmailIntegration)
  console.log('Validation:', validation)
  
  // Resolve dependencies
  const resolved = dependencyService.resolveIntegration('gmail-integration-id')
  console.log('Resolved Integration:', resolved)
  
  // Check what base integrations are available
  const baseIntegrations = dependencyService.getBaseIntegrations()
  console.log('Available Base Integrations:', baseIntegrations.map(bi => bi.name))
}

// Example: Creating a custom email integration
export function createCustomEmailIntegration(
  name: string,
  provider: 'custom' | 'protonmail' | 'tutanota',
  config: any
): CreateIntegrationRequest {
  const dependencyService = new IntegrationDependencyService()
  
  return dependencyService.createExtension('email-base', {
    name,
    description: `Custom ${provider} email integration`,
    type: 'oauth2',
    scopes: config.scopes || [],
    event_triggers: config.events || [],
    category: 'email',
    icon: config.icon || '📧',
    config_schema: config.schema || {}
  })
} 