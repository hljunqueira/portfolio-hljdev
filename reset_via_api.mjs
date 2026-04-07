import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://supabase.hljdev.com.br';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3NzU1Mjg0OTksImV4cCI6MjA5MDg4ODQ5OX0.LlUMNCOdakOAhEpt48_mI1eBavxSaEIlDWEjiLqfT0c';

const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const USER_ID = 'c4b4a110-e7f0-43b9-a9a7-96a3fc422ab8';
const NEW_PASSWORD = '183834@Hlj';
const USER_EMAIL = 'henriquelinharesjunqueira@gmail.com';

async function resetPassword() {
  console.log('Updating password via GoTrue Admin API...');

  // Update password using admin API - GoTrue will hash it correctly
  const { data, error } = await adminClient.auth.admin.updateUserById(USER_ID, {
    password: NEW_PASSWORD,
    email_confirm: true,
  });

  if (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }

  console.log('Password updated successfully!');
  console.log('User:', data.user.email, '| Confirmed:', data.user.email_confirmed_at);

  // Test the login directly
  console.log('\nTesting login...');
  const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzc1NTI4NDk5LCJleHAiOjIwOTA4ODg0OTl9.3fu-B2l3sM9EvkOcNXLSb4UAWvQIbAFyec7gnQ1Ax5c';
  const testClient = createClient(supabaseUrl, anonKey);
  const { data: loginData, error: loginError } = await testClient.auth.signInWithPassword({
    email: USER_EMAIL,
    password: NEW_PASSWORD,
  });

  if (loginError) {
    console.error('Login test FAILED:', loginError.message);
  } else {
    console.log('LOGIN SUCCESS! Token:', loginData.session?.access_token?.substring(0, 30) + '...');
  }
}

resetPassword();
