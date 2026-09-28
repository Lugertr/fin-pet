// data/content/LocalJsonContentRepository.ts
// Локальная реализация ContentRepository поверх content/*.json.
//
// ВАЖНО: content/branches.json и content/lessons.json — единственное место с
// текстами уроков; ничего из этого не должно дублироваться в UI/логике (§25 ТЗ).
// Сознательное отступление от дерева §25 (branches.json + один lessons.json
// вместо lessons/lesson_NNN.json на каждый урок) — при 19 уроках множество
// однотипных файлов не даёт выгоды, содержимое каждого урока и так изолировано
// одним объектом массива; при необходимости расщепить на отдельные файлы —
// не потребует менять ничего, кроме этого файла.

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
import { ContentRepository } from '@/domain/repositories/ContentRepository';
import achievementsJson from '../../../content/achievements.json';
import adventureEventsJson from '../../../content/adventure_events.json';
import arcadeSwipeCardsJson from '../../../content/arcade_swipe_cards.json';
import aiStubResponsesJson from '../../../content/ai_stub_responses.json';
import branchesJson from '../../../content/branches.json';
import documentsJson from '../../../content/documents.json';
import fiveLettersWordsJson from '../../../content/five_letters_words.json';
import glossaryJson from '../../../content/glossary.json';
import itemsJson from '../../../content/items.json';
import lessonsJson from '../../../content/lessons.json';
import screenHelpJson from '../../../content/screen_help.json';

const BRANCHES_CONTENT = branchesJson as BranchContent[];
const LESSONS_CONTENT = lessonsJson as unknown as AnyLessonContent[];
const ITEMS_CONTENT = itemsJson as ItemContent[];
const ACHIEVEMENTS_CONTENT = achievementsJson as AchievementDefinition[];
const AI_STUB_CONTENT = aiStubResponsesJson as AiStubContent;
const FIVE_LETTERS_WORDS_CONTENT = fiveLettersWordsJson as FiveLettersWordContent[];
const ADVENTURE_EVENTS_CONTENT = adventureEventsJson as AdventureEventTemplate[];
const GLOSSARY_CONTENT = glossaryJson as GlossaryTermContent[];
const SCREEN_HELP_CONTENT = screenHelpJson as ScreenHelpContent[];
const ARCADE_SWIPE_CARDS_CONTENT = arcadeSwipeCardsJson as ArcadeSwipeCardsContent[];
const DOCUMENTS_CONTENT = documentsJson as DocumentContent[];

export class LocalJsonContentRepository implements ContentRepository {
  async getBranches(): Promise<BranchContent[]> {
    return this.getBranchesSync();
  }

  async getLessons(): Promise<AnyLessonContent[]> {
    return this.getLessonsSync();
  }

  async getItems(): Promise<ItemContent[]> {
    return this.getItemsSync();
  }

  async getAchievements(): Promise<AchievementDefinition[]> {
    return this.getAchievementsSync();
  }

  async getAiStubContent(): Promise<AiStubContent> {
    return this.getAiStubContentSync();
  }

  async getFiveLettersWords(): Promise<FiveLettersWordContent[]> {
    return this.getFiveLettersWordsSync();
  }

  async getAdventureEvents(): Promise<AdventureEventTemplate[]> {
    return this.getAdventureEventsSync();
  }

  async getGlossary(): Promise<GlossaryTermContent[]> {
    return this.getGlossarySync();
  }

  async getScreenHelp(): Promise<ScreenHelpContent[]> {
    return this.getScreenHelpSync();
  }

  async getArcadeSwipeCards(): Promise<ArcadeSwipeCardsContent[]> {
    return this.getArcadeSwipeCardsSync();
  }

  async getDocuments(): Promise<DocumentContent[]> {
    return this.getDocumentsSync();
  }

  // Синхронные геттеры — контент локальный и уже забандлен, никакого ввода-вывода
  // нет; нужны, чтобы существующие экраны (lessons.tsx, аркада) могли и дальше
  // читать список уроков напрямую, без перевода на async-хуки ради самого
  // факта абстракции. Async-контракт интерфейса при этом настоящий: замена на
  // сетевой репозиторий не потребует менять эти методы, только их реализацию.
  getBranchesSync(): BranchContent[] {
    return BRANCHES_CONTENT;
  }

  getLessonsSync(): AnyLessonContent[] {
    return LESSONS_CONTENT;
  }

  getItemsSync(): ItemContent[] {
    return ITEMS_CONTENT;
  }

  getAchievementsSync(): AchievementDefinition[] {
    return ACHIEVEMENTS_CONTENT;
  }

  getAiStubContentSync(): AiStubContent {
    return AI_STUB_CONTENT;
  }

  getFiveLettersWordsSync(): FiveLettersWordContent[] {
    return FIVE_LETTERS_WORDS_CONTENT;
  }

  getAdventureEventsSync(): AdventureEventTemplate[] {
    return ADVENTURE_EVENTS_CONTENT;
  }

  getGlossarySync(): GlossaryTermContent[] {
    return GLOSSARY_CONTENT;
  }

  getScreenHelpSync(): ScreenHelpContent[] {
    return SCREEN_HELP_CONTENT;
  }

  getArcadeSwipeCardsSync(): ArcadeSwipeCardsContent[] {
    return ARCADE_SWIPE_CARDS_CONTENT;
  }

  getDocumentsSync(): DocumentContent[] {
    return DOCUMENTS_CONTENT;
  }
}
