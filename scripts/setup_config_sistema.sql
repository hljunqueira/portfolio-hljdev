-- Tabela de Configurações Globais do Sistema
CREATE TABLE IF NOT EXISTS public.config_sistema (
    id INTEGER PRIMARY KEY DEFAULT 1,
    ai_system_prompt TEXT NOT NULL,
    ai_model TEXT DEFAULT 'llama-3.3-70b-versatile',
    precos_min_site NUMERIC DEFAULT 4500,
    precos_max_site NUMERIC DEFAULT 15000,
    precos_min_sistema NUMERIC DEFAULT 8500,
    precos_max_sistema NUMERIC DEFAULT 35000,
    lead_score_threshold_alerta INTEGER DEFAULT 80,
    followup_interval_1 INTEGER DEFAULT 24, -- em horas
    followup_interval_2 INTEGER DEFAULT 72, -- em horas
    wa_instance_name TEXT DEFAULT 'hlj-principal',
    wa_api_key TEXT DEFAULT 'hlj_ev_apikey_2026_secure_key',
    wa_api_url TEXT DEFAULT 'https://evolution.hljdev.com.br',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Inserir valores padrão caso não existam
INSERT INTO public.config_sistema (
    id, 
    ai_system_prompt, 
    ai_model, 
    precos_min_site, 
    precos_max_site, 
    precos_min_sistema, 
    precos_max_sistema, 
    lead_score_threshold_alerta, 
    followup_interval_1, 
    followup_interval_2
) 
VALUES (
    1, 
    'Você é o Assistente Virtual de Elite da HLJ DEV. Sua missão é qualificar leads interessados em Sites de Alta Performance, Sistemas Web e Automações Inteligentes. Seja profissional, autoritário e consultivo. Pergunte Nome, E-mail, WhatsApp, CEP e o interesse específico.',
    'llama-3.3-70b-versatile',
    4500, 15000,
    8500, 35000,
    80,
    24, 72
)
ON CONFLICT (id) DO NOTHING;

-- Habilitar RLS
ALTER TABLE public.config_sistema ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Admin All Access on config_sistema" 
ON public.config_sistema
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Política de leitura pública (opcional, mas útil para o n8n sem auth complexa)
CREATE POLICY "Read config_sistema" 
ON public.config_sistema
FOR SELECT 
TO public 
USING (true);
