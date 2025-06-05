#!/bin/bash

# Script para migrar o banco de dados local para o servidor VPS
# Execute este script localmente para exportar o banco e depois transferir para o servidor

# Configurações Locais
LOCAL_DB_USER="root"
LOCAL_DB_PASS=""  # Preencha se tiver senha
LOCAL_DB_NAME="job_marketplace"

# Configurações do Servidor
SERVER_IP="seu_ip_aqui"
SERVER_USER="ubuntu"
SERVER_DB_USER="job_user"
SERVER_DB_PASS="senha_segura"
SERVER_DB_NAME="job_marketplace"

# Cores para feedback visual
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Iniciando processo de migração do banco de dados...${NC}"

# Criar pasta temporária
TEMP_DIR="./temp_db_migration"
mkdir -p $TEMP_DIR

# Exportar banco de dados local
echo -e "${GREEN}Exportando banco de dados local...${NC}"
if [ -z "$LOCAL_DB_PASS" ]; then
    mysqldump -u $LOCAL_DB_USER $LOCAL_DB_NAME > $TEMP_DIR/job_marketplace_export.sql
else
    mysqldump -u $LOCAL_DB_USER -p$LOCAL_DB_PASS $LOCAL_DB_NAME > $TEMP_DIR/job_marketplace_export.sql
fi

# Verificar se o export foi bem-sucedido
if [ $? -ne 0 ]; then
    echo -e "${RED}Erro ao exportar o banco de dados local.${NC}"
    exit 1
fi

echo -e "${GREEN}Banco de dados exportado com sucesso.${NC}"

# Transferir para o servidor
echo -e "${GREEN}Transferindo arquivo para o servidor...${NC}"
scp $TEMP_DIR/job_marketplace_export.sql $SERVER_USER@$SERVER_IP:/home/$SERVER_USER/

# Importar no servidor remoto
echo -e "${GREEN}Importando banco de dados no servidor remoto...${NC}"
ssh $SERVER_USER@$SERVER_IP << EOF
    # Importar o banco
    mysql -u $SERVER_DB_USER -p$SERVER_DB_PASS $SERVER_DB_NAME < /home/$SERVER_USER/job_marketplace_export.sql
    
    # Remover o arquivo após a importação
    rm /home/$SERVER_USER/job_marketplace_export.sql
EOF

# Limpar arquivos temporários
echo -e "${GREEN}Limpando arquivos temporários...${NC}"
rm -rf $TEMP_DIR

echo -e "${GREEN}Migração do banco de dados concluída com sucesso!${NC}" 