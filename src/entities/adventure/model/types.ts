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

export function formatAdventureTime(endsAt: string): string {
  const now = new Date();
  const end = new Date(endsAt);
  const diff = end.getTime() - now.getTime();

  if (diff <= 0) return 'Готово!';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return hours > 0 ? `${hours}ч ${minutes}м` : `${minutes}м ${seconds}с`;
}

export function isAdventureReady(endsAt: string): boolean {
  return new Date() >= new Date(endsAt);
}

export function calculateAdventureReward(minReward: number, maxReward: number): number {
  return Math.floor(Math.random() * (maxReward - minReward + 1)) + minReward;
}
