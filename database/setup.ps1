# Configurar MySQL
Write-Host "Configurando banco de dados MySQL..."
Write-Host "Por favor, insira sua senha root quando solicitado"

# Executar schema.sql
Write-Host "`nCriando estrutura do banco de dados..."
mysql -u root -p < schema.sql

# Executar seed.sql
Write-Host "`nInserindo dados iniciais..."
mysql -u root -p < seed.sql

Write-Host "`nConfigura\u00e7\u00e3o do banco conclu\u00edda!"
Write-Host "`nUsu\u00e1rios dispon\u00edveis:"
Write-Host "1. Admin"
Write-Host "   Email: admin@admin.com"
Write-Host "   Senha: admin123"
Write-Host "`n2. Empresa"
Write-Host "   Email: tech@company.com"
Write-Host "   Senha: company123"
Write-Host "`n3. Trabalhador"
Write-Host "   Email: joao@worker.com"
Write-Host "   Senha: worker123"
