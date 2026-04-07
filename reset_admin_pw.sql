UPDATE auth.users 
SET 
  encrypted_password = crypt('183834@Hlj', gen_salt('bf')),
  email_confirmed_at = NOW(),
  updated_at = NOW()
WHERE email = 'henriquelinharesjunqueira@gmail.com';

SELECT id, email, email_confirmed_at, encrypted_password IS NOT NULL AS has_password FROM auth.users;
