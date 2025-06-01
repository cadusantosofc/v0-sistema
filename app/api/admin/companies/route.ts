import { NextResponse } from "next/server"

const mockCompanies = [
  {
    id: "1",
    name: "Tech Corp",
    email: "contact@techcorp.com",
    phone: "+55 11 99999-9999",
    website: "https://techcorp.com",
    location: "São Paulo, SP",
    logo: "",
    status: "active",
    totalJobs: 15,
    totalHires: 8,
    rating: 4.5,
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "2",
    name: "Dev Solutions",
    email: "contact@devsolutions.com",
    phone: "+55 11 88888-8888",
    website: "https://devsolutions.com",
    location: "Rio de Janeiro, RJ",
    logo: "",
    status: "active",
    totalJobs: 10,
    totalHires: 5,
    rating: 4.2,
    createdAt: "2024-01-02T00:00:00.000Z",
  },
  {
    id: "3",
    name: "Digital Systems",
    email: "contact@digitalsystems.com",
    phone: "+55 11 77777-7777",
    website: "https://digitalsystems.com",
    location: "Belo Horizonte, MG",
    logo: "",
    status: "banned",
    totalJobs: 5,
    totalHires: 2,
    rating: 3.8,
    createdAt: "2024-01-03T00:00:00.000Z",
  },
]

export async function GET() {
  // Aqui você deve buscar as empresas do banco de dados
  return NextResponse.json(mockCompanies)
}
