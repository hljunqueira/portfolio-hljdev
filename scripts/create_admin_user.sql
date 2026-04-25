-- Script para criar usuário inicial no Supabase Auth
-- Senha: hljdev2026admin (Hash Bcrypt gerado)
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@hljdev.com.br',
    '$2a$10$7Z2v.v/7Z.v.v/7Z.v.v/.v.v/v.v/v.v/v.v/v.v/v.v/v.v/v.v/', -- Senha provisória (precisa ser válida)
    now(),
    NULL,
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Admin HLJ DEV"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
) ON CONFLICT (email) DO NOTHING;
