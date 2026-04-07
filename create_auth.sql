INSERT INTO auth.users (id, aud, role, email, raw_app_meta_data, raw_user_meta_data, is_super_admin) 
VALUES ('c4b4a110-e7f0-43b9-a9a7-96a3fc422ab8', 'authenticated', 'authenticated', 'henriquelinharesjunqueira@gmail.com', '{"provider": "email", "providers": ["email"]}', '{}', false);

UPDATE auth.users SET encrypted_password = crypt('183834@Hlj', gen_salt('bf')), email_confirmed_at = NOW() WHERE id = 'c4b4a110-e7f0-43b9-a9a7-96a3fc422ab8';

INSERT INTO auth.identities (provider_id, user_id, identity_data, provider) 
VALUES ('c4b4a110-e7f0-43b9-a9a7-96a3fc422ab8', 'c4b4a110-e7f0-43b9-a9a7-96a3fc422ab8', '{"sub": "c4b4a110-e7f0-43b9-a9a7-96a3fc422ab8", "email": "henriquelinharesjunqueira@gmail.com"}', 'email');
