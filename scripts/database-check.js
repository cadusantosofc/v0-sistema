/**
 * Script para verificar o estado do banco de dados
 */

// Importar apenas módulos padrão para evitar problemas
const { execSync } = require('child_process');

try {
  // Configuração básica
  const connection = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'job_marketplace'
  };

  // Criar uma consulta SQL para verificar a estrutura
  const query = `
    SELECT
      CONCAT('CREATE TABLE IF NOT EXISTS \`', table_name, '\` (') as query_head,
      GROUP_CONCAT(
        CONCAT('\`', column_name, '\` ', column_type, 
        CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END,
        CASE WHEN column_default IS NOT NULL THEN CONCAT(' DEFAULT "', column_default, '"') ELSE '' END,
        CASE WHEN column_key = 'PRI' THEN ' PRIMARY KEY' ELSE '' END
        ) ORDER BY ordinal_position SEPARATOR ',\n'
      ) as query_body,
      ')' as query_tail
    FROM information_schema.columns
    WHERE table_schema = '${connection.database}'
    GROUP BY table_name;
  `;

  // Executar consulta diretamente
  const command = `mysql -h${connection.host} -u${connection.user} ${connection.password ? `-p${connection.password}` : ''} -D${connection.database} -e "${query}"`;
  
  console.log('Tentando executar comando MySQL...');
  console.log(command);
  
  try {
    const output = execSync(command, { encoding: 'utf8' });
    console.log('\nEstrutura das tabelas:');
    console.log(output);
  } catch (error) {
    console.error('Erro ao executar comando MySQL:', error.message);
    
    // Tentar uma consulta mais simples
    const simpleCommand = `mysql -h${connection.host} -u${connection.user} ${connection.password ? `-p${connection.password}` : ''} -D${connection.database} -e "SHOW TABLES;"`;
    
    try {
      console.log('\nTentando comando mais simples:');
      const tablesOutput = execSync(simpleCommand, { encoding: 'utf8' });
      console.log('Tabelas no banco de dados:');
      console.log(tablesOutput);
    } catch (simpleError) {
      console.error('Também falhou o comando simples:', simpleError.message);
    }
  }
} catch (error) {
  console.error('Erro geral:', error);
} 