-- Script para corrigir a incompatibilidade entre os tipos de colunas
USE job_marketplace;

-- Verificar o tipo atual da coluna id na tabela jobs
SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'job_marketplace'
AND TABLE_NAME = 'jobs'
AND COLUMN_NAME = 'id';

-- Verificar o tipo atual da coluna job_id na tabela reviews
SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'job_marketplace'
AND TABLE_NAME = 'reviews'
AND COLUMN_NAME = 'job_id';

-- Modificar a coluna job_id para INT para corresponder ao tipo da coluna id na tabela jobs
ALTER TABLE reviews MODIFY COLUMN job_id INT NOT NULL;

-- Agora, adicionar a chave estrangeira
ALTER TABLE reviews
ADD CONSTRAINT fk_reviews_job FOREIGN KEY (job_id) REFERENCES jobs(id);

-- Adicionar as outras chaves estrangeiras
ALTER TABLE reviews
ADD CONSTRAINT fk_reviews_reviewer FOREIGN KEY (reviewer_id) REFERENCES users(id);

ALTER TABLE reviews
ADD CONSTRAINT fk_reviews_reviewed FOREIGN KEY (reviewed_id) REFERENCES users(id); 