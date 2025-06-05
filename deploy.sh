#!/bin/bash

# Script de Implantação para VPS Ubuntu
# Para job-marketplace

# Cores para feedback visual
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Iniciando implantação do Job Marketplace...${NC}"

# Atualizar sistema
echo -e "${GREEN}Atualizando sistema...${NC}"
sudo apt update && sudo apt upgrade -y

# Instalar dependências
echo -e "${GREEN}Instalando dependências...${NC}"
sudo apt install -y curl wget git nginx mysql-server

# Instalar Node.js via NVM
echo -e "${GREEN}Instalando Node.js...${NC}"
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install 18 # Next.js funciona bem com Node 18
nvm use 18

# Instalar PM2 para gerenciamento de processos
echo -e "${GREEN}Instalando PM2...${NC}"
npm install -g pm2

# Criando diretório da aplicação
echo -e "${GREEN}Preparando diretório da aplicação...${NC}"
mkdir -p /var/www/job-marketplace
cd /var/www/job-marketplace

# Clonar o repositório (substitua com o URL do seu repositório)
echo -e "${GREEN}Clonando repositório...${NC}"
git clone https://github.com/seu-usuario/job-marketplace.git .

# Instalar dependências do projeto
echo -e "${GREEN}Instalando dependências do projeto...${NC}"
npm install

# Criar arquivo .env
echo -e "${GREEN}Configurando variáveis de ambiente...${NC}"
cat > .env.local << EOL
# Configurações do banco de dados
DB_HOST=localhost
DB_USER=job_user
DB_PASSWORD=senha_segura
DB_NAME=job_marketplace
DB_PORT=3306

# Configurações da aplicação
NODE_ENV=production
EOL

# Configurar MySQL
echo -e "${GREEN}Configurando MySQL...${NC}"
sudo mysql -e "CREATE DATABASE IF NOT EXISTS job_marketplace;"
sudo mysql -e "CREATE USER 'job_user'@'localhost' IDENTIFIED BY 'senha_segura';"
sudo mysql -e "GRANT ALL PRIVILEGES ON job_marketplace.* TO 'job_user'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"

# Importar esquema e dados iniciais
echo -e "${GREEN}Importando esquema e dados iniciais...${NC}"
sudo mysql job_marketplace < database/recreate_db.sql

# Construir a aplicação
echo -e "${GREEN}Construindo a aplicação...${NC}"
npm run build

# Configurar PM2
echo -e "${GREEN}Configurando PM2...${NC}"
pm2 start npm --name "job-marketplace" -- start
pm2 save
pm2 startup

# Configurar Nginx
echo -e "${GREEN}Configurando Nginx...${NC}"
sudo tee /etc/nginx/sites-available/job-marketplace << EOL
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOL

# Ativar o site
sudo ln -s /etc/nginx/sites-available/job-marketplace /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

echo -e "${GREEN}Implantação concluída com sucesso!${NC}"
echo -e "${GREEN}Acesse seu site em: http://seu-dominio.com${NC}" 