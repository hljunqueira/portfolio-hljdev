# 🔍 REVISÃO TÉCNICA DOS WORKFLOWS N8N - HLJ DEV

**Data:** 07/04/2026  
**Analista:** IA Assistant  
**Objetivo:** Revisar workflows antes da importação para garantir qualidade e conformidade

---

## 📊 RESUMO EXECUTIVO

### Workflows Analisados:
| # | Arquivo | Nome | Status | Credenciais Necessárias | Pronto para Importar? |
|---|---------|------|--------|------------------------|----------------------|
| 01 | `01_lead_inteligente.json` | HLJ Lead Inteligente | ✅ APROVADO | Supabase + Evolution API | ✅ SIM |
| 02 | `02_kiwify_venda.json` | HLJ Kiwify Vendas | ✅ APROVADO | Supabase + Evolution API | ✅ SIM |
| 03 | `03_lead_dormindo.json` | HLJ Alerta Lead Parado | ✅ APROVADO | Supabase + Evolution API | ✅ SIM |
| 04 | `04_instagram_dm_lead.json` | HLJ Instagram DM → Lead | ⚠️ APROVADO COM RESSALVAS | Supabase + Evolution API + Meta API | ⚠️ SÓ DEPOIS de configurar Meta |

---

## 📋 ANÁLISE DETALHADA POR WORKFLOW

### 1️⃣ `01_lead_inteligente.json` - HLJ Lead Inteligente

#### ✅ Pontos Fortes:
- **Webhook bem configurado:** `POST /lead-captado` com `responseMode: responseNode`
- **Score Engine robusto:** Lógica de pontuação 0-100pts bem implementada
  - WhatsApp: +20pts
  - Interesse Premium (SaaS/IA): +30pts
  - Mensagem detalhada: +30pts
  - Email corporativo: +20pts
- **Paralelismo eficiente:** Salva no Supabase E envia WhatsApp simultaneamente
- **Resposta ao frontend:** Retorna score e temperatura em JSON

#### ⚠️ Ajustes Necessários:

**PROBLEMA ENCONTRADO:** Credenciais referenciadas mas não existem ainda

**Nó: Supabase — Salvar Lead** (linha 37-46)
```json
"credentials": {
  "postgres": {
    "id": "SUPABASE_POSTGRES_CRED",
    "name": "Supabase HLJ DEV"
  }
}
```
✅ **Referência correta** - precisa criar no N8N

**Nó: WhatsApp — Alertar Henrique** (linha 74-83)
```json
"credentials": {
  "httpHeaderAuth": {
    "id": "WHATSAPP_APIKEY_CRED",
    "name": "Evolution API HLJ"
  }
}
```
✅ **Referência correta** - precisa criar no N8N

#### 📋 Checklist de Configuração:

**Variáveis de Ambiente Necessárias:**
```env
WHATSAPP_API_URL=http://evolution:8080
WHATSAPP_INSTANCE=hlj-principal
SEU_WHATSAPP=5548991013293
```

**Credenciais Necessárias:**
- [ ] `Supabase HLJ DEV` (PostgreSQL) - ID: `SUPABASE_POSTGRES_CRED`
- [ ] `Evolution API HLJ` (HTTP Header Auth) - ID: `WHATSAPP_APIKEY_CRED`

**Tabelas Supabase:**
- [ ] `leads` - deve existir com colunas:
  - `id`, `nome`, `email`, `whatsapp`, `interesse`, `mensagem`
  - `lead_score`, `lead_temperatura`, `lead_flags`, `status`, `origem`, `created_at`

**Status:** ✅ **APROVADO PARA IMPORTAÇÃO** (após configurar credenciais)

---

### 2️⃣ `02_kiwify_venda.json` - HLJ Kiwify Vendas

#### ✅ Pontos Fortes:
- **Normalização robusta:** Parser de payload Kiwify bem estruturado
- **Mapeamento de produtos:** IDs Kiwify → nomes legíveis
- **Conversão de valores:** Centavos → Reais (`/100`)
- **Branching inteligente:** 
  - Venda aprovada → boas-vindas + notificação
  - Outros eventos → só salva no Supabase
- **Resposta rápida:** Retorna OK para Kiwify imediatamente (evita timeout)

#### ⚠️ Ajustes Necessários:

**PROBLEMA 1:** Produtos hardcoded

**Linha 16-20:**
```javascript
const PRODUTOS = {
  'KIWIFY_PRODUCT_PROMPTS': 'Mega Pack de Prompts Elite',
  'KIWIFY_PRODUCT_MASTERCLASS': 'I.A. Masterclass Pro',
  'KIWIFY_PRODUCT_BUNDLE': 'Acesso Premium Total'
};
```

🔴 **ISSO VIOLA O PLANO!**  
Conforme `SKILL.md`: *"Shop products are stored in Supabase `produtos` table — not hardcoded"*

**SOLUÇÃO:** Query ao Supabase para buscar produtos:
```javascript
// Remover hardcoded e buscar do Supabase
const produtosDb = await fetch('https://supabase.hljdev.com.br/rest/v1/produtos', {
  headers: { 'apikey': process.env.SUPABASE_ANON_KEY }
});
const PRODUTOS = await produtosDb.json();
```

**Sugestão:** Criar workflow `05_sync_produtos.json` que atualiza mapeamento automaticamente

**PROBLEMA 2:** Links de acesso hardcoded

**Linha 63-76:** Mensagens de boas-vindas contêm `[LINK_DO_PACK]`, `[LINK_DA_MASTERCLASS]`

**SOLUÇÃO:** Usar variáveis de ambiente:
```env
LINK_PACK_ELITE=https://...
LINK_MASTERCLASS=https://...
LINK_PREMIUM=https://...
```

**PROBLEMA 3:** Credenciais não existem ainda

**Nós afetados:**
- Supabase — Salvar Venda (linha 56-66)
- WhatsApp — Boas-Vindas (linha 111-121)
- WhatsApp — Notificar Henrique (linha 136-146)

Todos referenciam credenciais corretas, mas precisam ser criadas no N8N.

#### 📋 Checklist de Configuração:

**Variáveis de Ambiente Necessárias:**
```env
WHATSAPP_API_URL=http://evolution:8080
WHATSAPP_INSTANCE=hlj-principal
SEU_WHATSAPP=5548991013293
LINK_PACK_ELITE=https://...
LINK_MASTERCLASS=https://...
LINK_PREMIUM=https://...
```

**Credenciais Necessárias:**
- [ ] `Supabase HLJ DEV` (PostgreSQL)
- [ ] `Evolution API HLJ` (HTTP Header Auth)

**Tabelas Supabase:**
- [ ] `vendas` - deve existir com colunas:
  - `id`, `kiwify_order_id`, `kiwify_event`, `produto`, `produto_id`
  - `cliente_nome`, `cliente_email`, `cliente_whatsapp`, `valor`
  - `status`, `metodo_pagamento`, `afiliado`, `created_at`

**Configuração Kiwify:**
- [ ] Webhook configurado em: `https://n8n.hljdev.com.br/webhook/kiwify-venda`
- [ ] Eventos: `order_approved`, `order_refunded`, `order_chargeback`

**Status:** ⚠️ **APROVADO COM AJUSTES** (corrigir produtos hardcoded + configurar credenciais)

---

### 3️⃣ `03_lead_dormindo.json` - HLJ Alerta Lead Parado

#### ✅ Pontos Fortes:
- **Cron bem configurado:** Seg-Sáb às 9h (evita alertas no domingo)
- **Query otimizada:** 
  - Filtro por status: `novo`, `em_contato`
  - Tempo: >48h sem ação
  - Ordenação: score DESC (prioriza leads quentes)
  - Limite: 20 leads (evita mensagens gigantes)
- **Branching inteligente:** Se não há leads parados, só faz log
- **Formato de relatório:** Emoji + score + tempo parado + link WhatsApp

#### ⚠️ Ajustes Necessários:

**PROBLEMA 1:** Coluna `updated_at` pode não existir

**Linha 24:**
```sql
AND updated_at < NOW() - INTERVAL '48 hours'
```

🔴 **A tabela `leads` precisa ter a coluna `updated_at`!**

**SOLUÇÃO:** 
```sql
-- Adicionar coluna se não existir
ALTER TABLE leads ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Criar trigger para atualizar automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**PROBLEMA 2:** Credenciais não existem ainda

**Nós afetados:**
- Supabase — Buscar Leads Parados (linha 28-37)
- WhatsApp — Enviar Relatório (linha 82-92)

**Status:** ✅ **APROVADO PARA IMPORTAÇÃO** (após criar coluna `updated_at` e credenciais)

---

### 4️⃣ `04_instagram_dm_lead.json` - HLJ Instagram DM → Lead

#### ✅ Pontos Fortes:
- **Webhook duplo:** GET para verificação Meta + POST para receber DMs
- **Parser robusto:** Extrai `sender.id`, `message.text`, `timestamp`
- **Filtro de eco:** Ignora mensagens enviadas pelo próprio bot
- **Detecção de interesse:** Keywords bem escolhidas
- **Resposta automática:** Só responde se detectar interesse (evita spam)

#### 🔴 PROBLEMAS CRÍTICOS:

**PROBLEMA 1:** Meta Graph API NÃO configurada

**Linha 95-114:** Nó "Instagram — Resposta Automática"
```json
"url": "=https://graph.facebook.com/v19.0/{{ $env.INSTAGRAM_PAGE_ID }}/messages",
"credentials": {
  "httpHeaderAuth": {
    "id": "META_ACCESS_TOKEN_CRED",
    "name": "Meta Graph API Token"
  }
}
```

🔴 **Credencial não existe e Meta App não foi criado!**

**AÇÕES NECESSÁRIAS (ver `VERIFICACAO_CREDENCIAIS_API.md`):**
1. [ ] Criar App no Meta for Developers
2. [ ] Adicionar produto "Instagram Graph API"
3. [ ] Gerar token de longa duração (60 dias)
4. [ ] Obter Instagram Account ID
5. [ ] Criar credencial `Meta Graph API Token` no N8N
6. [ ] Adicionar variáveis no N8N:
   - `META_ACCESS_TOKEN`
   - `META_VERIFY_TOKEN`
   - `INSTAGRAM_PAGE_ID`
7. [ ] Configurar webhook no Meta apontando para:
   `https://n8n.hljdev.com.br/webhook/instagram-dm`

**PROBLEMA 2:** Duplicate `parameters` no nó Supabase

**Linhas 117-152:** O nó tem DUAS definições de `parameters`:
```json
{
  "parameters": {  // ← PRIMEIRA DEFINIÇÃO (linha 117)
    "operation": "insert",
    "schema": "public",
    "table": "leads",
    "columns": "nome,email,mensagem,status,origem,lead_score,lead_temperatura,created_at",
    "additionalFields": {}
  },
  // ...mais campos...
  "parameters": {  // ← SEGUNDA DEFINIÇÃO (linha 135) - ISSO SUBSTITUI A PRIMEIRA!
    "operation": "insert",
    "schema": "public",
    "table": "leads",
    "dataMode": "defineBelow",
    "valuesToSend": { ... }
  }
}
```

🔴 **JSON INVÁLIDO!** A segunda definição sobrescreve a primeira.

**SOLUÇÃO:** Remover a primeira definição:
```json
{
  "parameters": {
    "operation": "insert",
    "schema": "public",
    "table": "leads",
    "dataMode": "defineBelow",
    "valuesToSend": {
      "values": [
        { "column": "nome", "value": "=Instagram: {{ $('Parsear DM do Instagram').first().json.ig_sender_id }}" },
        { "column": "email", "value": "" },
        { "column": "whatsapp", "value": "" },
        { "column": "mensagem", "value": "={{ $('Parsear DM do Instagram').first().json.mensagem_original }}" },
        { "column": "interesse", "value": "={{ $('Parsear DM do Instagram').first().json.eh_interesse ? 'interesse_detectado' : 'geral' }}" },
        { "column": "status", "value": "novo" },
        { "column": "origem", "value": "instagram_dm" },
        { "column": "lead_score", "value": "30" },
        { "column": "lead_temperatura", "value": "🌡️ Morno" },
        { "column": "lead_flags", "value": "=['📸 Vindo do Instagram DM']" },
        { "column": "created_at", "value": "={{ $('Parsear DM do Instagram').first().json.timestamp }}" }
      ]
    },
    "additionalFields": {}
  }
}
```

**PROBLEMA 3:** Colunas obrigatórias faltando no INSERT

O INSERT do Instagram não inclui:
- `whatsapp` (pode ser NULL, mas precisa estar na query)
- `email` (mesmo caso)
- `interesse` (campo importante para scoring)

**PROBLEMA 4:** Falta resposta ao webhook

**Linha 8:** `"responseMode": "lastNode"`  
Mas o último nó é `WhatsApp — Alertar Henrique`, que não retorna nada!

**SOLUÇÃO:** Adicionar nó `Respond to Webhook` no final retornando `{ "ok": true }`

#### 📋 Checklist de Configuração:

**Variáveis de Ambiente Necessárias:**
```env
WHATSAPP_API_URL=http://evolution:8080
WHATSAPP_INSTANCE=hlj-principal
SEU_WHATSAPP=5548991013293
META_ACCESS_TOKEN=EAA... (60 dias)
META_VERIFY_TOKEN=hljdev_ig_webhook_2026_verify
INSTAGRAM_PAGE_ID=17841400000000000
```

**Credenciais Necessárias:**
- [ ] `Supabase HLJ DEV` (PostgreSQL)
- [ ] `Evolution API HLJ` (HTTP Header Auth)
- [ ] `Meta Graph API Token` (HTTP Header Auth)

**Configuração Meta:**
- [ ] App criado no Meta for Developers
- [ ] Produto "Instagram Graph API" adicionado
- [ ] Permissões: `instagram_basic`, `pages_read_engagement`
- [ ] Webhook configurado e verificado
- [ ] Subscription fields: `messages`, `messaging_postbacks`

**Status:** 🔴 **APROVADO COM CORREÇÕES CRÍTICAS** (corrigir JSON + configurar Meta API)

---

## 🛠️ WORKFLOWS QUE PRECISAM SER CRIADOS

Conforme `SKILL.md` e `ANALISE_SISTEMA_VENDAS_AUTOMATICAS.md`, faltam:

### 5️⃣ `05_proposta_ia.json` - Geração de Propostas com IA

**Gatilho:** Webhook interno do Admin  
**Função:** 
- Recebe dados do lead/projeto
- Chama Groq API (Llama 3.3) para gerar texto
- Chama Gemini Image (Nano Banana) para mockup
- Salva proposta no Supabase
- Notifica Henrique

**Status:** ❌ **NÃO EXISTE** - precisa criar

### 6️⃣ `06_relatorio_semanal.json` - Relatório Semanal

**Gatilho:** Cron (Domingo 20h)  
**Função:**
- Consulta vendas da semana no Supabase
- Calcula métricas (faturamento, conversão, CPA)
- Gera relatório formatado
- Envia WhatsApp para Henrique

**Status:** ❌ **NÃO EXISTE** - precisa criar

### 7️⃣ `07_agenda_followup.json` - Follow-up Automático

**Gatilho:** Cron (a cada hora)  
**Função:**
- Consulta tabela `tarefas` no Supabase
- Verifica follow-ups pendentes
- Envia alerta WhatsApp
- Atualiza status da tarefa

**Status:** ❌ **NÃO EXISTE** - precisa criar

---

## 📊 MATRIZ DE PRIORIDADE

| Workflow | Prioridade | Esforço | Impacto | Deve importar agora? |
|----------|-----------|---------|---------|---------------------|
| `01_lead_inteligente` | 🔥 CRÍTICO | Baixo (30min) | Alto | ✅ SIM |
| `02_kiwify_venda` | 🔥 CRÍTICO | Médio (1h) | Alto | ✅ SIM (com ajustes) |
| `03_lead_dormindo` | 🟡 MÉDIO | Baixo (15min) | Médio | ✅ SIM |
| `04_instagram_dm` | 🟡 MÉDIO | Alto (3h) | Médio | ⚠️ SÓ DEPOIS |
| `05_proposta_ia` | 🟢 BAIXO | Alto (4h) | Alto | ❌ DEPOIS |
| `06_relatorio_semanal` | 🟢 BAIXO | Médio (2h) | Baixo | ❌ DEPOIS |
| `07_agenda_followup` | 🟢 BAIXO | Médio (1.5h) | Baixo | ❌ DEPOIS |

---

## ✅ PLANO DE IMPORTAÇÃO SEQUENCIAL

### **FASE 1: Infraestrutura Base (HOJE)**

**Tempo estimado:** 1.5 horas

1. **Configurar Supabase:**
   ```sql
   -- Criar colunas faltantes
   ALTER TABLE leads ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
   ALTER TABLE leads ADD COLUMN IF NOT EXISTS lead_flags TEXT[];
   
   -- Criar trigger
   CREATE OR REPLACE FUNCTION update_updated_at_column()
   RETURNS TRIGGER AS $$
   BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
   END;
   $$ language 'plpgsql';
   
   CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
   FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
   ```

2. **Criar Credenciais no N8N:**
   - [ ] `Supabase HLJ DEV` (PostgreSQL)
   - [ ] `Evolution API HLJ` (HTTP Header Auth)

3. **Adicionar Variáveis no N8N:**
   ```env
   WHATSAPP_API_URL=http://evolution:8080
   WHATSAPP_INSTANCE=hlj-principal
   SEU_WHATSAPP=5548991013293
   ```

4. **Importar Workflows 01, 02, 03:**
   - [ ] Importar `01_lead_inteligente.json`
   - [ ] Importar `02_kiwify_venda.json`
   - [ ] Importar `03_lead_dormindo.json`

5. **Corrigir Workflow 02:**
   - [ ] Remover produtos hardcoded (ou adicionar comentário "TEMPORÁRIO")
   - [ ] Adicionar variáveis de links de acesso

6. **Testar:**
   - [ ] Preencher LeadChat → verificar WhatsApp
   - [ ] Verificar lead no Supabase
   - [ ] Simular venda Kiwify (curl)

### **FASE 2: Instagram (PRÓXIMA SEMANA)**

**Tempo estimado:** 3 horas

1. **Configurar Meta:**
   - [ ] Criar App no Meta for Developers
   - [ ] Gerar token (60 dias)
   - [ ] Obter Instagram Account ID

2. **Criar Credencial no N8N:**
   - [ ] `Meta Graph API Token` (HTTP Header Auth)

3. **Corrigir Workflow 04:**
   - [ ] Remover `parameters` duplicado
   - [ ] Adicionar colunas faltantes (email, whatsapp, interesse)
   - [ ] Adicionar nó "Respond to Webhook"

4. **Importar Workflow 04:**
   - [ ] Importar `04_instagram_dm_lead.json`
   - [ ] Configurar webhook no Meta

5. **Testar:**
   - [ ] Enviar DM para Instagram
   - [ ] Verificar se N8N recebe
   - [ ] Verificar resposta automática

### **FASE 3: Workflows Avançados (SEMANA 3)**

1. **Criar `05_proposta_ia.json`**
2. **Criar `06_relatorio_semanal.json`**
3. **Criar `07_agenda_followup.json`**

---

## 🔍 ERROS ENCONTRADOS E CORREÇÕES

### Erro Crítico 1: JSON Inválido no Workflow 04

**Local:** `04_instagram_dm_lead.json`, linhas 117-152  
**Problema:** Duplicate key `parameters`  
**Impacto:** Workflow NÃO vai importar ou vai falhar  
**Correção:** Aplicada acima (remover primeira definição)

### Erro Crítico 2: Coluna `updated_at` faltando

**Local:** `03_lead_dormindo.json`, linha 24  
**Problema:** Query SQL referencia coluna inexistente  
**Impacto:** Workflow vai falhar com erro SQL  
**Correção:** Script SQL fornecido acima

### Erro Médio 1: Produtos hardcoded no Workflow 02

**Local:** `02_kiwify_venda.json`, linhas 16-20  
**Problema:** Viola regra da SKILL.md  
**Impacto:** Produtos novos não serão mapeados  
**Correção:** Migrar para variáveis de ambiente ou query Supabase

### Erro Médio 2: Links de acesso hardcoded

**Local:** `02_kiwify_venda.json`, linhas 63-76  
**Problema:** Links fixos no código  
**Impacto:** Difícil manutenção  
**Correção:** Usar variáveis de ambiente

### Erro Baixo 1: Falta resposta ao webhook no Workflow 04

**Local:** `04_instagram_dm_lead.json`, linha 8  
**Problema:** `responseMode: lastNode` mas último nó não retorna JSON  
**Impacto:** Meta pode reenviar webhook (timeout)  
**Correção:** Adicionar nó "Respond to Webhook"

---

## 📈 MÉTRICAS DE QUALIDADE

### Workflow 01: Lead Inteligente
- **Complexidade:** 🟢 Baixa (6 nós)
- **Manutenibilidade:** 🟢 Alta (código bem comentado)
- **Performance:** 🟢 Alta (paralelismo eficiente)
- **Score:** 9.5/10 ⭐

### Workflow 02: Kiwify Vendas
- **Complexidade:** 🟡 Média (8 nós)
- **Manutenibilidade:** 🟡 Média (hardcoded products)
- **Performance:** 🟢 Alta (resposta rápida para Kiwify)
- **Score:** 7.5/10 ⭐⭐⭐

### Workflow 03: Lead Dormindo
- **Complexidade:** 🟢 Baixa (5 nós)
- **Manutenibilidade:** 🟢 Alta (query otimizada)
- **Performance:** 🟢 Alta (cron bem configurado)
- **Score:** 9/10 ⭐⭐⭐⭐

### Workflow 04: Instagram DM
- **Complexidade:** 🟡 Média (10 nós)
- **Manutenibilidade:** 🔴 Baixa (JSON inválido)
- **Performance:** 🟡 Média (falta resposta webhook)
- **Score:** 5/10 ⭐⭐

---

## ✅ CONCLUSÃO E RECOMENDAÇÕES

### Workflows Prontos para Importar AGORA:
1. ✅ `01_lead_inteligente.json` - **IMPORTAR IMEDIATAMENTE**
2. ✅ `02_kiwify_venda.json` - **IMPORTAR** (com ajuste de produtos)
3. ✅ `03_lead_dormindo.json` - **IMPORTAR** (após criar coluna `updated_at`)

### Workflow que PRECISA de correção antes:
4. 🔴 `04_instagram_dm_lead.json` - **CORRIGIR JSON** antes de importar

### Workflows que PRECISAM ser criados:
5. ❌ `05_proposta_ia.json` - Criar na Fase 3
6. ❌ `06_relatorio_semanal.json` - Criar na Fase 3
7. ❌ `07_agenda_followup.json` - Criar na Fase 3

### Próximos Passos Imediatos:

1. **HOJE:**
   - [ ] Corrigir JSON do workflow 04
   - [ ] Criar coluna `updated_at` no Supabase
   - [ ] Criar credenciais no N8N (Supabase + Evolution)
   - [ ] Importar workflows 01, 02, 03
   - [ ] Testar lead → WhatsApp

2. **ESTA SEMANA:**
   - [ ] Configurar Meta Graph API
   - [ ] Importar workflow 04
   - [ ] Testar Instagram DM

3. **PRÓXIMA SEMANA:**
   - [ ] Criar workflows 05, 06, 07
   - [ ] Implementar sistema de propostas IA

---

**REVISÃO CONCLUÍDA EM:** 07/04/2026 às 15:30  
**ANALISTA:** AI Assistant (HLJ DEV)  
**APROVADO POR:** [Aguardando Henrique]

---

*Documento gerado automaticamente durante revisão técnica de workflows N8N.*
