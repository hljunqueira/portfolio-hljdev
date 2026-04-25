# 🔐 VERIFICAÇÃO DE CREDENCIAIS DE API - HLJ DEV

**Data:** 07/04/2026  
**Status:** 📋 ANÁLISE COMPLETA  
**Objetivo:** Verificar todas as credenciais necessárias para automações de WhatsApp e Instagram

---

## 📊 RESUMO EXECUTIVO

### Credenciais Encontradas:
| Serviço | Status | Local | Necessário Configurar no N8N |
|---------|--------|-------|------------------------------|
| **Supabase** | ✅ Configurado | `.env.local` | ✅ Sim (PostgreSQL) |
| **N8N API Key** | ✅ Configurado | `.env.local` | ❌ Não (já configurada) |
| **Evolution API (WhatsApp)** | ⚠️ URL apenas | N8N env vars | ✅ Sim (HTTP Header Auth) |
| **Meta Graph API (Instagram)** | ❌ NÃO ENCONTRADO | - | ✅ Sim (OAuth2) |
| **Kiwify Webhook** | ✅ Configurado | Webhook URL | ❌ Não (só precisa ativar) |

---

## 1️⃣ SUPABASE

### ✅ Credenciais Encontradas:

**Arquivo:** `.env.local`
```env
VITE_SUPABASE_URL="https://supabase.hljdev.com.br"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_DB_PASSWORD=YOUR_SUPABASE_PASSWORD
```

**Arquivo:** `.env.vps` (linha 16)
```env
POSTGRES_PASSWORD=YOUR_SUPABASE_PASSWORD
```

### 🔧 Configuração no N8N:

**Credencial:** `Supabase HLJ DEV` (PostgreSQL)  
**ID:** `SUPABASE_POSTGRES_CRED`

**Configuração necessária:**
```
Host: db.supabase.hljdev.com.br (ou IP interno se na mesma VPS)
Port: 5432
Database: postgres
User: postgres
Password: YOUR_SUPABASE_PASSWORD
SSL: Required
```

**Usado em:**
- ✅ `01_lead_inteligente.json` - Salvar leads
- ✅ `02_kiwify_venda.json` - Salvar vendas
- ✅ Todas as automações futuras

### ⚠️ AÇÃO NECESSÁRIA:

1. Acessar: https://n8n.hljdev.com.br
2. Credentials → Nova credencial → PostgreSQL
3. Nome: `Supabase HLJ DEV`
4. Preencher dados acima
5. Testar conexão
6. Salvar

---

## 2️⃣ EVOLUTION API (WHATSAPP)

### ✅ Credenciais Encontradas:

**URL Base:** Configurada nas variáveis de ambiente do N8N (não nos arquivos .env locais)

**Variáveis N8N necessárias:**
```env
WHATSAPP_API_URL=http://evolution:8080 (interno Docker)
                 OU
                 https://evolution.hljdev.com.br (externo)

WHATSAPP_INSTANCE=hlj-principal

SEU_WHATSAPP=5548991013293 (número do Henrique)
```

**API Key:** Configurada via credencial HTTP Header Auth no N8N  
**ID da Credencial:** `WHATSAPP_APIKEY_CRED`  
**Nome:** `Evolution API HLJ`

### 🔧 Configuração no N8N:

**Credencial:** HTTP Header Auth  
**Tipo:** Header Authentication

**Configuração:**
```
Header Name: apikey
Header Value: [SUA API KEY DA EVOLUTION API]
```

**Como obter a API Key:**
1. Acessar: https://evolution.hljdev.com.br (ou URL interna)
2. Fazer login
3. Settings → API Key
4. Copiar chave
5. Colocar no N8N

### 📋 Endpoints Usados:

**Enviar mensagem:**
```
POST {{WHATSAPP_API_URL}}/message/sendText/{{WHATSAPP_INSTANCE}}

Headers:
  apikey: [SUA API KEY]
  
Body:
{
  "number": "5548991013293",
  "text": "Mensagem aqui"
}
```

### ✅ Usado em:
- `01_lead_inteligente.json` - Alertar Henrique de novo lead
- `02_kiwify_venda.json` - Boas-vindas ao cliente
- `03_lead_dormindo.json` - Alerta leads inativos
- `04_instagram_dm_lead.json` - Alerta de DMs

### ⚠️ AÇÕES NECESSÁRIAS:

1. **Verificar se Evolution API está rodando:**
   ```bash
   curl https://evolution.hljdev.com.br
   ```
   Deve retornar status 200

2. **Verificar instância conectada:**
   ```bash
   curl -X GET "https://evolution.hljdev.com.br/instance/connectionState/hlj-principal" \
     -H "apikey: SUA_API_KEY"
   ```
   Deve retornar: `state: open`

3. **Criar credencial no N8N:**
   - Credentials → New → HTTP Header Auth
   - Name: `Evolution API HLJ`
   - Header Name: `apikey`
   - Header Value: `[SUA API KEY]`
   - Save

---

## 3️⃣ META GRAPH API (INSTAGRAM)

### ❌ Credenciais NÃO Encontradas:

**Status:** Não há credenciais da Meta configuradas nos arquivos `.env`

**Variáveis Necessárias:**
```env
META_ACCESS_TOKEN=[TOKEN DE LONGA DURAÇÃO - 60 dias]
META_VERIFY_TOKEN=[TOKEN PARA VERIFICAR WEBHOOK]
INSTAGRAM_PAGE_ID=[ID DA PÁGINA INSTAGRAM BUSINESS]
INSTAGRAM_ACCOUNT_ID=[ID DA CONTA INSTAGRAM]
```

### 🔧 Como Obter as Credenciais:

#### Passo 1: Criar App no Meta for Developers

1. Acessar: https://developers.facebook.com/
2. Criar App → Tipo: `Business`
3. Adicionar produto: `Instagram Graph API`
4. Configurar permissões:
   - ✅ `instagram_basic`
   - ✅ `instagram_content_publish`
   - ✅ `pages_read_engagement`
   - ✅ `pages_manage_posts`

#### Passo 2: Gerar Token de Curta Duração

```bash
curl -X GET "https://graph.facebook.com/v19.0/oauth/access_token?client_id={app-id}&client_secret={app-secret}&grant_type=client_credentials"
```

#### Passo 3: Gerar Token de Longa Duração (60 dias)

```bash
curl -X GET "https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id={app-id}&client_secret={app-secret}&fb_exchange_token={short-lived-token}"
```

#### Passo 4: Obter Instagram Account ID

```bash
curl -X GET "https://graph.facebook.com/v19.0/me?fields=instagram_business_account&access_token={long-lived-token}"
```

Resposta:
```json
{
  "instagram_business_account": {
    "id": "17841400000000000"
  }
}
```

#### Passo 5: Criar Verify Token para Webhook

Escolha uma string secreta (ex: `hljdev_ig_webhook_2026_verify_token`)

#### Passo 6: Configurar no N8N

**Variáveis de ambiente no N8N:**
```env
META_ACCESS_TOKEN=EAA... (token de longa duração)
META_VERIFY_TOKEN=hljdev_ig_webhook_2026_verify_token
INSTAGRAM_PAGE_ID=17841400000000000
```

### 📋 Webhook do Instagram (Automação 04)

**URL do Webhook:**
```
https://n8n.hljdev.com.br/webhook/instagram-dm
```

**Configuração no Meta for Developers:**
1. App → Instagram Graph API → Webhooks
2. Subscribe to: `instagram`
3. Callback URL: `https://n8n.hljdev.com.br/webhook/instagram-dm`
4. Verify Token: `hljdev_ig_webhook_2026_verify_token`
5. Subscription Fields:
   - ✅ `messages`
   - ✅ `messaging_postbacks`

### ⚠️ AÇÕES NECESSÁRIAS:

1. [ ] Criar App no Meta for Developers
2. [ ] Gerar token de longa duração (60 dias)
3. [ ] Obter Instagram Account ID
4. [ ] Criar verify token
5. [ ] Adicionar variáveis de ambiente no N8N
6. [ ] Configurar webhook no Meta
7. [ ] Testar webhook (enviar DM para sua conta)

---

## 4️⃣ KIWIFY

### ✅ Webhook Configurado:

**URL do Webhook:**
```
https://n8n.hljdev.com.br/webhook/kiwify-venda
```

**Configuração na Kiwify:**
1. Acessar: https://app.kiwify.com.br/
2. Configurações → Webhooks
3. Adicionar webhook:
   - URL: `https://n8n.hljdev.com.br/webhook/kiwify-venda`
   - Eventos:
     - ✅ `order_approved` (venda aprovada)
     - ✅ `order_refunded` (reembolso)
     - ✅ `order_chargeback` (chargeback)
     - ✅ `order_waiting_payment` (aguardando pagamento)

### ✅ Usado em:
- `02_kiwify_venda.json` - Processar vendas e enviar boas-vindas

### ⚠️ AÇÕES NECESSÁRIAS:

1. [ ] Verificar se webhook está ativo na Kiwify
2. [ ] Testar com uma compra de teste (R$0,01 se possível)
3. [ ] Verificar se N8N recebe o evento
4. [ ] Verificar se venda aparece no Supabase

---

## 5️⃣ N8N API KEY

### ✅ Configurada:

**Arquivo:** `.env.local` (linha 5)
```env
N8N_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OGJkNGI5Ny02YmNiLTRhYzItYWY0MS05ZjIzMGU2ZDQxZTMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiOThlYTczYTctMmQwMi00ZGFiLThhMGQtN2JkNzg2MTc1ZTllIiwiaWF0IjoxNzc1NTI0MjAyfQ.BPicoawd3oeZYC1eLOVM2cmOjXiq10xUcfhKzFplSs4
```

**Uso:**
- Acesso à API do N8N para gerenciamento via código
- Criar/executar workflows programaticamente
- Monitorar execuções

### ✅ Testar API Key:

```bash
curl -X GET "https://n8n.hljdev.com.br/api/v1/workflows" \
  -H "X-N8N-API-KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

Deve retornar lista de workflows.

---

## 📋 CHECKLIST COMPLETO DE CONFIGURAÇÃO

### Supabase:
- [x] Credenciais nos arquivos `.env`
- [ ] Criar credencial PostgreSQL no N8N
- [ ] Testar conexão do N8N → Supabase
- [ ] Verificar se tabela `leads` existe
- [ ] Verificar se tabela `vendas` existe
- [ ] Configurar RLS (Row Level Security)

### Evolution API (WhatsApp):
- [ ] Verificar se Evolution API está online
- [ ] Verificar se instância `hlj-principal` está conectada
- [ ] Obter API Key da Evolution API
- [ ] Criar credencial HTTP Header Auth no N8N
- [ ] Testar envio de mensagem via N8N
- [ ] Verificar se número do Henrique está correto (5548991013293)

### Meta Graph API (Instagram):
- [ ] Criar App no Meta for Developers
- [ ] Vincular conta Instagram Business
- [ ] Gerar token de longa duração (60 dias)
- [ ] Obter Instagram Account ID
- [ ] Criar verify token para webhook
- [ ] Adicionar variáveis no N8N:
  - [ ] `META_ACCESS_TOKEN`
  - [ ] `META_VERIFY_TOKEN`
  - [ ] `INSTAGRAM_PAGE_ID`
- [ ] Configurar webhook no Meta
- [ ] Testar recebimento de DM
- [ ] Configurar alerta de expiração do token (55 dias)

### Kiwify:
- [ ] Verificar se webhook está configurado na Kiwify
- [ ] URL: `https://n8n.hljdev.com.br/webhook/kiwify-venda`
- [ ] Eventos: order_approved, order_refunded, order_chargeback
- [ ] Testar com compra de teste

### N8N:
- [ ] Criar credencial `Supabase HLJ DEV` (PostgreSQL)
- [ ] Criar credencial `Evolution API HLJ` (HTTP Header Auth)
- [ ] Adicionar variáveis de ambiente:
  - [ ] `WHATSAPP_API_URL`
  - [ ] `WHATSAPP_INSTANCE`
  - [ ] `SEU_WHATSAPP`
  - [ ] `META_ACCESS_TOKEN`
  - [ ] `META_VERIFY_TOKEN`
  - [ ] `INSTAGRAM_PAGE_ID`
- [ ] Ativar workflow `01_lead_inteligente.json`
- [ ] Ativar workflow `02_kiwify_venda.json`
- [ ] Ativar workflow `03_lead_dormindo.json`
- [ ] Ativar workflow `04_instagram_dm_lead.json`

---

## 🧪 ROTEIRO DE TESTES

### Teste 1: WhatsApp via Evolution API
```bash
# Testar diretamente
curl -X POST "https://evolution.hljdev.com.br/message/sendText/hlj-principal" \
  -H "Content-Type: application/json" \
  -H "apikey: SUA_API_KEY" \
  -d '{
    "number": "5548991013293",
    "text": "✅ Teste de conexão - HLJ DEV"
  }'
```

**Resultado esperado:**
- Mensagem chega no WhatsApp do Henrique
- Status 200 na resposta

### Teste 2: Lead → WhatsApp (N8N)
1. Acessar: https://hljdev.com.br
2. Preencher LeadChat
3. Verificar:
   - ✅ N8N recebe webhook
   - ✅ Lead salvo no Supabase
   - ✅ WhatsApp alerta Henrique
   - ✅ Score calculado

### Teste 3: Instagram DM
1. Enviar DM para conta Instagram do HLJ DEV
2. Verificar:
   - ✅ Meta envia webhook para N8N
   - ✅ N8N parseia mensagem
   - ✅ Lead criado no Supabase
   - ✅ WhatsApp alerta Henrique

### Teste 4: Kiwify Venda
1. Fazer compra teste na Kiwify
2. Verificar:
   - ✅ Kiwify envia webhook
   - ✅ N8N processa venda
   - ✅ Venda salva no Supabase
   - ✅ WhatsApp boas-vindas ao cliente
   - ✅ WhatsApp alerta Henrique

---

## ⚠️ PROBLEMAS COMUNS E SOLUÇÕES

### Problema 1: Evolution API não conecta
**Sintoma:** Erro 401 ou 500 ao enviar mensagem  
**Solução:**
```bash
# Verificar status da instância
curl -X GET "https://evolution.hljdev.com.br/instance/connectionState/hlj-principal" \
  -H "apikey: SUA_API_KEY"

# Se status != "open", reconectar
curl -X POST "https://evolution.hljdev.com.br/instance/connect/hlj-principal" \
  -H "apikey: SUA_API_KEY"
```

### Problema 2: Token Instagram expirado
**Sintoma:** Erro 401 do Meta Graph API  
**Solução:**
1. Gerar novo token de longa duração
2. Atualizar variável `META_ACCESS_TOKEN` no N8N
3. Restart workflow

### Problema 3: Webhook do Instagram não recebe dados
**Sintoma:** Nenhuma execução no N8N ao receber DM  
**Solução:**
1. Verificar se webhook está subscribe no Meta
2. Verificar se verify token está correto
3. Testar webhook via curl:
   ```bash
   curl -X GET "https://n8n.hljdev.com.br/webhook/instagram-dm?hub.mode=subscribe&hub.challenge=12345&hub.verify_token=SEU_TOKEN"
   ```
4. Deve retornar: `12345`

### Problema 4: Supabase não salva dados
**Sintoma:** Erro de conexão ou permissão  
**Solução:**
1. Verificar credencial PostgreSQL no N8N
2. Testar conexão
3. Verificar se tabelas existem
4. Verificar RLS (Row Level Security) não bloqueando inserts

---

## 📅 MANUTENÇÃO PROGRAMADA

### Diária:
- [ ] Verificar se Evolution API está online
- [ ] Verificar logs do N8N
- [ ] Verificar leads no Supabase

### Semanal:
- [ ] Verificar métricas de conversão
- [ ] Limpar leads de teste
- [ ] Backup do banco Supabase

### Mensal:
- [ ] Renovar token Instagram (55 dias)
- [ ] Revisar métricas de automações
- [ ] Otimizar workflows N8N
- [ ] Atualizar documentação

### Trimestral:
- [ ] Revisar estratégia de conteúdo
- [ ] Analisar ROI de campanhas
- [ ] Planejar novas automações

---

## 🔐 SEGURANÇA

### Boas Práticas:

1. **NUNCA expor API keys no código**
   - ✅ Usar variáveis de ambiente
   - ✅ Usar credenciais do N8N
   - ❌ Nunca commitar `.env` files

2. **Rotação de credenciais:**
   - API Keys: A cada 90 dias
   - Tokens OAuth: Antes de expirar
   - Senhas PostgreSQL: A cada 6 meses

3. **Monitoramento:**
   - Alertas de uso anormal de API
   - Logs de acesso a credenciais
   - Rate limiting ativado

4. **Backup:**
   - Exportar workflows N8N semanalmente
   - Backup do banco Supabase diário
   - Backup de credenciais (criptografado)

---

## ✅ CONCLUSÃO

### Credenciais Configuradas:
- ✅ Supabase (URL + Keys)
- ✅ N8N API Key
- ⚠️ Evolution API (URL configurada, precisa criar credencial no N8N)
- ❌ Meta Graph API (NÃO configurada - precisa criar)
- ✅ Kiwify Webhook (URL configurada)

### Ações Imediatas Necessárias:
1. **URGENTE:** Criar credenciais no N8N (Supabase + Evolution API)
2. **URGENTE:** Configurar variáveis de ambiente no N8N
3. **IMPORTANTE:** Criar App Meta e configurar Instagram
4. **IMPORTANTE:** Testar todas as automações

### Tempo Estimado para Configuração Completa:
- Supabase: 30 minutos
- Evolution API: 30 minutos
- Meta Graph API: 2-3 horas
- Testes: 1-2 horas
- **Total: 4-5 horas**

---

**VERIFICAÇÃO CONCLUÍDA EM:** 07/04/2026  
**PRÓXIMA REVISÃO:** 14/04/2026  
**RESPONSÁVEL:** Henrique Junqueira - HLJ DEV

---

*Documento gerado automaticamente durante revisão de credenciais de API.*
