// domain/repositories/ContentRepository.ts
// Абстракция над источником учебного контента. Сейчас — локальный JSON
// (LocalJsonContentRepository), позже можно подставить реализацию поверх
// сервера раздачи обновляемого контента (§3.4 ТЗ), не трогая потребителей.

import { AchievementDefinition } from '@/domain/achievement/Achievement';
import { AiStubContent } from '@/domain/ai/AiAssistant';
import {
  BranchContent,
  FiveLettersWordContent,
  GiftPathNodeContent,
  LessonContent,
} from '@/domain/content/LessonContent';
import { ItemContent } from '@/domain/content/ItemContent';

export interface ContentRepository {
  getBranches(): Promise<BranchContent[]>;
  getLessons(): Promise<LessonContent[]>;
  getItems(): Promise<ItemContent[]>;
  getAchievements(): Promise<AchievementDefinition[]>;
  getAiStubContent(): Promise<AiStubContent>;
  getGiftPathNodes(): Promise<GiftPathNodeContent[]>;
  getFiveLettersWords(): Promise<FiveLettersWordContent[]>;
}
