# Configuração do Banco de Dados

Este diretório contém os scripts necessários para configurar o banco de dados MySQL do sistema Job Marketplace.

## Pré-requisitos

1. MySQL Server instalado (recomendado MySQL 8.0 ou superior)
2. MySQL Workbench (opcional, mas recomendado para gerenciamento)

## Configuração Inicial

1. Abra o MySQL Workbench
2. Conecte com as credenciais:
   - Usuário: `root`
   - Senha: `root`
3. Execute os scripts na seguinte ordem:
   - `schema.sql`: Cria o banco e as tabelas
   - `seed.sql`: Insere dados iniciais

## Usuários do Sistema

O sistema vem com três usuários pré-configurados:

1. **Administrador**
   - Email: admin@admin.com
   - Senha: admin123
   - Saldo inicial: R$ 1.000,00

2. **Empresa Exemplo**
   - Email: tech@company.com
   - Senha: company123
   - Saldo inicial: R$ 5.000,00

3. **Trabalhador Exemplo**
   - Email: joao@worker.com
   - Senha: worker123
   - Saldo inicial: R$ 2.500,00

## Estrutura do Banco

O banco possui as seguintes tabelas:

- `users`: Usuários do sistema
- `wallets`: Carteiras digitais
- `transactions`: Transações financeiras
- `jobs`: Vagas de trabalho
- `applications`: Candidaturas
- `chats`: Conversas
- `messages`: Mensagens

## Funcionalidades Implementadas

- Sistema completo de autenticação
- Gestão de carteiras digitais
- Transações entre usuários
- Cadastro e gestão de vagas
- Sistema de candidaturas
- Chat entre empresas e candidatos

## Notas Importantes

- Todas as senhas são armazenadas com hash bcrypt
- Transações são atômicas e consistentes
- Sistema de upload de avatares configurado
- Todos os registros possuem timestamps
