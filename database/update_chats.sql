USE job_marketplace;

-- Adiciona colunas na tabela de chats
ALTER TABLE chats
ADD COLUMN job_id INT NOT NULL AFTER company_id,
ADD COLUMN job_title VARCHAR(100) NOT NULL AFTER job_id,
ADD COLUMN company_name VARCHAR(100) NOT NULL AFTER job_title,
ADD COLUMN worker_name VARCHAR(100) NOT NULL AFTER company_name,
ADD FOREIGN KEY (job_id) REFERENCES jobs(id);

-- Adiciona índice para job_id
CREATE INDEX idx_chats_job ON chats(job_id);
