-- Habilita a extensão de UUID (embora gen_random_uuid() nativo possa ser usado)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Leads
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  telefone TEXT,
  score INTEGER DEFAULT 0,
  logo_url TEXT,
  cores_hex TEXT[],
  status TEXT DEFAULT 'novo',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lead Histórico
CREATE TABLE IF NOT EXISTS public.lead_historico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  status_anterior TEXT,
  status_novo TEXT,
  modificado_por TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Propostas
CREATE TABLE IF NOT EXISTS public.propostas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id),
  titulo TEXT NOT NULL,
  descricao TEXT,
  valor NUMERIC(10,2),
  mockup_url TEXT,
  status TEXT DEFAULT 'rascunho',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vendas
CREATE TABLE IF NOT EXISTS public.vendas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kiwify_id TEXT UNIQUE,
  produto_nome TEXT,
  valor NUMERIC(10,2),
  cliente_nome TEXT,
  cliente_email TEXT,
  status TEXT DEFAULT 'pago',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Produtos
CREATE TABLE IF NOT EXISTS public.produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  preco NUMERIC(10,2),
  imagem_url TEXT,
  link_checkout TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tarefas
CREATE TABLE IF NOT EXISTS public.tarefas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  data_vencimento TIMESTAMPTZ,
  lead_id UUID REFERENCES public.leads(id),
  concluida BOOLEAN DEFAULT false,
  alerta_whatsapp BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Templates Mensagem
CREATE TABLE IF NOT EXISTS public.templates_mensagem (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  texto TEXT NOT NULL,
  tipo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projetos
CREATE TABLE IF NOT EXISTS public.projetos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_nome TEXT NOT NULL,
  lead_id UUID REFERENCES public.leads(id),
  status TEXT DEFAULT 'briefing',
  link_ambiente_teste TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Atividades Log
CREATE TABLE IF NOT EXISTS public.atividades_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  dados JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS for all tables
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_historico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.propostas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tarefas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates_mensagem ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projetos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atividades_log ENABLE ROW LEVEL SECURITY;

-- 1. Admin Full Access Policy (Authenticated users)
CREATE POLICY "Admin All Access on leads" ON public.leads FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin All Access on lead_historico" ON public.lead_historico FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin All Access on propostas" ON public.propostas FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin All Access on vendas" ON public.vendas FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin All Access on produtos" ON public.produtos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin All Access on tarefas" ON public.tarefas FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin All Access on templates_mensagem" ON public.templates_mensagem FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin All Access on projetos" ON public.projetos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin All Access on atividades_log" ON public.atividades_log FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 2. Public / Anon Specific Access
-- Allows anonymous chat clients to create new leads
CREATE POLICY "Public Insert on leads" ON public.leads FOR INSERT TO anon WITH CHECK (true);
-- Allows prospective clients to read active products on the shop
CREATE POLICY "Public Select on produtos" ON public.produtos FOR SELECT TO anon USING (ativo = true);

-- Note: All other actions (update/delete leads, select from other tables) are implicitly denied to 'anon'.
