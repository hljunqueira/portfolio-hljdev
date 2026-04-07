# HLJ DEV — Automações N8N

Pasta contendo os fluxos de automação prontos para importar no N8N em `n8n.hljdev.com.br`.

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
