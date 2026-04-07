---
name: "hljdev_project"
description: "Roadmap and infrastructure for the hljdev.com.br environment, containing a single Vercel app (Portfolio + Admin), n8n, Supabase, Evolution API, and Gemini Image."
---

# `hljdev.com.br` Full-Stack Context

This skill file documents the final architecture, commands, and roadmap to orchestrate the entire `hljdev.com.br` ecosystem.

## 🏢 Architecture Overview

### Domains & Hosting
- **`hljdev.com.br`** → Main Frontend (React Portfolio + Admin) on **Vercel**
- **`admin.hljdev.com.br`** → Caddy 301 Redirect → `hljdev.com.br/admin`
- **`n8n.hljdev.com.br`** → N8N on VPS port `3012`
- **`db.hljdev.com.br`** → Supabase Studio on VPS port `3013`

### Services
1. **Frontend + Admin (Vercel)**: Single React app. Public portfolio at `/` and secure admin at `/admin` (Supabase Auth protected).
2. **N8N (VPS Docker)**: Serverless backend. Handles all webhooks, AI calls, WhatsApp dispatch, and cron jobs.
3. **Supabase (VPS Docker)**: Postgres DB + Auth + Storage for logos/mockups.
4. **Evolution API (VPS Docker)**: WhatsApp API for sending/receiving messages.

## 🛠️ Admin Dashboard Screens

| Route | Screen | Key Features |
|---|---|---|
| `/admin` | Dashboard | Meta faturamento, KPIs com variação, Log de atividades, Urgentes |
| `/admin/pipeline` | Kanban Leads | Score, WA direto, filtros, histórico de status, templates de msg |
| `/admin/propostas` | Propostas IA | Mockup Gemini, editar/aprovar, abas por status |
| `/admin/vendas` | Vendas Kiwify | Tabela + filtro período + cards por produto |
| `/admin/projetos` | Projetos | Kanban de entrega (Briefing→Entregue) |
| `/admin/produtos` | Shop CRUD | Editar produtos sem deploy |
| `/admin/analytics` | Analytics | Instagram monitor, LTV, GA4, Caption IA, Pixel status |
| `/admin/tarefas` | Agenda | Follow-ups com alerta N8N no WhatsApp |
| `/admin/config` | Config | Templates WA, meta mensal, toggles N8N |

## 📋 Supabase Tables

- `leads` — dados do Discovery Chat (score, logo_url, cores_hex, etc.)
- `lead_historico` — timeline de mudanças de status
- `propostas` — propostas geradas pela IA + mockup_url
- `vendas` — espelho das vendas Kiwify
- `produtos` — CRUD dinâmico da Shop
- `tarefas` — agenda de follow-ups
- `templates_mensagem` — banco de templates WhatsApp
- `projetos` — andamento dos projetos contratados
- `atividades_log` — log global de eventos do sistema

## 🤖 N8N Automações (pasta `automacoes/`)

| Arquivo | Gatilho | Função |
|---|---|---|
| `01_lead_inteligente.json` | Webhook POST `/lead-captado` | Score + Supabase + WhatsApp |
| `02_kiwify_venda.json` | Webhook POST `/kiwify-venda` | Kiwify → Supabase + boas-vindas por produto |
| `03_lead_dormindo.json` | Cron seg-sáb 9h | Alerta leads parados >48h |
| `04_instagram_dm_lead.json` | Webhook Meta Graph API | DM Instagram → Lead + resposta automática |
| `05_proposta_ia.json` | Webhook interno | Groq + Gemini Image → proposta completa |
| `06_relatorio_semanal.json` | Cron domingo 20h | Resumo semanal no WhatsApp |
| `07_agenda_followup.json` | Cron a cada hora | Verifica `tarefas` → alerta WhatsApp |

## 🔑 Variáveis de Ambiente N8N

```env
SUPABASE_HOST, SUPABASE_PORT, SUPABASE_DB, SUPABASE_USER, SUPABASE_PASS
WHATSAPP_API_URL (Evolution API internal URL)
WHATSAPP_INSTANCE, WHATSAPP_APIKEY
SEU_WHATSAPP=5548991013293
META_VERIFY_TOKEN, META_ACCESS_TOKEN, INSTAGRAM_PAGE_ID
GROQ_API_KEY
GEMINI_API_KEY
```

## 🚀 VPS Commands

```bash
ssh root@76.13.171.93
cd /root/hlj-dev
docker compose up -d --build
systemctl reload caddy
```

## 📌 Rules

- NEVER build a custom Node API — use N8N for all backend logic.
- Admin UI changes go in `src/pages/Admin.tsx` — no separate admin folder.
- `admin.hljdev.com.br` redirects via Caddy to Vercel, not a separate container.
- Shop products are stored in Supabase `produtos` table — not hardcoded in `Shop.tsx`.
- Image generation uses **Gemini Flash Image (Nano Banana)** free tier.
- Text generation uses **Groq API** (Llama 3.3) free tier.
