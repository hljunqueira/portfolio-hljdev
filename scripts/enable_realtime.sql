
-- Habilita o Realtime para a tabela de campanhas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'campanhas_maps'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.campanhas_maps;
  END IF;
END $$;
