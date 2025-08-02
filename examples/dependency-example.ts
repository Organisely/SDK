import { 
  IntegrationDependencyService, 
  OrganiselyClient,
  EVENT_TYPES,
  SCOPES 
} from '@organisely/sdk'

// Example: Complete workflow with integration dependencies
export async function demonstrateIntegrationDependencies() {
  console.log('🚀 Organisely Integration Dependency System Demo\n')

  // 1. Initialize the dependency service
  const dependencyService = new IntegrationDependencyService()
  
  // 2. Show available base integrations
  const baseIntegrations = dependencyService.getBaseIntegrations()
  console.log('📋 Available Base Integrations:')
  baseIntegrations.forEach(base => {
    console.log(`  ${base.icon} ${base.name}: ${base.description}`)
    console.log(`    Scopes: ${base.scopes.join(', ')}`)
    console.log(`    Events: ${base.event_triggers?.join(', ')}`)
    console.log('')
  })

  // 3. Create a Gmail integration that extends email
  const gmailIntegration = {
    id: 'gmail-integration',
    name: 'Gmail',
    description: 'Gmail with labels and filters',
    type: 'oauth2' as const,
    status: 'active' as const,
    scopes: [
      'https://www.googleapis.com/auth/gmail.labels',
      'https://www.googleapis.com/auth/gmail.drafts'
    ],
    event_triggers: [
      'gmail.label_changed',
      'gmail.draft_created'
    ],
    extends: ['email-base'],
    is_base_integration: false,
    category: 'email' as const,
    icon: '📨',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: 'user-123',
    is_public: true,
    version: '1.0.0'
  }

  // 4. Add the Gmail integration to the service
  dependencyService.addIntegration(gmailIntegration)
  console.log('✅ Added Gmail integration')

  // 5. Resolve all dependencies for Gmail
  const resolvedGmail = dependencyService.resolveIntegration('gmail-integration')
  console.log('\n🔍 Resolved Gmail Integration:')
  console.log(`  Name: ${resolvedGmail?.name}`)
  console.log(`  All Scopes: ${resolvedGmail?.all_scopes.join(', ')}`)
  console.log(`  All Events: ${resolvedGmail?.all_events.join(', ')}`)
  console.log(`  Dependencies: ${resolvedGmail?.dependencies.length}`)
  console.log(`  Is Standalone: ${resolvedGmail?.is_standalone}`)

  // 6. Validate the integration
  const validation = dependencyService.validateDependencies(gmailIntegration)
  console.log('\n✅ Validation Results:')
  console.log(`  Valid: ${validation.valid}`)
  if (validation.errors.length > 0) {
    console.log(`  Errors: ${validation.errors.join(', ')}`)
  }
  if (validation.warnings.length > 0) {
    console.log(`  Warnings: ${validation.warnings.join(', ')}`)
  }

  // 7. Check if user can install the integration
  const userScopes = [SCOPES.READ_EMAILS, SCOPES.WRITE_EMAILS]
  const canInstall = dependencyService.canInstall('gmail-integration', userScopes)
  console.log(`\n🔐 Can Install: ${canInstall}`)

  // 8. Show what extends the email base
  const emailExtensions = dependencyService.getExtensions('email-base')
  console.log('\n📧 Email Extensions:')
  emailExtensions.forEach(ext => {
    console.log(`  ${ext.icon} ${ext.name}: ${ext.description}`)
  })

  // 9. Create a custom integration using the service
  const customEmail = dependencyService.createExtension('email-base', {
    name: 'ProtonMail',
    description: 'Secure email with ProtonMail',
    scopes: ['protonmail.read', 'protonmail.write'],
    event_triggers: ['protonmail.received', 'protonmail.sent'],
    icon: '🔒',
    category: 'email'
  })

  console.log('\n🔧 Created Custom Integration:')
  console.log(`  Name: ${customEmail.name}`)
  console.log(`  Extends: ${customEmail.extends?.join(', ')}`)
  console.log(`  Scopes: ${customEmail.scopes.join(', ')}`)

  return {
    baseIntegrations,
    gmailIntegration,
    resolvedGmail,
    validation,
    canInstall,
    emailExtensions,
    customEmail
  }
}

// Example: Real-world usage with Organisely client
export async function realWorldExample() {
  console.log('\n🌍 Real-World Example: Installing Gmail Integration\n')

  const client = new OrganiselyClient({
    apiKey: 'your-api-key'
  })

  const dependencyService = new IntegrationDependencyService()

  // 1. User wants to install Gmail
  const gmailIntegration = {
    id: 'gmail-integration',
    name: 'Gmail',
    extends: ['email-base'],
    scopes: ['gmail.labels', 'gmail.drafts'],
    event_triggers: ['gmail.label_changed']
  }

  // 2. Check if user has required permissions
  const resolved = dependencyService.resolveIntegration('gmail-integration')
  if (!resolved) {
    console.log('❌ Integration not found')
    return
  }

  console.log(`📋 Required Scopes: ${resolved.all_scopes.join(', ')}`)
  console.log(`📋 Required Events: ${resolved.all_events.join(', ')}`)

  // 3. Create the integration in Organisely
  try {
    const result = await client.createIntegration({
      name: gmailIntegration.name,
      description: 'Gmail integration with labels and drafts',
      type: 'oauth2',
      scopes: resolved.all_scopes,
      event_triggers: resolved.all_events,
      extends: gmailIntegration.extends,
      category: 'email',
      icon: '📨'
    })

    if (result.success) {
      console.log('✅ Gmail integration created successfully!')
      console.log(`   ID: ${result.data?.id}`)
      console.log(`   All scopes: ${resolved.all_scopes.join(', ')}`)
    }
  } catch (error) {
    console.error('❌ Failed to create integration:', error)
  }
}

// Run the demo
if (require.main === module) {
  demonstrateIntegrationDependencies()
    .then(() => realWorldExample())
    .catch(console.error)
} 