# Script simplificado para atualizar docker-compose.yml do N8N

Write-Host "Atualizando variáveis de ambiente do N8N..." -ForegroundColor Cyan

# Criar arquivo local temporário
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
      - SUPABASE_HOST=db.supabase.hljdev.com.br
      - SUPABASE_PORT=5432
      - SUPABASE_DB=postgres
      - SUPABASE_USER=postgres
      - SUPABASE_PASS=YOUR_SUPABASE_PASSWORD
      - WHATSAPP_API_URL=http://evolution:8080
      - WHATSAPP_INSTANCE=hlj-principal
      - SEU_WHATSAPP=5548991013293
      - GROQ_API_KEY=YOUR_GROQ_API_KEY
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
$COMPOSE_CONTENT | Out-File -FilePath ".\temp-docker-compose.yml" -Encoding UTF8

Write-Host "Enviando para VPS..." -ForegroundColor Yellow
scp ".\temp-docker-compose.yml" "root@76.13.171.93:/tmp/n8n-docker-compose.yml"

Write-Host "Backup do arquivo original..." -ForegroundColor Yellow
ssh root@76.13.171.93 "cp /root/hlj-infra/n8n/docker-compose.yml /root/hlj-infra/n8n/docker-compose.yml.backup"

Write-Host "Atualizando arquivo..." -ForegroundColor Yellow
ssh root@76.13.171.93 "cp /tmp/n8n-docker-compose.yml /root/hlj-infra/n8n/docker-compose.yml"

Write-Host ""
Write-Host "Verificando arquivo atualizado:" -ForegroundColor Cyan
ssh root@76.13.171.93 "cat /root/hlj-infra/n8n/docker-compose.yml"

Write-Host ""
Write-Host "Reiniciando N8N..." -ForegroundColor Yellow
ssh root@76.13.171.93 "cd /root/hlj-infra/n8n && docker compose down && docker compose up -d"

Write-Host ""
Write-Host "Verificando se container está rodando..." -ForegroundColor Cyan
ssh root@76.13.171.93 "docker ps | grep hlj-n8n"

Write-Host ""
Write-Host "Verificando variáveis aplicadas..." -ForegroundColor Cyan
ssh root@76.13.171.93 "docker exec hlj-n8n env | findstr SUPABASE"
ssh root@76.13.171.93 "docker exec hlj-n8n env | findstr WHATSAPP"

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "CONCLUIDO!" -ForegroundColor Green
Write-Host ""
Write-Host "Variáveis configuradas:" -ForegroundColor White
Write-Host "  - SUPABASE_HOST=db.supabase.hljdev.com.br" -ForegroundColor Gray
Write-Host "  - SUPABASE_PORT=5432" -ForegroundColor Gray
Write-Host "  - SUPABASE_DB=postgres" -ForegroundColor Gray
Write-Host "  - SUPABASE_USER=postgres" -ForegroundColor Gray
Write-Host "  - SUPABASE_PASS=YOUR_SUPABASE_PASSWORD" -ForegroundColor Gray
Write-Host "  - WHATSAPP_API_URL=http://evolution:8080" -ForegroundColor Gray
Write-Host "  - WHATSAPP_INSTANCE=hlj-principal" -ForegroundColor Gray
Write-Host "  - SEU_WHATSAPP=5548991013293" -ForegroundColor Gray
Write-Host ""
Write-Host "Acesse: https://n8n.hljdev.com.br" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Green

# Limpar arquivo temporário
Remove-Item ".\temp-docker-compose.yml" -Force
