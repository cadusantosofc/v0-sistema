// Tipos de status

export type ApplicationStatus = 
  | 'pending' 
  | 'accepted' 
  | 'rejected' 
  | 'cancelled' 
  | 'completed' 
  | 'active' 
  | 'accepted_by_company'

export type JobStatus = 
  | 'open' 
  | 'closed' 
  | 'draft' 
  | 'in_progress' 
  | 'completed' 
  | 'active' 
  | 'published'

// Interfaces

export interface Job {
  id: string;
  company_id: string;
  title: string;
  description: string;
  requirements: string[];
  salary_range: string;
  location: string;
  type: 'full_time' | 'part_time' | 'contract' | 'internship';
  category: string;
  status: JobStatus;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  // Para compatibilidade
  companyId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Application {
  id: string;
  job_id: string;
  user_id: string;
  applicant_id?: string; // Para compatibilidade
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
  // Para compatibilidade
  jobId?: string;
  workerId?: string;
  message?: string;
  worker_name?: string;
  worker_avatar?: string;
  accepted_by_company_at?: string;
  accepted_by_worker_at?: string;
}

export interface CreateJobData {
  company_id: string;
  title: string;
  description: string;
  requirements: string[];
  salary_range: string;
  location: string;
  type: 'full_time' | 'part_time' | 'contract' | 'internship';
  category: string;
  status?: JobStatus;
}

export interface JobsContextType {
  jobs: Job[];
  applications: Application[];
  isLoading: boolean;
  error: string | null;
  fetchAllJobs: () => Promise<void>;
  createJob: (jobData: CreateJobData) => Promise<Job | null>;
  applyToJob: (jobId: string, message: string) => Promise<boolean>;
  updateApplicationStatus: (applicationId: string, status: ApplicationStatus) => Promise<boolean>;
  getJobsByCompanyId: (companyId: string) => Promise<Job[]>;
  getJobsByCompany: (companyId: string) => Job[];
  getApplicationsByWorker: (workerId: string) => Application[];
  getJobById: (id: string) => Promise<Job | null>;
  getApplicationById: (id: string) => Application | undefined;
  getCompletedJobsByWorker: (workerId: string) => Job[];
  getActiveJobs: () => Job[];
  cancelJob: (jobId: string) => Promise<boolean>;
  getJobStats: () => { total: number; active: number; completed: number; pending: number };
  getLatestJobs: (limit?: number) => Job[];
  cancelApplication: (applicationId: string) => Promise<boolean>;
  getJobApplications: (jobId: string) => Application[];
  completeJob: (jobId: string, workerId: string) => Promise<boolean>,
  getAllJobs: () => Job[]
}
