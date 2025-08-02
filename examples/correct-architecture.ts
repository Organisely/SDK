import { IntegrationDependencyService } from '../integration-dependency-service'
import { CreateIntegrationRequest } from '../types'

// CORRECT ARCHITECTURE EXAMPLE
export function demonstrateCorrectArchitecture() {
  console.log('🏗️ Correct Organisely Integration Architecture\n')

  const dependencyService = new IntegrationDependencyService()

  // 1. BASE INTEGRATIONS (Define data structures and events)
  console.log('📋 Base Integrations (Define data structures):')
  const baseIntegrations = dependencyService.getBaseIntegrations()
  baseIntegrations.forEach(base => {
    console.log(`  ${base.icon} ${base.name}: ${base.description}`)
    console.log(`    Scopes: ${base.scopes.join(', ')}`)
    console.log(`    Events: ${base.event_triggers?.join(', ')}`)
  })

  // 2. OAUTH2 INTEGRATIONS (Output data to Organisely)
  console.log('\n🔌 OAuth2 Integrations (Output data to Organisely):')
  
  // Gmail OAuth2 - outputs email data
  const gmailOAuth2 = {
    name: 'Gmail',
    description: 'Gmail OAuth2 integration that outputs email data',
    type: 'oauth2' as const,
    scopes: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.modify'
    ],
    event_triggers: [], // OAuth2 integrations don't trigger events
    extends: ['email-base'], // Depends on email base for data structure
    category: 'email' as const,
    icon: '📨'
  }

  // Outlook OAuth2 - outputs email data
  const outlookOAuth2 = {
    name: 'Outlook',
    description: 'Outlook OAuth2 integration that outputs email data',
    type: 'oauth2' as const,
    scopes: [
      'https://graph.microsoft.com/Mail.ReadWrite',
      'https://graph.microsoft.com/User.Read'
    ],
    event_triggers: [], // OAuth2 integrations don't trigger events
    extends: ['email-base'], // Depends on email base for data structure
    category: 'email' as const,
    icon: '📧'
  }

  console.log(`  ${gmailOAuth2.icon} ${gmailOAuth2.name}: ${gmailOAuth2.description}`)
  console.log(`  ${outlookOAuth2.icon} ${outlookOAuth2.name}: ${outlookOAuth2.description}`)

  // 3. BOT INTEGRATIONS (Listen to events, depend on base integrations)
  console.log('\n🤖 Bot Integrations (Listen to events, depend on base integrations):')
  
  // Email Notifier Bot - depends on email base, listens to email events
  const emailNotifierBot = {
    name: 'Email Notifier Bot',
    description: 'Bot that logs when emails are received',
    type: 'bot' as const,
    scopes: [], // Bots don't need scopes, they listen to events
    event_triggers: ['email.received'], // Listens to email events
    extends: ['email-base'], // Depends on email base for event structure
    category: 'communication' as const,
    icon: '🔔'
  }

  // Habit Streak Bot - depends on habits base, listens to habit events
  const habitStreakBot = {
    name: 'Habit Streak Bot',
    description: 'Bot that celebrates habit streaks',
    type: 'bot' as const,
    scopes: [], // Bots don't need scopes, they listen to events
    event_triggers: ['habit.completed', 'habit.streak_milestone'], // Listens to habit events
    extends: ['habits-base'], // Depends on habits base for event structure
    category: 'productivity' as const,
    icon: '🎯'
  }

  console.log(`  ${emailNotifierBot.icon} ${emailNotifierBot.name}: ${emailNotifierBot.description}`)
  console.log(`  ${habitStreakBot.icon} ${habitStreakBot.name}: ${habitStreakBot.description}`)

  // 4. DATA FLOW EXAMPLE
  console.log('\n🔄 Data Flow Example:')
  console.log('1. User connects Gmail OAuth2 integration')
  console.log('2. Gmail outputs email data to Organisely (using email-base structure)')
  console.log('3. Organisely triggers email.received event')
  console.log('4. Email Notifier Bot (depends on email-base) receives the event')
  console.log('5. Bot logs "yes" to console')

  // 5. DEPENDENCY RESOLUTION
  console.log('\n🔍 Dependency Resolution:')
  
  // Resolve Gmail OAuth2 dependencies
  const resolvedGmail = dependencyService.resolveIntegration('gmail-integration')
  console.log(`Gmail OAuth2 extends email-base:`)
  console.log(`  Inherits scopes: ${resolvedGmail?.all_scopes.join(', ')}`)
  console.log(`  Inherits events: ${resolvedGmail?.all_events.join(', ')}`)

  // Resolve Email Notifier Bot dependencies
  const resolvedEmailBot = dependencyService.resolveIntegration('email-notifier-bot')
  console.log(`Email Notifier Bot extends email-base:`)
  console.log(`  Inherits scopes: ${resolvedEmailBot?.all_scopes.join(', ')}`)
  console.log(`  Inherits events: ${resolvedEmailBot?.all_events.join(', ')}`)

  return {
    baseIntegrations,
    gmailOAuth2,
    outlookOAuth2,
    emailNotifierBot,
    habitStreakBot
  }
}

// Example: Creating a new OAuth2 integration
export function createNewOAuth2Integration(provider: string) {
  const dependencyService = new IntegrationDependencyService()
  
  return dependencyService.createExtension('email-base', {
    name: `${provider} Email`,
    description: `${provider} OAuth2 integration that outputs email data`,
    type: 'oauth2',
    scopes: [
      `${provider.toLowerCase()}.read`,
      `${provider.toLowerCase()}.write`
    ],
    event_triggers: [], // OAuth2 integrations don't trigger events
    category: 'email',
    icon: '📧'
  })
}

// Example: Creating a new Bot integration
export function createNewBotIntegration(baseIntegration: string, botName: string) {
  const dependencyService = new IntegrationDependencyService()
  
  return dependencyService.createExtension(baseIntegration, {
    name: botName,
    description: `Bot that listens to ${baseIntegration} events`,
    type: 'bot',
    scopes: [], // Bots don't need scopes
    event_triggers: [`${baseIntegration}.received`], // Listen to events
    category: 'custom',
    icon: '🤖'
  })
}

// Run the demo
if (require.main === module) {
  demonstrateCorrectArchitecture()
} 