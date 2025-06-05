"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

interface Job {
  id: number;
  title: string;
  description: string;
  requirements: string;
  salary_range: string;
  location: string;
  type: string;
  category: string;
  status: string;
  payment_amount: number;
  created_at: string;
  updated_at: string;
}

export default function CompanyJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    async function fetchJobs() {
      setLoading(true);
      setError("");
      try {
        if (!user) {
          setError("Usuário não autenticado.");
          setLoading(false);
          return;
        }
        const res = await fetch(`/api/jobs?companyId=${user.id}`);
        if (!res.ok) throw new Error("Erro ao buscar vagas");
        const data = await res.json();
        setJobs(Array.isArray(data) ? data : [data]);
      } catch (err: any) {
        setError(err.message || "Erro desconhecido");
      }
      setLoading(false);
    }
    if (!authLoading) fetchJobs();
  }, [user, authLoading]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Minhas Vagas Publicadas</h1>
      {loading && <p>Carregando vagas...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && jobs.length === 0 && (
        <p>Nenhuma vaga publicada ainda.</p>
      )}
      {!loading && !error && jobs.length > 0 && (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="border rounded p-4 bg-white shadow">
              <h2 className="text-lg font-semibold">{job.title}</h2>
              <p className="text-sm text-gray-600 mb-1">{job.category} | {job.type} | {job.location}</p>
              <p className="mb-1">Salário: R$ {job.payment_amount?.toLocaleString("pt-BR") || job.salary_range}</p>
              <p className="mb-1"><b>Status:</b> {job.status}</p>
              <p className="mb-1"><b>Descrição:</b> {job.description}</p>
              <p className="mb-1"><b>Requisitos:</b> {job.requirements}</p>
              <p className="text-xs text-gray-400">Criada em: {new Date(job.created_at).toLocaleString("pt-BR")}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
