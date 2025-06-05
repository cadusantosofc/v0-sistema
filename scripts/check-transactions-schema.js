// Script para verificar o esquema da tabela transactions
require('dotenv').config();

// Importações
const mysql = require('mysql2/promise');

// Configuração do banco de dados a partir das variáveis de ambiente
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'job_marketplace',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Função para verificar o esquema da tabela
async function checkTransactionsSchema() {
  try {
    // Verificar o esquema da tabela transactions
    const [rows] = await pool.execute('DESCRIBE transactions');
    
    console.log('Esquema da tabela transactions:');
    console.log(JSON.stringify(rows, null, 2));
    
    // Verificar se há transações na tabela
    const [transactionCount] = await pool.execute('SELECT COUNT(*) as count FROM transactions');
    console.log(`\nNúmero de transações na tabela: ${transactionCount[0].count}`);
    
    if (transactionCount[0].count > 0) {
      // Mostrar algumas transações
      const [transactions] = await pool.execute('SELECT * FROM transactions LIMIT 3');
      console.log('\nExemplos de transações:');
      console.log(JSON.stringify(transactions, null, 2));
    }
  } catch (error) {
    console.error('Erro ao verificar esquema:', error);
  } finally {
    // Encerra a conexão com o banco de dados
    await pool.end();
  }
}

// Executa a verificação
checkTransactionsSchema(); 