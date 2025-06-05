import mysql from 'mysql2/promise';

console.log('Configuração do banco:', {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

// Verificar se já temos um pool global para reutilizar
declare global {
  var mysqlPool: mysql.Pool | undefined;
}

const createPool = () => {
  console.log('Criando novo pool de conexões');
  return mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT),
    waitForConnections: true,
    connectionLimit: 10, // Reduzido para evitar sobrecarga
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000, 
    idleTimeout: 30000, // 30 segundos - fecha conexões inativas mais rápido
    connectTimeout: 10000,
    namedPlaceholders: true
  });
};

// Usar pool global se existir, ou criar um novo
const pool = global.mysqlPool || createPool();

// Somente em ambiente de desenvolvimento, armazena o pool globalmente
if (process.env.NODE_ENV !== 'production') {
  global.mysqlPool = pool;
}

// Monitoramento de conexões
pool.on('connection', () => {
  console.log('Nova conexão estabelecida com o banco de dados');
});

pool.on('release', () => {
  console.log('Conexão liberada de volta para o pool');
});

pool.on('error', (err) => {
  console.error('Erro no pool de conexões:', err);
});

/**
 * Função auxiliar para executar queries com retry automático
 */
export async function query(sql: string, params?: any[], maxRetries = 3): Promise<any> {
  let retries = 0;
  let lastError;

  while (retries < maxRetries) {
    try {
      console.log(`Executando query (tentativa ${retries + 1}/${maxRetries})`, { 
        sql: sql.substring(0, 100) + (sql.length > 100 ? '...' : ''),
        params: params ? 'Com parâmetros' : 'Sem parâmetros'
      });

      // Usar diretamente o pool.query em vez de gerenciar conexões
      const [results] = await pool.query(sql, params);
      return results;
    } catch (error: any) {
      lastError = error;
      console.error(`Erro na tentativa ${retries + 1}/${maxRetries}:`, error.message);
      
      // Se o erro for de "too many connections", espere um pouco antes de tentar novamente
      if (error.code === 'ER_CON_COUNT_ERROR') {
        const waitTime = Math.pow(2, retries) * 1000; // Backoff exponencial: 1s, 2s, 4s
        console.log(`Aguardando ${waitTime}ms antes da próxima tentativa...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else {
        // Para outros erros, não precisamos fazer retry
        break;
      }
      
      retries++;
    }
  }

  console.error(`Todas as ${maxRetries} tentativas falharam`);
  throw lastError;
}

// Função de emergência para fechar todas as conexões e criar um novo pool
export async function resetPool() {
  try {
    console.log('Tentando resetar o pool de conexões...');
    await pool.end();
    console.log('Pool de conexões fechado com sucesso');
    
    // Criar um novo pool e atualizar a referência global
    const newPool = createPool();
    global.mysqlPool = newPool;
    
    console.log('Novo pool de conexões criado');
    return true;
  } catch (error) {
    console.error('Erro ao resetar pool de conexões:', error);
    return false;
  }
}

export { pool };
