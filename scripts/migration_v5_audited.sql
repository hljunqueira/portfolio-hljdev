-- 1. Garante consistência dos campos de Score
ALTER TABLE public.leads 
  ADD COLUMN IF NOT EXISTS lead_score INTEGER DEFAULT 0;

UPDATE public.leads 
  SET lead_score = score 
  WHERE (lead_score IS NULL OR lead_score = 0) AND score IS NOT NULL;

-- 2. Expansão de Preços, Parcelamento e NF-e em config_sistema
ALTER TABLE public.config_sistema
  ADD COLUMN IF NOT EXISTS precos_min_automacao NUMERIC DEFAULT 3500,
  ADD COLUMN IF NOT EXISTS precos_max_automacao NUMERIC DEFAULT 12000,
  ADD COLUMN IF NOT EXISTS precos_min_consultoria NUMERIC DEFAULT 1500,
  ADD COLUMN IF NOT EXISTS precos_max_consultoria NUMERIC DEFAULT 6000,
  ADD COLUMN IF NOT EXISTS max_parcelas_sem_juros INTEGER DEFAULT 6,
  ADD COLUMN IF NOT EXISTS max_parcelas_com_juros INTEGER DEFAULT 12,
  ADD COLUMN IF NOT EXISTS taxa_desconto_pix NUMERIC DEFAULT 5.0,
  ADD COLUMN IF NOT EXISTS emissao_nf_garantida BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS aliquota_imposto_percentual NUMERIC DEFAULT 6.0;

-- 3. Tabela de Campanhas de Prospecção Google Maps
CREATE TABLE IF NOT EXISTS public.campanhas_maps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword TEXT NOT NULL,
  location TEXT NOT NULL,
  total_encontrados INTEGER DEFAULT 0,
  validados_whatsapp INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabela de Histórico e Linha do Tempo do Lead
CREATE TABLE IF NOT EXISTS public.timeline_atividades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  meta_dados JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS na timeline_atividades
ALTER TABLE public.timeline_atividades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin All Access on timeline_atividades" 
ON public.timeline_atividades FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Read timeline_atividades" 
ON public.timeline_atividades FOR SELECT TO public USING (true);

-- 5. Suporte a Histórico de Objeções, ROI e Opções em Propostas
ALTER TABLE public.propostas
  ADD COLUMN IF NOT EXISTS opcoes_parcelamento JSONB,
  ADD COLUMN IF NOT EXISTS calculo_roi JSONB,
  ADD COLUMN IF NOT EXISTS emite_nf BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS objecoes_historico JSONB DEFAULT '[]'::jsonb;
