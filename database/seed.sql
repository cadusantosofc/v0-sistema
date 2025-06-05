USE job_marketplace;

-- Inserir usuário admin (senha: admin123)
INSERT INTO users (id, name, email, password, role, avatar) VALUES
('admin-1', 'Administrador', 'admin@admin.com', '$2a$10$rK7PQxWqR.VJwb3OQwMpYu9r6g6Wd8m0s1hJ5/pdFE4Mb7jzpq5Wy', 'admin', 'https://github.com/shadcn.png');

-- Inserir empresa de exemplo (senha: company123)
INSERT INTO users (id, name, email, password, role, avatar, bio, category) VALUES
('company-1', 'Tech Solutions', 'tech@company.com', '$2a$10$8XKg6.g.S5H/fC0YZ3IzKe1XWKzL9QCh6QR1xqV1UqIGYBpgBMp6G', 'company', 'https://github.com/shadcn.png', 'Empresa líder em soluções tecnológicas', 'Tecnologia');

-- Inserir trabalhador de exemplo (senha: worker123)
INSERT INTO users (id, name, email, password, role, avatar, bio, category, phone) VALUES
('worker-1', 'João Silva', 'joao@worker.com', '$2a$10$LKv0VqvQ1K0u.fpZxXYyHOXCkng7qQX3h8J4d.Sy0KRIqLJH.1XKW', 'worker', 'https://github.com/shadcn.png', 'Desenvolvedor Full Stack com 5 anos de experiência', 'desenvolvimento', '(11) 98888-8888');

-- Criar carteiras para os usuários
INSERT INTO wallets (user_id, balance) VALUES
('admin-1', 1000.00),
('company-1', 5000.00),
('worker-1', 2500.00);

-- Inserir algumas vagas de exemplo
INSERT INTO jobs (company_id, title, description, requirements, category, salary_range, location, type) VALUES
('company-1', 'Desenvolvedor Full Stack', 'Desenvolvimento de aplicações web usando React e Node.js', 'React, Node.js, TypeScript, 3+ anos de experiência', 'desenvolvimento', 'R$ 8.000 - R$ 12.000', 'Remoto', 'full_time'),
('company-1', 'UX Designer', 'Criação de interfaces intuitivas e atraentes', 'Figma, Adobe XD, 2+ anos de experiência', 'design', 'R$ 6.000 - R$ 9.000', 'Híbrido - São Paulo', 'full_time');

-- Inserir algumas candidaturas
INSERT INTO applications (job_id, worker_id, status, cover_letter) VALUES
(1, 'worker-1', 'pending', 'Tenho experiência com as tecnologias requeridas e gostaria de fazer parte do time.');

-- Inserir algumas transações de exemplo
INSERT INTO transactions (sender_id, receiver_id, amount, type, status, description) VALUES
('admin-1', 'worker-1', 1000.00, 'transfer', 'completed', 'Pagamento por serviço prestado'),
('company-1', 'worker-1', 1500.00, 'transfer', 'completed', 'Projeto concluído');
