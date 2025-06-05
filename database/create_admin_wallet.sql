-- Criar carteira do admin se não existir
INSERT IGNORE INTO wallets (id, user_id, balance)
VALUES ('admin-wallet', 'admin-1', 0);
