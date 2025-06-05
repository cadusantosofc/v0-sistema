import { RowDataPacket, OkPacket, FieldPacket, QueryResult } from 'mysql2/promise'

export type ApplicationRow = RowDataPacket & {
  id: string
  job_id: string
  applicant_id: string
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
  updated_at: string
}

export type ApplicationResult = QueryResult<ApplicationRow[]>

export type ApplicationRows = ApplicationRow[]
