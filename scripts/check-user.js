// Script para verificar usuário no banco de dados
const mysql = require('mysql2/promise');

async function main() {
  // Configurações de conexão
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'job_marketplace',
    port: 3306
  });

  try {
    console.log('Verificando usuário company-1...');
    const [rows] = await connection.execute('SELECT * FROM users WHERE id = ?', ['company-1']);
    
    if (rows.length > 0) {
      console.log('Usuário encontrado:');
      console.log(rows[0]);
    } else {
      console.log('Usuário não encontrado!');
      
      // Verificar quais empresas existem
      console.log('\nEmpresas cadastradas:');
      const [companies] = await connection.execute('SELECT id, name, email FROM users WHERE role = ?', ['company']);
      console.log(companies);
    }
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
  } finally {
    await connection.end();
  }
}

main(); 