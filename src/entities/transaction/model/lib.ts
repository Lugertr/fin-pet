import type { Transaction } from './types';

export function filterTransactions(
  transactions: Transaction[],
  filter: Transaction['type'] | 'all'
): Transaction[] {
  const filtered = filter === 'all' ? transactions : transactions.filter((t) => t.type === filter);
  return [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function groupTransactionsByDate(
  transactions: Transaction[]
): Record<string, Transaction[]> {
  const groups: Record<string, Transaction[]> = {};
  transactions.forEach((tx) => {
    const dateKey = tx.date.split('T')[0];
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(tx);
  });
  return groups;
}

export function calculateTransactionSummary(transactions: Transaction[]) {
  const earned = transactions
    .filter((t) => t.type === 'earn' || t.type === 'reward')
    .reduce((sum, t) => sum + t.amount, 0);
  const spent = transactions
    .filter((t) => t.type === 'spend')
    .reduce((sum, t) => sum + t.amount, 0);
  const saved = transactions.filter((t) => t.type === 'save').reduce((sum, t) => sum + t.amount, 0);

  return { earned, spent, saved };
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Сегодня';
  if (date.toDateString() === yesterday.toDateString()) return 'Вчера';

  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
  });
}

export function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
}
