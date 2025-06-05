-- Desativa verificações de chave estrangeira e modo seguro temporariamente
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_SAFE_UPDATES = 0;

-- Apaga o banco se existir e recria
DROP DATABASE IF EXISTS job_marketplace;
CREATE DATABASE job_marketplace;
USE job_marketplace;

-- Cria tabela users
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'worker', 'company') NOT NULL,
  avatar VARCHAR(255),
  phone VARCHAR(20),
  bio TEXT,
  category VARCHAR(50),
  document VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cria tabela wallets
CREATE TABLE wallets (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  balance DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Cria tabela jobs
CREATE TABLE jobs (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  company_id VARCHAR(36) NOT NULL,
  category VARCHAR(50) NOT NULL,
  payment_amount DECIMAL(10,2) NOT NULL,
  status ENUM('open', 'in_progress', 'completed', 'cancelled') DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES users(id)
);

-- Cria tabela applications
CREATE TABLE applications (
  id VARCHAR(36) PRIMARY KEY,
  job_id VARCHAR(36) NOT NULL,
  worker_id VARCHAR(36) NOT NULL,
  status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES jobs(id),
  FOREIGN KEY (worker_id) REFERENCES users(id)
);

-- Cria tabela transactions
CREATE TABLE transactions (
  id VARCHAR(36) PRIMARY KEY,
  from_wallet_id VARCHAR(36) NOT NULL,
  to_wallet_id VARCHAR(36) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  type ENUM('payment', 'refund', 'fee') NOT NULL,
  status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (from_wallet_id) REFERENCES wallets(id),
  FOREIGN KEY (to_wallet_id) REFERENCES wallets(id)
);

-- Cria tabela chats
CREATE TABLE chats (
  id VARCHAR(36) PRIMARY KEY,
  job_id VARCHAR(36) NOT NULL,
  worker_id VARCHAR(36) NOT NULL,
  company_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES jobs(id),
  FOREIGN KEY (worker_id) REFERENCES users(id),
  FOREIGN KEY (company_id) REFERENCES users(id)
);

-- Cria tabela messages
CREATE TABLE messages (
  id VARCHAR(36) PRIMARY KEY,
  chat_id VARCHAR(36) NOT NULL,
  sender_id VARCHAR(36) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (chat_id) REFERENCES chats(id),
  FOREIGN KEY (sender_id) REFERENCES users(id)
);

-- Cria índices para otimização
CREATE INDEX idx_users_auth ON users(email, password);
CREATE INDEX idx_jobs_category ON jobs(category);
CREATE INDEX idx_jobs_company ON jobs(company_id);
CREATE INDEX idx_applications_job ON applications(job_id);
CREATE INDEX idx_applications_worker ON applications(worker_id);
CREATE INDEX idx_chats_job ON chats(job_id);
CREATE INDEX idx_messages_chat ON messages(chat_id);

-- Insere usuários com senhas hash bcrypt
INSERT INTO users (id, name, email, password, role, avatar, phone, bio, category, document) VALUES
('admin-1', 'Administrador', 'admin@admin.com', '$2b$10$g5oDpA91TIDA0RHXgRz3/OwK53/cGnWpfRgr/SjyimxSAH7IyPuju', 'admin', '/placeholder.svg', '(11) 99999-9999', 'Administrador da plataforma', NULL, NULL),
('company-1', 'TechCorp Soluções', 'tech@company.com', '$2b$10$g5oDpA91TIDA0RHXgRz3/OwK53/cGnWpfRgr/SjyimxSAH7IyPuju', 'company', '/placeholder.svg', '(11) 3333-3333', 'Empresa de tecnologia especializada em soluções digitais', NULL, '12.345.678/0001-90'),
('worker-1', 'João Silva', 'joao@worker.com', '$2b$10$g5oDpA91TIDA0RHXgRz3/OwK53/cGnWpfRgr/SjyimxSAH7IyPuju', 'worker', '/placeholder.svg', '(11) 88888-8888', 'Desenvolvedor Full Stack com 5 anos de experiência', 'desenvolvimento', '123.456.789-00');

-- Cria carteiras para os usuários
INSERT INTO wallets (id, user_id, balance) VALUES
('wallet-admin-1', 'admin-1', 10000.00),
('wallet-company-1', 'company-1', 5000.00),
('wallet-worker-1', 'worker-1', 1500.00);

-- Cria algumas vagas de exemplo
INSERT INTO jobs (id, title, description, company_id, category, payment_amount) VALUES
('job-1', 'Desenvolvedor Full Stack', 'Vaga para desenvolvedor full stack com experiência em React e Node.js', 'company-1', 'desenvolvimento', 5000.00),
('job-2', 'Designer UI/UX', 'Vaga para designer com experiência em Figma e Adobe XD', 'company-1', 'design', 3000.00);

-- Reativa verificações
SET FOREIGN_KEY_CHECKS = 1;
SET SQL_SAFE_UPDATES = 1;
