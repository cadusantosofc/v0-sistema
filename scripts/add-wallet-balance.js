/**
 * Script para adicionar saldo à carteira de um usuário
 * 
 * Uso: node scripts/add-wallet-balance.js <userId> <amount>
 * Exemplo: node scripts/add-wallet-balance.js company-1 500
 */

// Importações
const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuração da conexão com o banco de dados
const pool = mysql.createPool({
  host: process.env.DATABASE_HOST || 'localhost',
  user: process.env.DATABASE_USER || 'root',
  password: process.env.DATABASE_PASSWORD || '',
  database: process.env.DATABASE_NAME || 'job_marketplace',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Função para verificar e criar carteira se não existir
async function ensureWalletExists(userId) {
  // Verifica se a carteira existe
  const [wallets] = await pool.execute(
    'SELECT * FROM wallets WHERE user_id = ?',
    [userId]
  );

  if (wallets.length === 0) {
    // Cria nova carteira
    await pool.execute(
      'INSERT INTO wallets (user_id, balance, status) VALUES (?, 0, "active")',
      [userId]
    );
    console.log(`Carteira criada para o usuário ${userId}`);
  }

  return wallets[0] || { user_id: userId, balance: 0 };
}

// Função principal
async function addBalance(userId, amount) {
  if (!userId || !amount) {
    console.error('Uso: node scripts/add-wallet-balance.js <userId> <amount>');
    process.exit(1);
  }

  const amountValue = parseFloat(amount);
  if (isNaN(amountValue) || amountValue <= 0) {
    console.error('O valor deve ser um número positivo');
    process.exit(1);
  }

  try {
    // Verifica/cria carteira do usuário
    const wallet = await ensureWalletExists(userId);

    // Atualiza saldo
    await pool.execute(
      'UPDATE wallets SET balance = balance + ? WHERE user_id = ?',
      [amountValue, userId]
    );

    // Verifica saldo atualizado
    const [updatedWallets] = await pool.execute(
      'SELECT * FROM wallets WHERE user_id = ?',
      [userId]
    );
    
    const updatedWallet = updatedWallets[0];
    console.log(`Saldo atualizado com sucesso!`);
    console.log(`Usuário: ${userId}`);
    console.log(`Saldo anterior: R$ ${wallet.balance.toFixed(2)}`);
    console.log(`Valor adicionado: R$ ${amountValue.toFixed(2)}`);
    console.log(`Saldo atual: R$ ${updatedWallet.balance.toFixed(2)}`);

  } catch (error) {
    console.error('Erro ao adicionar saldo:', error);
    process.exit(1);
  } finally {
    // Encerra a conexão com o banco de dados
    pool.end();
  }
}

// Executa a função principal
const userId = process.argv[2];
const amount = process.argv[3];
addBalance(userId, amount); 