
-- Move a extensão para o schema correto (extensions)
DROP EXTENSION IF EXISTS http CASCADE;
CREATE EXTENSION http SCHEMA extensions;

-- Recria a função do trigger apontando para o schema correto se necessário
CREATE OR REPLACE FUNCTION public.trigger_n8n_extracao()
RETURNS trigger AS $$
BEGIN
  IF (TG_OP = 'INSERT' AND NEW.status = 'idle') OR (NEW.status = 'queued') THEN
    PERFORM extensions.http_post(
      'http://hlj-n8n:5678/webhook/hlj-extracao-maps',
      json_build_object(
        'id', NEW.id,
        'name', NEW.name,
        'keyword', NEW.keyword,
        'location', NEW.location
      )::text,
      'application/json'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-associa o trigger
DROP TRIGGER IF EXISTS tr_n8n_extracao ON public.campanhas_maps;
CREATE TRIGGER tr_n8n_extracao
AFTER INSERT OR UPDATE ON public.campanhas_maps
FOR EACH ROW EXECUTE FUNCTION public.trigger_n8n_extracao();
