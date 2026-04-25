#!/bin/bash
# =====================================================
# HLJ DEV - Script de Importação de Workflows N8N
# =====================================================
# Este script importa os workflows 01, 02 e 03 para o N8N
# =====================================================

N8N_URL="https://n8n.hljdev.com.br"
API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OGJkNGI5Ny02YmNiLTRhYzItYWY0MS05ZjIzMGU2ZDQxZTMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiOThlYTczYTctMmQwMi00ZGFiLThhMGQtN2JkNzg2MTc1ZTllIiwiaWF0IjoxNzc1NTI0MjAyfQ.BPicoawd3oeZYC1eLOVM2cmOjXiq10xUcfhKzFplSs4"

echo "🚀 Importando workflows para N8N..."
echo "======================================"
echo ""

# Lista de workflows para importar
WORKFLOWS=(
  "01_lead_inteligente.json"
  "02_kiwify_venda.json"
  "03_lead_dormindo.json"
)

for workflow in "${WORKFLOWS[@]}"; do
  echo "📦 Importando: $workflow"
  
  if [ ! -f "$workflow" ]; then
    echo "❌ Arquivo não encontrado: $workflow"
    continue
  fi
  
  # Importar workflow via API
  response=$(curl -s -X POST "${N8N_URL}/api/v1/workflows" \
    -H "X-N8N-API-KEY: ${API_KEY}" \
    -H "Content-Type: application/json" \
    -d "@${workflow}")
  
  # Verificar se importou com sucesso
  if echo "$response" | grep -q '"id"'; then
    workflow_id=$(echo "$response" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    echo "✅ Sucesso! ID: ${workflow_id}"
  else
    echo "❌ Erro na importação:"
    echo "$response"
  fi
  
  echo ""
  sleep 1
done

echo "======================================"
echo "✨ Importação concluída!"
echo ""
echo "📋 Próximos passos:"
echo "1. Acessar: https://n8n.hljdev.com.br"
echo "2. Verificar se workflows foram importados"
echo "3. Configurar credenciais (Supabase + Evolution API)"
echo "4. Ativar workflows (toggle Active → ON)"
echo "5. Testar com lead de exemplo"
echo ""
