-- Alterar o campo avatar para comportar imagens em base64
USE job_marketplace;

-- Alterar o campo avatar para LONGTEXT que pode armazenar até 4GB de dados
ALTER TABLE users MODIFY COLUMN avatar LONGTEXT; 