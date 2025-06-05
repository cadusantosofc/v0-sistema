import { pool } from '@/lib/db'
import { JobApplication } from '@/lib/applications-context'

interface ApplicationRow {
  id: string
  job_id: string
  applicant_id: string
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
  updated_at: string
}

export async function createApplication(data: {
  job_id: string
  applicant_id: string
  status: 'pending'
}): Promise<JobApplication> {
  const [result] = await pool.execute(
    'INSERT INTO applications (job_id, applicant_id, status) VALUES (?, ?, ?)',
    [data.job_id, data.applicant_id, data.status]
  )

  const [rows] = await pool.query<[
    ApplicationRow[],
    { fieldCount: number; affectedRows: number; insertId: number; serverStatus: number; warningCount: number; message: string; protocol41: boolean; changedRows: number }
  ]>(
    'SELECT * FROM applications WHERE id = ?',
    [(result as any).insertId]
  )

  const row = rows[0][0]
  return {
    id: row.id,
    jobId: row.job_id,
    applicantId: row.applicant_id,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

export async function updateApplicationStatus(
  applicationId: string,
  status: 'accepted' | 'rejected'
): Promise<void> {
  await pool.execute(
    'UPDATE applications SET status = ?, updated_at = NOW() WHERE id = ?',
    [status, applicationId]
  )
}

export async function getApplicationsByJobId(jobId: string): Promise<JobApplication[]> {
  const [rows] = await pool.query<[
    ApplicationRow[],
    { fieldCount: number; affectedRows: number; insertId: number; serverStatus: number; warningCount: number; message: string; protocol41: boolean; changedRows: number }
  ]>(
    'SELECT * FROM applications WHERE job_id = ?',
    [jobId]
  )

  return rows[0].map((row: ApplicationRow) => ({
    id: row.id,
    jobId: row.job_id,
    applicantId: row.applicant_id,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }))
}

export async function getApplicationsByUserId(userId: string): Promise<JobApplication[]> {
  const [rows] = await pool.query<[
    ApplicationRow[],
    { fieldCount: number; affectedRows: number; insertId: number; serverStatus: number; warningCount: number; message: string; protocol41: boolean; changedRows: number }
  ]>(
    'SELECT * FROM applications WHERE applicant_id = ?',
    [userId]
  )

  return rows[0].map((row: ApplicationRow) => ({
    id: row.id,
    jobId: row.job_id,
    applicantId: row.applicant_id,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }))
}
