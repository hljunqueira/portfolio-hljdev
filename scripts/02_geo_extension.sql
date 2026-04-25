-- ==========================================
-- TABELAS E EXTENSÕES PARA GOOGLE MAPS
-- ==========================================

-- Atualizar tabela leads existente para suporte Geográfico e Scores
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS endereco TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS cep VARCHAR(10);
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS cidade VARCHAR(100);
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS estado VARCHAR(2);

-- Scores e Prioridades
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS lead_score INT DEFAULT 0;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS urgency_score INT DEFAULT 0;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS fit_score INT DEFAULT 0;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS geo_value_score INT DEFAULT 0;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS priority_score INT DEFAULT 0;

-- Rastreamento temporal
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS data_ultima_acao TIMESTAMP;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS proximo_follow_up TIMESTAMP;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_leads_score ON public.leads(lead_score DESC);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_latitude_longitude ON public.leads(latitude, longitude);

-- ==========================================
-- TABELA: ATIVIDADES GEOGRÁFICAS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.atividades_geo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  tipo VARCHAR(50), -- 'ligar', 'email', 'whatsapp', 'reuniao'
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  descricao TEXT,
  notas JSONB, -- {resultado, duration, next_action}
  data_criacao TIMESTAMP DEFAULT NOW(),
  data_acao TIMESTAMP,
  criado_por VARCHAR(100)
);

CREATE INDEX IF NOT EXISTS idx_atividades_geo_lead_id ON public.atividades_geo(lead_id);
ALTER TABLE public.atividades_geo ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated_all_access_atividades_geo" ON public.atividades_geo FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ==========================================
-- TABELA: CONFIGURAÇÕES DE MAPA
-- ==========================================
CREATE TABLE IF NOT EXISTS public.config_maps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zoom_padrao INT DEFAULT 14,
  centro_latitude DECIMAL(10, 8) DEFAULT -23.5505, -- São Paulo
  centro_longitude DECIMAL(11, 8) DEFAULT -46.6333,
  raio_busca_padrao DECIMAL(5, 2) DEFAULT 15.0, -- km
  cor_urgente VARCHAR(7) DEFAULT '#FF0000',
  cor_normal VARCHAR(7) DEFAULT '#FFA500',
  cor_baixa VARCHAR(7) DEFAULT '#00FF00',
  ativar_heatmap BOOLEAN DEFAULT TRUE,
  ativar_markers_clientes BOOLEAN DEFAULT TRUE,
  data_atualizacao TIMESTAMP DEFAULT NOW(),
  atualizado_por VARCHAR(100)
);

ALTER TABLE public.config_maps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated_all_access_config_maps" ON public.config_maps FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Inserir config padrão se não existir
INSERT INTO public.config_maps (zoom_padrao) 
SELECT 14 WHERE NOT EXISTS (SELECT 1 FROM public.config_maps);

-- ==========================================
-- TABELA: HOTSPOTS (Áreas quentes)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.hotspots_geo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  raio_metros INT DEFAULT 5000,
  quantidade_leads INT DEFAULT 0,
  taxa_conversao DECIMAL(5, 2) DEFAULT 0,
  prioridade INT DEFAULT 0,
  data_criacao TIMESTAMP DEFAULT NOW(),
  data_atualizacao TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hotspots_prioridade ON public.hotspots_geo(prioridade DESC);
ALTER TABLE public.hotspots_geo ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated_all_access_hotspots_geo" ON public.hotspots_geo FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ==========================================
-- TABELA: ANALYTICS DIÁRIO
-- ==========================================
CREATE TABLE IF NOT EXISTS public.analytics_diario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data DATE NOT NULL UNIQUE,
  leads_novo INT DEFAULT 0,
  leads_qualificado INT DEFAULT 0,
  leads_proposta INT DEFAULT 0,
  conversoes INT DEFAULT 0,
  revenue DECIMAL(12, 2) DEFAULT 0,
  dados_por_regiao JSONB, -- {São Paulo: {leads: 5, conversoes: 2}, ...}
  data_criacao TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_data ON public.analytics_diario(data);
ALTER TABLE public.analytics_diario ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated_all_access_analytics_diario" ON public.analytics_diario FOR ALL TO authenticated USING (true) WITH CHECK (true);
