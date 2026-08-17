import { Telemetry, validatePostHogConfig, getTelemetryHealth } from '../server/services/telemetry.js';

async function runHealthcheck() {
  console.log('==================================================');
  console.log('POSTHOG INGESTION HEALTHCHECK');
  console.log('==================================================\n');

  console.log('1. Validating Configuration...');
  validatePostHogConfig();
  
  const health = getTelemetryHealth();
  console.log('Current Health Status:', JSON.stringify(health, null, 2));

  if (!health.enabled) {
    console.error('\n🔴 POSTHOG INGESTION BLOCKED');
    console.error('Reason: Telemetry is disabled or unconfigured.');
    console.log('\nPlease set the following in Settings -> Environment Variables:');
    console.log('- POSTHOG_API_KEY: Your project API key');
    console.log('- POSTHOG_HOST: e.g., https://us.i.posthog.com');
    process.exit(1);
  }

  console.log('\n2. Sending Healthcheck Event...');
  try {
    Telemetry.track('system-healthcheck-initiator', 'posthog_ingestion_healthcheck', {
      timestamp: new Date().toISOString(),
      source: 'manual_healthcheck_script',
      environment: process.env.NODE_ENV || 'development'
    }, true);
    
    console.log('\n3. Verification');
    console.log('Waiting for SDK buffer (3 seconds)...');
    await new Promise(r => setTimeout(r, 3000));
    
    console.log('\n🟢 POSTHOG INGESTION VERIFIED (SENT)');
    console.log('Please check your PostHog Dashboard (Default project / Events).');
    console.log('Event: posthog_ingestion_healthcheck');
  } catch (err: any) {
    console.error('\n🔴 POSTHOG INGESTION FAILED');
    console.error('Error:', err.message);
    process.exit(1);
  }
}

runHealthcheck().catch(console.error);
