# Script para corrigir variáveis do N8N

Write-Host "Corrigindo configurações do N8N..." -ForegroundColor Cyan

# Criar arquivo com configurações CORRETAS
$COMPOSE_CONTENT = @"
version: '3.8'

services:
  n8n:
    image: n8nio/n8n:latest
    container_name: hlj-n8n
    ports:
      - '3012:5678'
    environment:
      - N8N_HOST=n8n.hljdev.com.br
      - N8N_PORT=5678
      - N8N_PROTOCOL=https
      - N8N_SECURE_COOKIE=false
      - WEBHOOK_URL=https://n8n.hljdev.com.br/
      - GENERIC_TIMEZONE=America/Sao_Paulo
      - SUPABASE_HOST=supabase-db
      - SUPABASE_PORT=5432
      - SUPABASE_DB=postgres
      - SUPABASE_USER=postgres
      - SUPABASE_PASS=YOUR_SUPABASE_PASSWORD
      - WHATSAPP_API_URL=https://evolution.hljdev.com.br
      - WHATSAPP_INSTANCE=hlj-principal
      - SEU_WHATSAPP=5548991013293
    volumes:
      - ./n8n_data:/home/node/.n8n
    restart: always
    networks:
      - hlj-network
      - supabase_default

networks:
  hlj-network:
    name: hlj-network
    driver: bridge
  supabase_default:
    external: true
"@

# Salvar arquivo temporário
$COMPOSE_CONTENT | Out-File -FilePath ".\temp-docker-compose-fixed.yml" -Encoding UTF8

Write-Host "Enviando para VPS..." -ForegroundColor Yellow
scp ".\temp-docker-compose-fixed.yml" "root@76.13.171.93:/tmp/n8n-docker-compose-fixed.yml"

Write-Host "Backup do arquivo atual..." -ForegroundColor Yellow
ssh root@76.13.171.93 "cp /root/hlj-infra/n8n/docker-compose.yml /root/hlj-infra/n8n/docker-compose.yml.backup.$(Get-Date -Format 'yyyyMMdd_HHmmss')"

Write-Host "Atualizando arquivo corrigido..." -ForegroundColor Yellow
ssh root@76.13.171.93 "cp /tmp/n8n-docker-compose-fixed.yml /root/hlj-infra/n8n/docker-compose.yml"

Write-Host ""
Write-Host "Reiniciando N8N com configurações corrigidas..." -ForegroundColor Yellow
ssh root@76.13.171.93 "cd /root/hlj-infra/n8n && docker compose down && docker compose up -d"

Start-Sleep -Seconds 5

Write-Host ""
Write-Host "Verificando se container está rodando..." -ForegroundColor Cyan
ssh root@76.13.171.93 "docker ps | grep hlj-n8n"

Write-Host ""
Write-Host "Testando conexão com Supabase..." -ForegroundColor Cyan
ssh root@76.13.171.93 "docker exec hlj-n8n sh -c 'echo SELECT 1 | psql -h supabase-db -U postgres -d postgres -t'" 2>&1

Write-Host ""
Write-Host "Verificando variáveis aplicadas..." -ForegroundColor Cyan
ssh root@76.13.171.93 "docker exec hlj-n8n env | grep SUPABASE"
ssh root@76.13.171.93 "docker exec hlj-n8n env | grep WHATSAPP"

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "CORREÇÕES APLICADAS:" -ForegroundColor Green
Write-Host ""
Write-Host "✅ SUPABASE_HOST: supabase-db (container interno)" -ForegroundColor White
Write-Host "✅ WHATSAPP_API_URL: https://evolution.hljdev.com.br (externo)" -ForegroundColor White
Write-Host "✅ N8N conectado à rede: supabase_default" -ForegroundColor White
Write-Host ""
Write-Host "NOTA: Evolution API 'hlj-principal' precisa ser criada/configurada" -ForegroundColor Yellow
Write-Host "      Use: https://evolution.hljdev.com.br para gerenciar" -ForegroundColor Yellow
Write-Host ""
Write-Host "Acesse: https://n8n.hljdev.com.br" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Green

# Limpar arquivo temporário
Remove-Item ".\temp-docker-compose-fixed.yml" -Force
