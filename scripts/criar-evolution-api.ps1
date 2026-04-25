# Script para criar Evolution API dedicada para HLJ DEV

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  CRIANDO EVOLUTION API - HLJ DEV" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Criar diretório
Write-Host "1️⃣  Criando diretório..." -ForegroundColor Yellow
ssh root@76.13.171.93 "mkdir -p /root/hlj-infra/evolution-api"

# Enviar docker-compose.yml
Write-Host "2️⃣  Enviando docker-compose.yml..." -ForegroundColor Yellow
scp ".\scripts\evolution-api-docker-compose.yml" "root@76.13.171.93:/root/hlj-infra/evolution-api/docker-compose.yml"

# Criar diretório de dados
Write-Host "3️⃣  Criando diretório de dados..." -ForegroundColor Yellow
ssh root@76.13.171.93 "mkdir -p /root/hlj-infra/evolution-api/evolution_data"

# Iniciar Evolution API
Write-Host "4️⃣  Iniciando Evolution API..." -ForegroundColor Yellow
ssh root@76.13.171.93 "cd /root/hlj-infra/evolution-api && docker compose up -d"

# Aguardar inicialização
Write-Host "5️⃣  Aguardando inicialização (30s)..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Verificar se está rodando
Write-Host "6️⃣  Verificando status..." -ForegroundColor Yellow
ssh root@76.13.171.93 "docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' | grep hlj-evolution"

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "✅ EVOLUTION API HLJ DEV CRIADA!" -ForegroundColor Green
Write-Host ""
Write-Host "Detalhes:" -ForegroundColor White
Write-Host "  Container: hlj-evolution" -ForegroundColor Gray
Write-Host "  Porta: 3013 → 8080" -ForegroundColor Gray
Write-Host "  URL: https://evolution.hljdev.com.br" -ForegroundColor Gray
Write-Host "  Dados: /root/hlj-infra/evolution-api/evolution_data" -ForegroundColor Gray
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor Yellow
Write-Host "  1. Acessar: https://evolution.hljdev.com.br" -ForegroundColor Gray
Write-Host "  2. Criar instância: hlj-principal" -ForegroundColor Gray
Write-Host "  3. Conectar WhatsApp (QR Code)" -ForegroundColor Gray
Write-Host "  4. Copiar API Key" -ForegroundColor Gray
Write-Host ""
Write-Host "NOTA: A porta 3013 precisa ser configurada no Caddy para" -ForegroundColor Yellow
Write-Host "      apontar para o container hlj-evolution" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Green
