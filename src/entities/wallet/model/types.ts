export interface Finances {
  coins: number;
  savings: number;
  totalEarned: number;
  totalSpent: number;
  totalSaved: number;
}

export interface Stats {
  totalQuestsCompleted: number;
  totalCoinsEarned: number;
  totalCoinsSpent: number;
  totalItemsBought: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
}
