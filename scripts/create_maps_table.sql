CREATE TABLE IF NOT EXISTS public.campanhas_maps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  keyword TEXT,
  location TEXT,
  status TEXT DEFAULT 'idle',
  leads_found INTEGER DEFAULT 0,
  dispatches_sent INTEGER DEFAULT 0,
  last_run TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.campanhas_maps ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'campanhas_maps' 
        AND policyname = 'Allow all for authenticated'
    ) THEN
        CREATE POLICY "Allow all for authenticated" ON public.campanhas_maps 
        FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;
END $$;
