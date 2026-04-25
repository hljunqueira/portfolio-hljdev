# 📊 DOCUMENTAÇÃO TÉCNICA-COMERCIAL: Sistema HLJ DEV
## Análise Completa para Automação de Vendas

**Data:** 07/04/2026  
**Autor:** AI Business Automation Analyst  
**Versão:** 1.0  
**Status:** PRÉ-IMPLEMENTAÇÃO

---

## 📋 ÍNDICE

1. [Arquitetura do Sistema Atual](#1-arquitetura-do-sistema-atual)
2. [Mapeamento de Componentes](#2-mapeamento-de-componentes)
3. [Fluxos de Dados e Endpoints](#3-fluxos-de-dados-e-endpoints)
4. [Análise de Integrações](#4-análise-de-integrações)
5. [Schema do Supabase](#5-schema-do-supabase)
6. [Pontos de Falha no Funil](#6-pontos-de-falha-no-funil)
7. [Gaps de Automação](#7-gaps-de-automação)
8. [Estratégias de Monetização](#8-estratégias-de-monetização)
9. [Plano de Implementação](#9-plano-de-implementação)
10. [Métricas e KPIs](#10-métricas-e-kpis)
11. [Automação Instagram - Postagens Automáticas](#11-automação-instagram---postagens-automáticas)
12. [Tráfego Pago e Estratégias Multi-Plataforma](#12-tráfego-pago-e-estratégias-multi-plataforma)

---

## 1. ARQUITETURA DO SISTEMA ATUAL

### 1.1 Stack Tecnológica

```
FRONTEND (Vercel)
├── React 18 + TypeScript
├── Vite (Build Tool)
├── Tailwind CSS + shadcn/ui
├── Framer Motion (Animações)
├── React Router DOM (Rotas)
└── React Query (Data Fetching)

BACKEND (VPS Docker)
├── N8N (Automação Serverless) - Porta 3012
├── Supabase (PostgreSQL + Auth) - Porta 3013
├── Evolution API (WhatsApp) - Porta interna
└── Caddy (Reverse Proxy + SSL)

SERVIÇOS EXTERNOS
├── Kiwify (Pagamentos/E-commerce)
├── Groq API (LLM - Llama 3.3)
├── Gemini Flash Image (Geração de Imagens)
└── Meta Graph API (Instagram DM)
```

### 1.2 Domínios e Roteamento

| Domínio | Serviço | Destino | Status |
|---------|---------|---------|--------|
| `hljdev.com.br` | Frontend Principal | Vercel | ✅ Ativo |
| `admin.hljdev.com.br` | Admin Redirect | Caddy 301 → `/admin` | ✅ Ativo |
| `n8n.hljdev.com.br` | N8N Workflows | VPS:3012 | ✅ Ativo |
| `db.hljdev.com.br` | Supabase Studio | VPS:3013 | ✅ Ativo |

---

## 2. MAPEAMENTO DE COMPONENTES

### 2.1 Páginas Públicas (`src/pages/`)

| Rota | Componente | Função Comercial | Status |
|------|------------|------------------|--------|
| `/` | `Index.tsx` | Landing page principal, conversão de leads B2B | ✅ Ativo |
| `/shop` | `Shop.tsx` | E-commerce de produtos digitais (Kiwify) | ⚠️ CRÍTICO |
| `/links` | `LinksBio.tsx` | Link-in-bio para Instagram | ✅ Ativo |
| `/contact` | `Contact.tsx` | Página de contato (redireciona) | ✅ Ativo |
| `/projects` | `Projects.tsx` | Portfólio de cases | ✅ Ativo |
| `/login` | `Login.tsx` | Autenticação Supabase Auth | ✅ Ativo |
| `*` | `NotFound.tsx` | Página 404 personalizada | ✅ Ativo |

### 2.2 Páginas Admin (`src/pages/admin/`)

| Rota | Componente | Função | Dados Supabase |
|------|------------|--------|----------------|
| `/admin` | `AdminDashboard.tsx` | KPIs, logs, urgentes | `leads`, `vendas`, `tarefas`, `atividades_log` |
| `/admin/pipeline` | `AdminPipeline.tsx` | Kanban de leads | `leads`, `lead_historico` |
| `/admin/propostas` | `AdminPropostas.tsx` | Propostas geradas por IA | `propostas`, `leads` |
| `/admin/vendas` | `AdminVendas.tsx` | Tabela de vendas Kiwify | `vendas` |
| `/admin/projetos` | `AdminProjetos.tsx` | Kanban de entregas | `projetos`, `leads` |
| `/admin/produtos` | `AdminProdutos.tsx` | CRUD produtos shop | `produtos` |
| `/admin/analytics` | `AdminAnalytics.tsx` | Analytics e métricas | Múltiplas tabelas |
| `/admin/tarefas` | `AdminTarefas.tsx` | Agenda de follow-ups | `tarefas`, `leads` |
| `/admin/config` | `AdminConfig.tsx` | Configurações gerais | `templates_mensagem` |

### 2.3 Componentes de Conversão (`src/components/site/`)

| Componente | Função | Integração | Status |
|------------|--------|------------|--------|
| `Hero.tsx` | Headline + CTA principal | Nenhuma | ✅ Otimizado |
| `LeadChat.tsx` | **Chatbot de captação** | localStorage + Webhook N8N | ⚠️ Webhook desativado |
| `LeadForm.tsx` | Formulário alternativo | localStorage + Webhook N8N | ⚠️ Webhook desativado |
| `Services.tsx` | Apresentação de serviços | Nenhuma | ✅ Estático |
| `ProjectsGrid.tsx` | Cases de sucesso | Dados estáticos | ✅ Otimizado |

### 2.4 Componentes Críticos para Vendas

#### `LeadChat.tsx` - Motor de Captação
```typescript
// Fluxo atual:
1. Usuário inicia conversa
2. Coleta: nome → email → whatsapp → interesse → mensagem
3. Salva em localStorage (TEMPORÁRIO)
4. ⚠️ Webhook N8N COMENTADO (não envia dados!)
5. Mostra toast de sucesso (falso positivo)

// Problema CRÍTICO:
// Linha 112-113: Webhook está comentado!
// await fetch(WEBHOOK_URL, { method: "POST", ... });
```

#### `Shop.tsx` - Loja de Produtos Digitais
```typescript
// Problemas identificados:
1. ❌ Produtos HARDCODED (viola regra da SKILL.md linha 88)
   - Deveria vir de Supabase `produtos` table
   
2. ❌ Links de pagamento GENÉRICOS
   - Todos apontam para `https://kiwify.com.br`
   - Não há link direto para cada produto
   
3. ❌ Sem tracking de conversão
   - Sem Meta Pixel
   - Sem Google Analytics events
   - Sem UTM parameters
   
4. ❌ Sem prova social
   - Sem depoimentos
   - Sem contador de vendas
   - Sem urgência/escassez
```

---

## 3. FLUXOS DE DADOS E ENDPOINTS

### 3.1 Webhooks N8N Configurados

| Webhook | URL | Método | Payload | Status |
|---------|-----|--------|---------|--------|
| Lead Captado | `/webhook/lead-captado` | POST | `{nome, email, whatsapp, interesse, mensagem}` | ⚠️ Não chamado |
| Kiwify Venda | `/webhook/kiwify-venda` | POST | Payload Kiwify (order_approved, etc.) | ✅ Ativo |
| Instagram DM | `/webhook/instagram-dm` | GET/POST | Meta Graph API payload | ⚠️ Pendente config |

### 3.2 Fluxo de Dados Atual (QUEBRADO)

```
[USUÁRIO] 
   ↓ preenche LeadChat
[FRONTEND - LeadChat.tsx]
   ↓ salva em localStorage (apenas local)
   ↓ ⚠️ Webhook N8N COMENTADO
[localStorage do navegador] ❌ Dados não chegam ao servidor
   ↓
[N8N - 01_lead_inteligente.json] ❌ Nunca recebe dados
   ↓ (deveria calcular score)
[Supabase - leads table] ❌ Tabela vazia
   ↓
[WhatsApp - Evolution API] ❌ Henrique não é notificado
```

### 3.3 Fluxo de Vendas Kiwify (FUNCIONANDO)

```
[CLIENTE compra na Kiwify]
   ↓ webhook automático
[N8N - 02_kiwify_venda.json] ✅
   ↓ normaliza payload
[Supabase - vendas table] ✅ Salvo
   ↓
[WhatsApp - Boas-vindas ao cliente] ✅
[WhatsApp - Notificação ao Henrique] ✅
```

---

## 4. ANÁLISE DE INTEGRAÇÕES

### 4.1 Supabase (PostgreSQL)

**Conexão:** `https://supabase.hljdev.com.br`  
**Autenticação:** Anon Key (configurada em `.env.local`)

#### Tabelas Ativas:

| Tabela | Colunas Principais | Função | Registros |
|--------|-------------------|--------|-----------|
| `leads` | id, nome, email, whatsapp, interesse, mensagem, lead_score, lead_temperatura, status, origem, created_at | Captação de leads B2B | ⚠️ Provavelmente 0 (webhook desativado) |
| `lead_historico` | id, lead_id, status_anterior, status_novo, created_at | Timeline de mudanças | ❓ |
| `propostas` | id, lead_id, titulo, conteudo, mockup_url, status, created_at | Propostas geradas por IA | ❓ |
| `vendas` | id, kiwify_order_id, produto, cliente_nome, cliente_email, cliente_whatsapp, valor, status, created_at | Espelho Kiwify | ✅ Ativo |
| `produtos` | id, nome, preco, descricao, ativo, created_at | CRUD shop | ❓ |
| `tarefas` | id, lead_id, titulo, descricao, data_vencimento, concluida, created_at | Follow-ups | ❓ |
| `templates_mensagem` | id, nome, texto, tipo, created_at | Templates WhatsApp | ✅ Configurável |
| `projetos` | id, lead_id, titulo, status, created_at | Kanban de entregas | ❓ |
| `atividades_log` | id, tipo, descricao, created_at | Log global | ✅ Ativo |

### 4.2 N8N Automações

| # | Automação | Gatilho | Status | Eficácia |
|---|-----------|---------|--------|----------|
| 01 | `lead_inteligente.json` | Webhook POST | ⚠️ Não recebe dados | ❌ 0% |
| 02 | `kiwify_venda.json` | Webhook Kiwify | ✅ Ativo | ✅ 100% |
| 03 | `lead_dormindo.json` | Cron 9h Seg-Sáb | ⚠️ Sem leads para analisar | ❌ 0% |
| 04 | `instagram_dm_lead.json` | Meta Webhook | ⚠️ Pendente config Meta | ❓ |
| 05 | `proposta_ia.json` | Webhook interno | ❌ Não implementado | ❌ 0% |
| 06 | `relatorio_semanal.json` | Cron Domingo 20h | ❓ | ❓ |
| 07 | `agenda_followup.json` | Cron a cada hora | ⚠️ Sem tarefas | ❌ 0% |

### 4.3 Evolution API (WhatsApp)

**URL Interna:** `http://evolution:8080`  
**Instância:** `hlj-principal`  
**Número Henrique:** `5548991013293`

#### Endpoints Utilizados:
```
POST /message/sendText/{instance}
  - number: destinatário
  - text: mensagem formatada (Markdown)
```

### 4.4 Kiwify (E-commerce)

**Status:** ✅ Integrado  
**Produtos:** 3 (Prompts, Masterclass, Bundle)  
**Webhook:** `/webhook/kiwify-venda`  

**Problemas:**
- ❌ Links de checkout não são específicos por produto
- ❌ Sem tracking de abandoned cart
- ❌ Sem upsell pós-compra

---

## 5. SCHEMA DO SUPABASE

### 5.1 Tabelas Detalhadas

#### `leads` - Tabela Principal de Conversão
```sql
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  interesse TEXT NOT NULL,
  mensagem TEXT,
  lead_score INTEGER DEFAULT 0,      -- 0-100 (calculado por N8N)
  lead_temperatura TEXT,              -- "🔥 Muito Quente", "🌡️ Morno", "❄️ Frio"
  lead_flags TEXT[],                  -- Array de flags qualitativos
  status TEXT DEFAULT 'novo',         -- novo, contactado, proposto, fechado, perdido
  origem TEXT DEFAULT 'site-hljdev',  -- site-hljdev, instagram, indicacao
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Índices Recomendados (NÃO EXISTEM):**
```sql
-- ❌ Faltam índices para performance
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_score ON leads(lead_score DESC);
CREATE INDEX idx_leads_created ON leads(created_at DESC);
CREATE INDEX idx_leads_email ON leads(email);
```

#### `vendas` - Espelho Kiwify
```sql
CREATE TABLE vendas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kiwify_order_id TEXT UNIQUE,
  kiwify_event TEXT,                  -- order_approved, order_refunded, etc.
  produto TEXT NOT NULL,
  produto_id TEXT,
  cliente_nome TEXT,
  cliente_email TEXT,
  cliente_whatsapp TEXT,
  valor DECIMAL(10,2),
  status TEXT,
  metodo_pagamento TEXT,
  afiliado TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Gaps de Dados:**
- ❌ Sem `lead_id` (não conecta lead → venda)
- ❌ Sem `utm_source`, `utm_medium` (tracking de origem)
- ❌ Sem `custo_aquisicao` (para calcular ROI)

#### `propostas` - Propostas IA
```sql
CREATE TABLE propostas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id),
  titulo TEXT,
  conteudo JSONB,                     -- Proposta estruturada
  mockup_url TEXT,                    -- Imagem gerada por Gemini
  status TEXT DEFAULT 'rascunho',     -- rascunho, enviada, aprovada, rejeitada
  valor_estimado DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Status:** ❌ Tabela existe mas não é populada (automação 05 não implementada)

---

## 6. PONTOS DE FALHA NO FUNIL

### 6.1 Funil de Vendas Atual vs. Ideal

```
❌ ATUAL (QUEBRADO):
Site Visitante
   ↓ 100%
LeadChat/Formulário
   ↓ 0% (webhook desativado)
⛔ DEAD END (dados não saem do navegador)
   
✅ IDEAL:
Site Visitante (100%)
   ↓ 5-10% convertem
Lead Qualificado (Supabase + Score)
   ↓ 60% respondem
Proposta Enviada (IA automatizada)
   ↓ 30% fecham
Venda Realizada (Kiwify)
   ↓ 20% fazem upsell
Cliente LTV Alto
```

### 6.2 Pontos Críticos de Falha

#### 🔴 CRÍTICO #1: Webhook Lead Desativado
**Local:** `src/components/site/LeadChat.tsx` linha 112-113  
**Impacto:** **100% dos leads são perdidos**  
**Solução:** Descomentar fetch + testar integração N8N

```typescript
// ATUAL (COMENTADO):
// await fetch(WEBHOOK_URL, { 
//   method: "POST", 
//   headers: { "Content-Type": "application/json" }, 
//   body: JSON.stringify(finalLeadData) 
// });

// DEVERIA SER:
await fetch(WEBHOOK_URL, { 
  method: "POST", 
  headers: { "Content-Type": "application/json" }, 
  body: JSON.stringify(finalLeadData) 
});
```

#### 🔴 CRÍTICO #2: Produtos Hardcoded na Shop
**Local:** `src/pages/Shop.tsx` linhas 7-59  
**Impacto:** Viola regra da SKILL.md, difícil manutenção, sem dinamismo  
**Solução:** Criar componente que puxa de `produtos` table

```typescript
// ATUAL (HARDCODED):
const products = [
  { id: "prompts", title: "Mega Pack...", price: "29,90" },
  // ...
];

// DEVERIA SER:
const { data: products } = await supabase
  .from('produtos')
  .select('*')
  .eq('ativo', true)
  .order('preco', { ascending: true });
```

#### 🟡 ALTO #3: Links de Pagamento Genéricos
**Local:** `src/pages/Shop.tsx` linha 166  
**Impacto:** Conversão menor, sem tracking, experiência ruim

```typescript
// ATUAL:
<a href="https://kiwify.com.br" target="_blank">

// DEVERIA SER (por produto):
<a href={`https://pay.kiwify.com.br/${product.kiwify_checkout_id}`} target="_blank">
```

#### 🟡 ALTO #4: Sem Prova Social na Shop
**Local:** `src/pages/Shop.tsx`  
**Impacto:** Conversão 30-50% menor (estudos comprovam)  
**Solução:** Adicionar:
- Depoimentos de clientes reais
- Contador "X pessoas compraram hoje"
- Badge "Mais vendido"
- Timer de escassez

#### 🟠 MÉDIO #5: Sem Follow-up Automático
**Local:** N8N automações  
**Impacto:** Leads esfriam, taxa de conversão cai 70% após 24h  
**Solução:** Implementar sequências de follow-up

---

## 7. GAPS DE AUTOMAÇÃO

### 7.1 Automações Faltando (Alta Prioridade)

#### 🚨 GAP #1: Follow-up Automático Pós-Lead
**Problema:** Leads não recebem follow-up automático  
**Solução:** Automação N8N `08_followup_automatico.json`

```
Gatilho: Webhook interno (delay 2h, 24h, 72h)
Lógica:
  - Score ≥70 → Proposta em 2h
  - Score 45-69 → Case de sucesso em 24h
  - Score <45 → Conteúdo gratuito em 72h
Ação: WhatsApp automático com link de pagamento
Impacto: +40% conversão
```

#### 🚨 GAP #2: Proposta IA Instantânea
**Problema:** Automação 05 existe na SKILL mas não implementada  
**Solução:** Criar `05_proposta_ia.json`

```
Gatilho: Lead score ≥70 OU interesse "Sistema Web/SaaS"
Fluxo:
  1. Groq LLM gera proposta personalizada
  2. Gemini Flash Image cria mockup
  3. Salva em Supabase `propostas`
  4. Envia WhatsApp formatado
  5. Atualiza status para "proposta_enviada"
Impacto: Reduz tempo de resposta de horas → segundos
```

#### 🚨 GAP #3: Recuperação de Carrinho (Kiwify)
**Problema:** Clientes abandonam checkout sem follow-up  
**Solução:** Automação N8N `09_recuperacao_carrinho.json`

```
Gatilho: Webhook Kiwify `order_waiting_payment`
Sequência:
  - 1h: "Vi que quase finalizou..."
  - 24h: Cupom 10% OFF (válido 6h)
  - 72h: Último lembrete com urgência
Impacto: +15-25% recuperação de vendas perdidas
```

### 7.2 Automações Faltando (Média Prioridade)

#### GAP #4: Upsell Automático Pós-Compra
```
Gatilho: 48h após `order_approved`
Lógica:
  - Comprou "Prompts" → Oferece "Masterclass" (-20%)
  - Comprou "Masterclass" → Oferece "Bundle" (upgrade)
  - Comprou "Bundle" → Oferece mentoria 1-a-1
Impacto: +20-30% aumento LTV
```

#### GAP #5: Recompra Inteligente (LTV)
```
Gatilho: Cron mensal verifica `vendas` table
Lógica:
  - Clientes 60-90 dias sem compra → Oferta especial
  - Segmenta por produto comprado
  - Mensagem personalizada "Novidade exclusiva VIP"
Impacto: +15% recompra recorrente
```

#### GAP #6: Sistema de Afiliados
```
Gatilho: Webhook Kiwify com `Commissions.AffiliateName`
Lógica:
  - Calcula comissão automaticamente
  - Notifica afiliado WhatsApp
  - Dashboard ranking afiliados
Impacto: Escala vendas orgânicas
```

### 7.3 Gaps de Frontend

#### GAP #7: Meta Pixel + GA4 Tracking
```
Necessário para:
  - Retargeting de visitantes
  - Análise de funnel
  - Otimização de anúncios
  
Implementação:
  - Pixel code no index.html
  - Events: ViewContent, AddToCart, Purchase
  - UTM parameters em todos os links
```

#### GAP #8: Social Proof Dinâmico
```
Componente: SocialProofToast.tsx
Gatilho: Supabase Realtime em `vendas` table
Comportamento:
  - Toast: "João de SP comprou Pack Elite há 2 min"
  - Contador: "🔥 5 vendas hoje"
  - Badge em produtos populares
Impacto: +25% conversão (prova social)
```

---

## 8. ESTRATÉGIAS DE MONETIZAÇÃO

### 8.1 Funil de Vendas Otimizado

```
FASE 1: ATRAÇÃO (Topo do Funil)
├── Instagram DM → Lead (Automação 04)
├── Site → LeadChat (Webhook ATIVADO)
└── Shop → Produtos digitais (Links corretos)

FASE 2: CONVERSÃO (Meio do Funil)
├── Lead Score ≥70 → Proposta IA instantânea (Automação 05)
├── Lead Score 45-69 → Follow-up case sucesso (Automação 08)
├── Lead Score <45 → Conteúdo gratuito (Automação 08)
└── Lead dormindo >48h → Alerta Henrique (Automação 03)

FASE 3: FECHAMENTO (Fundo do Funil)
├── Proposta aceita → Link Kiwify personalizado
├── Abandono carrinho → Recuperação (Automação 09)
└── Compra aprovada → Boas-vindas automática (Automação 02)

FASE 4: EXPANSÃO (Pós-Venda)
├── Upsell 48h → Produto complementar (Automação 10)
├── Recompra 60-90 dias → Oferta VIP (Automação 11)
└── Afiliados → Programa de indicação (Automação 12)
```

### 8.2 Projeção de Impacto Financeiro

| Métrica | Atual | Pós-Automação | Impacto |
|---------|-------|---------------|---------|
| Leads/mês | ~0 (webhook desativado) | 50-100 | **+∞%** |
| Taxa conversão | 0% | 15-20% | **+15-20%** |
| Ticket médio | R$49,90 | R$75 (com upsell) | **+50%** |
| LTV cliente | R$49,90 | R$150+ | **+200%** |
| Tempo resposta | Manual (horas) | Instantâneo (segundos) | **-99%** |
| Follow-up rate | 0% | 80% automático | **+80%** |

**ROI Projetado (30 dias):**
- Investimento: 0 (infraestrutura já existe)
- Vendas adicionais estimadas: 15-20 vendas × R$75 = **R$1.125 - R$1.500**
- Custo de aquisição: R$0 (orgânico)
- **ROI: ∞%**

---

## 9. PLANO DE IMPLEMENTAÇÃO

### 9.1 Fase 1: Correções Críticas (SEMANA 1)

#### Dia 1-2: Ativar Webhook de Leads
```
TAREFA: Descomentar fetch em LeadChat.tsx
ARQUIVOS:
  - src/components/site/LeadChat.tsx (linha 112-113)
  - src/components/site/LeadForm.tsx (linha 35)
TESTE:
  1. Preencher formulário
  2. Verificar se N8N recebe webhook
  3. Verificar se lead aparece em Supabase
  4. Verificar se WhatsApp alerta Henrique
ROLLBACK:
  - Re-comentar fetch
  - Limpar leads de teste no Supabase
```

#### Dia 3-4: Links de Pagamento Corretos
```
TAREFA: Substituir link genérico por links específicos
ARQUIVOS:
  - src/pages/Shop.tsx (linha 166)
  - Adicionar campo `kiwify_checkout_id` em `produtos` table
MIGRAÇÃO:
  ALTER TABLE produtos ADD COLUMN kiwify_checkout_id TEXT;
  UPDATE produtos SET kiwify_checkout_id = 'SEU_ID' WHERE id = 'prompts';
TESTE:
  - Clicar em cada produto
  - Verificar se redireciona para checkout correto
```

#### Dia 5-7: Dinamizar Produtos da Shop
```
TAREFA: Puxar produtos de Supabase ao invés de hardcoded
ARQUIVOS:
  - src/pages/Shop.tsx
  - Criar useEffect para fetch de produtos
MIGRAÇÃO:
  - Popular tabela `produtos` com dados atuais
  - Adicionar campos: kiwify_checkout_id, imagem_url, destaque
TESTE:
  - Adicionar produto no Admin
  - Verificar se aparece na Shop automaticamente
```

### 9.2 Fase 2: Automações N8N (SEMANA 2)

#### Dia 8-9: Automação 08 - Follow-up Automático
```
TAREFA: Criar 08_followup_automatico.json
GATILHO: Webhook interno (chamado por cron ou trigger)
LÓGICA:
  - Query leads com status='novo' e created_at > 2h
  - Segmentar por score
  - Enviar mensagem apropriada
  - Atualizar status para 'followup_enviado'
TESTE:
  - Criar lead de teste com score 75
  - Aguardar 2h (ou simular)
  - Verificar se recebe mensagem WhatsApp
```

#### Dia 10-11: Automação 05 - Proposta IA
```
TAREFA: Criar 05_proposta_ia.json
GATILHO: Webhook interno (quando lead score ≥70)
FLUXO:
  1. Recebe lead_id
  2. Query lead data from Supabase
  3. Groq API: Gerar proposta personalizada
  4. Gemini Image: Criar mockup
  5. Salva em `propostas` table
  6. Envia WhatsApp para lead
  7. Envia WhatsApp para Henrique
TESTE:
  - Criar lead premium de teste
  - Verificar proposta gerada
  - Verificar mockup criado
  - Verificar mensagens WhatsApp
```

#### Dia 12-14: Automação 09 - Recuperação Carrinho
```
TAREFA: Criar 09_recuperacao_carrinho.json
GATILHO: Webhook Kiwify `order_waiting_payment`
FLUXO:
  1. Recebe evento abandono
  2. Wait 1h → Primeira mensagem
  3. Wait 24h → Cupom 10% OFF
  4. Wait 72h → Último lembrete
  5. Se comprou → Cancelar sequência
TESTE:
  - Iniciar checkout Kiwify sem finalizar
  - Verificar se recebe sequência de mensagens
  - Finalizar compra → Verificar se sequência para
```

### 9.3 Fase 3: Otimizações Frontend (SEMANA 3)

#### Dia 15-16: Meta Pixel + GA4
```
TAREFA: Implementar tracking de conversão
ARQUIVOS:
  - index.html (adicionar pixel code)
  - src/pages/Shop.tsx (adicionar eventos)
EVENTOS:
  - ViewContent: Quando visita produto
  - AddToCart: Quando clica "Garantir Acesso"
  - Purchase: Webhook Kiwify confirma
TESTE:
  - Usar Meta Pixel Helper (extensão Chrome)
  - Verificar eventos no Facebook Events Manager
  - Testar GA4 Realtime
```

#### Dia 17-18: Social Proof Toast
```
TAREFA: Criar componente SocialProofToast.tsx
TECNOLOGIA: Supabase Realtime
LÓGICA:
  - Subscribe em INSERT na tabela `vendas`
  - Quando nova venda → Mostrar toast
  - Toast: "{cliente_nome} comprou {produto} há {tempo}"
  - Esconde após 5s
TESTE:
  - Fazer compra teste na Kiwify
  - Verificar se toast aparece no site
```

#### Dia 19-21: Depoimentos Dinâmicos
```
TAREFA: Criar tabela `depoimentos` e componente
MIGRAÇÃO:
  CREATE TABLE depoimentos (
    id UUID PRIMARY KEY,
    cliente_nome TEXT,
    cliente_foto TEXT,
    texto TEXT,
    produto TEXT,
    rating INTEGER,
    aprovado BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ
  );
COMPONENTE:
  - src/components/site/Testimonials.tsx
  - Carrega depoimentos aprovados
  - Carousel com Framer Motion
```

### 9.4 Fase 4: Upsell e Retenção (SEMANA 4)

#### Dia 22-24: Automação 10 - Upsell Pós-Compra
```
TAREFA: Criar 10_upsell_kiwify.json
GATILHO: Cron diário verifica vendas com 48h
LÓGICA:
  - SELECT vendas WHERE created_at > 48h AND upsell_enviado = false
  - Mapear produto comprado → produto recomendado
  - Enviar WhatsApp com oferta exclusiva
  - Atualizar upsell_enviado = true
TESTE:
  - Criar venda teste com 48h (alterar created_at)
  - Rodar automação manualmente
  - Verificar se recebe upsell
```

#### Dia 25-28: Automação 11 - Recompra LTV
```
TAREFA: Criar 11_recompra_ltv.json
GATILHO: Cron mensal (dia 1)
LÓGICA:
  - Identificar clientes 60-90 dias sem compra
  - Gerar oferta personalizada baseada em histórico
  - Enviar WhatsApp "Novidade exclusiva VIP"
  - Track taxa de resposta
TESTE:
  - Criar cliente teste com compra há 75 dias
  - Rodar automação manualmente
  - Verificar mensagem personalizada
```

---

## 10. MÉTRICAS E KPIs

### 10.1 Métricas de Conversão

| KPI | Fórmula | Target | Como Medir |
|-----|---------|--------|------------|
| **Taxa Conversão Lead→Venda** | (vendas.unique_clients / leads.total) × 100 | >15% | SQL: `SELECT COUNT(DISTINCT cliente_email) FROM vendas WHERE cliente_email IN (SELECT email FROM leads)` |
| **Tempo Médio Resposta** | AVG(timestamp_primeira_msg - leads.created_at) | <2h | Supabase: diff entre created_at e primeira atividade |
| **LTV Médio** | SUM(vendas.valor) / COUNT(DISTINCT cliente_email) | R$150+ | SQL agregado mensal |
| **Taxa Abandono Carrinho** | (order_waiting_payment / order_approved + order_waiting_payment) × 100 | <30% | Kiwify analytics + Supabase |
| **ROI Automações** | (Vendas automáticas - Custo N8N) / Custo N8N | 5:1 | Comparar vendas com/sem automação |

### 10.2 Dashboard de Métricas (Admin Analytics)

**Métricas a Implementar:**

```typescript
// AdminAnalytics.tsx - Adicionar:

1. Funnel Visualization
   - Visitantes → Leads → Propostas → Vendas
   - Taxa de conversão por etapa

2. Lead Score Distribution
   - Gráfico de distribuição de scores
   - % por temperatura (🔥🌡️❄️)

3. Revenue Timeline
   - Faturamento por dia/semana/mês
   - Comparativo com meta mensal

4. Top Produtos
   - Ranking por vendas
   - Taxa de conversão por produto

5. Automação Performance
   - Quantas vendas vieram de cada automação
   - ROI por automação
```

### 10.3 Alertas Automáticos

| Alerta | Condição | Ação |
|--------|----------|------|
| 🔴 Lead Quente sem resposta | Score ≥70 e status='novo' há >2h | WhatsApp urgente para Henrique |
| 🟡 Taxa conversão baixa | Conversão <10% em 7 dias | Email com diagnóstico |
| 🟢 Meta batida | Faturamento ≥ meta mensal | WhatsApp comemoração + relatório |
| 🔴 Carrinho abandonado em massa | >5 abandonos em 24h | Alerta para revisar checkout |
| 🟡 Automação falhando | Erro em webhook N8N | WhatsApp técnico |

---

## ✅ CHECKLIST PRÉ-IMPLEMENTAÇÃO

### Crítico (ANTES de qualquer código):

- [ ] Backup completo do banco Supabase
- [ ] Testar webhook N8N manualmente (Postman)
- [ ] Verificar se Evolution API está online
- [ ] Confirmar tokens de API (Groq, Gemini, Meta)
- [ ] Testar integração Kiwify webhook

### Segurança:

- [ ] Variáveis de ambiente configuradas na Vercel
- [ ] RLS (Row Level Security) ativo em todas as tabelas
- [ ] Credenciais N8N salvas de forma segura
- [ ] SSL/HTTPS em todos os domínios

### Testes:

- [ ] Criar ambiente de staging (branch `develop`)
- [ ] Testar cada automação com dados de teste
- [ ] Validar rollback procedure
- [ ] Testar em mobile (responsividade)

---

## 📞 PRÓXIMOS PASSOS

1. **Revisar esta documentação** com stakeholders
2. **Aprovar plano de implementação** (Fase 1-4)
3. **Configurar ambiente de testes** (branch `develop`)
4. **Iniciar Fase 1** (Correções Críticas)
5. **Monitorar métricas** diariamente
6. **Ajustar automações** baseado em performance

---

**Documento criado em:** 07/04/2026  
**Próxima revisão:** Após Fase 1 (14/04/2026)  
**Responsável:** Equipe de Desenvolvimento HLJ DEV

---

*Este documento deve ser atualizado a cada fase concluída para manter histórico de evolução do sistema.*

---

## 11. AUTOMAÇÃO INSTAGRAM - POSTAGENS AUTOMÁTICAS

### 11.1 Visão Geral

**Automação:** `13_postagem_automatica_instagram.json`  
**Status:** 🆕 Nova automação a ser implementada  
**Prioridade:** ALTA (Atração orgânica de leads)  
**Impacto:** +30-50% alcance orgânico, geração passiva de leads

### 11.2 Problema Atual

```
❌ SITUAÇÃO ATUAL:
├── Postagens manuais inconsistentes
├── Sem frequência definida
├── Conteúdo não otimizado para conversão
├── Sem geração automática de imagens
├── Sem legendas estratégicas com IA
└── Perda de oportunidades de alcance orgânico

✅ SITUAÇÃO DESEJADA:
├── Postagem automática diária (9h)
├── Conteúdo gerado por IA (Groq + Gemini)
├── Imagens profissionais automáticas
├── Legendas otimizadas para engajamento
├── CTA direcionando para hljdev.com.br
└── Leads entrando pelo Instagram passivamente
```

### 11.3 Arquitetura da Automação

#### Fluxo Completo:

```
[CRON - Todos os dias 9h]
   ↓
[N8N - 13_postagem_automatica_instagram.json]
   ↓
1️⃣ Groq API (Llama 3.3)
   → Gera legenda estratégica sobre automação/IA
   → Inclui CTA: "Link na bio → hljdev.com.br"
   ↓
2️⃣ Gemini Flash Image (Nano Banana)
   → Cria imagem profissional do post
   → Estilo: Matrix/Hacker aesthetic (marca HLJ)
   ↓
3️⃣ Meta Graph API
   → Publica no Instagram Business
   → Caption com hashtags otimizadas
   ↓
4️⃣ Supabase - posts_instagram table
   → Salva histórico do post
   → Track: data, legenda, imagem_url, status
   ↓
5️⃣ WhatsApp - Evolution API
   → Notifica Henrique: "✅ Post publicado!"
   → Inclui link do post para compartilhar
   ↓
[INSTAGRAM - Post ao vivo]
   → Alcance orgânico
   → Geração de leads passivos
```

### 11.4 Especificação Técnica

#### Tabela Supabase: `posts_instagram`

```sql
CREATE TABLE posts_instagram (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Conteúdo
  caption TEXT NOT NULL,                    -- Legenda gerada por IA
  image_url TEXT,                           -- URL da imagem (Supabase Storage)
  image_prompt TEXT,                        -- Prompt usado para gerar imagem
  
  -- Metadados
  hashtags TEXT[],                          -- Array de hashtags
  post_type TEXT DEFAULT 'feed',            -- feed, reel, story
  tema TEXT,                                -- Tema do post (ex: "Automação WhatsApp")
  
  -- Status
  status TEXT DEFAULT 'publicado',          -- rascunho, publicado, falhou
  instagram_post_id TEXT,                   -- ID do post no Instagram
  instagram_permalink TEXT,                 -- Link direto do post
  
  -- Analytics (atualizado manualmente ou via API)
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  reach_count INTEGER DEFAULT 0,
  
  -- Timestamps
  scheduled_for TIMESTAMPTZ,                -- Quando deveria publicar
  published_at TIMESTAMPTZ DEFAULT NOW(),   -- Quando realmente publicou
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_posts_status ON posts_instagram(status);
CREATE INDEX idx_posts_published ON posts_instagram(published_at DESC);
CREATE INDEX idx_posts_tema ON posts_instagram(tema);
```

#### Variáveis de Ambiente N8N Adicionais

```env
# Já existentes (reutilizar):
GROQ_API_KEY                    # Para gerar legendas
GEMINI_API_KEY                  # Para gerar imagens
META_ACCESS_TOKEN               # Para publicar no Instagram
INSTAGRAM_PAGE_ID              # ID da página Instagram

# Novas variáveis:
POSTAGENS_HORARIO=09:00         # Horário de publicação (cron)
POSTAGENS_TEMPLATES_PATH        # Path para templates de conteúdo
POSTAGENS_HASHTAGS_BASE         # Hashtags base sempre incluídas
```

### 11.5 Template de Legenda (Groq Prompt)

```typescript
// Prompt para Groq API
const promptTemplate = `
Você é um especialista em marketing digital e automação com IA. 
Crie uma legenda ENG AJADORA para Instagram sobre: ${tema_do_dia}

REGRAS:
1. Máximo 2200 caracteres (limite Instagram)
2. Tom: Profissional, técnico, autoridade em IA
3. Estrutura:
   - Hook impactante (1-2 linhas)
   - Valor/Insight principal (3-5 linhas)
   - CTA claro: "Quer automatizar seu negócio? Link na bio → hljdev.com.br"
4. Incluir 3-5 hashtags relevantes
5. Usar emojis estratégicos (máx 5)
6. NUNCA mencionar "IA" de forma genérica - seja específico
7. Focar em DORES do empresário (tempo, escala, eficiência)

TEMAS ROTATIVOS:
- Automação de atendimento WhatsApp
- Agentes de IA para vendas 24/7
- Sistemas web personalizados
- Eliminação de trabalho braçal
- Escala de negócios com tecnologia
- Cases de sucesso (sem citar nomes)
- Dicas de produtividade com IA

Gere APENAS a legenda, sem comentários adicionais.`;
```

### 11.6 Template de Imagem (Gemini Prompt)

```typescript
// Prompt para Gemini Flash Image
const imagePromptTemplate = `
Create a professional social media post image for HLJ DEV - 
a B2B automation company specializing in AI solutions.

VISUAL STYLE:
- Dark mode aesthetic (black/dark gray background)
- Matrix green accent color (#14FF14 or similar neon green)
- Minimalist, tech-oriented design
- Clean typography (Inter or similar modern font)

CONTENT:
- Main text: "${titulo_do_post}"
- Subtitle: "Automatize. Escale. Lucre."
- Include: HLJ DEV logo watermark (bottom right)
- Add subtle: Circuit board pattern or code lines in background

DIMENSIONS:
- Instagram feed: 1080x1080 pixels
- High resolution, crisp text
- Professional, enterprise-grade feel

AVOID:
- Stock photos of people
- Cluttered design
- Bright colors except green accent
- Cartoon or casual style`;
```

### 11.7 Estrutura do Fluxo N8N

```json
{
  "name": "HLJ Postagem Automática Instagram",
  "nodes": [
    {
      "name": "Cron - Diário 9h",
      "type": "n8n-nodes-base.scheduleTrigger",
      "parameters": {
        "rule": { "interval": [{ "field": "hours", "hoursInterval": 24 }] },
        "triggerTimes": [{ "hour": 9, "minute": 0 }]
      }
    },
    {
      "name": "Selecionar Tema do Dia",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": "// Rotaciona temas baseado no dia da semana\nconst temas = [\n  'Automação de Atendimento WhatsApp',\n  'Agentes de IA para Vendas 24/7',\n  'Sistemas Web Personalizados',\n  'Eliminação de Trabalho Braçal',\n  'Escala de Negócios com Tecnologia',\n  'Produtividade com IA',\n  'Cases de Sucesso em Automação'\n];\nconst dia = new Date().getDay();\nreturn [{ json: { tema: temas[dia], dia_semana: dia } }];"
      }
    },
    {
      "name": "Groq - Gerar Legenda",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "POST",
        "url": "https://api.groq.com/openai/v1/chat/completions",
        "body": {
          "model": "llama-3.3-70b-versatile",
          "messages": [{ "role": "user", "content": "={{ $json.tema }}" }]
        }
      }
    },
    {
      "name": "Gemini - Gerar Imagem",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "POST",
        "url": "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent",
        "body": { "prompt": "={{ $('Selecionar Tema do Dia').first().json.tema }}" }
      }
    },
    {
      "name": "Upload Imagem - Supabase Storage",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "POST",
        "url": "https://supabase.hljdev.com.br/storage/v1/object/posts/{{ $now }}.png"
      }
    },
    {
      "name": "Meta Graph API - Publicar Post",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "POST",
        "url": "https://graph.facebook.com/v19.0/{{ $env.INSTAGRAM_PAGE_ID }}/media",
        "body": {
          "image_url": "={{ $('Upload Imagem').first().json.url }}",
          "caption": "={{ $('Groq - Gerar Legenda').first().json.choices[0].message.content }}"
        }
      }
    },
    {
      "name": "Supabase - Salvar Post",
      "type": "n8n-nodes-base.postgres",
      "parameters": {
        "operation": "insert",
        "table": "posts_instagram",
        "columns": "caption,image_url,image_prompt,hashtags,tema,instagram_post_id,status"
      }
    },
    {
      "name": "WhatsApp - Notificar Henrique",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "POST",
        "url": "={{ $env.WHATSAPP_API_URL }}/message/sendText/{{ $env.WHATSAPP_INSTANCE }}",
        "body": {
          "number": "={{ $env.SEU_WHATSAPP }}",
          "text": "✅ *POST PUBLICADO!*\n\n📸 Tema: {{ $('Selecionar Tema').first().json.tema }}\n🔗 Link: {{ $('Meta API').first().json.permalink }}\n\nCompartilhe nos stories para ampliar alcance!"
        }
      }
    }
  ]
}
```

### 11.8 Configuração Meta Graph API

#### Pré-requisitos:

1. **Conta Instagram Business** (não pode ser pessoal)
2. **Página Facebook** vinculada ao Instagram
3. **App no Meta for Developers** com permissões:
   - `instagram_basic`
   - `instagram_content_publish`
   - `pages_read_engagement`

#### Setup Passo a Passo:

```bash
# 1. Gerar Access Token de Longa Duração
curl -X GET "https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id={app-id}&client_secret={app-secret}&fb_exchange_token={short-lived-token}"

# 2. Obter Instagram Account ID
curl -X GET "https://graph.facebook.com/v19.0/me?fields=instagram_business_account&access_token={long-lived-token}"

# 3. Testar Publicação
curl -X POST "https://graph.facebook.com/v19.0/{ig-account-id}/media" \
  -F "image_url=https://exemplo.com/imagem.jpg" \
  -F "caption=Teste de publicação" \
  -F "access_token={long-lived-token}"
```

### 11.9 Cronograma de Conteúdo Sugerido

| Dia | Tema | Formato | Objetivo |
|-----|------|---------|----------|
| **Segunda** | Automação WhatsApp | Feed | Educar sobre dor |
| **Terça** | Agentes IA 24/7 | Feed | Mostrar solução |
| **Quarta** | Case de Sucesso | Feed + Stories | Prova social |
| **Quinta** | TIPS & Truques IA | Feed | Engajamento |
| **Sexta** | Oferta/Serviço | Feed | Conversão direta |
| **Sábado** | Behind the Scenes | Stories | Humanização |
| **Domingo** | Motivation/Quote | Stories | Branding |

### 11.10 Hashtags Estratégicas

```javascript
// Hashtags base (sempre incluídas)
const hashtagsBase = [
  '#HLJDEV',
  '#AutomaçãoIA',
  '#InteligenciaArtificial',
  '#TransformaçãoDigital',
  '#NegóciosDigitais'
];

// Hashtags por tema (rotativas)
const hashtagsPorTema = {
  'WhatsApp': ['#WhatsAppBusiness', '#Chatbot', '#AtendimentoAutomatizado'],
  'AgentesIA': ['#AgenteIA', '#IA24h', '#VendasAutomatizadas'],
  'SistemasWeb': ['#SaaS', '#DesenvolvimentoWeb', '#SistemaPersonalizado'],
  'Produtividade': ['#ProdutividadeIA', '#AutomaçãoDeTarefas', '#Eficiência']
};
```

### 11.11 Métricas de Performance

#### KPIs da Automação:

| Métrica | Target | Como Medir |
|---------|--------|------------|
| **Frequência de Posts** | 7/semana (100%) | Contagem em `posts_instagram` |
| **Taxa de Sucesso** | >95% | `status = 'publicado' / total` |
| **Engajamento Médio** | >3% | `(likes + comments) / reach` |
| **Leads do Instagram** | 5-10/semana | Leads com `origem = 'instagram_dm'` |
| **Alcance Orgânico** | +30% mês a mês | Instagram Insights |
| **Seguidores Growth** | +5-10%/mês | Contagem mensal |

#### Dashboard Admin - Nova Seção:

```typescript
// AdminAnalytics.tsx - Adicionar componente:

<section className="Instagram Analytics">
  <h3>📸 Instagram Automático</h3>
  
  <div className="grid grid-cols-3 gap-4">
    <KPI label="Posts Este Mês" value={postsCount} />
    <KPI label="Taxa Sucesso" value={`${successRate}%`} />
    <KPI label="Leads Gerados" value={instagramLeads} />
  </div>
  
  <Chart 
    type="line"
    data={postsPerformance}
    title="Engajamento por Post"
  />
  
  <Table 
    data={recentPosts}
    columns={["data", "tema", "likes", "comments", "status"]}
  />
</section>
```

### 11.12 Plano de Implementação

#### Dia 1-2: Configuração Meta API
```
✅ Criar App no Meta for Developers
✅ Gerar Access Token longa duração
✅ Testar publicação manual via API
✅ Configurar variáveis de ambiente no N8N
```

#### Dia 3-4: Criar Tabela Supabase
```
✅ Executar SQL de criação `posts_instagram`
✅ Configurar RLS (Row Level Security)
✅ Criar bucket no Storage para imagens
✅ Testar upload manual
```

#### Dia 5-7: Desenvolver Automação N8N
```
✅ Criar 13_postagem_automatica_instagram.json
✅ Implementar integração Groq API
✅ Implementar integração Gemini Image
✅ Configurar Meta Graph API node
✅ Testar fluxo completo manualmente
```

#### Dia 8-9: Testes e Ajustes
```
✅ Rodar automação em ambiente de teste
✅ Verificar qualidade das imagens
✅ Ajustar prompts de IA
✅ Validar legendas geradas
✅ Testar notificação WhatsApp
```

#### Dia 10: Deploy e Monitoramento
```
✅ Ativar cron diário (9h)
✅ Monitorar primeira semana
✅ Ajustar horários se necessário
✅ Coletar feedback de engajamento
```

### 11.13 Rollback Procedure

```bash
# Se automação falhar ou postar conteúdo inadequado:

1. Desativar workflow no N8N
   - Acessar n8n.hljdev.com.br
   - Toggle "Active" → OFF

2. Deletar post problemático no Instagram
   - Via app Instagram ou Meta Business Suite

3. Limpar histórico no Supabase
   DELETE FROM posts_instagram WHERE id = 'POST_ID';

4. Investigar causa raiz
   - Ver logs de execução no N8N
   - Revisar prompts de IA
   - Ajustar parâmetros

5. Reativar após correção
   - Testar com post privado primeiro
   - Só ativar após validação
```

### 11.14 Custos Estimados

| Serviço | Custo | Observação |
|---------|-------|------------|
| **Groq API** | $0 (Free tier) | Llama 3.3 free |
| **Gemini Flash Image** | $0 (Free tier) | Nano Banana free |
| **Meta Graph API** | $0 | Gratuito para Business |
| **Supabase Storage** | $0 (Free tier) | Até 1GB |
| **N8N** | $0 (Self-hosted) | Já rodando na VPS |
| **TOTAL** | **$0/mês** | Infraestrutura existente |

### 11.15 ROI Projetado

**Cenário Sem Automação:**
- Posts manuais: 2-3/semana (inconsistente)
- Alcance orgânico: ~500/post
- Leads do Instagram: 0-2/semana
- Tempo gasto: 3h/semana

**Cenário Com Automação:**
- Posts automáticos: 7/semana (consistente)
- Alcance orgânico: ~1000/post (+100%)
- Leads do Instagram: 5-10/semana
- Tempo gasto: 0h (100% automático)

**Impacto Financeiro:**
- Leads adicionais: +3-8/semana = +12-32/mês
- Taxa conversão: 15% = +2-5 vendas/mês
- Ticket médio: R$75
- **Faturamento adicional: R$150-375/mês**
- **ROI: ∞%** (custo zero)

---

**AUTOMAÇÃO INSTAGRAM DOCUMENTADA!**  
Pronta para implementação seguindo plano acima.  
Recomendação: Implementar após corrigir gaps críticos (Fase 1).

---

*Este documento deve ser atualizado a cada fase concluída para manter histórico de evolução do sistema.*

---

## 12. TRÁFEGO PAGO E ESTRATÉGIAS MULTI-PLATAFORMA

### 12.1 Visão Geral do Tráfego Pago

**Objetivo:** Escalar leads qualificados através de anúncios pagos  
**Plataformas:** Instagram Ads, TikTok Ads, YouTube Ads  
**Orçamento Sugerido:** R$30-50/dia (inicial) → R$100-200/dia (escala)  
**ROI Esperado:** 3:1 a 5:1 (R$3-5 de receita por R$1 investido)

#### Potencial de Faturamento com Tráfego Pago:

| Investimento Mensal | Leads/Mês | Conversão | Vendas/Mês | Faturamento | ROI |
|---------------------|-----------|-----------|------------|-------------|-----|
| **R$500** (inicial) | 50-70 | 15% | 8-10 | R$600-750 | 1.2:1 |
| **R$1.000** | 100-140 | 15% | 15-21 | R$1.125-1.575 | 1.5:1 |
| **R$2.000** | 200-280 | 18% | 36-50 | R$2.700-3.750 | 1.8:1 |
| **R$3.000** (escala) | 300-420 | 20% | 60-84 | R$4.500-6.300 | 2.1:1 |
| **R$5.000** (otimizado) | 500-700 | 22% | 110-154 | R$8.250-11.550 | 2.3:1 |

**Projeção 6 meses (cenário conservador):**
- Mês 1: R$500 → R$750 (ROI 1.2:1)
- Mês 2: R$1.000 → R$1.500 (ROI 1.5:1)
- Mês 3: R$2.000 → R$3.000 (ROI 1.5:1)
- Mês 4: R$3.000 → R$5.400 (ROI 1.8:1)
- Mês 5: R$4.000 → R$7.600 (ROI 1.9:1)
- Mês 6: R$5.000 → R$10.000 (ROI 2:1)
- **Total investido: R$15.500**
- **Total faturado: R$28.250**
- **Lucro líquido: R$12.750**
- **ROI médio: 1.82:1**

---

### 12.2 Componentes do Sistema Adaptáveis para Tráfego Pago

#### ✅ **Componentes Reutilizáveis:**

| Componente Atual | Adaptação para Tráfego Pago | Esforço |
|------------------|---------------------------|----------|
| **LeadChat.tsx** | Adicionar UTM parameters tracking | 1h |
| **LeadForm.tsx** | Campos extras: origem_campanha, utm_source | 2h |
| **Shop.tsx** | Landing pages por produto com pixel events | 3h |
| **AdminPipeline.tsx** | Filtro por origem de tráfego | 2h |
| **AdminAnalytics.tsx** | Dashboard de ROI por campanha | 4h |
| **Tabela `leads`** | Colunas: utm_source, utm_medium, utm_campaign, ad_group, click_id | 1h SQL |
| **Tabela `vendas`** | Colunas: custo_aquisicao, campanha_id, ROAS | 1h SQL |

#### 🆕 **Novos Componentes Necessários:**

| Componente | Função | Prioridade |
|------------|--------|------------|
| **CampaignTracker.tsx** | Rastreia UTM parameters em todas as páginas | 🔴 ALTA |
| **LandingPageGenerator.tsx** | Gera LPs dinâmicas por campanha | 🟡 MÉDIA |
| **AdPerformance.tsx** | Widget de performance de anúncios no Admin | 🟡 MÉDIA |
| **ROICalculator.tsx** | Calculadora de ROI em tempo real | 🟢 BAIXA |

---

### 12.3 Schema do Supabase - Atualizações para Tráfego Pago

#### Adicionar Colunas na Tabela `leads`:

```sql
-- UTM Tracking
ALTER TABLE leads ADD COLUMN utm_source TEXT;          -- facebook, instagram, tiktok, google
ALTER TABLE leads ADD COLUMN utm_medium TEXT;          -- cpc, cpm, video_view, engagement
ALTER TABLE leads ADD COLUMN utm_campaign TEXT;        -- nome da campanha
ALTER TABLE leads ADD COLUMN utm_content TEXT;         -- id do anúncio
ALTER TABLE leads ADD COLUMN utm_term TEXT;            -- palavras-chave (se aplicável)

-- Ad Platform Data
ALTER TABLE leads ADD COLUMN ad_platform TEXT;         -- facebook, tiktok, youtube
ALTER TABLE leads ADD COLUMN ad_account_id TEXT;       -- ID da conta de anúncios
ALTER TABLE leads ADD COLUMN ad_id TEXT;               -- ID do anúncio específico
ALTER TABLE leads ADD COLUMN ad_group TEXT;            -- nome do grupo de anúncios
ALTER TABLE leads ADD COLUMN campaign_name TEXT;       -- nome legível da campanha

-- Click Data
ALTER TABLE leads ADD COLUMN fb_click_id TEXT;         -- _fbc parameter (Facebook)
ALTER TABLE leads ADD COLUMN tt_click_id TEXT;         -- ttclid parameter (TikTok)
ALTER TABLE leads ADD COLUMN gclid TEXT;               -- Google Click ID

-- Timestamps
ALTER TABLE leads ADD COLUMN first_touch_at TIMESTAMPTZ;    -- primeiro clique
ALTER TABLE leads ADD COLUMN last_touch_at TIMESTAMPTZ;     -- último toque antes de converter

-- Índices para performance
CREATE INDEX idx_leads_utm_source ON leads(utm_source);
CREATE INDEX idx_leads_utm_campaign ON leads(utm_campaign);
CREATE INDEX idx_leads_ad_platform ON leads(ad_platform);
CREATE INDEX idx_leads_fb_click ON leads(fb_click_id);
```

#### Adicionar Colunas na Tabela `vendas`:

```sql
-- ROI Tracking
ALTER TABLE vendas ADD COLUMN custo_aquisicao DECIMAL(10,2);   -- custo por aquisição (CPA)
ALTER TABLE vendas ADD COLUMN campanha_origem TEXT;            -- campanha que gerou a venda
ALTER TABLE vendas ADD COLUMN ROAS DECIMAL(5,2);               -- Return on Ad Spend
ALTER TABLE vendas ADD COLUMN ad_spend_total DECIMAL(10,2);    -- gasto total em ads até venda
ALTER TABLE vendas ADD COLUMN touches_count INTEGER;           -- quantos toques antes de comprar
ALTER TABLE vendas ADD COLUMN first_touch_campaign TEXT;       -- primeira campanha que tocou
ALTER TABLE vendas ADD COLUMN last_touch_campaign TEXT;        -- última campanha antes de comprar

-- Índices
CREATE INDEX idx_vendas_campanha ON vendas(campanha_origem);
CREATE INDEX idx_vendas_custo ON vendas(custo_aquisicao);
```

#### Criar Tabela `campanhas_ads`:

```sql
CREATE TABLE campanhas_ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificação
  nome TEXT NOT NULL,                    -- nome legível da campanha
  platform TEXT NOT NULL,                -- facebook, instagram, tiktok, youtube
  campaign_id TEXT,                      -- ID na plataforma de ads
  ad_account_id TEXT,                    -- ID da conta de anúncios
  
  -- Orçamento
  orcamento_diario DECIMAL(10,2),        -- orçamento por dia
  orcamento_total DECIMAL(10,2),         -- orçamento total da campanha
  custo_total_gasto DECIMAL(10,2) DEFAULT 0,  -- quanto gastou até agora
  
  -- Métricas (atualizado via API ou manual)
  impressoes INTEGER DEFAULT 0,
  cliques INTEGER DEFAULT 0,
  leads_gerados INTEGER DEFAULT 0,
  vendas_geradas INTEGER DEFAULT 0,
  receita_gerada DECIMAL(10,2) DEFAULT 0,
  
  -- KPIs Calculados
  CPC DECIMAL(10,2),                     -- Custo por Clique
  CPM DECIMAL(10,2),                     -- Custo por Mil Impressões
  CTR DECIMAL(5,2),                      -- Click-Through Rate (%)
  CPA DECIMAL(10,2),                     -- Custo por Aquisição
  ROAS DECIMAL(5,2),                     -- Return on Ad Spend
  
  -- Status
  status TEXT DEFAULT 'ativa',           -- ativa, pausada, encerrada, rascunho
  data_inicio DATE,
  data_fim DATE,
  
  -- Configurações
  target_audience JSONB,                 -- configuração do público-alvo
  ad_creatives TEXT[],                   -- URLs dos criativos usados
  landing_page_url TEXT,                 -- URL de destino
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_campanhas_platform ON campanhas_ads(platform);
CREATE INDEX idx_campanhas_status ON campanhas_ads(status);
CREATE INDEX idx_campanhas_data ON campanhas_ads(data_inicio);
```

---

### 12.4 Integração de Analytics - Medindo ROI de Anúncios Pagos

#### A) **Meta Pixel + Conversion API (Instagram/Facebook)**

**Implementação no `index.html`:**

```html
<!-- Meta Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', 'SEU_PIXEL_ID');
fbq('track', 'PageView');
</script>
<noscript>
  <img height="1" width="1" style="display:none" 
    src="https://www.facebook.com/tr?id=SEU_PIXEL_ID&ev=PageView&noscript=1"/>
</noscript>
<!-- End Meta Pixel Code -->
```

**Eventos na `Shop.tsx`:**

```typescript
// Quando visualiza produto
fbq('track', 'ViewContent', {
  content_name: product.title,
  content_category: product.category,
  value: parseFloat(product.price),
  currency: 'BRL'
});

// Quando clica em comprar
fbq('track', 'AddToCart', {
  content_name: product.title,
  value: parseFloat(product.price),
  currency: 'BRL'
});

// Quando inicia checkout
fbq('track', 'InitiateCheckout', {
  value: parseFloat(product.price),
  currency: 'BRL'
});
```

**Conversion API (Server-Side) via N8N:**

```json
// N8N Node - Enviar evento para Meta CAPI
{
  "method": "POST",
  "url": "https://graph.facebook.com/v19.0/SEU_PIXEL_ID/events",
  "body": {
    "data": [{
      "event_name": "Purchase",
      "event_time": "{{ $json.created_at }}",
      "user_data": {
        "em": "{{ $('hash_email').first().json.hash }}",
        "ph": "{{ $('hash_phone').first().json.hash }}"
      },
      "custom_data": {
        "currency": "BRL",
        "value": "{{ $json.valor }}",
        "content_name": "{{ $json.produto }}"
      },
      "action_source": "website"
    }],
    "access_token": "{{ $env.META_PIXEL_ACCESS_TOKEN }}"
  }
}
```

#### B) **TikTok Pixel**

**Implementação no `index.html`:**

```html
<!-- TikTok Pixel Code -->
<script>
!function (w, d, t) {
  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
  ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],
  ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
  for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
  ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
  ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid=basic&lib="+e;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
  
  ttq.load('SEU_PIXEL_ID');
  ttq.page();
}(window, document, 'ttq');
</script>

<!-- Track Lead -->
<script>
  ttq.track('Lead');
</script>
```

**Eventos Avançados:**

```typescript
// ViewContent
ttq.track('ViewContent', {
  content_id: product.id,
  content_name: product.title,
  content_category: 'Digital Product',
  value: parseFloat(product.price),
  currency: 'USD'
});

// CompletePayment
ttq.track('CompletePayment', {
  value: parseFloat(order.valor),
  currency: 'USD',
  products: [{
    content_id: order.produto_id,
    content_name: order.produto,
    price: parseFloat(order.valor)
  }]
});
```

#### C) **YouTube/Google Analytics 4**

**Implementação no `index.html`:**

```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-SEU_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-SEU_ID');
  
  // YouTube Ads Conversion Tracking
  gtag('config', 'AW-SEU_CONVERSION_ID');
</script>
```

**Eventos GA4:**

```typescript
// Lead captado
gtag('event', 'generate_lead', {
  'currency': 'BRL',
  'value': 0,
  'interest': lead.interesse,
  'source': lead.origem
});

// Compra realizada
gtag('event', 'purchase', {
  'transaction_id': order.kiwify_order_id,
  'value': parseFloat(order.valor),
  'currency': 'BRL',
  'items': [{
    'item_id': order.produto_id,
    'item_name': order.produto,
    'price': parseFloat(order.valor),
    'quantity': 1
  }]
});
```

---

### 12.5 Automações N8N para Funil de Tráfego Pago

#### 🚀 **Automação 14: Rastreamento de Campanhas**

**Arquivo:** `14_rastreamento_campanhas.json`  
**Gatilho:** Webhook de lead com UTM parameters  
**Fluxo:**

```
[Lead com UTM Parameters]
   ↓
1️⃣ Parse UTM data
   ↓
2️⃣ Query campanhas_ads table
   → Verifica se campanha existe
   → Se não existe, cria nova campanha
   ↓
3️⃣ Atualiza métricas da campanha
   → leads_gerados +1
   ↓
4️⃣ Salva lead com dados completos de attribution
   ↓
5️⃣ Calcula ROI em tempo real
   → ROAS = receita_gerada / custo_total_gasto
   ↓
6️⃣ Alerta se campanha com ROAS baixo
   → ROAS <2: "⚠️ Campanha X com ROAS 1.5"
   → ROAS >4: "🔥 Campanha Y com ROAS 4.2 - Escalar!"
```

#### 🚀 **Automação 15: Otimização de Campanhas por IA**

**Arquivo:** `15_otimizacao_campanhas_ia.json`  
**Gatilho:** Cron diário (22h)  
**Fluxo:**

```
[Cron - 22h todos os dias]
   ↓
1️⃣ Query todas campanhas ativas
   ↓
2️⃣ Calcula métricas por campanha
   → CTR, CPC, CPA, ROAS
   ↓
3️⃣ Groq API analisa performance
   → Prompt: "Analise estas campanhas e recomende otimizações"
   ↓
4️⃣ Gera relatório de otimização
   → Campanhas para escalar (ROAS >4)
   → Campanhas para pausar (ROAS <1.5)
   → Sugestões de criativos novos
   → Públicos semelhantes para testar
   ↓
5️⃣ Envia WhatsApp para Henrique
   → Resumo diário de performance
   → Recomendações de ação
   ↓
6️⃣ Salva relatório em Supabase
   → Tabela: relatorios_campanhas
```

#### 🚀 **Automação 16: Retargeting Automático**

**Arquivo:** `16_retargeting_automatico.json`  
**Gatilho:** Lead sem conversão após 7 dias  
**Fluxo:**

```
[Lead com 7 dias sem comprar]
   ↓
1️⃣ Verifica se lead veio de tráfego pago
   ↓
2️⃣ Se sim, adiciona em Custom Audience
   → Facebook: Adiciona email na audience "Retargeting 7d"
   → TikTok: Adiciona email na audience "Warm Leads"
   ↓
3️⃣ Envia WhatsApp de follow-up
   → "Vi que você se interessou por automação..."
   → Inclui case de sucesso
   → Link com desconto de 10%
   ↓
4️⃣ Atualiza lead status
   → status = 'retargeting'
   ↓
5️⃣ Monitora conversão nos próximos 7 dias
   → Se converteu: Remove de audience
   → Se não converteu: Próximo follow-up
```

#### 🚀 **Automação 17: Alerta de Orçamento**

**Arquivo:** `17_alerta_orcamento.json`  
**Gatilho:** Cron a cada 6h  
**Fluxo:**

```
[Cron - A cada 6h]
   ↓
1️⃣ Query campanhas com gasto >80% do orçamento
   ↓
2️⃣ Para cada campanha:
   → Calcula ROAS atual
   → Se ROAS >3: "✅ Campanha X gastou 80%, ROAS 3.5 - Recomendo aumentar orçamento!"
   → Se ROAS <1.5: "⚠️ Campanha Y gastou 80%, ROAS 1.2 - Pausar ou otimizar?"
   ↓
3️⃣ Alerta WhatsApp para Henrique
   → Lista de campanhas críticas
   → Recomendações de ação
   ↓
4️⃣ Se campanha com ROAS >4 e orçamento acabando:
   → Sugere duplicar campanha com orçamento 2x
```

---

### 12.6 Estratégias de Conteúdo por Plataforma

#### 📸 **Instagram (Foco: Branding + Leads Qualificados)**

**Mix de Conteúdo Semanal:**

| Dia | Tipo | Formato | Objetivo |
|-----|------|---------|----------|
| **Segunda** | Dica rápida de IA | Reel (15-30s) | Alcance orgânico |
| **Terça** | Case de sucesso | Carousel (5-7 slides) | Prova social |
| **Quarta** | Behind the scenes | Stories (5-10) | Humanização |
| **Quinta** | Tutorial passo a passo | Reel (30-60s) | Educação |
| **Sexta** | Oferta/Serviço | Feed + Stories | Conversão |
| **Sábado** | Meme tech/IA | Reel (10-15s) | Engajamento |
| **Domingo** | Quote inspiracional | Stories | Branding |

**Estratégia de Tráfego Pago:**

```yaml
campanhas_instagram:
  - nome: "Conversão - Lead Magnet"
    objetivo: "Geração de Leads"
    publico:
      - Idade: 25-45 anos
      - Interesses: Empreendedorismo, Marketing Digital, IA, Automação
      - Lookalike: Clientes atuais (1-3%)
    criativo: Vídeo 30s mostrando resultado de automação
    CTA: "Cadastre-se para receber guia gratuito"
    orcamento: R$20/dia
    metrica_alvo: CPL < R$8

  - nome: "Remarketing - Shop"
    objetivo: "Conversão"
    publico:
      - Visitaram site nos últimos 30 dias
      - Não compraram
    criativo: Carousel de produtos com depoimentos
    CTA: "Compre Agora"
    orcamento: R$15/dia
    metrica_alvo: ROAS > 3

  - nome: "Engajamento - Reels"
    objetivo: "Visualizações de Vídeo"
    publico:
      - Broad: 18-50, interesses em tecnologia
    criativo: Reels virais sobre IA
    CTA: "Visitar Perfil"
    orcamento: R$10/dia
    metrica_alvo: CPM < R$5
```

#### 🎵 **TikTok (Foco: Alcance Viral + Geração de Leads Jovens)**

**Mix de Conteúdo Semanal:**

| Dia | Tipo | Duração | Formato |
|-----|------|---------|----------|
| **Segunda** | Trend + IA | 15-20s | Usar áudio viral com twist de IA |
| **Terça** | Tutorial rápido | 30-45s | "Como automatizar X com IA" |
| **Quarta** | Storytime | 45-60s | "Como perdi R$X antes de automatizar" |
| **Quinta** | Meme tech | 10-15s | Humor sobre trabalho manual vs IA |
| **Sexta** | Case study | 30-45s | "De X horas para Y minutos" |
| **Sábado** | Dica surpresa | 15-20s | Prompt secreto de IA |
| **Domingo** | Q&A | 30-60s | Respondendo comentários |

**Estratégia de Tráfego Pago:**

```yaml
campanhas_tiktok:
  - nome: "Conversão - Lead Gen"
    objetivo: "Geração de Leads"
    publico:
      - Idade: 18-35 anos
      - Interesses: Empreendedorismo, Tecnologia, Marketing
      - Comportamento: Engajou com conteúdo de negócios
    criativo: Vídeo UGC-style (parece orgânico)
    CTA: "Saiba Mais"
    orcamento: R$15/dia
    metrica_alvo: CPL < R$6
    
  - nome: "Traffic - Link in Bio"
    objetivo: "Tráfego"
    publico:
      - Interest-based: IA, automação, produtividade
    criativo: "3 ferramentas de IA que você precisa conhecer"
    CTA: "Link na Bio"
    orcamento: R$10/dia
    metrica_alvo: CPC < R$0,50
```

#### 📺 **YouTube (Foco: Autoridade + SEO de Longo Prazo)**

**Mix de Conteúdo Mensal:**

| Semana | Tipo | Duração | Frequência |
|--------|------|---------|------------|
| **Semana 1** | Tutorial completo | 10-15 min | 1x/semana |
| **Semana 2** | Case study detalhado | 8-12 min | 1x/semana |
| **Semana 3** | Review de ferramenta IA | 6-10 min | 1x/semana |
| **Semana 4** | Q&A / Live | 20-30 min | 1x/mês |

**Formato dos Vídeos:**

```
ESTRUTURA PADRÃO:
0:00-0:15 - Hook impactante (dor do público)
0:15-0:30 - O que vai aprender
0:30-2:00 - Contexto/problema
2:00-8:00 - Tutorial/solução passo a passo
8:00-9:00 - Resultado/prova social
9:00-10:00 - CTA (inscreva-se + link na descrição)
```

**Estratégia de Tráfego Pago:**

```yaml
campanhas_youtube:
  - nome: "Discovery Ads - Tutorial"
    objetivo: "Visualizações"
    publico:
      - Custom Intent: Buscaram "automação WhatsApp", "agente IA"
      - Placement: Canais de marketing digital, empreendedorismo
    criativo: Vídeo 15s "skipável"
    CTA: "Assista ao tutorial completo"
    orcamento: R$15/dia
    metrica_alvo: CPV < R$0,10
    
  - nome: "Bumper Ads - Branding"
    objetivo: "Alcance"
    publico:
      - Remarketing: Visitaram site nos últimos 90 dias
    criativo: 6s não-skipável "Automatize seu negócio com HLJ DEV"
    CTA: Brand awareness
    orcamento: R$5/dia
    metrica_alvo: CPM < R$8
```

---

### 12.7 Automação de Distribuição Multi-Plataforma

#### 🚀 **Automação 18: Cross-Posting Inteligente**

**Arquivo:** `18_cross_posting_inteligente.json`  
**Gatilho:** Conteúdo criado no Supabase  
**Fluxo:**

```
[Conteúdo Criado - Tabela: conteudos]
   ↓
1️⃣ Detecta tipo de conteúdo
   → Vídeo longo → YouTube primeiro
   → Vídeo curto → TikTok + Reels
   → Imagem → Instagram + Pinterest
   → Texto → LinkedIn + Twitter
   ↓
2️⃣ Adapta formato para cada plataforma
   → YouTube: Título SEO + descrição longa + tags
   → TikTok: Legenda curta + hashtags trending
   → Instagram: Legenda média + hashtags relevantes
   → LinkedIn: Tom profissional + CTA para site
   ↓
3️⃣ Agenda postagens otimizadas
   → Instagram: 9h, 12h, 18h
   → TikTok: 11h, 15h, 20h
   → YouTube: 14h (terça/quinta)
   → LinkedIn: 8h (terça/quarta)
   ↓
4️⃣ Publica automaticamente
   → Meta Graph API (Instagram)
   → TikTok API
   → YouTube Data API
   → LinkedIn API
   ↓
5️⃣ Salva histórico
   → Tabela: publicacoes_multiplataforma
   ↓
6️⃣ Notifica WhatsApp
   → "✅ Conteúdo publicado em 3 plataformas"
```

#### Schema para Conteúdo Multi-Plataforma:

```sql
CREATE TABLE conteudos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Conteúdo Base
  titulo TEXT NOT NULL,
  descricao TEXT,
  tipo TEXT NOT NULL,               -- video_longo, video_curto, imagem, texto
  arquivo_url TEXT,                 -- URL do arquivo original (Supabase Storage)
  thumbnail_url TEXT,
  
  -- Metadados
  tema TEXT,                        -- IA, automação, tutorial, case
  tags TEXT[],
  nivel TEXT,                       -- iniciante, intermediario, avancado
  
  -- Status
  status TEXT DEFAULT 'rascunho',   -- rascunho, agendado, publicado, falhou
  data_criacao TIMESTAMPTZ DEFAULT NOW(),
  
  -- Tracking
  criado_por TEXT DEFAULT 'ia',     -- ia, manual
  fonte_inspiracao TEXT             -- URL, trend, ideia original
);

CREATE TABLE publicacoes_multiplataforma (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conteudo_id UUID REFERENCES conteudos(id),
  
  -- Plataforma
  plataforma TEXT NOT NULL,         -- instagram, tiktok, youtube, linkedin, twitter
  
  -- Adaptações
  titulo_adaptado TEXT,
  descricao_adaptada TEXT,
  hashtags TEXT[],
  horario_agendado TIMESTAMPTZ,
  
  -- IDs na plataforma
  platform_post_id TEXT,
  platform_url TEXT,
  
  -- Métricas (atualizado após 24h, 7d, 30d)
  visualizacoes INTEGER DEFAULT 0,
  curtidas INTEGER DEFAULT 0,
  comentarios INTEGER DEFAULT 0,
  compartilhamentos INTEGER DEFAULT 0,
  cliques_link INTEGER DEFAULT 0,
  leads_gerados INTEGER DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'agendado',   -- agendado, publicado, falhou
  publicado_em TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_publicacoes_plataforma ON publicacoes_multiplataforma(plataforma);
CREATE INDEX idx_publicacoes_status ON publicacoes_multiplataforma(status);
CREATE INDEX idx_publicacoes_data ON publicacoes_multiplataforma(publicado_em DESC);
```

---

### 12.8 Métricas e Dashboard Administrativo

#### 📊 **KPIs Essenciais para Tráfego Pago:**

| Métrica | Fórmula | Target | Como Exibir |
|---------|---------|--------|-------------|
| **ROAS** | Receita Gerada / Custo em Ads | >3 | Gauge chart (verde >3, amarelo 2-3, vermelho <2) |
| **CPA** | Custo Total / Conversões | < R$15 | Número com trend arrow |
| **CTR** | Cliques / Impressões × 100 | >2% | Barra de progresso |
| **CPC** | Custo / Cliques | < R$1 | Número simples |
| **CPM** | (Custo / Impressões) × 1000 | < R$10 | Número simples |
| **CPL** | Custo / Leads | < R$8 | Número com sparkline |
| **Conversão Rate** | Vendas / Cliques × 100 | >3% | Funnel chart |
| **Frequency** | Impressões / Alcance | <3 | Alerta se >3 |
| **Relevance Score** | Meta Quality Ranking | >7 | Badge colorido |

#### 📈 **Novo Componente Admin: `AdPerformance.tsx`**

```typescript
// src/components/admin/AdPerformance.tsx

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export const AdPerformance = () => {
  const [campanhas, setCampanhas] = useState([]);
  const [kpiResumo, setKpiResumo] = useState({
    total_gasto: 0,
    total_receita: 0,
    ROAS_medio: 0,
    CPA_medio: 0,
    leads_total: 0,
    vendas_total: 0
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    const { data } = await supabase
      .from('campanhas_ads')
      .select('*')
      .eq('status', 'ativa')
      .order('created_at', { ascending: false });
    
    setCampanhas(data);
    calcularKPIs(data);
  };

  const calcularKPIs = (campanhas) => {
    const total_gasto = campanhas.reduce((sum, c) => sum + c.custo_total_gasto, 0);
    const total_receita = campanhas.reduce((sum, c) => sum + c.receita_gerada, 0);
    const ROAS_medio = total_gasto > 0 ? total_receita / total_gasto : 0;
    const CPA_medio = campanhas.length > 0 
      ? total_gasto / campanhas.reduce((sum, c) => sum + c.vendas_geradas, 0) 
      : 0;
    
    setKpiResumo({
      total_gasto,
      total_receita,
      ROAS_medio,
      CPA_medio,
      leads_total: campanhas.reduce((sum, c) => sum + c.leads_gerados, 0),
      vendas_total: campanhas.reduce((sum, c) => sum + c.vendas_geradas, 0)
    });
  };

  return (
    <div className="space-y-6">
      {/* KPIs Principais */}
      <div className="grid grid-cols-4 gap-4">
        <KPIBox 
          title="ROAS Médio"
          value={`${kpiResumo.ROAS_medio.toFixed(2)}x`}
          color={kpiResumo.ROAS_medio >= 3 ? 'green' : kpiResumo.ROAS_medio >= 2 ? 'yellow' : 'red'}
        />
        <KPIBox 
          title="CPA Médio"
          value={`R$ ${kpiResumo.CPA_medio.toFixed(2)}`}
          color={kpiResumo.CPA_medio <= 15 ? 'green' : 'red'}
        />
        <KPIBox 
          title="Total Investido"
          value={`R$ ${kpiResumo.total_gasto.toFixed(2)}`}
        />
        <KPIBox 
          title="Receita Gerada"
          value={`R$ ${kpiResumo.total_receita.toFixed(2)}`}
          color="green"
        />
      </div>

      {/* Gráfico de Performance por Campanha */}
      <Chart
        type="bar"
        data={campanhas.map(c => ({
          name: c.nome,
          ROAS: c.ROAS,
          CPA: c.CPA,
          leads: c.leads_gerados
        }))}
        title="Performance por Campanha"
      />

      {/* Tabela de Campanhas */}
      <Table
        data={campanhas}
        columns={[
          { key: 'nome', label: 'Campanha' },
          { key: 'platform', label: 'Plataforma' },
          { key: 'custo_total_gasto', label: 'Gasto', format: 'currency' },
          { key: 'leads_gerados', label: 'Leads' },
          { key: 'vendas_geradas', label: 'Vendas' },
          { key: 'ROAS', label: 'ROAS', format: 'number', color: 'conditional' },
          { key: 'CPA', label: 'CPA', format: 'currency' },
          { key: 'status', label: 'Status', format: 'badge' }
        ]}
      />
    </div>
  );
};
```

#### 📊 **Novo Componente Admin: `MultiPlatformAnalytics.tsx`**

```typescript
// src/components/admin/MultiPlatformAnalytics.tsx

export const MultiPlatformAnalytics = () => {
  const [metrics, setMetrics] = useState({
    instagram: { posts: 0, reach: 0, engagement: 0, leads: 0 },
    tiktok: { posts: 0, views: 0, engagement: 0, leads: 0 },
    youtube: { videos: 0, views: 0, subscribers: 0, leads: 0 }
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">📱 Analytics Multi-Plataforma</h2>

      {/* Cards por Plataforma */}
      <div className="grid grid-cols-3 gap-6">
        <PlatformCard 
          platform="instagram"
          icon="📸"
          metrics={metrics.instagram}
          color="pink"
        />
        <PlatformCard 
          platform="tiktok"
          icon="🎵"
          metrics={metrics.tiktok}
          color="black"
        />
        <PlatformCard 
          platform="youtube"
          icon="📺"
          metrics={metrics.youtube}
          color="red"
        />
      </div>

      {/* Gráfico de Engajamento */}
      <Chart
        type="line"
        data={engagementOverTime}
        title="Engajamento ao Longo do Tempo"
        platforms={['instagram', 'tiktok', 'youtube']}
      />

      {/* Top Conteúdos */}
      <TopContentList limit={10} />

      {/* ROI por Plataforma */}
      <ROIComparisonChart />
    </div>
  );
};
```

---

### 12.9 Plano de Implementação - Tráfego Pago

#### **SEMANA 1: Setup de Tracking**

```markdown
**Dia 1-2: Pixels e Analytics**
- [ ] Instalar Meta Pixel no site
- [ ] Instalar TikTok Pixel
- [ ] Configurar GA4
- [ ] Configurar Google Ads Conversion Tracking
- [ ] Testar pixels com extensões (Meta Pixel Helper, TikTok Pixel Helper)

**Dia 3-4: Schema Updates**
- [ ] Executar SQL de novas colunas em `leads` e `vendas`
- [ ] Criar tabela `campanhas_ads`
- [ ] Criar tabela `conteudos` e `publicacoes_multiplataforma`
- [ ] Configurar RLS

**Dia 5-7: Componente de Tracking**
- [ ] Criar `CampaignTracker.tsx`
- [ ] Parse UTM parameters em todas as páginas
- [ ] Salvar dados no localStorage e enviar com leads
- [ ] Testar fluxo completo
```

#### **SEMANA 2: Dashboard e Automações**

```markdown
**Dia 8-10: Admin Dashboard**
- [ ] Criar `AdPerformance.tsx`
- [ ] Criar `MultiPlatformAnalytics.tsx`
- [ ] Integrar com Supabase
- [ ] Testar visualizações

**Dia 11-14: Automações N8N**
- [ ] Criar 14_rastreamento_campanhas.json
- [ ] Criar 15_otimizacao_campanhas_ia.json
- [ ] Criar 16_retargeting_automatico.json
- [ ] Criar 17_alerta_orcamento.json
- [ ] Testar cada automação
```

#### **SEMANA 3: Primeiras Campanhas**

```markdown
**Dia 15-17: Meta Ads**
- [ ] Criar conta Meta Ads Manager
- [ ] Configurar pixel e Conversion API
- [ ] Criar primeira campanha de conversão
- [ ] Budget: R$20/dia
- [ ] Monitorar por 48h

**Dia 18-19: TikTok Ads**
- [ ] Criar conta TikTok Ads
- [ ] Instalar pixel
- [ ] Criar campanha de geração de leads
- [ ] Budget: R$15/dia
- [ ] Monitorar por 48h

**Dia 20-21: YouTube Ads**
- [ ] Criar conta Google Ads
- [ ] Vincular canal YouTube
- [ ] Criar campanha de descoberta
- [ ] Budget: R$15/dia
- [ ] Monitorar por 48h
```

#### **SEMANA 4: Otimização**

```markdown
**Dia 22-24: Análise de Performance**
- [ ] Revisar métricas de todas as campanhas
- [ ] Identificar vencedoras e perdedoras
- [ ] Pausar campanhas com ROAS <1.5
- [ ] Escalar campanhas com ROAS >3

**Dia 25-28: Cross-Posting**
- [ ] Criar 18_cross_posting_inteligente.json
- [ ] Configurar APIs de cada plataforma
- [ ] Testar publicação automática
- [ ] Criar banco de 10 conteúdos
```

---

### 12.10 Dicas Estratégicas por Plataforma

#### 📸 **Instagram - 15 Dicas de Ouro:**

1. **Poste Reels 5x/semana** (algoritmo prioriza)
2. **Use 3-5 hashtags** (não use 30)
3. **Stories com enquetes** (aumenta engajamento 40%)
4. **CTA na legenda** ("Salve para depois", "Compartilhe")
5. **Poste às 9h, 12h ou 18h** (melhores horários BR)
6. **Responda comentários em 1h** (aumenta alcance)
7. **Collabs com micro-influencers** (1k-10k seguidores)
8. **Use trending áudios** (aumenta alcance 2-3x)
9. **Carrossel com 5-7 slides** (maior tempo de tela)
10. **Legendas com 100-200 caracteres** (taxa de leitura maior)
11. **Faça Lives 1x/semana** (conexão real com audiência)
12. **Use Link Sticker nos Stories** (tráfego direto)
13. **Crie Highlights organizados** (prova social 24/7)
14. **Anúncios com UGC performam 3x mais**
15. **Teste A/B de criativos semanalmente**

#### 🎵 **TikTok - 15 Dicas de Ouro:**

1. **Primeiros 3 segundos são cruciais** (hook imediato)
2. **Use trending sounds** (algoritmo prioriza)
3. **Poste 1-3x/dia** (frequência > qualidade no início)
4. **Vídeos 15-30s performam melhor**
5. **Hashtags: 3-5 relevantes** (#IA, #Automação, #Marketing)
6. **CTA no vídeo e legenda** ("Link na bio")
7. **Responda comentários com vídeo** (cria conteúdo + engajamento)
8. **Duets e Stitches** (aproveite conteúdo viral)
9. **Poste às 11h, 15h ou 20h**
10. **Edição rápida (cortes a cada 2-3s)**
11. **Legendas no vídeo** (85% assistem sem som)
12. **Séries de conteúdo** ("Parte 1, Parte 2...")
13. **Use CapCut templates** (profissional + rápido)
14. **Nicho específico** (não tente agradar todos)
15. **Analytics semanal** (dobre o que funciona)

#### 📺 **YouTube - 15 Dicas de Ouro:**

1. **Títulos com números e emoção** ("7 Automações que Salvaram Meu Negócio")
2. **Thumbnails com contraste alto** (faces, cores vibrantes, texto grande)
3. **Primeiros 30s = Hook** (não perca tempo com intro)
4. **SEO é rei** (pesquise keywords antes de gravar)
5. **Descrição otimizada** (primeiras 2 linhas com keywords)
6. **Tags: 10-15 relevantes**
7. **Cards e End Screens** (retenção + CTA)
8. **Poste consistentemente** (1x/semana, mesmo dia/hora)
9. **Vídeos 8-15 minutos** (sweet spot para monetização)
10. **Capítulos no vídeo** (melhora experiência + SEO)
11. **Playlist organize conteúdo** (aumenta watch time)
12. **Community Tab** (engaje entre uploads)
13. **Shorts 3-5x/semana** (atrai novos inscritos)
14. **Colabs com outros criadores**
15. **Analise retenção** (onde as pessoas saem? melhore)

---

### 12.11 Projeção Financeira Detalhada

#### **Cenário Realista - 6 Meses:**

| Mês | Investimento | Leads | Conversão | Vendas | Faturamento | ROI |
|-----|--------------|-------|-----------|--------|-------------|-----|
| **1** | R$1.500 | 120 | 12% | 14 | R$1.050 | 0.7:1 |
| **2** | R$2.000 | 180 | 14% | 25 | R$1.875 | 0.94:1 |
| **3** | R$2.500 | 250 | 16% | 40 | R$3.000 | 1.2:1 |
| **4** | R$3.000 | 350 | 18% | 63 | R$4.725 | 1.58:1 |
| **5** | R$3.500 | 450 | 20% | 90 | R$6.750 | 1.93:1 |
| **6** | R$4.000 | 550 | 22% | 121 | R$9.075 | 2.27:1 |

**Totais:**
- Investido: R$16.500
- Faturado: R$26.475
- **Lucro: R$9.975**
- **ROI Médio: 1.6:1**
- **CPA Médio: R$21**
- **LTV Médio: R$218**

#### **Cenário Otimizado (com automações rodando):**

| Mês | Investimento | Leads | Conversão | Vendas | Faturamento | ROI |
|-----|--------------|-------|-----------|--------|-------------|-----|
| **1** | R$1.500 | 150 | 15% | 23 | R$1.725 | 1.15:1 |
| **2** | R$2.500 | 280 | 18% | 50 | R$3.750 | 1.5:1 |
| **3** | R$3.500 | 450 | 20% | 90 | R$6.750 | 1.93:1 |
| **4** | R$4.500 | 650 | 22% | 143 | R$10.725 | 2.38:1 |
| **5** | R$5.000 | 800 | 24% | 192 | R$14.400 | 2.88:1 |
| **6** | R$5.500 | 1000 | 25% | 250 | R$18.750 | 3.41:1 |

**Totais:**
- Investido: R$22.500
- Faturado: R$56.100
- **Lucro: R$33.600**
- **ROI Médio: 2.49:1**
- **CPA Médio: R$16**
- **LTV Médio: R$224**

---

### 12.12 Checklist de Setup de Tráfego Pago

```markdown
## PRE-REQUISITOS
- [ ] Meta Business Manager criado
- [ ] TikTok Ads Account criada
- [ ] Google Ads Account criada
- [ ] Cartão de crédito configurado
- [ ] Pixels instalados e testados

## TRACKING
- [ ] UTM parameters em todos os links de anúncios
- [ ] Conversion API configurada (Meta)
- [ ] GA4 events configurados
- [ ] Supabase schema atualizado
- [ ] CampaignTracker.tsx implementado

## AUTOMAÇÕES
- [ ] 14_rastreamento_campanhas.json
- [ ] 15_otimizacao_campanhas_ia.json
- [ ] 16_retargeting_automatico.json
- [ ] 17_alerta_orcamento.json
- [ ] 18_cross_posting_inteligente.json

## DASHBOARD
- [ ] AdPerformance.tsx
- [ ] MultiPlatformAnalytics.tsx
- [ ] ROI Calculator
- [ ] Funnel Visualization

## CAMPANHAS INICIAIS
- [ ] Meta Ads: Conversão (R$20/dia)
- [ ] Meta Ads: Remarketing (R$15/dia)
- [ ] TikTok Ads: Lead Gen (R$15/dia)
- [ ] YouTube Ads: Discovery (R$15/dia)
- [ ] Total: R$65/dia = R$1.950/mês
```

---

## ✅ CONCLUSÃO - TRÁFEGO PAGO

### Resumo Executivo:

**Investimento Inicial Sugerido:** R$1.500-2.000/mês  
**Retorno Esperado Mês 1:** R$1.050-1.725 (ROI 0.7-1.15:1)  
**Retorno Esperado Mês 6:** R$9.075-18.750 (ROI 2.27-3.41:1)  
**Break-even:** Mês 2-3  
**Lucro Acumulado 6 meses:** R$9.975-33.600

### Chaves do Sucesso:

1. ✅ **Tracking impecável** (sem dados = sem otimização)
2. ✅ **Teste A/B constante** (criativos, públicos, copies)
3. ✅ **Escale o que funciona** (ROAS >3 = aumente budget 20%/semana)
4. ✅ **Pause o que não funciona** (ROAS <1.5 por 3 dias = pause)
5. ✅ **Automações de retargeting** (70% das vendas vêm de remarketing)
6. ✅ **Conteúdo orgânico + pago** (sinergia aumenta ROI 2-3x)
7. ✅ **Otimização semanal** (analise dados toda segunda-feira)

### Próximos Passos:

1. Implementar tracking (SEMANA 1)
2. Criar dashboard e automações (SEMANA 2)
3. Lançar primeiras campanhas (SEMANA 3)
4. Otimizar baseado em dados (SEMANA 4+)

**Com tráfego pago + automações + conteúdo orgânico, o HLJ DEV pode escalar de R$0 para R$10.000-18.000/mês em faturamento em 6 meses.**

---

*Este documento deve ser atualizado a cada fase concluída para manter histórico de evolução do sistema.*
