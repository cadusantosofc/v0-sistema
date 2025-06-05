-- Arquivo de índices para otimizar performance do Job Marketplace
-- Execute este script para adicionar os índices necessários no banco de dados

-- Índices para tabela de vagas (jobs)
ALTER TABLE jobs ADD INDEX idx_jobs_status (status);
ALTER TABLE jobs ADD INDEX idx_jobs_company_id (company_id);
ALTER TABLE jobs ADD INDEX idx_jobs_category (category);
ALTER TABLE jobs ADD INDEX idx_jobs_created_at (created_at);
ALTER TABLE jobs ADD INDEX idx_jobs_company_status (company_id, status);

-- Índices para tabela de candidaturas (applications)
ALTER TABLE applications ADD INDEX idx_applications_job_id (job_id);
ALTER TABLE applications ADD INDEX idx_applications_worker_id (worker_id);
ALTER TABLE applications ADD INDEX idx_applications_status (status);
ALTER TABLE applications ADD INDEX idx_applications_created_at (created_at);
ALTER TABLE applications ADD INDEX idx_applications_job_worker (job_id, worker_id);

-- Índices para tabela de usuários (users)
ALTER TABLE users ADD INDEX idx_users_role (role);
ALTER TABLE users ADD INDEX idx_users_email (email);

-- Índices para tabela de avaliações (reviews)
ALTER TABLE reviews ADD INDEX idx_reviews_job_id (job_id);
ALTER TABLE reviews ADD INDEX idx_reviews_worker_id (worker_id);
ALTER TABLE reviews ADD INDEX idx_reviews_company_id (company_id);

-- Índices para tabela de carteiras (wallets)
ALTER TABLE wallets ADD INDEX idx_wallets_user_id (user_id);

-- Índices para tabela de transações (transactions)
ALTER TABLE transactions ADD INDEX idx_transactions_wallet_id (wallet_id);
ALTER TABLE transactions ADD INDEX idx_transactions_created_at (created_at);
ALTER TABLE transactions ADD INDEX idx_transactions_type (type);

-- Índices para tabela de mensagens (messages)
ALTER TABLE messages ADD INDEX idx_messages_sender_id (sender_id);
ALTER TABLE messages ADD INDEX idx_messages_recipient_id (recipient_id);
ALTER TABLE messages ADD INDEX idx_messages_created_at (created_at);
ALTER TABLE messages ADD INDEX idx_messages_conversation (sender_id, recipient_id);

-- Índices para tabela de notificações (notifications)
ALTER TABLE notifications ADD INDEX idx_notifications_user_id (user_id);
ALTER TABLE notifications ADD INDEX idx_notifications_created_at (created_at);
ALTER TABLE notifications ADD INDEX idx_notifications_read (is_read); 