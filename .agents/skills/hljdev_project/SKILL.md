---
name: "hljdev_project"
description: "Roadmap and infrastructure for the hljdev.com.br environment (Elite Software Engineering), containing Vercel app, n8n, Supabase, Evolution API, and Gemini Image."
---

# `hljdev.com.br` Elite Tech Context

This skill file documents the architecture and roadmap to orchestrate the high-converting ecosystem of HLJ DEV.

## 🏢 Architecture Overview

### Domains & Hosting
- **`hljdev.com.br`** → Main Frontend (React Portfolio + Admin) on **Vercel**
- **`n8n.hljdev.com.br`** → N8N on VPS port `3012`
- **`db.hljdev.com.br`** → Supabase Studio on VPS port `3013`

### Services (Elite Rebranding)
1. **Frontend + Admin (Vercel)**: Focus on high-converting sales for **Sites & Sistemas**. Admin at `/admin`.
2. **N8N (VPS Docker)**: Serverless backend for all business logic and AI orchestration.
3. **Supabase (VPS Docker)**: Postgres DB + Auth + CRM storage.
4. **Evolution API (VPS Docker)**: WhatsApp API for real-time customer engagement.

## 🛠️ Admin Dashboard Screens

| Route | Screen | Key Features |
|---|---|---|
| `/admin` | Dashboard | KPIs de Elite, Log de Atividades, Leads Urgentes |
| `/admin/pipeline` | Kanban Leads | Score Inteligente, ViaCEP Data, WhatsApp Direto |
| `/admin/propostas` | Propostas IA | Groq Llama 3.3 + Mockups Gemini, Preços Premium |
| `/admin/projetos` | Projetos | Kanban de entrega (Briefing → Entrega de Elite) |
| `/admin/analytics` | Analytics | Instagram LTV, Pixel Status, Performance de Vendas |

## 📋 Lead Discovery & Chat
- **ViaCEP Integration**: Automatic address lookup in `LeadChat.tsx`. Handles city-level unique CEPs.
- **Validations**: Real-time Regex for Email and WhatsApp (DDD+Number).
- **Lead Score**: Calculated in N8N based on Corporate Email, detailed message, and High-Value interest.

## 🤖 N8N Automações (Revisadas)

| Arquivo | Gatilho | Função de Elite |
|---|---|---|
| `01_lead_inteligente.json` | Webhook POST `/lead-captado` | Score (Sites/Sistemas Elite = 100pts) + Supabase + Alerta WA |
| `05_proposta_ia.json` | Webhook interno | Groq (Llama 3.3) gera propostas de R$ 4.5k a R$ 8.5k automaticamente |
| `02_kiwify_venda.json` | Webhook POST `/kiwify-venda` | Sincronização de vendas e boas-vindas VIP |

## 💰 Price Table (IA Proposals)
- **Site Institucional de Elite**: R$ 4.500,00+
- **Sistema Web Personalizado**: R$ 8.500,00+
- **Automação de Processos (n8n)**: R$ 3.500,00+

## 🚀 VPS Commands
```bash
ssh root@23.80.89.116
cd /root/hlj-dev
docker compose up -d --build
```

## 📌 Rules & Guidelines
- **Premium Branding**: Always use "Elite", "High Performance", and "Authority" in copy.
- **Contextual Chat**: LeadChat messages must adapt to user's selected interest.
- **No Custom Backend**: All logic resides in N8N.
- **Data Integrity**: Never allow leads with invalid Email or Phone formats.
- **Geo-Intelligence**: Use CEP to prioritize leads by region in the Admin Map.
