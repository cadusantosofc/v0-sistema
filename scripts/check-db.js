/**
 * Script para verificar o banco de dados diretamente via mysql2
 */

const mysql = require('mysql2/promise');

async function checkDatabase() {
  // Configuração de conexão
  const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'job_marketplace',
    port: Number(process.env.DB_PORT) || 3306
  };

  console.log('Tentando conectar ao banco de dados com a configuração:');
  console.log(JSON.stringify(config, null, 2));

  // Criar pool de conexão
  const pool = mysql.createPool(config);
  
  try {
    // Verificar conexão
    console.log('\n=== Testando conexão ===');
    const [testResult] = await pool.query('SELECT 1 as test');
    console.log('Conexão bem-sucedida:', testResult);

    // Listar tabelas
    console.log('\n=== Tabelas no banco de dados ===');
    const [tables] = await pool.query('SHOW TABLES');
    console.log(tables.map(t => Object.values(t)[0]).join(', '));

    // Verificar a estrutura de cada tabela de interesse
    const tablesToCheck = ['users', 'wallets', 'transactions', 'jobs'];
    
    for (const table of tablesToCheck) {
      console.log(`\n=== Estrutura da tabela ${table} ===`);
      const [columns] = await pool.query(`DESCRIBE ${table}`);
      
      console.log('Colunas:');
      columns.forEach(col => {
        console.log(`- ${col.Field} (${col.Type})${col.Null === 'NO' ? ' NOT NULL' : ''}${col.Key === 'PRI' ? ' PRIMARY KEY' : ''}`);
      });
      
      // Contar registros
      const [countResult] = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
      console.log(`\nTotal de registros: ${countResult[0].count}`);
      
      // Mostrar exemplos se houver registros
      if (countResult[0].count > 0) {
        const [samples] = await pool.query(`SELECT * FROM ${table} LIMIT 2`);
        console.log('\nExemplos de registros:');
        samples.forEach((row, i) => {
          console.log(`\nRegistro ${i + 1}:`);
          Object.entries(row).forEach(([key, value]) => {
            console.log(`  ${key}: ${value}`);
          });
        });
      }
    }

    // Verificar especificamente os wallets
    console.log('\n=== Detalhes das carteiras ===');
    const [wallets] = await pool.query('SELECT * FROM wallets');
    wallets.forEach(wallet => {
      console.log(`\nCarteira ID: ${wallet.id}`);
      console.log(`  Usuário: ${wallet.user_id}`);
      console.log(`  Saldo: ${wallet.balance} (Tipo: ${typeof wallet.balance})`);
      console.log(`  Status: ${wallet.status}`);
      console.log(`  Criado em: ${wallet.created_at}`);
    });

  } catch (error) {
    console.error('Erro ao verificar banco de dados:', error);
  } finally {
    await pool.end();
    console.log('\nConexão encerrada.');
  }
}

// Executar a verificação
checkDatabase().catch(err => {
  console.error('Erro fatal:', err);
  process.exit(1);
}); 