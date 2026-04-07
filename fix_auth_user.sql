-- Fix created_at being NULL (GoTrue rejects auth without it)
UPDATE auth.users 
SET 
  created_at = NOW(),
  updated_at = NOW(),
  email_confirmed_at = NOW(),
  encrypted_password = crypt('183834@Hlj', gen_salt('bf'))
WHERE email = 'henriquelinharesjunqueira@gmail.com';

-- Fix/recreate the identity record with correct identity_data including email
DELETE FROM auth.identities WHERE user_id = 'c4b4a110-e7f0-43b9-a9a7-96a3fc422ab8';

INSERT INTO auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
  'c4b4a110-e7f0-43b9-a9a7-96a3fc422ab8',
  'c4b4a110-e7f0-43b9-a9a7-96a3fc422ab8',
  '{"sub": "c4b4a110-e7f0-43b9-a9a7-96a3fc422ab8", "email": "henriquelinharesjunqueira@gmail.com", "email_verified": true}',
  'email',
  NOW(),
  NOW(),
  NOW()
);

-- Verify
SELECT 
  u.id, 
  u.email, 
  u.created_at,
  u.email_confirmed_at, 
  u.encrypted_password IS NOT NULL AS has_password,
  i.provider,
  i.identity_data->>'email' AS identity_email
FROM auth.users u 
LEFT JOIN auth.identities i ON i.user_id = u.id
WHERE u.email = 'henriquelinharesjunqueira@gmail.com';
