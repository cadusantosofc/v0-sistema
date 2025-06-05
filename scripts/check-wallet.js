// Script para verificar o saldo da carteira de um usuário
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

// Função para verificar a carteira
async function checkWallet(userId) {
  try {
    // Verificar se o usuário existe
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );

    if (!users.length) {
      console.log(`Usuário com ID ${userId} não encontrado`);
      return;
    }

    // Verificar a carteira
    const [wallets] = await pool.execute(
      'SELECT * FROM wallets WHERE user_id = ?',
      [userId]
    );

    if (!wallets.length) {
      console.log(`Usuário ${userId} (${users[0].name}) não possui carteira`);
      return;
    }

    // Exibir informações da carteira
    const wallet = wallets[0];
    console.log(`\nInformações da carteira:`);
    console.log(`Usuário: ${users[0].name} (${userId})`);
    console.log(`ID da carteira: ${wallet.id}`);
    
    // Exibe o tipo e valor bruto do saldo
    console.log(`Tipo do saldo: ${typeof wallet.balance}`);
    console.log(`Valor bruto do saldo: ${wallet.balance}`);
    
    // Converte para número
    const balance = Number(wallet.balance);
    console.log(`Saldo convertido: R$ ${balance.toFixed(2)}`);
    console.log(`Status: ${wallet.status}`);

    // Verificar se o saldo é suficiente para criar uma vaga
    const MIN_BALANCE = 50.00; // Valor mínimo para criar uma vaga
    if (balance >= MIN_BALANCE) {
      console.log(`\nO saldo é SUFICIENTE para criar uma vaga básica (custo: R$ ${MIN_BALANCE.toFixed(2)})`);
    } else {
      console.log(`\nO saldo é INSUFICIENTE para criar uma vaga básica (custo: R$ ${MIN_BALANCE.toFixed(2)})`);
      console.log(`Faltam R$ ${(MIN_BALANCE - balance).toFixed(2)}`);
    }

    // Mostrar também o dump completo da carteira para debug
    console.log('\nDump completo da carteira:');
    console.log(JSON.stringify(wallet, null, 2));

  } catch (error) {
    console.error('Erro ao verificar carteira:', error);
  } finally {
    // Encerra a conexão com o banco de dados
    await pool.end();
  }
}

// Pega o ID do usuário da linha de comando ou usa o padrão
const userId = process.argv[2] || 'company-1';
console.log(`Verificando carteira do usuário: ${userId}`);

// Executa a verificação
checkWallet(userId); 