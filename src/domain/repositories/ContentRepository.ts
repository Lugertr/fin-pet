// domain/repositories/ContentRepository.ts
// Абстракция над источником учебного контента. Сейчас — локальный JSON
// (LocalJsonContentRepository), позже можно подставить реализацию поверх
// сервера раздачи обновляемого контента (§3.4 ТЗ), не трогая потребителей.

import { AchievementDefinition } from '@/domain/achievement/Achievement';
import { AdventureEventTemplate } from '@/domain/adventure/AdventureEvent';
import { AiStubContent } from '@/domain/ai/AiAssistant';
import {
  ArcadeSwipeCardsContent,
  BranchContent,
  FiveLettersWordContent,
  AnyLessonContent,
} from '@/domain/content/LessonContent';
import { ItemContent } from '@/domain/content/ItemContent';
import {
  DocumentContent,
  GlossaryTermContent,
  ScreenHelpContent,
} from '@/domain/content/ReferenceContent';

export interface ContentRepository {
  getBranches(): Promise<BranchContent[]>;
  getLessons(): Promise<AnyLessonContent[]>;
  getItems(): Promise<ItemContent[]>;
  getAchievements(): Promise<AchievementDefinition[]>;
  getAiStubContent(): Promise<AiStubContent>;
  getFiveLettersWords(): Promise<FiveLettersWordContent[]>;
  getAdventureEvents(): Promise<AdventureEventTemplate[]>;
  getGlossary(): Promise<GlossaryTermContent[]>;
  getScreenHelp(): Promise<ScreenHelpContent[]>;
  getArcadeSwipeCards(): Promise<ArcadeSwipeCardsContent[]>;
  getDocuments(): Promise<DocumentContent[]>;
}
