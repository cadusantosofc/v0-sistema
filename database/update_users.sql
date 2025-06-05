USE job_marketplace;

-- Adicionar coluna password na tabela users
ALTER TABLE users
ADD COLUMN password VARCHAR(255) NOT NULL AFTER email;

-- Adicionar índice para email e password para otimizar login
CREATE INDEX idx_users_auth ON users(email, password);
