import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://supabase.hljdev.com.br';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3NzU1Mjg0OTksImV4cCI6MjA5MDg4ODQ5OX0.LlUMNCOdakOAhEpt48_mI1eBavxSaEIlDWEjiLqfT0c';

const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const USER_EMAIL = 'henriquelinharesjunqueira@gmail.com';
const USER_PASSWORD = '183834@Hlj';

async function createAdminUser() {
  console.log('Creating admin user via GoTrue Admin API...');

  const { data, error } = await adminClient.auth.admin.createUser({
    email: USER_EMAIL,
    password: USER_PASSWORD,
    email_confirm: true,
  });

  if (error) {
    console.error('Create error:', error.message);
    process.exit(1);
  }

  console.log('User created! ID:', data.user.id);
  console.log('Confirmed:', data.user.email_confirmed_at);

  // Test login immediately
  console.log('\nTesting login...');
  const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzc1NTI4NDk5LCJleHAiOjIwOTA4ODg0OTl9.3fu-B2l3sM9EvkOcNXLSb4UAWvQIbAFyec7gnQ1Ax5c';
  const testClient = createClient(supabaseUrl, anonKey);
  
  const { data: loginData, error: loginError } = await testClient.auth.signInWithPassword({
    email: USER_EMAIL,
    password: USER_PASSWORD,
  });

  if (loginError) {
    console.error('Login test FAILED:', loginError.message);
  } else {
    console.log('LOGIN SUCCESS! User ID:', loginData.user?.id);
  }
}

createAdminUser();
