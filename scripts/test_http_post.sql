
-- Teste manual de chamada interna do banco para o n8n
SELECT http_post(
  'http://hlj-n8n:5678/webhook/hlj-extracao-maps',
  '{"id": "test-id", "name": "Teste Manual", "keyword": "teste", "location": "Florianópolis"}',
  'application/json'
);
