
CREATE EXTENSION IF NOT EXISTS http;

CREATE OR REPLACE FUNCTION public.trigger_n8n_extracao()
RETURNS trigger AS $$
BEGIN
  -- Dispara se o status mudar para 'idle' (nova campanha) ou 'queued' (comando de play)
  IF (TG_OP = 'INSERT' AND NEW.status = 'idle') OR (NEW.status = 'queued') THEN
    PERFORM http_post(
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

DROP TRIGGER IF EXISTS tr_n8n_extracao ON public.campanhas_maps;
CREATE TRIGGER tr_n8n_extracao
AFTER INSERT OR UPDATE ON public.campanhas_maps
FOR EACH ROW EXECUTE FUNCTION public.trigger_n8n_extracao();
