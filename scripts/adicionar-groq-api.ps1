# Script para adicionar GROQ_API_KEY ao docker-compose do N8N
# Executar na VPS

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  HLJ DEV - Adicionando GROQ_API_KEY" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Caminhos
$dockerComposePath = "/home/henrique/hlj-dev/docker-compose.yml"
$backupPath = "/home/henrique/hlj-dev/docker-compose.yml.backup.groq"

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

# Verificar se GROQ_API_KEY já existe
if ($content -match "GROQ_API_KEY") {
    Write-Host "⚠️  ATENÇÃO: GROQ_API_KEY já existe no arquivo!" -ForegroundColor Yellow
    Write-Host "Deseja substituir? (s/n)" -ForegroundColor Yellow
    $resp = Read-Host
    if ($resp -ne "s") {
        Write-Host "❌ Operação cancelada." -ForegroundColor Red
        exit 0
    }
}

# Adicionar GROQ_API_KEY após WHATSAPP_API_KEY
Write-Host "`n🔧 Adicionando GROQ_API_KEY..." -ForegroundColor Yellow

# Padrão para encontrar: linha do WHATSAPP_API_KEY
$pattern = '(            WHATSAPP_API_KEY: .*\r?\n)'
$replacement = @"
$1            GROQ_API_KEY: YOUR_GROQ_API_KEY
"@

$newContent = $content -replace $pattern, $replacement

# Salvar arquivo
Set-Content -Path $dockerComposePath -Value $newContent -NoNewline
Write-Host "✅ GROQ_API_KEY adicionada com sucesso!" -ForegroundColor Green

# Validar
Write-Host "`n🔍 Verificando configuração..." -ForegroundColor Yellow
$verifyContent = Get-Content $dockerComposePath -Raw
if ($verifyContent -match "GROQ_API_KEY") {
    Write-Host "✅ GROQ_API_KEY encontrada no arquivo!" -ForegroundColor Green
} else {
    Write-Host "❌ ERRO: GROQ_API_KEY não foi adicionada!" -ForegroundColor Red
    Write-Host "🔄 Restaurando backup..." -ForegroundColor Yellow
    Copy-Item $backupPath $dockerComposePath -Force
    exit 1
}

# Reiniciar N8N
Write-Host "`n🔄 Reiniciando serviço N8N..." -ForegroundColor Yellow
Write-Host "Executando: cd /home/henrique/hlj-dev && docker compose up -d n8n" -ForegroundColor Gray

$restartCmd = @"
cd /home/henrique/hlj-dev && docker compose up -d n8n
"@

Write-Host "`n✅ Script concluído!" -ForegroundColor Green
Write-Host "`n📋 PRÓXIMOS PASSOS:" -ForegroundColor Cyan
Write-Host "1. Execute manualmente na VPS:" -ForegroundColor White
Write-Host "   cd /home/henrique/hlj-dev" -ForegroundColor Yellow
Write-Host "   docker compose up -d n8n" -ForegroundColor Yellow
Write-Host ""
Write-Host "2. Após reiniciar, verifique as variáveis:" -ForegroundColor White
Write-Host "   docker exec hlj-n8n env | grep GROQ" -ForegroundColor Yellow
Write-Host ""
Write-Host "3. Acesse N8N e ative os workflows 05 e 13" -ForegroundColor White
Write-Host "   https://n8n.hljdev.com.br" -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================`n" -ForegroundColor Cyan
