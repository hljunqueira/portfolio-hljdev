import json
import os

# Diretorio de saida
output_dir = os.path.join(os.path.dirname(__file__), '..', 'automacoes')

# Headers padrao Supabase
SUPABASE_HEADERS = {
    "apikey": "=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzc1NTI4NDk5LCJleHAiOjIwOTA4ODg0OTl9.3fu-B2l3sM9EvkOcNXLSb4UAWvQIbAFyec7gnQ1Ax5c",
    "Authorization": "=Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzc1NTI4NDk5LCJleHAiOjIwOTA4ODg0OTl9.3fu-B2l3sM9EvkOcNXLSb4UAWvQIbAFyec7gnQ1Ax5c",
    "Content-Type": "application/json"
}

# Workflow 07 - Agenda Follow-up
workflow07 = {
    "name": "HLJ Agenda Follow-ups",
    "nodes": [
        {
            "parameters": {"rule": {"interval": [{"field": "cronExpression", "expression": "0 9 * * 1-5"}]}},
            "id": "node-cron",
            "name": "Cron - Seg-Sex 9h",
            "type": "n8n-nodes-base.scheduleTrigger",
            "typeVersion": 1.2,
            "position": [240, 300]
        },
        {
            "parameters": {
                "method": "GET",
                "url": "={{ $env.SUPABASE_HOST }}/rest/v1/tarefas?status=eq.pendente&data=eq.{{ $now.toFormat('yyyy-MM-dd') }}",
                "sendHeaders": True,
                "headerParameters": {"parameters": [{"name": k, "value": v} for k, v in SUPABASE_HEADERS.items()]},
                "options": {}
            },
            "id": "node-buscar-tarefas",
            "name": "Supabase - Buscar Tarefas do Dia",
            "type": "n8n-nodes-base.httpRequest",
            "typeVersion": 4.2,
            "position": [500, 300]
        },
        {
            "parameters": {
                "jsCode": "const tarefas = $input.first().json;\nconst lista = tarefas.slice(0, 10).map((t, i) => `${i+1}. ${t.titulo} - ${t.lead_nome}`).join('\\n');\nconst msg = tarefas.length > 0 ? `📋 AGENDA DO DIA\\n━━━━━━━━━━━━━━━\\n${lista}\\n━━━━━━━━━━━━━━━\\nTotal: ${tarefas.length} tarefa(s)` : '✅ Nenhuma tarefa para hoje!';\nreturn [{ json: { mensagem: msg, total: tarefas.length } }];"
            },
            "id": "node-resumo",
            "name": "Montar Resumo",
            "type": "n8n-nodes-base.code",
            "typeVersion": 2,
            "position": [760, 300]
        },
        {
            "parameters": {
                "method": "POST",
                "url": "={{ $env.WHATSAPP_API_URL }}/message/sendText/{{ $env.WHATSAPP_INSTANCE }}",
                "sendHeaders": True,
                "headerParameters": {"parameters": [{"name": "apikey", "value": "={{ $env.WHATSAPP_API_KEY }}"}, {"name": "Content-Type", "value": "application/json"}]},
                "sendBody": True,
                "bodyParameters": {"parameters": [{"name": "number", "value": "={{ $env.SEU_WHATSAPP }}"}, {"name": "text", "value": "={{ $json.mensagem }}"}]},
                "options": {}
            },
            "id": "node-enviar",
            "name": "WhatsApp - Enviar Agenda",
            "type": "n8n-nodes-base.httpRequest",
            "typeVersion": 4.2,
            "position": [1020, 300]
        }
    ],
    "connections": {
        "Cron - Seg-Sex 9h": {"main": [[{"node": "Supabase - Buscar Tarefas do Dia", "type": "main", "index": 0}]]},
        "Supabase - Buscar Tarefas do Dia": {"main": [[{"node": "Montar Resumo", "type": "main", "index": 0}]]},
        "Montar Resumo": {"main": [[{"node": "WhatsApp - Enviar Agenda", "type": "main", "index": 0}]]}
    },
    "pinData": {},
    "settings": {"executionOrder": "v1", "saveManualExecutions": True},
    "tags": [{"name": "HLJ DEV"}, {"name": "Agenda"}],
    "triggerCount": 0,
    "versionId": "07-hlj-agenda-followup"
}

# Workflow 09 - Recuperacao Carrinho
workflow09 = {
    "name": "HLJ Recuperação Carrinho Abandonado",
    "nodes": [
        {
            "parameters": {"path": "kiwify-carrinho", "httpMethod": "POST", "responseMode": "responseNode", "options": {}},
            "id": "node-webhook",
            "name": "Webhook - Kiwify Carrinho",
            "type": "n8n-nodes-base.webhook",
            "typeVersion": 2,
            "position": [240, 300],
            "webhookId": "hlj-carrinho-abandonado"
        },
        {
            "parameters": {"amount": 1, "unit": "hours"},
            "id": "node-wait-1h",
            "name": "Wait 1 Hora",
            "type": "n8n-nodes-base.wait",
            "typeVersion": 1.1,
            "position": [500, 300]
        },
        {
            "parameters": {
                "method": "POST",
                "url": "={{ $env.WHATSAPP_API_URL }}/message/sendText/{{ $env.WHATSAPP_INSTANCE }}",
                "sendHeaders": True,
                "headerParameters": {"parameters": [{"name": "apikey", "value": "={{ $env.WHATSAPP_API_KEY }}"}, {"name": "Content-Type", "value": "application/json"}]},
                "sendBody": True,
                "bodyParameters": {"parameters": [{"name": "number", "value": "=55{{ $('Webhook - Kiwify Carrinho').first().json.body.customer.mobile.replace(/\\D/g, '') }}"}, {"name": "text", "value": "=Oi {{ $('Webhook - Kiwify Carrinho').first().json.body.customer.name }}! Vi que quase finalizou sua compra. Precisa de ajuda? Estou aqui! 😊"}]},
                "options": {}
            },
            "id": "node-msg-1h",
            "name": "WhatsApp - Mensagem 1h",
            "type": "n8n-nodes-base.httpRequest",
            "typeVersion": 4.2,
            "position": [760, 300]
        },
        {
            "parameters": {"amount": 23, "unit": "hours"},
            "id": "node-wait-24h",
            "name": "Wait 24 Horas",
            "type": "n8n-nodes-base.wait",
            "typeVersion": 1.1,
            "position": [1020, 300]
        },
        {
            "parameters": {
                "method": "POST",
                "url": "={{ $env.WHATSAPP_API_URL }}/message/sendText/{{ $env.WHATSAPP_INSTANCE }}",
                "sendHeaders": True,
                "headerParameters": {"parameters": [{"name": "apikey", "value": "={{ $env.WHATSAPP_API_KEY }}"}, {"name": "Content-Type", "value": "application/json"}]},
                "sendBody": True,
                "bodyParameters": {"parameters": [{"name": "number", "value": "=55{{ $('Webhook - Kiwify Carrinho').first().json.body.customer.mobile.replace(/\\D/g, '') }}"}, {"name": "text", "value": "={{ $('Webhook - Kiwify Carrinho').first().json.body.customer.name }}, separei um cupom de 10% OFF: CARRINHO10 🎁 Finalize agora!"}]},
                "options": {}
            },
            "id": "node-msg-24h",
            "name": "WhatsApp - Cupom 24h",
            "type": "n8n-nodes-base.httpRequest",
            "typeVersion": 4.2,
            "position": [1280, 300]
        },
        {
            "parameters": {"respondWith": "json", "responseBody": "={\"ok\": true}", "options": {}},
            "id": "node-resposta",
            "name": "Resposta OK",
            "type": "n8n-nodes-base.respondToWebhook",
            "typeVersion": 1.1,
            "position": [1540, 300]
        }
    ],
    "connections": {
        "Webhook - Kiwify Carrinho": {"main": [[{"node": "Wait 1 Hora", "type": "main", "index": 0}]]},
        "Wait 1 Hora": {"main": [[{"node": "WhatsApp - Mensagem 1h", "type": "main", "index": 0}]]},
        "WhatsApp - Mensagem 1h": {"main": [[{"node": "Wait 24 Horas", "type": "main", "index": 0}]]},
        "Wait 24 Horas": {"main": [[{"node": "WhatsApp - Cupom 24h", "type": "main", "index": 0}]]},
        "WhatsApp - Cupom 24h": {"main": [[{"node": "Resposta OK", "type": "main", "index": 0}]]}
    },
    "pinData": {},
    "settings": {"executionOrder": "v1", "saveManualExecutions": True},
    "tags": [{"name": "HLJ DEV"}, {"name": "Kiwify"}, {"name": "Recuperação"}],
    "triggerCount": 1,
    "versionId": "09-hlj-recuperacao-carrinho"
}

# Salvar workflows
workflows = {
    '07_agenda_followup.json': workflow07,
    '09_recuperacao_carrinho.json': workflow09
}

for filename, workflow in workflows.items():
    filepath = os.path.join(output_dir, filename)
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(workflow, f, indent=2, ensure_ascii=False)
    print(f'✅ {filename} criado!')

print(f'\n🎉 Workflows 07 e 09 criados com sucesso!')

# ============================================
# WORKFLOW 08 - FOLLOW-UP AUTOMÁTICO
# ============================================
workflow08 = {
    "name": "HLJ Follow-up Automático",
    "nodes": [
        {
            "parameters": {"rule": {"interval": [{"field": "cronExpression", "expression": "0 */2 * * *"}]}},
            "id": "node-cron",
            "name": "Cron - A Cada 2 Horas",
            "type": "n8n-nodes-base.scheduleTrigger",
            "typeVersion": 1.2,
            "position": [240, 300]
        },
        {
            "parameters": {
                "method": "GET",
                "url": "={{ $env.SUPABASE_HOST }}/rest/v1/leads?status=eq.novo&order=created_at.desc",
                "sendHeaders": True,
                "headerParameters": {"parameters": [{"name": k, "value": v} for k, v in SUPABASE_HEADERS.items()]},
                "options": {}
            },
            "id": "node-buscar",
            "name": "Supabase - Buscar Leads Novos",
            "type": "n8n-nodes-base.httpRequest",
            "typeVersion": 4.2,
            "position": [500, 300]
        },
        {
            "parameters": {
                "jsCode": "const leads = $input.first().json;\nconst agora = Date.now();\nconst leads2h = leads.filter(lead => {\n  const criado = new Date(lead.created_at).getTime();\n  const horas = (agora - criado) / (1000 * 60 * 60);\n  return horas >= 2 && horas < 4;\n});\nreturn leads2h.map(lead => ({ json: lead }));"
            },
            "id": "node-filtrar",
            "name": "Filtrar Leads 2h+",
            "type": "n8n-nodes-base.code",
            "typeVersion": 2,
            "position": [760, 300]
        },
        {
            "parameters": {"conditions": {"options": {}, "conditions": [{"id": "cond", "leftValue": "={{ $items().length }}", "rightValue": 0, "operator": {"type": "number", "operation": "gt"}}]}},
            "id": "node-if",
            "name": "Tem Leads?",
            "type": "n8n-nodes-base.if",
            "typeVersion": 2,
            "position": [1020, 300]
        },
        {
            "parameters": {
                "jsCode": "const lead = $input.first().json;\nconst score = parseInt(lead.score) || 0;\nlet msg = '';\nif (score >= 70) msg = `Oi ${lead.nome?.split(' ')[0]}! Vi seu interesse em automacao. Posso mostrar um case similar? Responda SIM!`;\nelse if (score >= 45) msg = `Oi ${lead.nome?.split(' ')[0]}! Separei material sobre automacao. Quer receber?`;\nelse msg = `Oi ${lead.nome?.split(' ')[0]}! Quer dicas semanais de IA? E gratis!`;\nconst numero = lead.telefone ? '55' + lead.telefone.replace(/\\D/g, '') : null;\nreturn [{ json: { lead_id: lead.id, lead_nome: lead.nome, numero, mensagem: msg, score } }];"
            },
            "id": "node-msg",
            "name": "Montar Mensagem por Score",
            "type": "n8n-nodes-base.code",
            "typeVersion": 2,
            "position": [1280, 200]
        },
        {
            "parameters": {
                "method": "POST",
                "url": "={{ $env.WHATSAPP_API_URL }}/message/sendText/{{ $env.WHATSAPP_INSTANCE }}",
                "sendHeaders": True,
                "headerParameters": {"parameters": [{"name": "apikey", "value": "={{ $env.WHATSAPP_API_KEY }}"}, {"name": "Content-Type", "value": "application/json"}]},
                "sendBody": True,
                "bodyParameters": {"parameters": [{"name": "number", "value": "={{ $json.numero }}"}, {"name": "text", "value": "={{ $json.mensagem }}"}]},
                "options": {}
            },
            "id": "node-enviar",
            "name": "WhatsApp - Enviar Follow-up",
            "type": "n8n-nodes-base.httpRequest",
            "typeVersion": 4.2,
            "position": [1540, 200]
        },
        {
            "parameters": {
                "method": "PATCH",
                "url": "={{ $env.SUPABASE_HOST }}/rest/v1/leads?id=eq.{{ $json.lead_id }}",
                "sendHeaders": True,
                "headerParameters": {"parameters": [{"name": k, "value": v} for k, v in SUPABASE_HEADERS.items()]},
                "sendBody": True,
                "bodyParameters": {"parameters": [{"name": "status", "value": "followup_enviado"}]},
                "options": {}
            },
            "id": "node-update",
            "name": "Supabase - Atualizar Status",
            "type": "n8n-nodes-base.httpRequest",
            "typeVersion": 4.2,
            "position": [1800, 200]
        },
        {
            "parameters": {"jsCode": "console.log('[HLJ] Sem leads para follow-up');\nreturn [{ json: { status: 'sem_leads' } }];"},
            "id": "node-log",
            "name": "Log - Sem Leads",
            "type": "n8n-nodes-base.code",
            "typeVersion": 2,
            "position": [1280, 400]
        }
    ],
    "connections": {
        "Cron - A Cada 2 Horas": {"main": [[{"node": "Supabase - Buscar Leads Novos", "type": "main", "index": 0}]]},
        "Supabase - Buscar Leads Novos": {"main": [[{"node": "Filtrar Leads 2h+", "type": "main", "index": 0}]]},
        "Filtrar Leads 2h+": {"main": [[{"node": "Tem Leads?", "type": "main", "index": 0}]]},
        "Tem Leads?": {"main": [[{"node": "Montar Mensagem por Score", "type": "main", "index": 0}], [{"node": "Log - Sem Leads", "type": "main", "index": 0}]]},
        "Montar Mensagem por Score": {"main": [[{"node": "WhatsApp - Enviar Follow-up", "type": "main", "index": 0}]]},
        "WhatsApp - Enviar Follow-up": {"main": [[{"node": "Supabase - Atualizar Status", "type": "main", "index": 0}]]}
    },
    "pinData": {},
    "settings": {"executionOrder": "v1", "saveManualExecutions": True},
    "tags": [{"name": "HLJ DEV"}, {"name": "CRM"}, {"name": "Follow-up"}],
    "triggerCount": 0,
    "versionId": "08-hlj-followup-automatico"
}

# ============================================
# WORKFLOW 10 - UPSELL PÓS-COMPRA
# ============================================
workflow10 = {
    "name": "HLJ Upsell Pós-Compra",
    "nodes": [
        {
            "parameters": {"rule": {"interval": [{"field": "cronExpression", "expression": "0 10 * * *"}]}},
            "id": "node-cron",
            "name": "Cron - Diario 10h",
            "type": "n8n-nodes-base.scheduleTrigger",
            "typeVersion": 1.2,
            "position": [240, 300]
        },
        {
            "parameters": {
                "method": "GET",
                "url": "={{ $env.SUPABASE_HOST }}/rest/v1/vendas?status=eq.aprovado&created_at=gte.{{ $now.minus(2, 'day').toISO() }}&created_at=lte.{{ $now.minus(1, 'day').toISO() }}",
                "sendHeaders": True,
                "headerParameters": {"parameters": [{"name": k, "value": v} for k, v in SUPABASE_HEADERS.items()]},
                "options": {}
            },
            "id": "node-vendas",
            "name": "Supabase - Vendas 48h Atras",
            "type": "n8n-nodes-base.httpRequest",
            "typeVersion": 4.2,
            "position": [500, 300]
        },
        {
            "parameters": {
                "jsCode": "const vendas = $input.first().json;\nconst upsellMap = {\n  'Mega Pack de Prompts Elite': 'I.A. Masterclass Pro',\n  'I.A. Masterclass Pro': 'Acesso Premium Total',\n  'Acesso Premium Total': null\n};\nconst upsells = vendas.filter(v => !v.upsell_enviado).map(v => ({\n  ...v,\n  produto_recomendado: upsellMap[v.produto]\n})).filter(v => v.produto_recomendado);\nreturn upsells.map(v => ({ json: v }));"
            },
            "id": "node-filtrar",
            "name": "Filtrar Upsells",
            "type": "n8n-nodes-base.code",
            "typeVersion": 2,
            "position": [760, 300]
        },
        {
            "parameters": {
                "method": "POST",
                "url": "={{ $env.WHATSAPP_API_URL }}/message/sendText/{{ $env.WHATSAPP_INSTANCE }}",
                "sendHeaders": True,
                "headerParameters": {"parameters": [{"name": "apikey", "value": "={{ $env.WHATSAPP_API_KEY }}"}, {"name": "Content-Type", "value": "application/json"}]},
                "sendBody": True,
                "bodyParameters": {"parameters": [{"name": "number", "value": "=55{{ $json.cliente_whatsapp?.replace(/\\D/g, '') }}"}, {"name": "text", "value": "={{ $json.cliente_nome }}, vi que comprou {{ $json.produto }}! 🎉\n\nQue tal evoluir para {{ $json.produto_recomendado }} com 20% OFF?\n\nUse cupom: UPGRADE20\nValido por 48h! 🔥"}]},
                "options": {}
            },
            "id": "node-upsell",
            "name": "WhatsApp - Oferta Upsell",
            "type": "n8n-nodes-base.httpRequest",
            "typeVersion": 4.2,
            "position": [1020, 300]
        },
        {
            "parameters": {
                "method": "PATCH",
                "url": "={{ $env.SUPABASE_HOST }}/rest/v1/vendas?id=eq.{{ $json.id }}",
                "sendHeaders": True,
                "headerParameters": {"parameters": [{"name": k, "value": v} for k, v in SUPABASE_HEADERS.items()]},
                "sendBody": True,
                "bodyParameters": {"parameters": [{"name": "upsell_enviado", "value": True}]},
                "options": {}
            },
            "id": "node-update",
            "name": "Supabase - Marcar Upsell Enviado",
            "type": "n8n-nodes-base.httpRequest",
            "typeVersion": 4.2,
            "position": [1280, 300]
        }
    ],
    "connections": {
        "Cron - Diario 10h": {"main": [[{"node": "Supabase - Vendas 48h Atras", "type": "main", "index": 0}]]},
        "Supabase - Vendas 48h Atras": {"main": [[{"node": "Filtrar Upsells", "type": "main", "index": 0}]]},
        "Filtrar Upsells": {"main": [[{"node": "WhatsApp - Oferta Upsell", "type": "main", "index": 0}]]},
        "WhatsApp - Oferta Upsell": {"main": [[{"node": "Supabase - Marcar Upsell Enviado", "type": "main", "index": 0}]]}
    },
    "pinData": {},
    "settings": {"executionOrder": "v1", "saveManualExecutions": True},
    "tags": [{"name": "HLJ DEV"}, {"name": "Upsell"}, {"name": "Vendas"}],
    "triggerCount": 0,
    "versionId": "10-hlj-upsell-pos-compra"
}

# ============================================
# WORKFLOW 11 - RECOMPRA LTV
# ============================================
workflow11 = {
    "name": "HLJ Recompra LTV",
    "nodes": [
        {
            "parameters": {"rule": {"interval": [{"field": "cronExpression", "expression": "0 9 1 * *"}]}},
            "id": "node-cron",
            "name": "Cron - Dia 1 Todo Mes",
            "type": "n8n-nodes-base.scheduleTrigger",
            "typeVersion": 1.2,
            "position": [240, 300]
        },
        {
            "parameters": {
                "method": "GET",
                "url": "={{ $env.SUPABASE_HOST }}/rest/v1/vendas?status=eq.aprovado",
                "sendHeaders": True,
                "headerParameters": {"parameters": [{"name": k, "value": v} for k, v in SUPABASE_HEADERS.items()]},
                "options": {}
            },
            "id": "node-vendas",
            "name": "Supabase - Buscar Todas Vendas",
            "type": "n8n-nodes-base.httpRequest",
            "typeVersion": 4.2,
            "position": [500, 300]
        },
        {
            "parameters": {
                "jsCode": "const vendas = $input.first().json;\nconst agora = Date.now();\nconst clientesInativos = vendas.filter(v => {\n  const ultimaCompra = new Date(v.created_at).getTime();\n  const dias = (agora - ultimaCompra) / (1000 * 60 * 60 * 24);\n  return dias >= 60 && dias <= 90;\n});\nreturn clientesInativos.map(v => ({ json: v }));"
            },
            "id": "node-filtrar",
            "name": "Filtrar 60-90 Dias",
            "type": "n8n-nodes-base.code",
            "typeVersion": 2,
            "position": [760, 300]
        },
        {
            "parameters": {
                "method": "POST",
                "url": "={{ $env.WHATSAPP_API_URL }}/message/sendText/{{ $env.WHATSAPP_INSTANCE }}",
                "sendHeaders": True,
                "headerParameters": {"parameters": [{"name": "apikey", "value": "={{ $env.WHATSAPP_API_KEY }}"}, {"name": "Content-Type", "value": "application/json"}]},
                "sendBody": True,
                "bodyParameters": {"parameters": [{"name": "number", "value": "=55{{ $json.cliente_whatsapp?.replace(/\\D/g, '') }}"}, {"name": "text", "value": "={{ $json.cliente_nome }}, faz tempo que nao nos falamos! 😊\n\nTemos NOVIDADES exclusivas para clientes VIP:\n\n🎁 Oferta especial so essa semana!\n\nBora conferir? Responda SIM!"}]},
                "options": {}
            },
            "id": "node-oferta",
            "name": "WhatsApp - Oferta VIP",
            "type": "n8n-nodes-base.httpRequest",
            "typeVersion": 4.2,
            "position": [1020, 300]
        },
        {
            "parameters": {
                "method": "POST",
                "url": "={{ $env.WHATSAPP_API_URL }}/message/sendText/{{ $env.WHATSAPP_INSTANCE }}",
                "sendHeaders": True,
                "headerParameters": {"parameters": [{"name": "apikey", "value": "={{ $env.WHATSAPP_API_KEY }}"}, {"name": "Content-Type", "value": "application/json"}]},
                "sendBody": True,
                "bodyParameters": {"parameters": [{"name": "number", "value": "={{ $env.SEU_WHATSAPP }}"}, {"name": "text", "value": "📊 LTV - {{ $items().length }} cliente(s) VIP contatado(s) para recompra."}]},
                "options": {}
            },
            "id": "node-log",
            "name": "WhatsApp - Log Henrique",
            "type": "n8n-nodes-base.httpRequest",
            "typeVersion": 4.2,
            "position": [1280, 300]
        }
    ],
    "connections": {
        "Cron - Dia 1 Todo Mes": {"main": [[{"node": "Supabase - Buscar Todas Vendas", "type": "main", "index": 0}]]},
        "Supabase - Buscar Todas Vendas": {"main": [[{"node": "Filtrar 60-90 Dias", "type": "main", "index": 0}]]},
        "Filtrar 60-90 Dias": {"main": [[{"node": "WhatsApp - Oferta VIP", "type": "main", "index": 0}]]},
        "WhatsApp - Oferta VIP": {"main": [[{"node": "WhatsApp - Log Henrique", "type": "main", "index": 0}]]}
    },
    "pinData": {},
    "settings": {"executionOrder": "v1", "saveManualExecutions": True},
    "tags": [{"name": "HLJ DEV"}, {"name": "LTV"}, {"name": "Recompra"}],
    "triggerCount": 0,
    "versionId": "11-hlj-recompra-ltv"
}

# ============================================
# WORKFLOW 13 - POSTS AUTOMATICOS INSTAGRAM
# ============================================
workflow13 = {
    "name": "HLJ Postagem Automatica Instagram",
    "nodes": [
        {
            "parameters": {"rule": {"interval": [{"field": "cronExpression", "expression": "0 9 * * *"}]}},
            "id": "node-cron",
            "name": "Cron - Diario 9h",
            "type": "n8n-nodes-base.scheduleTrigger",
            "typeVersion": 1.2,
            "position": [240, 300]
        },
        {
            "parameters": {
                "jsCode": "const temas = [\n  'Automacao de Atendimento WhatsApp',\n  'Agentes de IA para Vendas 24/7',\n  'Sistemas Web Personalizados',\n  'Eliminacao de Trabalho Bracal',\n  'Escala de Negocios com Tecnologia',\n  'Produtividade com IA',\n  'Cases de Sucesso em Automacao'\n];\nconst dia = new Date().getDay();\nreturn [{ json: { tema: temas[dia], dia_semana: dia } }];"
            },
            "id": "node-tema",
            "name": "Selecionar Tema do Dia",
            "type": "n8n-nodes-base.code",
            "typeVersion": 2,
            "position": [500, 300]
        },
        {
            "parameters": {
                "method": "POST",
                "url": "https://api.groq.com/openai/v1/chat/completions",
                "sendHeaders": True,
                "headerParameters": {"parameters": [{"name": "Authorization", "value": "=Bearer {{ $env.GROQ_API_KEY }}"}, {"name": "Content-Type", "value": "application/json"}]},
                "sendBody": True,
                "bodyParameters": {"parameters": [
                    {"name": "model", "value": "llama-3.3-70b-versatile"},
                    {"name": "messages", "value": "={{ JSON.stringify([{role:'system',content:'Voce e especialista em marketing digital e automacao com IA.'},{role:'user',content:'Crie legenda ENG AJADORA para Instagram sobre: '+$json.tema+'. REGRAS: 1)Max 2200 chars 2)Tom profissional 3)Hook impactante 4)CTA: Link na bio → hljdev.com.br 5)3-5 hashtags 6)Max 5 emojis 7)Foque em dores do empresario'}]) }}"},
                    {"name": "temperature", "value": 0.8},
                    {"name": "max_tokens", "value": 500}
                ]},
                "options": {}
            },
            "id": "node-groq",
            "name": "Groq - Gerar Legenda",
            "type": "n8n-nodes-base.httpRequest",
            "typeVersion": 4.2,
            "position": [760, 300]
        },
        {
            "parameters": {
                "method": "POST",
                "url": "https://graph.facebook.com/v19.0/{{ $env.INSTAGRAM_PAGE_ID }}/media",
                "sendHeaders": True,
                "headerParameters": {"parameters": [{"name": "Authorization", "value": "=Bearer {{ $env.META_ACCESS_TOKEN }}"}, {"name": "Content-Type", "value": "application/json"}]},
                "sendBody": True,
                "bodyParameters": {"parameters": [
                    {"name": "image_url", "value": "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1080&h=1080&fit=crop"},
                    {"name": "caption", "value": "={{ $('Groq - Gerar Legenda').first().json.choices[0].message.content }}"}
                ]},
                "options": {}
            },
            "id": "node-publicar",
            "name": "Meta API - Publicar Post",
            "type": "n8n-nodes-base.httpRequest",
            "typeVersion": 4.2,
            "position": [1020, 300]
        },
        {
            "parameters": {
                "method": "POST",
                "url": "={{ $env.WHATSAPP_API_URL }}/message/sendText/{{ $env.WHATSAPP_INSTANCE }}",
                "sendHeaders": True,
                "headerParameters": {"parameters": [{"name": "apikey", "value": "={{ $env.WHATSAPP_API_KEY }}"}, {"name": "Content-Type", "value": "application/json"}]},
                "sendBody": True,
                "bodyParameters": {"parameters": [
                    {"name": "number", "value": "={{ $env.SEU_WHATSAPP }}"},
                    {"name": "text", "value": "✅ POST PUBLICADO!\n\nTema: {{ $('Selecionar Tema do Dia').first().json.tema }}\n\n📱 Instagram: @hljdev"}
                ]},
                "options": {}
            },
            "id": "node-notificar",
            "name": "WhatsApp - Notificar Henrique",
            "type": "n8n-nodes-base.httpRequest",
            "typeVersion": 4.2,
            "position": [1280, 300]
        }
    ],
    "connections": {
        "Cron - Diario 9h": {"main": [[{"node": "Selecionar Tema do Dia", "type": "main", "index": 0}]]},
        "Selecionar Tema do Dia": {"main": [[{"node": "Groq - Gerar Legenda", "type": "main", "index": 0}]]},
        "Groq - Gerar Legenda": {"main": [[{"node": "Meta API - Publicar Post", "type": "main", "index": 0}]]},
        "Meta API - Publicar Post": {"main": [[{"node": "WhatsApp - Notificar Henrique", "type": "main", "index": 0}]]}
    },
    "pinData": {},
    "settings": {"executionOrder": "v1", "saveManualExecutions": True},
    "tags": [{"name": "HLJ DEV"}, {"name": "Instagram"}, {"name": "Conteudo"}],
    "triggerCount": 0,
    "versionId": "13-hlj-postagem-automatica"
}

# Salvar TODOS os workflows
workflows = {
    '07_agenda_followup.json': workflow07,
    '08_followup_automatico.json': workflow08,
    '09_recuperacao_carrinho.json': workflow09,
    '10_upsell_pos_compra.json': workflow10,
    '11_recompra_ltv.json': workflow11,
    '13_postagem_automatica_instagram.json': workflow13
}

for filename, workflow in workflows.items():
    filepath = os.path.join(output_dir, filename)
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(workflow, f, indent=2, ensure_ascii=False)
    print(f'✅ {filename} criado!')

print(f'\n🎉 TODOS os workflows criados com sucesso!')
print(f'\n📋 Resumo:')
print(f'  ✅ 07_agenda_followup.json')
print(f'  ✅ 08_followup_automatico.json')
print(f'  ✅ 09_recuperacao_carrinho.json')
print(f'  ✅ 10_upsell_pos_compra.json')
print(f'  ✅ 11_recompra_ltv.json')
print(f'  ✅ 13_postagem_automatica_instagram.json')
