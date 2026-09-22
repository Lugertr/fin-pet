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
import { AiStubContent } from '@/domain/ai/AiAssistant';
import {
  BranchContent,
  FiveLettersWordContent,
  GiftPathNodeContent,
  LessonContent,
} from '@/domain/content/LessonContent';
import { ItemContent } from '@/domain/content/ItemContent';
import { ContentRepository } from '@/domain/repositories/ContentRepository';
import achievementsJson from '../../../content/achievements.json';
import aiStubResponsesJson from '../../../content/ai_stub_responses.json';
import branchesJson from '../../../content/branches.json';
import fiveLettersWordsJson from '../../../content/five_letters_words.json';
import giftPathNodesJson from '../../../content/giftPathNodes.json';
import itemsJson from '../../../content/items.json';
import lessonsJson from '../../../content/lessons.json';

const BRANCHES_CONTENT = branchesJson as BranchContent[];
const LESSONS_CONTENT = lessonsJson as LessonContent[];
const ITEMS_CONTENT = itemsJson as ItemContent[];
const ACHIEVEMENTS_CONTENT = achievementsJson as AchievementDefinition[];
const AI_STUB_CONTENT = aiStubResponsesJson as AiStubContent;
const GIFT_PATH_NODES_CONTENT = giftPathNodesJson as GiftPathNodeContent[];
const FIVE_LETTERS_WORDS_CONTENT = fiveLettersWordsJson as FiveLettersWordContent[];

export class LocalJsonContentRepository implements ContentRepository {
  async getBranches(): Promise<BranchContent[]> {
    return this.getBranchesSync();
  }

  async getLessons(): Promise<LessonContent[]> {
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

  async getGiftPathNodes(): Promise<GiftPathNodeContent[]> {
    return this.getGiftPathNodesSync();
  }

  async getFiveLettersWords(): Promise<FiveLettersWordContent[]> {
    return this.getFiveLettersWordsSync();
  }

  // Синхронные геттеры — контент локальный и уже забандлен, никакого ввода-вывода
  // нет; нужны, чтобы существующие экраны (lessons.tsx, аркада) могли и дальше
  // читать список уроков напрямую, без перевода на async-хуки ради самого
  // факта абстракции. Async-контракт интерфейса при этом настоящий: замена на
  // сетевой репозиторий не потребует менять эти методы, только их реализацию.
  getBranchesSync(): BranchContent[] {
    return BRANCHES_CONTENT;
  }

  getLessonsSync(): LessonContent[] {
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

  getGiftPathNodesSync(): GiftPathNodeContent[] {
    return GIFT_PATH_NODES_CONTENT;
  }

  getFiveLettersWordsSync(): FiveLettersWordContent[] {
    return FIVE_LETTERS_WORDS_CONTENT;
  }
}
