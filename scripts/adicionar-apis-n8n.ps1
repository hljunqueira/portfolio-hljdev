# Script para adicionar variáveis GROQ + Meta ao docker-compose do N8N
# Executar na VPS via SSH

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  HLJ DEV - Adicionando APIs ao N8N" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Caminhos
$dockerComposePath = "/home/henrique/hlj-dev/docker-compose.yml"
$backupPath = "/home/henrique/hlj-dev/docker-compose.yml.backup.apis"

# Verificar se arquivo existe
if (-not (Test-Path $dockerComposePath)) {
    Write-Host "❌ ERRO: docker-compose.yml não encontrado!" -ForegroundColor Red
    Write-Host "Caminho esperado: $dockerComposePath" -ForegroundColor Yellow
    exit 1
}

Write-Host "📁 Encontrado: $dockerComposePath" -ForegroundColor Green

# Criar backup
Write-Host "`n📦 Criando backup..." -ForegroundColor Yellow
Copy-Item $dockerComposePath $backupPath -Force
Write-Host "✅ Backup criado: $backupPath" -ForegroundColor Green

# Ler conteúdo
Write-Host "`n📖 Lendo docker-compose..." -ForegroundColor Yellow
$content = Get-Content $dockerComposePath -Raw

# Verificar se variáveis já existem
if ($content -match "GROQ_API_KEY") {
    Write-Host "⚠️  GROQ_API_KEY já existe! Substituindo..." -ForegroundColor Yellow
}
if ($content -match "META_ACCESS_TOKEN") {
    Write-Host "⚠️  META_ACCESS_TOKEN já existe! Substituindo..." -ForegroundColor Yellow
}
if ($content -match "INSTAGRAM_PAGE_ID") {
    Write-Host "⚠️  INSTAGRAM_PAGE_ID já existe! Substituindo..." -ForegroundColor Yellow
}

# Adicionar variáveis após WHATSAPP_API_KEY
Write-Host "`n🔧 Adicionando variáveis..." -ForegroundColor Yellow

$pattern = '(            WHATSAPP_API_KEY: .*\r?\n)'
$replacement = @"
$1            GROQ_API_KEY: YOUR_GROQ_API_KEY_ALT
            META_ACCESS_TOKEN: YOUR_META_ACCESS_TOKEN
            INSTAGRAM_PAGE_ID: '716727468195955'
            INSTAGRAM_ID: '17841475969861706'
"@

$newContent = $content -replace $pattern, $replacement

# Salvar arquivo
Set-Content -Path $dockerComposePath -Value $newContent -NoNewline
Write-Host "✅ Variáveis adicionadas com sucesso!" -ForegroundColor Green

# Validar
Write-Host "`n🔍 Verificando configuração..." -ForegroundColor Yellow
$verifyContent = Get-Content $dockerComposePath -Raw

$validado = $true
if ($verifyContent -match "GROQ_API_KEY") {
    Write-Host "✅ GROQ_API_KEY encontrada!" -ForegroundColor Green
} else {
    Write-Host "❌ GROQ_API_KEY NÃO encontrada!" -ForegroundColor Red
    $validado = $false
}

if ($verifyContent -match "META_ACCESS_TOKEN") {
    Write-Host "✅ META_ACCESS_TOKEN encontrado!" -ForegroundColor Green
} else {
    Write-Host "❌ META_ACCESS_TOKEN NÃO encontrado!" -ForegroundColor Red
    $validado = $false
}

if ($verifyContent -match "INSTAGRAM_PAGE_ID") {
    Write-Host "✅ INSTAGRAM_PAGE_ID encontrado!" -ForegroundColor Green
} else {
    Write-Host "❌ INSTAGRAM_PAGE_ID NÃO encontrado!" -ForegroundColor Red
    $validado = $false
}

if ($verifyContent -match "INSTAGRAM_ID") {
    Write-Host "✅ INSTAGRAM_ID encontrado!" -ForegroundColor Green
} else {
    Write-Host "❌ INSTAGRAM_ID NÃO encontrado!" -ForegroundColor Red
    $validado = $false
}

if (-not $validado) {
    Write-Host "🔄 Restaurando backup..." -ForegroundColor Yellow
    Copy-Item $backupPath $dockerComposePath -Force
    exit 1
}

Write-Host "`n========================================`n" -ForegroundColor Cyan
Write-Host "✅ Script concluído com sucesso!" -ForegroundColor Green
Write-Host "`n📋 PRÓXIMOS PASSOS:" -ForegroundColor Cyan
Write-Host "`n1️⃣  Reinicie o N8N executando:" -ForegroundColor White
Write-Host "   cd /home/henrique/hlj-dev" -ForegroundColor Yellow
Write-Host "   docker compose up -d n8n" -ForegroundColor Yellow
Write-Host ""
Write-Host "2️⃣  Após reiniciar, verifique:" -ForegroundColor White
Write-Host "   docker exec hlj-n8n env | grep -E 'GROQ|META|INSTAGRAM'" -ForegroundColor Yellow
Write-Host ""
Write-Host "3️⃣  Acesse o N8N e importe os workflows:" -ForegroundColor White
Write-Host "   https://n8n.hljdev.com.br" -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================`n" -ForegroundColor Cyan
