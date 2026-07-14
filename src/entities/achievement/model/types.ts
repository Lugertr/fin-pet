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
