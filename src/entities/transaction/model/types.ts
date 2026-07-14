export type TransactionType = 'earn' | 'spend' | 'save' | 'withdraw' | 'interest' | 'reward';

export interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  amount: number;
  description: string;
  category?: string;
}

export interface TransactionFilter {
  id: TransactionType | 'all';
  label: string;
  emoji: string;
}

export const TRANSACTION_FILTERS: TransactionFilter[] = [
  { id: 'all', label: 'Все', emoji: '📋' },
  { id: 'earn', label: 'Доходы', emoji: '💰' },
  { id: 'spend', label: 'Траты', emoji: '💸' },
  { id: 'save', label: 'Вклад', emoji: '🏦' },
  { id: 'withdraw', label: 'Снятие', emoji: '💵' },
  { id: 'reward', label: 'Награды', emoji: '🎁' },
];

export const TRANSACTION_TYPE_INFO: Record<
  TransactionType,
  { emoji: string; color: string; sign: string }
> = {
  earn: { emoji: '💰', color: 'text-green-600', sign: '+' },
  spend: { emoji: '💸', color: 'text-red-600', sign: '-' },
  save: { emoji: '🏦', color: 'text-blue-600', sign: '-' },
  withdraw: { emoji: '💵', color: 'text-purple-600', sign: '+' },
  interest: { emoji: '📈', color: 'text-green-600', sign: '+' },
  reward: { emoji: '🎁', color: 'text-yellow-600', sign: '+' },
};
