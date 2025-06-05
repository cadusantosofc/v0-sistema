CREATE TABLE IF NOT EXISTS wallet_requests (
  id varchar(36) NOT NULL,
  user_id varchar(36) NOT NULL,
  type ENUM('deposit', 'withdrawal') NOT NULL,
  amount decimal(10,2) NOT NULL,
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  receipt_url varchar(255),
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
