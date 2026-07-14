export type { Pet, PetType, PetMood } from '@/entities/pet';
export type { Quest, QuestCategory, QuestDifficulty } from '@/entities/quest';
export type { ShopItem, ShopCategory, Rarity } from '@/entities/shop-item';
export type { InventoryItem } from '@/entities/inventory';
export type { Achievement } from '@/entities/achievement';
export type { Finances, Stats } from '@/entities/wallet';
export type { PiggyBank } from '@/entities/piggy-bank';
export type { Adventure, ActiveAdventure, AdventureCategory } from '@/entities/adventure';
export type { ChatMessage } from '@/entities/chat';
export type { Transaction, TransactionType } from '@/entities/transaction';
export type { NotificationSettings, AppSettings } from '@/entities/settings';

export type RewardAnimationType = 'coins' | 'achievement' | 'level_up';

export interface RewardAnimation {
  type: RewardAnimationType;
  value: number | string;
  timestamp: number;
}

export interface GameState {
  pet: import('@/entities/pet').Pet | null;
  finances: import('@/entities/wallet').Finances;
  inventory: import('@/entities/inventory').InventoryItem[];
  dailyQuests: import('@/entities/quest').Quest[];
  piggyBank: import('@/entities/piggy-bank').PiggyBank;
  achievements: import('@/entities/achievement').Achievement[];
  stats: import('@/entities/wallet').Stats;
  chatMessages: import('@/entities/chat').ChatMessage[];
  transactions: import('@/entities/transaction').Transaction[];
  settings: import('@/entities/settings').AppSettings;
  isOnboarded: boolean;
  lastRewardAnimation: RewardAnimation | null;
  activeAdventure: import('@/entities/adventure').ActiveAdventure | null;
}
