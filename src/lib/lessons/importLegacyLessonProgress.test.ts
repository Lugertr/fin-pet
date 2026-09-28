// lib/lessons/importLegacyLessonProgress.test.ts
// Однократный перенос учебного прогресса из AsyncStorage в SQLite (миграция v9):
// пройденные уроки и опыт не теряются, уже сохранённое в SQLite не затирается.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { LessonProgressState, createLessonProgress } from '@/domain/lesson/lessonProgress';
import { LessonProgressRepository } from '@/domain/repositories/LessonProgressRepository';
import {
  LEGACY_LESSONS_STORE_KEY,
  convertLegacyLessonsStore,
  importLegacyLessonProgress,
} from './importLegacyLessonProgress';

const NOW = '2026-09-28T12:00:00.000Z';

function legacyJson(progress: Record<string, unknown>, totalXp: unknown = 0): string {
  return JSON.stringify({ state: { progress, completedBranches: [], totalXp }, version: 0 });
}

function memoryRepository(initial: LessonProgressState[] = [], xp = 0) {
  const rows = new Map(initial.map((state) => [state.lessonId, state]));
  let totalXp = xp;
  const repository: LessonProgressRepository = {
    getAllForProfile: async () => [...rows.values()],
    save: async (_profileId, state) => {
      rows.set(state.lessonId, state);
    },
    deleteAllForProfile: async () => rows.clear(),
    getTotalXp: async () => totalXp,
    saveTotalXp: async (_profileId, value) => {
      totalXp = value;
    },
  };
  return { repository, rows, getXp: () => totalXp };
}

describe('convertLegacyLessonsStore', () => {
  it('пройденный урок — завершён (с датой), начатый — пустой, опыт переносится', () => {
    const { states, totalXp } = convertLegacyLessonsStore(
      legacyJson(
        {
          1: {
            lesson_id: 1,
            status: 'completed',
            score: 0,
            completed_at: '2026-09-20T10:00:00.000Z',
          },
          2: { lesson_id: 2, status: 'in_progress', score: 0, completed_at: null },
        },
        400
      ),
      NOW
    );
    expect(states).toEqual([
      { ...createLessonProgress(1), completedAt: '2026-09-20T10:00:00.000Z' },
      createLessonProgress(2),
    ]);
    expect(totalXp).toBe(400);
  });

  it('пройденный без даты — дата переноса', () => {
    const { states } = convertLegacyLessonsStore(
      legacyJson({ 3: { lesson_id: 3, status: 'completed', completed_at: null } }),
      NOW
    );
    expect(states[0].completedAt).toBe(NOW);
  });

  it('пусто или битые данные — ничего не переносится', () => {
    expect(convertLegacyLessonsStore(null, NOW)).toEqual({ states: [], totalXp: 0 });
    expect(convertLegacyLessonsStore('{не json', NOW)).toEqual({ states: [], totalXp: 0 });
    expect(convertLegacyLessonsStore(legacyJson({ x: { status: 'completed' } }, -5), NOW)).toEqual({
      states: [],
      totalXp: 0,
    });
  });
});

describe('importLegacyLessonProgress', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('переносит уроки и опыт в репозиторий и удаляет старый ключ', async () => {
    await AsyncStorage.setItem(
      LEGACY_LESSONS_STORE_KEY,
      legacyJson({ 1: { lesson_id: 1, status: 'completed', completed_at: NOW } }, 250)
    );
    const memory = memoryRepository();

    await importLegacyLessonProgress('profile', memory.repository);

    expect(memory.rows.get(1)?.completedAt).toBe(NOW);
    expect(memory.getXp()).toBe(250);
    expect(await AsyncStorage.getItem(LEGACY_LESSONS_STORE_KEY)).toBeNull();
  });

  it('уже сохранённое в SQLite не затирает: урок и больший опыт остаются', async () => {
    await AsyncStorage.setItem(
      LEGACY_LESSONS_STORE_KEY,
      legacyJson({ 1: { lesson_id: 1, status: 'completed', completed_at: NOW } }, 100)
    );
    const saved = { ...createLessonProgress(1), readNodes: [0] };
    const memory = memoryRepository([saved], 300);

    await importLegacyLessonProgress('profile', memory.repository);

    expect(memory.rows.get(1)).toEqual(saved);
    expect(memory.getXp()).toBe(300);
  });

  it('без старого ключа ничего не делает', async () => {
    const memory = memoryRepository();
    await importLegacyLessonProgress('profile', memory.repository);
    expect(memory.rows.size).toBe(0);
  });
});
