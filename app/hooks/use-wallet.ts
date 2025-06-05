"use client"

import { useState, useEffect, useCallback } from "react"

interface Transaction {
  id: string
  type: "credit" | "debit"
  amount: number
  description: string
  jobId: string
  createdAt: string
}

interface Wallet {
  wallet_id: string
  user_id: string
  balance: number
  status: string
  created_at: string
  updated_at: string
}

export function useWallet(userId: string) {
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string>("")  

  const fetchWallet = useCallback(async () => {
    if (!userId) {
      setBalance(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log(`Buscando carteira para o usuário: ${userId}`);
      const response = await fetch(`/api/wallet/${userId}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao carregar carteira: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Resposta da API de carteira:', data);
      
      // Garantir que o saldo seja um número
      const numericBalance = typeof data.balance === 'number' 
        ? data.balance 
        : parseFloat(data.balance || '0');
      
      setBalance(numericBalance);
      setLastUpdated(new Date().toLocaleTimeString());
      console.log(`Saldo atualizado: R$ ${numericBalance.toFixed(2)}`);
    } catch (err) {
      console.error('Erro ao carregar carteira:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar carteira');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const updateBalance = async (amount: number): Promise<boolean> => {
    if (!userId) return false;

    try {
      setLoading(true);
      setError(null);

      console.log(`Atualizando carteira do usuário ${userId} com valor: ${amount}`);
      const response = await fetch(`/api/wallet/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify({ amount })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro ao atualizar saldo: ${response.status} ${response.statusText}`);
      }

      const data: Wallet = await response.json();
      console.log('Resposta da API após atualização:', data);
      
      // Garantir que o saldo seja um número
      const numericBalance = typeof data.balance === 'number' 
        ? data.balance 
        : parseFloat(data.balance || '0');
      
      setBalance(numericBalance);
      setLastUpdated(new Date().toLocaleTimeString());
      console.log(`Saldo atualizado para: R$ ${numericBalance.toFixed(2)}`);
      
      return true;
    } catch (err) {
      console.error('Erro ao atualizar saldo:', err);
      setError(err instanceof Error ? err.message : 'Erro ao atualizar saldo');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const hasEnoughBalance = async (amount: number): Promise<boolean> => {
    await fetchWallet(); // Recarrega saldo antes de verificar
    return balance >= amount;
  };

  // Busca inicial
  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  return {
    balance,
    loading,
    error,
    lastUpdated,
    updateBalance,
    hasEnoughBalance,
    reloadBalance: fetchWallet
  };
} 