export interface PiggyBank {
  balance: number;
  interestRate: number;
  goal?: {
    itemId: string;
    targetAmount: number;
  };
  lastInterestCalculatedAt: string;
}

export const DEFAULT_PIGGY_BANK_GOAL = 1000;
