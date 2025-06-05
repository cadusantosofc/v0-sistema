import { ApplicationsContextType } from '@/lib/applications-context';

export interface Application {
    id: string;
    userId: string;
    jobId: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: Date;
    updatedAt: Date;
}

export interface ApplicationsState extends ApplicationsContextType {
    loading: boolean;
    error: string | null;
}
