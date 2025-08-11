import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Import TypeScript function
import { testBossHunterAuth } from '../../../src/lib/twitter.js';

async function main() {
  console.log('🔍 Testing Boss Hunter Twitter Authentication...\n');
  
  const result = await testBossHunterAuth();
  
  if (result.success) {
    console.log('✅ Authentication successful!');
    console.log(`📊 Retrieved user data for @${result.user?.username}`);
    console.log(`🆔 User ID: ${result.user?.id}`);
    console.log(`📝 Name: ${result.user?.name}`);
  } else {
    console.log('❌ Authentication failed:');
    console.log(result.error);
  }
}

main().catch(console.error);
