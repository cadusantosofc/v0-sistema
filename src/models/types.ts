export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'worker' | 'company';
  avatar?: string;
  phone?: string;
  bio?: string;
  category?: string;
  document?: string;
  created_at: Date;
}

export type Wallet = {
  id: number;
  user_id: string;
  balance: number;
  status: 'active' | 'blocked';
  created_at: Date;
}

export type Transaction = {
  id: string;
  from_wallet_id: string;
  to_wallet_id: string;
  amount: number;
  type: 'payment' | 'refund' | 'fee' | 'deposit' | 'withdrawal' | 'transfer';
  status: 'pending' | 'completed' | 'failed';
  description?: string;
  created_at: Date;
}

export type Chat = {
  id: number;
  worker_id: string;
  company_id: string;
  job_id: string;
  status: 'active' | 'closed';
  created_at: Date;
}

export type Message = {
  id: number;
  chat_id: number;
  sender_id: string;
  content: string;
  created_at: Date;
}

export type Review = {
  id: string;
  job_id: string;
  reviewer_id: string;
  reviewed_id: string;
  rating: number;
  comment: string;
  status: 'active' | 'deleted';
  created_at: Date;
}
