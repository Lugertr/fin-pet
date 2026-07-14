import type { Transaction } from '@/entities/transaction';

export function createTransaction(
  type: Transaction['type'],
  amount: number,
  description: string,
  category?: string
): Transaction {
  return {
    id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    date: new Date().toISOString(),
    type,
    amount,
    description,
    category,
  };
}
