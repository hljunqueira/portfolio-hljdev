# HLJ DEV — Automações N8N

Pasta contendo os fluxos de automação prontos para importar no N8N em `n8n.hljdev.com.br`.

**Status da Revisão:** ✅ REVISÃO TÉCNICA CONCLUÍDA (07/04/2026)  
**Workflows Corrigidos:** `04_instagram_dm_lead.json` (JSON inválido corrigido + resposta webhook adicionada)  
**Documentação Completa:** Ver `docs/REVISAO_TECHNICA_WORKFLOWS.md`

---

## 📋 Índice de Fluxos

| # | Arquivo | Nome do Fluxo | Gatilho | Função |
|---|---|---|---|---|
| 01 | `01_lead_inteligente.json` | **HLJ Lead Inteligente** | Webhook POST | Recebe lead do site, calcula Lead Score (0-100pts), salva no Supabase, notifica WhatsApp com link direto pro contato |
| 02 | `02_kiwify_venda.json` | **HLJ Kiwify Vendas** | Webhook POST | Recebe evento da Kiwify, normaliza payload, salva venda no Supabase, envia boas-vindas personalizada por produto |
| 03 | `03_lead_dormindo.json` | **HLJ Alerta Lead Parado** | Cron (Seg-Sáb 9h) | Varre leads parados >48h, gera relatório priorizado por Lead Score e envia no seu WhatsApp |
| 04 | `04_instagram_dm_lead.json` | **HLJ Instagram DM → Lead** | Webhook GET/POST (Meta) | Recebe DMs do Instagram via Meta Graph API, detecta intenção de compra, responde automaticamente e cria lead no Supabase |

---

## 🔑 Variáveis de Ambiente necessárias no N8N

Configure em: **N8N Settings → Variables (ou .env no docker-compose)**

```env
# Supabase (Postgres direto)
SUPABASE_HOST=db.hljdev.com.br
SUPABASE_PORT=5432
SUPABASE_DB=postgres
SUPABASE_USER=postgres
SUPABASE_PASS=SUA_SENHA_AQUI

# WhatsApp (Evolution API — rodando na própria VPS ou externa)
WHATSAPP_API_URL=http://evolution:8080
WHATSAPP_INSTANCE=hlj-principal
WHATSAPP_APIKEY=SUA_CHAVE_EVOLUTION
SEU_WHATSAPP=5548991013293

# Meta Graph API (Instagram DM)
META_VERIFY_TOKEN=hlj-dev-token-secreto-2026
META_ACCESS_TOKEN=EAAxxxxx... (gerado no Meta for Developers)
INSTAGRAM_PAGE_ID=SEU_PAGE_ID_INSTAGRAM
```

---

## ⚠️ PRÉ-REQUISITOS ANTES DA IMPORTAÇÃO

### 1. Configurar Variáveis de Ambiente no N8N

**MÉTODO CORRETO: Via docker-compose.yml** (API não suporta na Community Edition)

#### Opção A: Automática (Recomendada) - Executar Script

```powershell
# No Windows PowerShell (no seu PC local)
cd "c:\Users\Henrique - PC\Desktop\Projetos Dev\portfolio-hljdev"
.\scripts\atualizar-env-n8n.ps1
```

O script irá:
1. ✅ Fazer backup do docker-compose.yml atual
2. ✅ Adicionar as 8 variáveis de ambiente
3. ✅ Reiniciar o N8N automaticamente

#### Opção B: Manual - Editar docker-compose.yml

**Acessar VPS:**
```bash
ssh root@23.80.89.116
cd /root/hlj-infra/n8n
nano docker-compose.yml
```

**Adicionar as seguintes variáveis em `environment:`:**

```yaml
services:
  n8n:
    environment:
      # Supabase (PostgreSQL)
      - SUPABASE_HOST=supabase.hljdev.com.br
      - SUPABASE_PORT=5432
      - SUPABASE_DB=postgres
      - SUPABASE_USER=postgres
      - SUPABASE_PASS=YOUR_SUPABASE_PASSWORD
      
      # WhatsApp (Evolution API)
      - WHATSAPP_API_URL=https://evolution.hljdev.com.br
      - WHATSAPP_INSTANCE=hlj-principal
      - SEU_WHATSAPP=5548991013293
```

**Salvar e reiniciar:**
```bash
docker compose down
docker compose up -d
```

**Verificar se variáveis foram aplicadas:**
```bash
docker exec hlj-n8n env | grep SUPABASE
docker exec hlj-n8n env | grep WHATSAPP
```

### 2. Configurar Supabase (SQL):

**Executar no SQL Editor do Supabase:**
```sql
-- Adicionar coluna updated_at se não existir
ALTER TABLE leads ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
ALTER TABLE leads ADD COLUMN IF NOT EXISTS lead_flags TEXT[];
ALTER TABLE leads ADD COLUMN IF NOT EXISTS interesse TEXT;

-- Criar trigger para atualizar updated_at automaticamente
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

### 3. Criar Credenciais no N8N:

**A) Supabase HLJ DEV (PostgreSQL):**
- Host: `db.supabase.hljdev.com.br` (ou IP interno da VPS)
- Port: `5432`
- Database: `postgres`
- User: `postgres`
- Password: `YOUR_SUPABASE_PASSWORD`
- SSL: `Required`

**B) Evolution API HLJ (HTTP Header Auth):**
- Header Name: `apikey`
- Header Value: `[SUA API KEY DA EVOLUTION API]`

### 4. Workflows 01, 02, 03 - Pronto para importar ✅
### 5. Workflow 04 - SÓ importar após configurar Meta Graph API (ver seção abaixo)

---

## 🚀 Como Importar no N8N

1. Acesse `n8n.hljdev.com.br`
2. Clique em **+** → **Import from File**
3. Selecione o arquivo `.json` desejado
4. Configure as **Credentials** necessárias dentro de cada nó
5. Ative o fluxo (toggle **Active** → ON)

---

## 📡 URLs dos Webhooks (após ativar no N8N)

| Destino | URL do Webhook N8N | Configurar em |
|---|---|---|
| Site (`LeadChat.tsx`) | `https://n8n.hljdev.com.br/webhook/lead-captado` | `.env` do Vercel: `VITE_N8N_WEBHOOK_URL` |
| Kiwify | `https://n8n.hljdev.com.br/webhook/kiwify-venda` | Kiwify → Configurações → Webhooks |
| Instagram DM | `https://n8n.hljdev.com.br/webhook/instagram-dm` | Meta for Developers → Webhooks → Instagram |

---

## 🏗️ Pré-requisitos: Meta for Developers (Instagram DM)

Para ativar o fluxo `04_instagram_dm_lead.json`, você precisará:

1. Criar um **App** em [developers.facebook.com](https://developers.facebook.com)
2. Adicionar o produto **"Instagram" e "Messenger"**
3. Conectar sua **Página do Facebook** vinculada ao Instagram Profissional
4. Gerar um **Access Token de Longa Duração** (Page Access Token)
5. Configurar o Webhook apontando para: `https://n8n.hljdev.com.br/webhook/instagram-dm`
6. Usar `hlj-dev-token-secreto-2026` (ou o valor que definir em `META_VERIFY_TOKEN`) como Verify Token
7. Assinar os eventos: `messages`, `messaging_postbacks`

> ⚠️ **Importante**: Use apenas a **Meta Graph API oficial**. Bots não-oficiais para Instagram violam os Termos de Serviço e podem resultar em banimento da conta.
