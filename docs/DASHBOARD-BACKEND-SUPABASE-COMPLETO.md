# 🗺️ Google Maps: Dashboard Admin \+ Backend \+ Supabase

**Guia prático com sua API Key já em mãos**

---

## 🎯 Sua API Key

VITE\_GOOGLE\_MAPS\_API\_KEY=AIzaSy... (você já tem\!)

Guarde com segurança. Você vai precisar.

---

## 📱 DASHBOARD ADMIN (/admin/maps)

### Como Deve Ficar (Visualmente):

┌─────────────────────────────────────────────────────────┐

│  HLJ DEV \- Mapa de Leads                                │

├─────────────────────────────────────────────────────────┤

│                                                         │

│  📍 MAPA (80% da tela)                                  │

│  ┌───────────────────────────────────────────────────┐  │

│  │                                                   │  │

│  │  \[Mapa com marcadores 🔴🟡🟢\]                    │  │

│  │                                                   │  │

│  │  🔴 João Silva (Score 88\) \- São Paulo           │  │

│  │  🟡 Maria Santos (Score 65\) \- Rio               │  │

│  │  🟢 Carlos Lima (Score 42\) \- Belo Horizonte     │  │

│  │                                                   │  │

│  └───────────────────────────────────────────────────┘  │

│                                                         │

├─────────────────────────────────────────────────────────┤

│  FILTROS (lado esquerdo, colapsável)                   │

│  ┌─────────────────────────────────────────────────┐   │

│  │ 🔽 Status:                                      │   │

│  │   ☐ Novo                                       │   │

│  │   ☑ Qualificado                                │   │

│  │   ☐ Proposta                                   │   │

│  │                                                 │   │

│  │ 🔽 Score:                                      │   │

│  │   Apenas \> 70 \[━━━●━━\] 100                    │   │

│  │                                                 │   │

│  │ 🔽 Região:                                     │   │

│  │   São Paulo (12)                               │   │

│  │   Rio de Janeiro (8)                           │   │

│  │   Minas Gerais (5)                             │   │

│  │                                                 │   │

│  │ 🔽 Data:                                       │   │

│  │   Últimos 7 dias ⚙️                            │   │

│  │                                                 │   │

│  │ \[LIMPAR FILTROS\]                               │   │

│  └─────────────────────────────────────────────────┘   │

│                                                         │

├─────────────────────────────────────────────────────────┤

│  DETALHES DO LEAD (ao clicar no marcador)              │

│  ┌─────────────────────────────────────────────────┐   │

│  │ João Silva                                      │   │

│  │ 📧 joao@empresa.com                            │   │

│  │ 📱 (11) 99999-9999                             │   │

│  │ 🏢 TechStartup XYZ                             │   │

│  │ 🎯 Tipo: E-commerce                            │   │

│  │ 📍 São Paulo, SP                               │   │

│  │ ⭐ Score: 88/100 (MUITO BOM\!)                  │   │

│  │                                                 │   │

│  │ \[☎️ Ligar\] \[📧 Email\] \[💬 Instagram\] \[📱 WA\]  │   │

│  │ \[✅ Qualificado\] \[❌ Descartar\]                │   │

│  │                                                 │   │

│  │ 📅 Histórico:                                  │   │

│  │   22/04 14:30 \- Lead chegou                   │   │

│  │   22/04 15:00 \- Você ligou (5 min)            │   │

│  │   22/04 15:15 \- Resposta: Muito interessado   │   │

│  │                                                 │   │

│  └─────────────────────────────────────────────────┘   │

│                                                         │

├─────────────────────────────────────────────────────────┤

│  KPIs (em cima)                                         │

│  ┌──────┬──────┬──────┬──────┐                         │

│  │Leads │Score │Taxa  │ Revenue                        │

│  │hoje: │médio:│conv: │est:                            │

│  │  5   │  72  │35%   │R$45k                           │

│  └──────┴──────┴──────┴──────┘                         │

└─────────────────────────────────────────────────────────┘

### Componentes React:

// src/components/admin/LeadsMap.tsx

export function LeadsMap() {

  return (

    \<div className="grid grid-cols-4 gap-4"\>

      {/\* KPIs em cima \*/}

      \<KPIWidget title="Leads Hoje" value={5} /\>

      \<KPIWidget title="Score Médio" value="72/100" /\>

      \<KPIWidget title="Taxa Conversão" value="35%" /\>

      \<KPIWidget title="Revenue Est." value="R$45k" /\>

      

      {/\* Mapa \+ Detalhes \*/}

      \<div className="col-span-3"\>

        \<MapContainer leads={leads} onMarkerClick={handleMarkerClick} /\>

      \</div\>

      

      {/\* Filtros \*/}

      \<div\>

        \<FilterPanel filters={filters} onFilterChange={setFilters} /\>

      \</div\>

      

      {/\* Detalhes do Lead \*/}

      {selectedLead && (

        \<LeadDetailsPanel lead={selectedLead} onAction={handleAction} /\>

      )}

    \</div\>

  )

}

### Arquivos React a Criar:

src/components/admin/

├─ LeadsMap.tsx (componente principal)

├─ MapContainer.tsx (mapa com Google Maps)

├─ LeadMarker.tsx (marcador customizado)

├─ LeadDetailsPanel.tsx (painel de detalhes)

├─ FilterPanel.tsx (filtros)

├─ KPIWidget.tsx (cards de números)

└─ LeadsMapAdmin.tsx (página inteira)

src/services/

├─ mapsService.ts (chamadas API Google Maps)

├─ leadsService.ts (CRUD de leads)

└─ analyticsService.ts (analytics)

src/types/

├─ lead.ts (interface de lead)

├─ map.ts (tipos do mapa)

└─ filter.ts (tipos de filtro)

---

## ⚙️ BACKEND (N8N)

### Workflow 1: "Lead Inteligente com Geo"

**O que faz:** Lead preenche → Sistema processa → Você notificado

ENTRADA:

  Webhook (POST /novo-lead)

  {

    nome: "João Silva",

    email: "joao@empresa.com",

    telefone: "(11) 99999-9999",

    empresa: "TechStartup XYZ",

    tipo: "e-commerce",

    endereco: "São Paulo, SP"

  }

PROCESSAMENTO 1: Google Geocoding

  Input: "São Paulo, SP"

  Output: 

  {

    latitude: \-23.5505,

    longitude: \-46.6333,

    endereco\_completo: "São Paulo, São Paulo, Brasil"

  }

PROCESSAMENTO 2: Groq IA \- Calcula Score

  Prompt: 

  "Analisar lead:

   \- Nome: João

   \- Tipo: e-commerce

   \- Urgência: 'Preciso urgente' → score urgência

   \- Fit: E-commerce → score fit

   \- Localização: São Paulo → score geo

   \- Budget: 'R$ 15k' → score valor

   

   Retornar JSON:

   {

     urgency\_score: 90,

     fit\_score: 95,

     geo\_value\_score: 85,

     final\_score: 88

   }"

  

  Output:

  {

    urgency\_score: 90,

    fit\_score: 95,

    geo\_value\_score: 85,

    lead\_score: 88

  }

PROCESSAMENTO 3: Supabase \- Salvar

  INSERT INTO leads (

    nome, email, telefone, empresa, tipo,

    latitude, longitude, endereco,

    lead\_score, urgency\_score, fit\_score, geo\_value\_score,

    status, data\_criacao

  ) VALUES (

    "João Silva", "joao@empresa.com", "(11) 99999-9999", 

    "TechStartup XYZ", "e-commerce",

    \-23.5505, \-46.6333, "São Paulo, SP",

    88, 90, 95, 85,

    "novo", NOW()

  )

NOTIFICAÇÕES (Paralelas):

  1\. WhatsApp Você:

     "🔴 NOVO LEAD URGENTE\!

      João Silva \- E-commerce

      Score: 88/100

      São Paulo, SP

      

      Ver no mapa →"

  

  2\. Email João:

     "Oi João\!

      Recebemos seu contato.

      Em breve retornamos.

      

      Obrigado\!"

  

  3\. Instagram DM João (Opcional):

     "Oi João\! 👋

      Vi que você quer e-commerce.

      Exatamente nossa especialidade\!

      

      Volto em breve 🚀"

AGENDAMENTO:

  Calendar: Lembrete em 1 dia

  "Ligar para João Silva"

### Workflow 2: "Follow-up Automático"

TRIGGER: Diariamente (09:00 AM)

BUSCAR:

  Leads com status \= "novo" 

  E (data\_criacao \>= 1 dia OR 3 dias OR 7 dias)

AÇÕES:

  Se 1 dia:

    WhatsApp: "Lembre-se de ligar para João\!"

  

  Se 3 dias (sem resposta):

    Email: "Oi João, queremos ajudar\!"

  

  Se 7 dias (última chance):

    WhatsApp: "Última tentativa de contato"

    Status: "inativo"

### Workflow 3: "Analytics Diário"

TRIGGER: 18:00 (fim do dia)

BUSCAR:

  \- Leads chegados hoje

  \- Leads convertidos hoje

  \- Revenue estimado hoje

  \- Por região

ENVIAR:

  Email você:

  "📊 RELATÓRIO DIÁRIO

   

   Leads: 5

   Conversões: 1

   Revenue: R$ 15.000

   

   São Paulo: 3 leads

   Rio: 2 leads"

---

## 💾 SUPABASE: Tabelas Novas

### SQL para Criar Tudo:

\-- \========================================

\-- TABELAS PRINCIPAIS

\-- \========================================

\-- Atualizar tabela leads existente

ALTER TABLE leads ADD COLUMN IF NOT EXISTS (

  latitude DECIMAL(10, 8),

  longitude DECIMAL(11, 8),

  endereco TEXT,

  cep VARCHAR(10),

  cidade VARCHAR(100),

  estado VARCHAR(2),

  

  \-- Scores

  lead\_score INT DEFAULT 0,

  urgency\_score INT DEFAULT 0,

  fit\_score INT DEFAULT 0,

  geo\_value\_score INT DEFAULT 0,

  priority\_score INT DEFAULT 0,

  

  \-- Status

  status VARCHAR(50) DEFAULT 'novo',

  

  \-- Rastreamento

  data\_ultima\_acao TIMESTAMP,

  proximo\_follow\_up TIMESTAMP

);

\-- Índices para performance

CREATE INDEX IF NOT EXISTS idx\_leads\_score ON leads(lead\_score DESC);

CREATE INDEX IF NOT EXISTS idx\_leads\_status ON leads(status);

CREATE INDEX IF NOT EXISTS idx\_leads\_latitude\_longitude ON leads(latitude, longitude);

\-- \========================================

\-- TABELA: ATIVIDADES GEOGRÁFICAS

\-- \========================================

CREATE TABLE IF NOT EXISTS atividades\_geo (

  id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

  lead\_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,

  

  tipo VARCHAR(50), \-- 'ligar', 'email', 'whatsapp', 'reuniao'

  latitude DECIMAL(10, 8),

  longitude DECIMAL(11, 8),

  

  descricao TEXT,

  notas JSONB, \-- {resultado, duration, next\_action}

  

  data\_criacao TIMESTAMP DEFAULT NOW(),

  data\_acao TIMESTAMP,

  

  criado\_por VARCHAR(100),

  

  CONSTRAINT fk\_lead FOREIGN KEY(lead\_id) REFERENCES leads(id)

);

CREATE INDEX IF NOT EXISTS idx\_atividades\_geo\_lead\_id ON atividades\_geo(lead\_id);

CREATE INDEX IF NOT EXISTS idx\_atividades\_geo\_tipo ON atividades\_geo(tipo);

CREATE INDEX IF NOT EXISTS idx\_atividades\_geo\_data ON atividades\_geo(data\_acao);

\-- \========================================

\-- TABELA: CONFIGURAÇÕES DE MAPA

\-- \========================================

CREATE TABLE IF NOT EXISTS config\_maps (

  id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

  

  \-- Google Maps Config

  zoom\_padrao INT DEFAULT 14,

  centro\_latitude DECIMAL(10, 8\) DEFAULT \-23.5505, \-- São Paulo

  centro\_longitude DECIMAL(11, 8\) DEFAULT \-46.6333,

  

  raio\_busca\_padrao DECIMAL(5, 2\) DEFAULT 15.0, \-- km

  

  \-- Cores por Score

  cor\_urgente VARCHAR(7) DEFAULT '\#FF0000',

  cor\_normal VARCHAR(7) DEFAULT '\#FFA500',

  cor\_baixa VARCHAR(7) DEFAULT '\#00FF00',

  

  \-- Outros

  ativar\_heatmap BOOLEAN DEFAULT TRUE,

  ativar\_markers\_clientes BOOLEAN DEFAULT TRUE,

  

  data\_atualizacao TIMESTAMP DEFAULT NOW(),

  atualizado\_por VARCHAR(100)

);

\-- Inserir config padrão

INSERT INTO config\_maps (id) VALUES (gen\_random\_uuid()) 

  ON CONFLICT DO NOTHING;

\-- \========================================

\-- TABELA: HOTSPOTS (Áreas quentes)

\-- \========================================

CREATE TABLE IF NOT EXISTS hotspots\_geo (

  id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

  

  nome VARCHAR(100),

  latitude DECIMAL(10, 8),

  longitude DECIMAL(11, 8),

  

  raio\_metros INT DEFAULT 5000,

  

  quantidade\_leads INT DEFAULT 0,

  taxa\_conversao DECIMAL(5, 2\) DEFAULT 0,

  

  prioridade INT DEFAULT 0,

  

  data\_criacao TIMESTAMP DEFAULT NOW(),

  data\_atualizacao TIMESTAMP DEFAULT NOW()

);

CREATE INDEX IF NOT EXISTS idx\_hotspots\_prioridade ON hotspots\_geo(prioridade DESC);

\-- \========================================

\-- TABELA: FOLLOW-UP SCHEDULE

\-- \========================================

CREATE TABLE IF NOT EXISTS follow\_ups (

  id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

  lead\_id UUID NOT NULL REFERENCES leads(id),

  

  tipo VARCHAR(50), \-- 'ligar', 'email', 'proposta', 'reuniao'

  mensagem TEXT,

  

  agendado\_para TIMESTAMP NOT NULL,

  enviado BOOLEAN DEFAULT FALSE,

  enviado\_em TIMESTAMP,

  

  resultado VARCHAR(100), \-- 'respondeu', 'nao\_respondeu', 'agendou'

  

  CONSTRAINT fk\_follow\_up\_lead FOREIGN KEY(lead\_id) REFERENCES leads(id)

);

CREATE INDEX IF NOT EXISTS idx\_follow\_ups\_agendado ON follow\_ups(agendado\_para);

CREATE INDEX IF NOT EXISTS idx\_follow\_ups\_enviado ON follow\_ups(enviado);

\-- \========================================

\-- TABELA: ANALYTICS

\-- \========================================

CREATE TABLE IF NOT EXISTS analytics\_diario (

  id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

  

  data DATE NOT NULL,

  

  \-- Números

  leads\_novo INT DEFAULT 0,

  leads\_qualificado INT DEFAULT 0,

  leads\_proposta INT DEFAULT 0,

  

  conversoes INT DEFAULT 0,

  revenue DECIMAL(12, 2\) DEFAULT 0,

  

  \-- Por região

  dados\_por\_regiao JSONB, \-- {São Paulo: {leads: 5, conversoes: 2}, ...}

  

  data\_criacao TIMESTAMP DEFAULT NOW(),

  

  CONSTRAINT unique\_data UNIQUE(data)

);

CREATE INDEX IF NOT EXISTS idx\_analytics\_data ON analytics\_diario(data);

\-- \========================================

\-- ROW LEVEL SECURITY (RLS)

\-- \========================================

\-- Apenas você acessa o mapa (seu user\_id)

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "leads\_personal\_access" ON leads

  FOR SELECT USING (auth.uid() \= 'seu-user-id-aqui');

CREATE POLICY "leads\_insert\_own" ON leads

  FOR INSERT WITH CHECK (auth.uid() \= 'seu-user-id-aqui');

\-- Similar para outras tabelas

ALTER TABLE atividades\_geo ENABLE ROW LEVEL SECURITY;

ALTER TABLE follow\_ups ENABLE ROW LEVEL SECURITY;

\-- \========================================

\-- VIEWS (Consultas prontas)

\-- \========================================

\-- View: Leads com Score Alto

CREATE OR REPLACE VIEW leads\_urgent AS

SELECT 

  id, nome, email, telefone,

  latitude, longitude,

  lead\_score, status,

  CURRENT\_TIMESTAMP \- data\_criacao as tempo\_decorrido

FROM leads

WHERE lead\_score \>= 80 AND status \= 'novo'

ORDER BY lead\_score DESC;

\-- View: Hotspots por Região

CREATE OR REPLACE VIEW hotspots\_ranked AS

SELECT 

  cidade, estado,

  COUNT(\*) as total\_leads,

  AVG(lead\_score) as score\_medio,

  COUNT(CASE WHEN status \= 'fechado' THEN 1 END)::DECIMAL / COUNT(\*) \* 100 as taxa\_conversao

FROM leads

WHERE latitude IS NOT NULL

GROUP BY cidade, estado

ORDER BY taxa\_conversao DESC;

### Estrutura Final (Diagrama):

leads (existente, aumentada)

├─ id, nome, email, telefone

├─ empresa, tipo, mensagem

├─ latitude, longitude ← NOVO

├─ endereco, cep, cidade, estado ← NOVO

├─ lead\_score, urgency\_score ← NOVO

├─ fit\_score, geo\_value\_score ← NOVO

├─ status, data\_criacao

└─ data\_ultima\_acao, proximo\_follow\_up ← NOVO

atividades\_geo (NOVA)

├─ id, lead\_id

├─ tipo, descricao, notas

├─ latitude, longitude

└─ data\_acao, criado\_por

config\_maps (NOVA)

├─ zoom\_padrao, centro\_lat, centro\_lng

├─ cores, raio\_busca

└─ configurações gerais

hotspots\_geo (NOVA)

├─ nome, latitude, longitude

├─ quantidade\_leads

└─ taxa\_conversao

follow\_ups (NOVA)

├─ lead\_id, tipo, mensagem

├─ agendado\_para, enviado

└─ resultado

---

## 🔗 Variáveis de Ambiente (.env.local)

\# Google Maps

VITE\_GOOGLE\_MAPS\_API\_KEY=AIzaSy... (sua chave aqui)

\# Supabase

VITE\_SUPABASE\_URL=https://seu-projeto.supabase.co

VITE\_SUPABASE\_ANON\_KEY=eyJhbG...

\# N8N

VITE\_N8N\_API\_URL=https://n8n.hljdev.com.br

VITE\_N8N\_WEBHOOK\_URL=https://n8n.hljdev.com.br/webhook

\# Maps Config

VITE\_MAPS\_DEFAULT\_ZOOM=14

VITE\_MAPS\_DEFAULT\_CENTER\_LAT=-23.5505

VITE\_MAPS\_DEFAULT\_CENTER\_LNG=-46.6333

VITE\_MAPS\_RAIO\_BUSCA\_KM=15

\# Seu User ID (para RLS)

VITE\_USER\_ID=seu-user-id-aqui

---

## ✅ Checklist: Implementar Agora

### Passo 1: Supabase

- [ ] Copiar SQL acima  
- [ ] Executar no Editor SQL (Supabase Studio)  
- [ ] Verificar tabelas criadas  
- [ ] Testar com 1 INSERT manual

### Passo 2: Componentes React

- [ ] Criar mapcontainer.tsx  
- [ ] npm install @react-google-maps/api  
- [ ] Criar LeadsMap.tsx  
- [ ] Testar em localhost:5173/admin/maps

### Passo 3: N8N

- [ ] Acessar n8n.hljdev.com.br  
- [ ] Criar webhook para /novo-lead  
- [ ] Conectar com Geocoding  
- [ ] Conectar com Groq  
- [ ] Testar com 1 lead

### Passo 4: Deploy

- [ ] git push  
- [ ] Vercel auto-deploy  
- [ ] Testar em produção

---

*Pronto para começar? Qual passo quer fazer primeiro?*  
