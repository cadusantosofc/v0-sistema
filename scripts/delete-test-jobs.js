/**
 * Script para excluir vagas de teste do banco de dados
 * 
 * Uso: node scripts/delete-test-jobs.js
 */

// Importações
const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuração da conexão com o banco de dados
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'job_marketplace',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function deleteTestJobs() {
  console.log('Iniciando exclusão de vagas de teste...');
  
  try {
    // 1. Primeiro vamos verificar quais vagas existem
    const [jobs] = await pool.query('SELECT id, title FROM jobs');
    console.log(`Encontradas ${jobs.length} vagas no banco de dados`);
    
    // 2. Identificar vagas de teste (aquelas com "teste" ou "test" no título)
    const testJobs = jobs.filter(job => 
      job.title.toLowerCase().includes('teste') || 
      job.title.toLowerCase().includes('test') || 
      job.title.toLowerCase().includes('api')
    );
    
    console.log(`Identificadas ${testJobs.length} vagas de teste`);
    
    if (testJobs.length === 0) {
      console.log('Não há vagas de teste para excluir.');
      return;
    }
    
    // Exibir lista de vagas que serão excluídas
    console.log('\nVagas que serão excluídas:');
    testJobs.forEach((job, index) => {
      console.log(`${index + 1}. ID: ${job.id}, Título: ${job.title}`);
    });
    
    // Extrair os IDs das vagas de teste
    const testJobIds = testJobs.map(job => job.id);
    
    // 3. Excluir candidaturas relacionadas às vagas de teste (uma por uma)
    console.log('\nExcluindo candidaturas relacionadas...');
    let totalApplicationsDeleted = 0;
    
    for (const jobId of testJobIds) {
      const [appResult] = await pool.execute(
        `DELETE FROM applications WHERE job_id = ?`,
        [jobId]
      );
      
      totalApplicationsDeleted += appResult.affectedRows;
      console.log(`- Excluídas ${appResult.affectedRows} candidaturas da vaga ID ${jobId}`);
    }
    
    console.log(`Total: ${totalApplicationsDeleted} candidaturas excluídas`);
    
    // 4. Excluir as vagas de teste (uma por uma)
    console.log('\nExcluindo vagas de teste...');
    let totalJobsDeleted = 0;
    
    for (const jobId of testJobIds) {
      const [jobResult] = await pool.execute(
        `DELETE FROM jobs WHERE id = ?`,
        [jobId]
      );
      
      totalJobsDeleted += jobResult.affectedRows;
      console.log(`- Excluída vaga ID ${jobId}`);
    }
    
    console.log(`Total: ${totalJobsDeleted} vagas excluídas`);
    
    console.log('\nExclusão de vagas de teste concluída com sucesso!');
  } catch (error) {
    console.error('Erro ao excluir vagas de teste:', error);
  } finally {
    // Fechar a conexão com o banco de dados
    await pool.end();
  }
}

// Executar o script
deleteTestJobs(); 