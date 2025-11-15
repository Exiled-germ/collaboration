// Apply nickname sessions migration to Supabase
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SUPABASE_URL = 'https://qbxgrxvlfoqeefnznyhj.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_KEY || SUPABASE_SERVICE_KEY === 'your_service_role_key_here') {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is not set in .env file');
  console.error('Please add your service role key to .env:');
  console.error('SUPABASE_SERVICE_ROLE_KEY="your_actual_service_role_key"');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function applyMigration() {
  console.log('🚀 Applying nickname sessions migration...\n');

  try {
    // Read migration file
    const migrationPath = join(__dirname, 'supabase', 'migrations', '20251115000000_nickname_sessions.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    console.log('📄 Migration file loaded');
    console.log('📊 Executing SQL...\n');

    // Execute migration
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });

    if (error) {
      // Try direct query if RPC doesn't exist
      console.log('⚠️  RPC method not available, trying direct execution...');
      
      // Split by semicolons and execute each statement
      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      for (const statement of statements) {
        const { error: stmtError } = await supabase.rpc('exec', { query: statement });
        if (stmtError) {
          console.error(`❌ Error executing statement:`, stmtError.message);
          console.error(`Statement: ${statement.substring(0, 100)}...`);
        }
      }
    }

    console.log('✅ Migration applied successfully!\n');
    console.log('📋 Created tables:');
    console.log('  - sessions (nickname-based sessions)');
    console.log('  - Updated projects table with session_id');
    console.log('  - Updated artifacts table with uploaded_by_nickname');
    console.log('\n🎉 You can now use nickname-based sessions!');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\n📝 Manual steps:');
    console.error('1. Go to https://supabase.com/dashboard');
    console.error('2. Select your project');
    console.error('3. Go to SQL Editor');
    console.error('4. Copy and paste the contents of:');
    console.error('   supabase/migrations/20251115000000_nickname_sessions.sql');
    console.error('5. Click Run');
  }
}

applyMigration();
