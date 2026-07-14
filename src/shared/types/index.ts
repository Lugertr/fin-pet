// ============================================================
// ТИПЫ ПИТОМЦА
// ============================================================

export type PetType = 'cat' | 'dog' | 'dragon' | 'fox';
export type PetMood = 'idle' | 'happy' | 'sad' | 'hungry' | 'sleeping';

export interface Pet {
  id: string;
  type: PetType;
  name: string;
  color: string;
  level: number;
  experience: number;
  stage: number;
  hunger: number;
  happiness: number;
  energy: number;
  accessories: string[];
  roomDecorations: string[];
  createdAt: string;
  lastFedAt: string;
  lastPlayedAt: string;
  lastStatusUpdateAt: string;
}

// ============================================================
// ФИНАНСЫ
// ============================================================

export interface Finances {
  coins: number;
  savings: number;
  totalEarned: number;
  totalSpent: number;
  totalSaved: number;
}

// ============================================================
// ЗАДАНИЯ
// ============================================================

export type QuestCategory = 'basics' | 'saving' | 'budgeting' | 'investing';
export type QuestDifficulty = 1 | 2 | 3;

export interface Quest {
  id: string;
  templateId: string;
  title: string;
  description: string;
  category: QuestCategory;
  difficulty: QuestDifficulty;
  reward: number;
  content: string;
  answerType: 'text' | 'number' | 'multiple_choice' | 'open';
  correctAnswer?: string;
  answerOptions?: string[];
  experienceReward: number;
  date: string;
  completed: boolean;
  completedAt?: string;
  userAnswer?: string;
  isCorrect?: boolean;
}

// ============================================================
// МАГАЗИН
// ============================================================

export type ShopCategory = 'food' | 'toy' | 'accessory' | 'room_decoration' | 'investment';
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  category: ShopCategory;
  price: number;
  effect: {
    hunger?: number;
    happiness?: number;
    passiveIncome?: number;
  };
  rarity: Rarity;
  image: string;
  consumable: boolean;
  levelRequirement?: number;
}

export interface InventoryItem {
  itemId: string;
  quantity: number;
  purchasedAt: string;
  equipped: boolean;
}

// ============================================================
// КОПИЛКА
// ============================================================

export interface PiggyBank {
  balance: number;
  interestRate: number;
  goal?: {
    itemId: string;
    targetAmount: number;
  };
  lastInterestCalculatedAt: string;
}

// ============================================================
// ДОСТИЖЕНИЯ
// ============================================================

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  condition: {
    type: string;
    value: number;
  };
  unlocked: boolean;
  unlockedAt?: string;
  reward?: {
    coins?: number;
    experience?: number;
  };
}

// ============================================================
// СТАТИСТИКА
// ============================================================

export interface Stats {
  totalQuestsCompleted: number;
  totalCoinsEarned: number;
  totalCoinsSpent: number;
  totalItemsBought: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
}

// ============================================================
// ЧАТ
// ============================================================

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

// ============================================================
// ТРАНЗАКЦИИ (ДНЕВНИК ТРАТ)
// ============================================================

export type TransactionType = 'earn' | 'spend' | 'save' | 'withdraw' | 'interest' | 'reward';

export interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  amount: number;
  description: string;
  category?: string;
}

// ============================================================
// НАСТРОЙКИ ПРИЛОЖЕНИЯ
// ============================================================

export interface NotificationSettings {
  quests: boolean;
  petHungry: boolean;
  motivation: boolean;
  piggyBank?: boolean;
  adventures?: boolean;
  achievements?: boolean;
}

export interface AppSettings {
  notifications: NotificationSettings;
  reminderTime: string;
  parentPinHash?: string;
  soundEnabled: boolean;
  vibrationEnabled?: boolean;
  language?: 'ru' | 'en';
}

// ============================================================
// АНИМАЦИЯ НАГРАДЫ
// ============================================================

export type RewardAnimationType = 'coins' | 'achievement' | 'level_up';

export interface RewardAnimation {
  type: RewardAnimationType;
  value: number | string;
  timestamp: number;
}

// ============================================================
// ПРИКЛЮЧЕНИЯ
// ============================================================

export type AdventureCategory = 'shop' | 'bank' | 'exchange';

export interface Adventure {
  id: string;
  name: string;
  description: string;
  duration: number;
  minReward: number;
  maxReward: number;
  category: AdventureCategory;
  emoji: string;
  energyCost: number;
  levelRequirement: number;
}

export interface ActiveAdventure {
  adventureId: string;
  startedAt: string;
  endsAt: string;
  reward?: number;
}

// ============================================================
// СОСТОЯНИЕ ИГРЫ
// ============================================================

export interface GameState {
  pet: Pet | null;
  finances: Finances;
  inventory: InventoryItem[];
  dailyQuests: Quest[];
  piggyBank: PiggyBank;
  achievements: Achievement[];
  stats: Stats;
  chatMessages: ChatMessage[];
  transactions: Transaction[];
  settings: AppSettings;
  isOnboarded: boolean;
  lastRewardAnimation: RewardAnimation | null;
  activeAdventure: ActiveAdventure | null;
}
