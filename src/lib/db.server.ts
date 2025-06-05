import { createPool, Pool } from 'mysql2/promise';

export const pool: Pool = createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'job_marketplace',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Garantir que este arquivo seja usado apenas no lado do servidor
if (typeof window !== 'undefined') {
  throw new Error('Este arquivo deve ser usado apenas no lado do servidor');
}
