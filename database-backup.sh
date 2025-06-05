#!/bin/bash

# Script para backup do banco de dados
# Este script pode ser executado manualmente ou por um cron job

# Diretório onde os backups serão armazenados
BACKUP_DIR="/home/ubuntu/backups"
mkdir -p $BACKUP_DIR

# Nome do arquivo de backup baseado na data atual
DATE=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILE="$BACKUP_DIR/job_marketplace_$DATE.sql"

# Credenciais do banco de dados (ajuste conforme necessário)
DB_USER="job_user"
DB_PASS="senha_segura"
DB_NAME="job_marketplace"

# Criar o backup
echo "Criando backup do banco de dados..."
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME > $BACKUP_FILE

# Compactar o backup
echo "Compactando o arquivo de backup..."
gzip $BACKUP_FILE

echo "Backup concluído: ${BACKUP_FILE}.gz"

# Manter apenas os 7 backups mais recentes
echo "Removendo backups antigos..."
ls -t ${BACKUP_DIR}/job_marketplace_*.sql.gz | tail -n +8 | xargs -r rm

echo "Processo de backup finalizado com sucesso!" 