-- Adiciona coluna sender_id se não existir
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS sender_id VARCHAR(255) NOT NULL;

-- Adiciona coluna receiver_id se não existir
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS receiver_id VARCHAR(255) NOT NULL;

-- Adiciona coluna amount se não existir
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS amount DECIMAL(10,2) NOT NULL;

-- Adiciona coluna type se não existir
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS type ENUM('transfer', 'deposit', 'withdrawal') NOT NULL;

-- Adiciona coluna status se não existir
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS status ENUM('pending', 'completed', 'failed') NOT NULL;

-- Adiciona coluna description se não existir
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS description TEXT NOT NULL;

-- Adiciona coluna created_at se não existir
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
