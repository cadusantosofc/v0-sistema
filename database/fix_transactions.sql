-- Modificar a tabela transactions para aceitar UUID
ALTER TABLE transactions 
MODIFY id varchar(36) NOT NULL;
