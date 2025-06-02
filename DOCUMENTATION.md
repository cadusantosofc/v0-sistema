# Job Marketplace - Documentação do Sistema

## Visão Geral
Sistema de marketplace para conectar empresas e trabalhadores, com funcionalidades de gestão de usuários, empresas, vagas e carteiras digitais.

## Estrutura do Projeto

### Principais Diretórios
```
/app
  /admin          # Área administrativa
  /api           # APIs do sistema
  /companies     # Lista de empresas
  /dashboard     # Dashboard do usuário
  /post-job      # Criação de vagas
  /users         # Lista de usuários
/components      # Componentes React reutilizáveis
/data           # Camada de dados e persistência
/hooks          # Hooks React customizados
```

## Sistema de Carteira Digital

### Armazenamento
- **Localização**: `/data/wallets/users.txt`
- **Formato**: `userId|balance` (um por linha)
- **Exemplo**: `worker-1|1000`

### Identificadores (IDs)
- **Formato**: `{tipo}-{número}`
- **Tipos**:
  - `admin-{n}`: Administradores
  - `worker-{n}`: Trabalhadores
  - `company-{n}`: Empresas
- **Exemplos**: 
  - `admin-1`: Carlos Eduardo (Admin)
  - `worker-1`: João (Trabalhador)
  - `company-1`: Tech Corp

### APIs

#### GET /api/wallet/[userId]
- **Função**: Consultar saldo
- **Resposta**: `{ balance: number }`
- **Exemplo**: `GET /api/wallet/worker-1` → `{ balance: 1000 }`

#### PATCH /api/wallet/[userId]
- **Função**: Atualizar saldo
- **Corpo**: `{ amount: number }`
- **Validações**:
  - Não permite saldo negativo
- **Exemplo**: `PATCH /api/wallet/worker-1` com `{ amount: 100 }` → `{ balance: 1100 }`

#### POST /api/wallet/manual
- **Função**: Ajuste manual de saldo (admin)
- **Corpo**: `{ userId: string, amount: number }`
- **Validações**:
  - Requer usuário admin
  - Não permite saldo negativo
- **Exemplo**: `POST /api/wallet/manual` com `{ userId: "worker-1", amount: 100 }`

### Frontend

#### Hook useWallet
- **Arquivo**: `/hooks/use-wallet.ts`
- **Funcionalidades**:
  - Consulta de saldo
  - Atualização automática a cada 10 segundos
  - Cache-busting com headers específicos
  - Timestamp de última atualização
  - Loading states
  - Tratamento de erros

#### Componente Balance
- **Arquivo**: `/components/wallet/balance.tsx`
- **Props**:
  - `userId`: ID do usuário/empresa
  - `showSkeleton`: Controla exibição do loading (default: true)
  - `className`: Classes CSS customizadas
- **Features**:
  - Formatação em Reais (R$)
  - Loading state com Skeleton
  - Tooltip com horário da última atualização
  - Atualização automática via useWallet

### Páginas Administrativas

#### Finance (/admin/finance)
- **Arquivo**: `/app/admin/finance/page.tsx`
- **Funcionalidades**:
  - Formulário para ajuste manual de saldo
  - Validações com react-hook-form e zod
  - Feedback visual de sucesso/erro
  - Atualização imediata do saldo

#### Users (/users)
- **Arquivo**: `/app/users/page.tsx`
- **Features**:
  - Lista de usuários com saldos
  - Exibição do ID para referência
  - Atualização automática dos saldos
  - Filtros e ordenação

#### Companies (/companies)
- **Arquivo**: `/app/companies/page.tsx`
- **Features**:
  - Lista de empresas com saldos
  - Exibição do ID para referência
  - Atualização automática dos saldos
  - Filtros e ordenação

## Dados Mockados

### Usuários
```typescript
[
  {
    id: "admin-1",
    name: "Carlos Eduardo",
    email: "admin@example.com",
    role: "admin"
  },
  {
    id: "worker-1",
    name: "João",
    email: "joao@example.com",
    role: "worker"
  }
]
```

### Empresas
```typescript
[
  {
    id: "company-1",
    name: "Tech Corp",
    email: "contact@techcorp.com",
    status: "active"
  },
  {
    id: "company-2",
    name: "Dev Solutions",
    email: "contact@devsolutions.com",
    status: "active"
  }
]
```

## Boas Práticas

### Segurança
- Validação de saldo negativo
- Verificação de permissões admin
- Sanitização de IDs

### Performance
- Polling otimizado (10s)
- Cache-busting controlado
- Loading states para feedback

### UX
- Feedback visual de ações
- Tooltips informativos
- Formatação consistente
- Skeleton loading

## Troubleshooting

### Saldo não atualiza
1. Verificar se o ID está no formato correto (`tipo-número`)
2. Checar arquivo `users.txt`
3. Verificar console do navegador por erros
4. Tentar recarregar a página

### Erros comuns
- **"Saldo não pode ficar negativo"**: Tentativa de débito maior que saldo
- **"ID do usuário é obrigatório"**: ID ausente ou malformatado
- **"Erro ao carregar saldo"**: Problema ao ler arquivo `users.txt`

## Manutenção

### Adição de Usuário/Empresa
1. Adicionar registro em `/api/admin/users/route.ts` ou `/api/admin/companies/route.ts`
2. Usar ID no formato correto
3. Criar registro inicial no `users.txt` se necessário

### Backup
- Fazer backup regular do arquivo `users.txt`
- Manter formato `userId|balance`
- Validar integridade dos dados

## Futuras Melhorias
1. Histórico de transações
2. Sistema de notificações
3. Exportação de relatórios
4. Dashboard financeiro
5. Multi-moeda
