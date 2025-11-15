// Supabase 연결 테스트 스크립트
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://yvbihchwylsytvtjhvfj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2YmloY2h3eWxzeXR2dGpodmZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwNTU1NDksImV4cCI6MjA3ODYzMTU0OX0.Ww0HrFeNHQ6fHpMntEeXBT1oMKnugHld7bPKSHir1AA';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkTables() {
  console.log('🔍 Checking Supabase connection...\n');

  // Test 1: Check team_members table
  console.log('1. Checking team_members table...');
  const { data: members, error: membersError } = await supabase
    .from('team_members')
    .select('count')
    .limit(1);

  if (membersError) {
    console.log('❌ team_members table NOT FOUND');
    console.log('   Error:', membersError.message);
  } else {
    console.log('✅ team_members table exists');
  }

  // Test 2: Check projects table
  console.log('\n2. Checking projects table...');
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('count')
    .limit(1);

  if (projectsError) {
    console.log('❌ projects table NOT FOUND');
    console.log('   Error:', projectsError.message);
  } else {
    console.log('✅ projects table exists');
  }

  // Test 3: Check phases table
  console.log('\n3. Checking phases table...');
  const { data: phases, error: phasesError } = await supabase
    .from('phases')
    .select('count')
    .limit(1);

  if (phasesError) {
    console.log('❌ phases table NOT FOUND');
    console.log('   Error:', phasesError.message);
  } else {
    console.log('✅ phases table exists');
  }

  console.log('\n' + '='.repeat(50));
  
  if (membersError || projectsError || phasesError) {
    console.log('\n⚠️  TABLES NOT FOUND!');
    console.log('\n📋 Please run this SQL in Supabase SQL Editor:');
    console.log('   File: SIMPLE_SETUP.sql');
    console.log('   URL: https://supabase.com/dashboard/project/yvbihchwylsytvtjhvfj/sql');
  } else {
    console.log('\n✅ All tables exist! Database is ready.');
  }
}

checkTables().catch(console.error);
