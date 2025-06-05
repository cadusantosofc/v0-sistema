-- Usar o banco de dados
USE job_marketplace;

-- Criar tabela de avaliações básica
CREATE TABLE reviews (
  id VARCHAR(36) PRIMARY KEY,
  job_id VARCHAR(36) NOT NULL,
  reviewer_id VARCHAR(36) NOT NULL,
  reviewed_id VARCHAR(36) NOT NULL,
  rating INT NOT NULL,
  comment TEXT,
  status ENUM('active', 'deleted') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 