# Script para corrigir HOST do Supabase

Write-Host "Corrigindo SUPABASE_HOST..." -ForegroundColor Cyan

# Criar arquivo com configuração CORRETA
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
      - SUPABASE_HOST=supabase.hljdev.com.br
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

networks:
  hlj-network:
    name: hlj-network
    driver: bridge
"@

# Salvar arquivo temporário
$COMPOSE_CONTENT | Out-File -FilePath ".\temp-docker-compose-final.yml" -Encoding UTF8

Write-Host "Enviando para VPS..." -ForegroundColor Yellow
scp ".\temp-docker-compose-final.yml" "root@76.13.171.93:/tmp/n8n-docker-compose-final.yml"

Write-Host "Backup do arquivo atual..." -ForegroundColor Yellow
ssh root@76.13.171.93 "cp /root/hlj-infra/n8n/docker-compose.yml /root/hlj-infra/n8n/docker-compose.yml.backup.final"

Write-Host "Atualizando arquivo..." -ForegroundColor Yellow
ssh root@76.13.171.93 "cp /tmp/n8n-docker-compose-final.yml /root/hlj-infra/n8n/docker-compose.yml"

Write-Host ""
Write-Host "Reiniciando N8N..." -ForegroundColor Yellow
ssh root@76.13.171.93 "cd /root/hlj-infra/n8n && docker compose down && docker compose up -d"

Start-Sleep -Seconds 5

Write-Host ""
Write-Host "Verificando container..." -ForegroundColor Cyan
ssh root@76.13.171.93 "docker ps | grep hlj-n8n"

Write-Host ""
Write-Host "Verificando variáveis..." -ForegroundColor Cyan
ssh root@76.13.171.93 "docker exec hlj-n8n env | grep SUPABASE_HOST"
ssh root@76.13.171.93 "docker exec hlj-n8n env | grep WHATSAPP_API_URL"

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "✅ CONFIGURAÇÃO FINAL CORRIGIDA!" -ForegroundColor Green
Write-Host ""
Write-Host "Variáveis aplicadas:" -ForegroundColor White
Write-Host "  SUPABASE_HOST=supabase.hljdev.com.br ✅" -ForegroundColor Green
Write-Host "  WHATSAPP_API_URL=https://evolution.hljdev.com.br ✅" -ForegroundColor Green
Write-Host ""
Write-Host "Acesse: https://n8n.hljdev.com.br" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Green

# Limpar arquivo temporário
Remove-Item ".\temp-docker-compose-final.yml" -Force
