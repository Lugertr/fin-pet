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

export const QUEST_CATEGORY_EMOJIS: Record<QuestCategory, string> = {
  basics: '📘',
  saving: '💰',
  budgeting: '📊',
  investing: '📈',
};
