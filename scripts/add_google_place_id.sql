
-- Adiciona a coluna google_place_id para evitar duplicidade de leads do Maps
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS google_place_id TEXT;
ALTER TABLE public.leads ADD CONSTRAINT leads_google_place_id_key UNIQUE (google_place_id);

-- Adiciona comentário para documentação
COMMENT ON COLUMN public.leads.google_place_id IS 'ID único do Google Places para evitar duplicidade na extração automática.';
