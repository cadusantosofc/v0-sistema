export interface Job {
  id: string;
  company_id: string;
  title: string;
  description: string;
  requirements: string;
  salary_range: string;
  location: string;
  type: 'full_time' | 'part_time' | 'contract' | 'internship';
  category: string;
  status: 'open' | 'closed' | 'draft' | 'cancelled';
  created_at: string;
  updated_at: string;
  applications?: Application[];
}

export interface Application {
  id: string;
  job_id: string;
  applicant_id: string;
  status: 'pending' | 'rejected' | 'accepted';
  created_at: string;
  updated_at: string;
  job?: Job;
  applicant?: {
    id: string;
    name: string;
    email: string;
    avatar: string;
    role: 'worker';
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  avatar: string;
  role: 'worker' | 'company';
  created_at: string;
  updated_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface JobApplication extends Application {
  job: Job;
  applicant: {
    id: string;
    name: string;
    email: string;
    avatar: string;
    role: 'worker';
  };
}

export interface ApplicationWithDetails {
  job: Job;
  applicant: User;
  status: 'pending' | 'rejected' | 'accepted';
  created_at: string;
  updated_at: string;
}
