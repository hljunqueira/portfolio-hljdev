-- Delete existing broken user
DELETE FROM auth.identities WHERE user_id = 'c4b4a110-e7f0-43b9-a9a7-96a3fc422ab8';
DELETE FROM auth.users WHERE id = 'c4b4a110-e7f0-43b9-a9a7-96a3fc422ab8';

SELECT 'User deleted, now creating fresh via API...' AS status;
