# Guia de Otimização de Performance

Este guia contém dicas e práticas para melhorar a performance do Job Marketplace.

## Otimizações de Front-end

### 1. Implementação de Lazy Loading

```jsx
// Antes
import HeavyComponent from '@/components/HeavyComponent';

// Depois
import dynamic from 'next/dynamic';
const HeavyComponent = dynamic(() => import('@/components/HeavyComponent'), {
  loading: () => <p>Carregando...</p>,
  ssr: false // Use false apenas se o componente não precisar de SSR
});
```

### 2. Otimização de Imagens

```jsx
// Antes
<img src="/profile.jpg" alt="Perfil" />

// Depois
import Image from 'next/image';

<Image 
  src="/profile.jpg" 
  alt="Perfil" 
  width={300} 
  height={300} 
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
  priority={false} // Use true apenas para imagens acima da dobra
/>
```

### 3. Memoização de Componentes

```jsx
// Antes
function ExpensiveComponent({ data }) {
  // Cálculos caros aqui
  return <div>{/* Renderização */}</div>;
}

// Depois
import { memo, useMemo } from 'react';

const ExpensiveComponent = memo(function ExpensiveComponent({ data }) {
  const processedData = useMemo(() => {
    // Cálculos caros aqui
    return data.map(item => /* processamento */);
  }, [data]);
  
  return <div>{/* Renderização com processedData */}</div>;
});
```

## Otimizações de Back-end

### 1. Cache de Requisições da API

```typescript
// Em app/api/jobs/route.ts
export const revalidate = 60; // Cache por 60 segundos

// Ou usando caching condicional
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  
  // Gerar um ETag baseado nos dados
  const etag = `"job-${id}-v1"`;
  
  // Verificar se o cliente já tem a versão atual
  const ifNoneMatch = request.headers.get('if-none-match');
  if (ifNoneMatch === etag) {
    return new NextResponse(null, { status: 304 }); // Not Modified
  }
  
  // Buscar dados normalmente
  const data = await fetchData(id);
  
  // Retornar com headers de cache
  return NextResponse.json(data, {
    headers: {
      'ETag': etag,
      'Cache-Control': 'max-age=60'
    }
  });
}
```

### 2. Otimização de Consultas ao Banco de Dados

```typescript
// Antes
const [rows] = await pool.query('SELECT * FROM jobs');

// Depois - Selecionar apenas colunas necessárias
const [rows] = await pool.query('SELECT id, title, company_id, status FROM jobs');

// Usar índices adequados
// No arquivo database/schema.sql:
// CREATE INDEX idx_jobs_status_company ON jobs(status, company_id);

// Implementar paginação
const page = 1;
const limit = 10;
const offset = (page - 1) * limit;
const [rows] = await pool.query(
  'SELECT id, title FROM jobs WHERE status = ? LIMIT ? OFFSET ?',
  ['open', limit, offset]
);
```

### 3. Implementar Cache com Redis (para instalação em VPS)

```typescript
// Instalar
// npm install redis

// Implementar
import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.connect();

// Exemplo de uso
async function getJobWithCache(jobId) {
  const cacheKey = `job:${jobId}`;
  
  // Tentar ler do cache primeiro
  const cachedData = await redisClient.get(cacheKey);
  if (cachedData) {
    return JSON.parse(cachedData);
  }
  
  // Se não estiver no cache, buscar do banco
  const [job] = await pool.query('SELECT * FROM jobs WHERE id = ?', [jobId]);
  
  // Salvar no cache por 5 minutos
  await redisClient.set(cacheKey, JSON.stringify(job), {
    EX: 300 // 5 minutos
  });
  
  return job;
}
```

## Otimizações do Servidor (VPS)

### 1. Configurar Nginx para Caching

Adicione ao arquivo `/etc/nginx/sites-available/job-marketplace`:

```nginx
server {
    # ... configurações existentes ...
    
    # Configurações de cache
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        expires 7d;
        add_header Cache-Control "public, max-age=604800";
    }
    
    # Gzip para compressão
    gzip on;
    gzip_comp_level 5;
    gzip_min_length 256;
    gzip_proxied any;
    gzip_vary on;
    gzip_types
        application/javascript
        application/json
        application/x-javascript
        application/xml
        text/css
        text/javascript
        text/plain
        text/xml;
}
```

### 2. Alocar Recursos Adequados

- **CPU**: Pelo menos 2 cores para um desempenho adequado
- **Memória**: Mínimo de 2GB RAM, ideal 4GB
- **Disco**: SSD é fortemente recomendado (em vez de HDD)

### 3. Monitoramento de Performance

Instale ferramentas de monitoramento:

```bash
# Instalar netdata para monitoramento em tempo real
sudo apt update
sudo apt install -y netdata

# Configurar para acesso remoto
sudo sed -i 's/127.0.0.1/0.0.0.0/g' /etc/netdata/netdata.conf
sudo systemctl restart netdata

# Acesse o dashboard em http://seu-ip:19999
```

## Dicas de Performance para Cloudflare

Se você estiver usando Cloudflare como proxy, ative estas configurações:

1. **Auto Minify**: Ative para HTML, CSS e JavaScript
2. **Brotli**: Ative para compressão melhor que Gzip
3. **Caching Level**: Defina como "Standard"
4. **Browser Cache TTL**: Defina como "1 dia"
5. **Always Online**: Ative para disponibilidade mesmo quando o servidor estiver offline 