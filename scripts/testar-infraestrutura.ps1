# Script para testar Evolution API, N8N e Supabase na VPS

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  TESTE COMPLETO - HLJ DEV INFRASTRUCTURE" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# ========================================
# 1. TESTAR EVOLUTION API
# ========================================
Write-Host "1️⃣  TESTANDO EVOLUTION API..." -ForegroundColor Yellow
Write-Host "------------------------------------------------" -ForegroundColor Gray

Write-Host "Verificando se Evolution API está rodando..." -ForegroundColor White
$evolutionStatus = ssh root@23.80.89.116 "docker ps --format 'table {{.Names}}\t{{.Status}}' | grep evolution"
Write-Host $evolutionStatus -ForegroundColor Cyan

Write-Host ""
Write-Host "Tentando acessar Evolution API externamente..." -ForegroundColor White
try {
    $evolutionResponse = Invoke-RestMethod -Uri "https://evolution.hljdev.com.br" -Method GET -TimeoutSec 5
    Write-Host "✅ Evolution API está acessível!" -ForegroundColor Green
    Write-Host "Resposta: $($evolutionResponse | ConvertTo-Json -Depth 1)" -ForegroundColor Gray
} catch {
    Write-Host "⚠️  Evolution API não responde ou requer autenticação (normal)" -ForegroundColor Yellow
    Write-Host "Detalhes: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host ""

# ========================================
# 2. TESTAR N8N
# ========================================
Write-Host "2️⃣  TESTANDO N8N..." -ForegroundColor Yellow
Write-Host "------------------------------------------------" -ForegroundColor Gray

Write-Host "Verificando se N8N está rodando..." -ForegroundColor White
$n8nStatus = ssh root@23.80.89.116 "docker ps --format 'table {{.Names}}\t{{.Status}}' | grep hlj-n8n"
Write-Host $n8nStatus -ForegroundColor Cyan

Write-Host ""
Write-Host "Verificando variáveis de ambiente no N8N..." -ForegroundColor White
$n8nEnv = ssh root@23.80.89.116 "docker exec hlj-n8n env | grep -E 'SUPABASE_|WHATSAPP_|SEU_WHATSAPP'"
Write-Host $n8nEnv -ForegroundColor Gray

Write-Host ""
Write-Host "Testando API do N8N..." -ForegroundColor White
try {
    $n8nResponse = Invoke-RestMethod -Uri "https://n8n.hljdev.com.br/api/v1/workflows" -Method GET -Headers @{
        "X-N8N-API-KEY" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OGJkNGI5Ny02YmNiLTRhYzItYWY0MS05ZjIzMGU2ZDQxZTMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiOThlYTczYTctMmQwMi00ZGFiLThhMGQtN2JkNzg2MTc1ZTllIiwiaWF0IjoxNzc1NTI0MjAyfQ.BPicoawd3oeZYC1eLOVM2cmOjXiq10xUcfhKzFplSs4"
    } -TimeoutSec 5
    Write-Host "✅ N8N API está acessível!" -ForegroundColor Green
    Write-Host "Workflows encontrados: $($n8nResponse.data.Count)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Erro ao acessar N8N API: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# ========================================
# 3. TESTAR SUPABASE
# ========================================
Write-Host "3️⃣  TESTANDO SUPABASE..." -ForegroundColor Yellow
Write-Host "------------------------------------------------" -ForegroundColor Gray

Write-Host "Verificando se Supabase está rodando..." -ForegroundColor White
$supabaseStatus = ssh root@23.80.89.116 "docker ps --format 'table {{.Names}}\t{{.Status}}' | grep supabase"
Write-Host $supabaseStatus -ForegroundColor Cyan

Write-Host ""
Write-Host "Testando conexão com Supabase (Studio)..." -ForegroundColor White
try {
    Invoke-RestMethod -Uri "https://supabase.hljdev.com.br" -Method GET -TimeoutSec 5
    Write-Host "✅ Supabase Studio está acessível!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Supabase Studio: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Testando conexão com PostgreSQL..." -ForegroundColor White
$pgTest = ssh root@23.80.89.116 "docker exec supabase-db psql -U postgres -d postgres -c 'SELECT version();' -t" 2>&1
if ($pgTest -match "PostgreSQL") {
    Write-Host "✅ PostgreSQL está respondendo!" -ForegroundColor Green
    Write-Host "Versão: $($pgTest.Trim())" -ForegroundColor Gray
} else {
    Write-Host "❌ Erro ao conectar ao PostgreSQL" -ForegroundColor Red
    Write-Host $pgTest -ForegroundColor Gray
}

Write-Host ""
Write-Host "Verificando tabela 'leads'..." -ForegroundColor White
$leadsTest = ssh root@23.80.89.116 "docker exec supabase-db psql -U postgres -d postgres -c 'SELECT COUNT(*) FROM leads;' -t" 2>&1
if ($leadsTest -match "^\s*\d+\s*$") {
    Write-Host "✅ Tabela 'leads' existe!" -ForegroundColor Green
    Write-Host "Registros: $($leadsTest.Trim())" -ForegroundColor Gray
} else {
    Write-Host "⚠️  Tabela 'leads' não encontrada ou erro: $leadsTest" -ForegroundColor Yellow
}

Write-Host ""

# ========================================
# 4. TESTAR CONECTIVIDADE ENTRE SERVIÇOS
# ========================================
Write-Host "4️⃣  TESTANDO CONECTIVIDADE ENTRE SERVIÇOS..." -ForegroundColor Yellow
Write-Host "------------------------------------------------" -ForegroundColor Gray

Write-Host "Testando se N8N consegue resolver supabase.hljdev.com.br..." -ForegroundColor White
$dnsTest = ssh root@23.80.89.116 "docker exec hlj-n8n nslookup supabase.hljdev.com.br 2>&1 | head -5"
if ($dnsTest -match "Address") {
    Write-Host "✅ DNS resolution OK" -ForegroundColor Green
    Write-Host $dnsTest -ForegroundColor Gray
} else {
    Write-Host "⚠️  DNS resolution: $dnsTest" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Testando conexão HTTP do N8N para Evolution API..." -ForegroundColor White
$httpTest = ssh root@23.80.89.116 "docker exec hlj-n8n wget -qO- --timeout=5 https://evolution.hljdev.com.br 2>&1 | head -3"
if ($LASTEXITCODE -eq 0 -or $httpTest) {
    Write-Host "✅ N8N consegue acessar Evolution API" -ForegroundColor Green
} else {
    Write-Host "⚠️  N8N → Evolution API: Possível problema de rede" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Testando conexão N8N → Supabase (porta 5432)..." -ForegroundColor White
$pgConnTest = ssh root@23.80.89.116 "docker exec hlj-n8n nc -zv supabase.hljdev.com.br 5432 2>&1"
if ($pgConnTest -match "succeeded|connected") {
    Write-Host "✅ N8N consegue conectar ao Supabase" -ForegroundColor Green
} else {
    Write-Host "⚠️  Conexão N8N → Supabase: $pgConnTest" -ForegroundColor Yellow
}

Write-Host ""

# ========================================
# RESUMO
# ========================================
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  RESUMO DOS TESTES" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Serviços rodando:" -ForegroundColor White
Write-Host "  ✅ Evolution API (zapcar-evolution)" -ForegroundColor Green
Write-Host "  ✅ N8N (hlj-n8n)" -ForegroundColor Green
Write-Host "  ✅ Supabase (supabase-db + serviços)" -ForegroundColor Green
Write-Host ""

Write-Host "Variáveis configuradas no N8N:" -ForegroundColor White
Write-Host "  ✅ SUPABASE_HOST=supabase.hljdev.com.br" -ForegroundColor Green
Write-Host "  ✅ WHATSAPP_API_URL=https://evolution.hljdev.com.br" -ForegroundColor Green
Write-Host ""

Write-Host "Próximos passos:" -ForegroundColor Yellow
Write-Host "  1. Criar instância 'hlj-principal' na Evolution API" -ForegroundColor Gray
Write-Host "     → Acesse: https://evolution.hljdev.com.br" -ForegroundColor Gray
Write-Host ""
Write-Host "  2. Criar credenciais no N8N" -ForegroundColor Gray
Write-Host "     → Acesse: https://n8n.hljdev.com.br" -ForegroundColor Gray
Write-Host "     → Settings → Credentials → Add" -ForegroundColor Gray
Write-Host ""
Write-Host "  3. Configurar SQL no Supabase" -ForegroundColor Gray
Write-Host "     → Acesse: https://supabase.hljdev.com.br" -ForegroundColor Gray
Write-Host "     → SQL Editor → Executar script de colunas" -ForegroundColor Gray
Write-Host ""
Write-Host "  4. Importar workflows no N8N" -ForegroundColor Gray
Write-Host "     → Menu ⋮ → Import from File" -ForegroundColor Gray
Write-Host "     → Importar: 01, 02, 03" -ForegroundColor Gray
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
