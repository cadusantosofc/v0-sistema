-- Criação do banco de dados
CREATE DATABASE IF NOT EXISTS job_marketplace;
USE job_marketplace;

-- Tabela de usuários
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'worker', 'company') NOT NULL,
    avatar VARCHAR(255),
    phone VARCHAR(20),
    bio TEXT,
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de carteiras digitais
CREATE TABLE wallets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50),
    balance DECIMAL(10,2) DEFAULT 0.00,
    status ENUM('active', 'blocked') DEFAULT 'active',
    FOREIGN KEY (user_id) REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de transações
CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id VARCHAR(50),
    receiver_id VARCHAR(50),
    amount DECIMAL(10,2) NOT NULL,
    type ENUM('deposit', 'withdrawal', 'transfer') NOT NULL,
    status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (receiver_id) REFERENCES users(id)
);

-- Tabela de chats
CREATE TABLE chats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    worker_id VARCHAR(50),
    company_id VARCHAR(50),
    status ENUM('active', 'closed') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (worker_id) REFERENCES users(id),
    FOREIGN KEY (company_id) REFERENCES users(id)
);

-- Tabela de mensagens
CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chat_id INT,
    sender_id VARCHAR(50),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chat_id) REFERENCES chats(id),
    FOREIGN KEY (sender_id) REFERENCES users(id)
);

-- Índices para otimização
CREATE INDEX idx_transactions_sender ON transactions(sender_id);
CREATE INDEX idx_transactions_receiver ON transactions(receiver_id);
CREATE INDEX idx_messages_chat ON messages(chat_id);
CREATE INDEX idx_chats_users ON chats(worker_id, company_id);

-- Tabela de vagas
CREATE TABLE jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id VARCHAR(50),
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    category VARCHAR(50),
    salary_range VARCHAR(50),
    location VARCHAR(100),
    type ENUM('full_time', 'part_time', 'contract', 'freelance') NOT NULL,
    status ENUM('open', 'closed', 'draft') DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES users(id)
);

-- Tabela de candidaturas
CREATE TABLE applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT,
    worker_id VARCHAR(50),
    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    cover_letter TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id),
    FOREIGN KEY (worker_id) REFERENCES users(id)
);

-- Índices para vagas e candidaturas
CREATE INDEX idx_jobs_company ON jobs(company_id);
CREATE INDEX idx_jobs_category ON jobs(category);
CREATE INDEX idx_applications_job ON applications(job_id);
CREATE INDEX idx_applications_worker ON applications(worker_id);
