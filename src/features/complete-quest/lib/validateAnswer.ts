import type { Quest } from '@/entities/quest';

export function validateAnswer(quest: Quest, answer: string): boolean {
  if (quest.answerType !== 'open' && quest.correctAnswer) {
    return answer.toLowerCase().trim() === quest.correctAnswer.toLowerCase().trim();
  }
  return true;
}
