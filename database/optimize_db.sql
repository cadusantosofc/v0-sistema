-- Script para otimizar o banco de dados e liberar memória

-- Desativa verificações de chave estrangeira temporariamente
SET FOREIGN_KEY_CHECKS = 0;

-- Adiciona campo categoria na tabela jobs se não existir
ALTER TABLE jobs MODIFY COLUMN category VARCHAR(50) NOT NULL DEFAULT 'servicos';

-- Adiciona índices para otimizar consultas
-- Verifica se o índice já existe antes de criar
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs(category);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at);

CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_worker_id ON applications(worker_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at);

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Limpa dados desnecessários (opcional)
-- Use apenas se necessário liberar espaço

-- Remover candidaturas antigas (mais de 6 meses)
-- DELETE FROM applications WHERE created_at < DATE_SUB(NOW(), INTERVAL 6 MONTH);

-- Remover mensagens antigas (mais de 3 meses)
-- DELETE FROM messages WHERE created_at < DATE_SUB(NOW(), INTERVAL 3 MONTH);

-- Otimiza as tabelas para recuperar espaço
OPTIMIZE TABLE jobs;
OPTIMIZE TABLE applications;
OPTIMIZE TABLE users;
OPTIMIZE TABLE wallets;
OPTIMIZE TABLE transactions;
OPTIMIZE TABLE messages;
OPTIMIZE TABLE chats;

-- Reativa verificações
SET FOREIGN_KEY_CHECKS = 1;

-- Informações sobre o uso de memória das tabelas
SELECT 
    table_name, 
    table_rows,
    data_length/1024/1024 as data_size_mb,
    index_length/1024/1024 as index_size_mb,
    (data_length + index_length)/1024/1024 as total_size_mb
FROM 
    information_schema.tables
WHERE 
    table_schema = 'job_marketplace'
ORDER BY 
    (data_length + index_length) DESC; 