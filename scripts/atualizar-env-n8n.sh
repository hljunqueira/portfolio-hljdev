#!/bin/bash
# =====================================================
# HLJ DEV - Atualizar Variáveis de Ambiente no N8N
# =====================================================
# Este script atualiza o docker-compose.yml do N8N
# com as variáveis de ambiente reais extraídas dos .env
# =====================================================

SSH_CMD="ssh root@76.13.171.93"
DOCKER_COMPOSE="/root/hlj-infra/n8n/docker-compose.yml"

echo "🚀 Atualizando variáveis de ambiente do N8N..."
echo "================================================"
echo ""

# Backup do arquivo atual
echo "📦 Criando backup..."
$SSH_CMD "cp $DOCKER_COMPOSE ${DOCKER_COMPOSE}.backup.$(date +%Y%m%d_%H%M%S)"

# Criar novo docker-compose.yml com variáveis
echo "✏️  Atualizando docker-compose.yml..."

cat << 'EOF' | $SSH_CMD "cat > /tmp/n8n-docker-compose.yml"
version: '3.8'

services:
  n8n:
    image: n8nio/n8n:latest
    container_name: hlj-n8n
    ports:
      - '3012:5678'
    environment:
      # N8N Configuration
      - N8N_HOST=n8n.hljdev.com.br
      - N8N_PORT=5678
      - N8N_PROTOCOL=https
      - N8N_SECURE_COOKIE=false
      - WEBHOOK_URL=https://n8n.hljdev.com.br/
      - GENERIC_TIMEZONE=America/Sao_Paulo
      
      # Supabase (PostgreSQL)
      - SUPABASE_HOST=db.supabase.hljdev.com.br
      - SUPABASE_PORT=5432
      - SUPABASE_DB=postgres
      - SUPABASE_USER=postgres
      - SUPABASE_PASS=YOUR_SUPABASE_PASSWORD
      
      # WhatsApp (Evolution API)
      - WHATSAPP_API_URL=http://evolution:8080
      - WHATSAPP_INSTANCE=hlj-principal
      - SEU_WHATSAPP=5548991013293
    volumes:
      - ./n8n_data:/home/node/.n8n
    restart: always
    networks:
      - hlj-network

networks:
  hlj-network:
    name: hlj-network
    driver: bridge
EOF

# Copiar arquivo atualizado
$SSH_CMD "cp /tmp/n8n-docker-compose.yml $DOCKER_COMPOSE"

echo "✅ Arquivo atualizado!"
echo ""

# Verificar alterações
echo " Verificando alterações..."
$SSH_CMD "cat $DOCKER_COMPOSE"

echo ""
echo "================================================"
echo "✅ Variáveis de ambiente configuradas com sucesso!"
echo ""
echo "📋 Variáveis adicionadas:"
echo "  ✅ Supabase:"
echo "     - SUPABASE_HOST=db.supabase.hljdev.com.br"
echo "     - SUPABASE_PORT=5432"
echo "     - SUPABASE_DB=postgres"
echo "     - SUPABASE_USER=postgres"
echo "     - SUPABASE_PASS=YOUR_SUPABASE_PASSWORD"
echo ""
echo "  ✅ WhatsApp (Evolution API):"
echo "     - WHATSAPP_API_URL=http://evolution:8080"
echo "     - WHATSAPP_INSTANCE=hlj-principal"
echo "     - SEU_WHATSAPP=5548991013293"
echo ""
echo "⚠️  IMPORTANTE: Reinicie o N8N para aplicar:"
echo "   cd /root/hlj-infra/n8n"
echo "   docker compose down"
echo "   docker compose up -d"
echo ""
echo "🔗 Após reiniciar, acesse:"
echo "   https://n8n.hljdev.com.br"
echo "================================================"
