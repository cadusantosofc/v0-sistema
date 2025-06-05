import { JobApplication } from '@/lib/applications-context'

export async function createApplication(data: {
  job_id: string
  applicant_id: string
  status: 'pending'
}): Promise<JobApplication> {
  const response = await fetch('/api/applications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error('Failed to create application')
  }

  return response.json()
}

export async function updateApplicationStatus(
  applicationId: string,
  status: 'pending' | 'pending_worker_confirmation' | 'accepted' | 'rejected' | 'accepted_by_company' | 'active' | 'completed'
): Promise<void> {
  await fetch(`/api/applications`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id: applicationId, status }),
  })
}

export async function getApplicationsByJobId(jobId: string): Promise<JobApplication[]> {
  const response = await fetch(`/api/applications?jobId=${jobId}`)
  
  if (!response.ok) {
    throw new Error('Failed to fetch applications')
  }

  return response.json()
}

export async function getApplicationsByUserId(userId: string) {
  try {
    const response = await fetch(`/api/applications?userId=${userId}`)
    
    if (!response.ok) {
      // Se for erro 404 ou 400, assume que o usuário não tem permissão
      if (response.status === 404 || response.status === 400) {
        return [];
      }
      
      let errorMsg = 'Falha ao buscar candidaturas';
      try {
        const data = await response.json();
        if (data?.error) errorMsg = data.error;
      } catch {}
      
      // Se a mensagem indicar que não é trabalhador, retorna array vazio
      if (errorMsg.includes('não é um trabalhador')) {
        return [];
      }
      
      throw new Error(errorMsg);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erro na requisição de candidaturas:', error);
    // Em caso de qualquer erro, retorna array vazio para não quebrar a UI
    return [];
  }
}

export async function deleteApplication(applicationId: string): Promise<void> {
  await fetch(`/api/applications?id=${applicationId}`, {
    method: 'DELETE',
  })
}
