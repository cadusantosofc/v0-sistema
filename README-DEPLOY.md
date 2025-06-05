# Guia de Implantação e Otimização do Job Marketplace

Este guia contém instruções detalhadas para otimizar o desempenho da aplicação e implantá-la em um servidor VPS Ubuntu.

## Índice

1. [Otimização da Aplicação Local](#otimização-da-aplicação-local)
2. [Preparação para Implantação em VPS](#preparação-para-implantação-em-vps)
3. [Migração do Banco de Dados](#migração-do-banco-de-dados)
4. [Implantação no Servidor VPS](#implantação-no-servidor-vps)
5. [Manutenção e Backups](#manutenção-e-backups)
6. [Troubleshooting](#troubleshooting)

## Otimização da Aplicação Local

Antes de implantar, otimize sua aplicação localmente:

1. **Implementar o lazy loading para componentes pesados**:
   - Edite os componentes que demoram para carregar, especialmente aqueles com muitos dados ou cálculos complexos.
   - Consulte o arquivo `PERFORMANCE.md` para exemplos.

2. **Otimizar as consultas ao banco de dados**:
   - Adicione índices para as colunas frequentemente consultadas.
   - Execute o seguinte SQL para adicionar índices essenciais:

   ```sql
   ALTER TABLE jobs ADD INDEX idx_jobs_status (status);
   ALTER TABLE jobs ADD INDEX idx_jobs_company_id (company_id);
   ALTER TABLE applications ADD INDEX idx_applications_job_id (job_id);
   ALTER TABLE applications ADD INDEX idx_applications_user_id (user_id);
   ```

3. **Ativar o cache de API**:
   - Adicione `export const revalidate = 60;` nas rotas de API que não mudam com frequência.
   - Para dados que mudam raramente, aumente esse valor para 300 (5 minutos) ou 3600 (1 hora).

4. **Otimizar as imagens**:
   - Substitua as tags `<img>` pelo componente `<Image>` do Next.js.
   - Consulte `PERFORMANCE.md` para exemplos detalhados.

## Preparação para Implantação em VPS

1. **Requisitos do servidor**:
   - Ubuntu 20.04 LTS ou superior
   - Mínimo 2GB RAM (4GB recomendado)
   - 2 vCPUs ou mais
   - 20GB SSD
   - Acesso SSH como root ou usuário com sudo

2. **Preparar arquivos de implantação**:
   - Todos os scripts necessários já foram criados:
     - `deploy.sh`: Script principal de implantação
     - `database-backup.sh`: Para backups do banco de dados
     - `migrate-database.sh`: Para migrar seu banco de dados local para o servidor

3. **Personalizar os scripts**:
   - Edite os arquivos para ajustar:
     - Senha do banco de dados (substitua "senha_segura" por uma senha forte)
     - Domínio do site (substitua "seu-dominio.com" pelo seu domínio real)
     - IP do servidor (substitua "seu_ip_aqui" pelo IP do seu VPS)

## Migração do Banco de Dados

1. **Preparar o banco de dados local**:
   - Certifique-se de que seu MySQL local está rodando
   - Atualize as credenciais no arquivo `migrate-database.sh`

2. **Executar a migração**:
   ```bash
   # Torne o script executável
   chmod +x migrate-database.sh

   # Execute o script
   ./migrate-database.sh
   ```

3. **Verificação**:
   - O script irá informar quando a migração for concluída
   - Em caso de erro, verifique as credenciais e conexões

## Implantação no Servidor VPS

1. **Configuração inicial do servidor**:
   - Conecte-se ao servidor via SSH:
     ```bash
     ssh usuario@seu_ip_aqui
     ```
   - Atualize o sistema:
     ```bash
     sudo apt update && sudo apt upgrade -y
     ```

2. **Transferir scripts para o servidor**:
   ```bash
   scp deploy.sh database-backup.sh usuario@seu_ip_aqui:~/
   ```

3. **Executar o script de implantação**:
   ```bash
   # No servidor
   chmod +x deploy.sh
   ./deploy.sh
   ```

4. **Configurar domínio (opcional)**:
   - Adicione registros DNS apontando para o IP do seu servidor
   - Configure SSL com Let's Encrypt:
     ```bash
     sudo apt install certbot python3-certbot-nginx
     sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com
     ```

## Manutenção e Backups

1. **Configurar backups automáticos**:
   ```bash
   # Torne o script executável
   chmod +x database-backup.sh
   
   # Teste o script
   ./database-backup.sh
   
   # Configure o cron para execução diária
   (crontab -l 2>/dev/null; echo "0 2 * * * ~/database-backup.sh") | crontab -
   ```

2. **Monitoramento de performance**:
   - Instale ferramentas de monitoramento conforme descrito em `PERFORMANCE.md`
   - Monitore regularmente:
     - Uso de CPU e memória
     - Tempos de resposta do servidor
     - Logs de erro em `/var/log/nginx/error.log`

3. **Atualizações regulares**:
   - Para atualizar a aplicação:
     ```bash
     cd /var/www/job-marketplace
     git pull
     npm install
     npm run build
     pm2 restart job-marketplace
     ```

## Troubleshooting

### O site está lento após a implantação

1. **Verifique os recursos do servidor**:
   ```bash
   htop
   ```
   - Se a CPU ou memória estiverem constantemente acima de 80%, considere aumentar os recursos do VPS.

2. **Verifique os logs do Nginx**:
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

3. **Verifique os logs da aplicação**:
   ```bash
   pm2 logs job-marketplace
   ```

### Erros no banco de dados

1. **Verifique a conexão com o banco**:
   ```bash
   mysql -u job_user -p job_marketplace
   ```

2. **Restaure um backup se necessário**:
   ```bash
   gunzip -c /home/ubuntu/backups/job_marketplace_[DATA].sql.gz | mysql -u job_user -p job_marketplace
   ```

### O site não está acessível

1. **Verifique se o Nginx está rodando**:
   ```bash
   sudo systemctl status nginx
   ```

2. **Verifique se o Node.js está rodando**:
   ```bash
   pm2 status
   ```

3. **Verifique as configurações de firewall**:
   ```bash
   sudo ufw status
   ```
   
   Se necessário, abra as portas 80 e 443:
   ```bash
   sudo ufw allow 80
   sudo ufw allow 443
   ```

---

Para mais detalhes sobre otimização de performance, consulte o arquivo `PERFORMANCE.md`.

Em caso de dúvidas ou problemas, abra uma issue no repositório ou entre em contato com o suporte. 