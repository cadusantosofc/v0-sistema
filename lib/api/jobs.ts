import { Job } from '@/lib/jobs-context'

export async function createJob(data: {
  company_id: string
  title: string
  description: string
  requirements: string
  salary_range: string
  location: string
  type: 'full_time' | 'part_time' | 'contract' | 'internship'
  category: string
  status: 'open' | 'closed' | 'draft'
}): Promise<Job> {
  const response = await fetch('/api/jobs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error('Failed to create job')
  }

  return response.json()
}

export async function getJobById(id: string): Promise<Job | null> {
  const response = await fetch(`/api/jobs?jobId=${id}`)
  
  if (!response.ok) {
    throw new Error('Failed to fetch job')
  }

  return response.json()
}

export async function getJobsByCompanyId(companyId: string): Promise<Job[]> {
  const response = await fetch(`/api/jobs?companyId=${companyId}`)
  
  if (!response.ok) {
    throw new Error('Failed to fetch jobs')
  }

  return response.json()
}

export async function listOpenJobs(category?: string): Promise<Job[]> {
  const response = await fetch(`/api/jobs${category ? `?category=${category}` : ''}`)
  
  if (!response.ok) {
    throw new Error('Failed to fetch jobs')
  }

  return response.json()
}

export async function updateJob(id: string, data: Partial<{
  title: string
  description: string
  requirements: string
  salary_range: string
  location: string
  type: 'full_time' | 'part_time' | 'contract' | 'internship'
  category: string
  status: 'open' | 'closed' | 'draft'
}>): Promise<Job> {
  const response = await fetch(`/api/jobs`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id, ...data }),
  })

  if (!response.ok) {
    throw new Error('Failed to update job')
  }

  return response.json()
}

export async function deleteJob(id: string): Promise<void> {
  await fetch(`/api/jobs?id=${id}`, {
    method: 'DELETE',
  })
}
