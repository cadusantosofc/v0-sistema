# Instalar dependências
Write-Host "Instalando dependências..."
npm install

# Criar arquivo .env
Write-Host "Criando arquivo .env..."
@"
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=job_marketplace
DB_PORT=3306
"@ | Out-File -FilePath ".env" -Encoding UTF8

# Criar diretório de uploads
Write-Host "Criando diretório de uploads..."
New-Item -ItemType Directory -Force -Path "public/uploads"

Write-Host "Configuração concluída!"
Write-Host ""
Write-Host "Para configurar o banco de dados:"
Write-Host "1. Abra o MySQL Workbench"
Write-Host "2. Conecte com usuário root e senha root"
Write-Host "3. Execute o arquivo database/schema.sql"
