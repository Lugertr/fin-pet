// lib/lessons/importLegacyLessonProgress.ts
// Однократный перенос учебного прогресса из AsyncStorage (zustand persist
// «finsputnik-lessons-store», до миграции v9) в SQLite: пройденные уроки и
// опыт игрока. Уже сохранённое в SQLite не перезаписывается. После переноса
// ключ удаляется — сброс профиля не вернёт старый прогресс.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { LessonProgressState, createLessonProgress } from '@/domain/lesson/lessonProgress';
import { convertLegacyTotalXp } from '@/domain/player/PlayerLevel';
import { LessonProgressRepository } from '@/domain/repositories/LessonProgressRepository';

export const LEGACY_LESSONS_STORE_KEY = 'finsputnik-lessons-store';

interface LegacyLessonProgress {
  lesson_id?: unknown;
  status?: unknown;
  completed_at?: unknown;
}

/**
 * Сохранённый zustand persist → состояния уроков и опыт. Начатый урок
 * переносится пустым (продолжится с начала), пройденный — завершённым, без
 * звезды (её можно получить, перепройдя идеально). Опыт там — по прежней
 * шкале уровней, он пересчитывается в новую с тем же уровнем
 * (convertLegacyTotalXp). Битые данные — пусто.
 */
export function convertLegacyLessonsStore(
  raw: string | null,
  nowIso: string
): { states: LessonProgressState[]; totalXp: number } {
  const empty = { states: [], totalXp: 0 };
  if (!raw) return empty;

  let snapshot: { progress?: Record<string, LegacyLessonProgress>; totalXp?: unknown };
  try {
    snapshot = JSON.parse(raw)?.state ?? {};
  } catch {
    return empty;
  }

  const states = Object.values(snapshot.progress ?? {}).flatMap((item) => {
    if (!item || typeof item.lesson_id !== 'number') return [];
    const state = createLessonProgress(item.lesson_id);
    if (item.status !== 'completed') return [state];
    const completedAt = typeof item.completed_at === 'string' ? item.completed_at : nowIso;
    return [{ ...state, completedAt }];
  });

  const xp = snapshot.totalXp;
  const totalXp = typeof xp === 'number' ? convertLegacyTotalXp(xp) : 0;
  return { states, totalXp };
}

export async function importLegacyLessonProgress(
  profileId: string,
  repository: LessonProgressRepository
): Promise<void> {
  const raw = await AsyncStorage.getItem(LEGACY_LESSONS_STORE_KEY);
  if (raw === null) return;

  const { states, totalXp } = convertLegacyLessonsStore(raw, new Date().toISOString());
  const existing = new Set(
    (await repository.getAllForProfile(profileId)).map((state) => state.lessonId)
  );
  for (const state of states) {
    if (!existing.has(state.lessonId)) await repository.save(profileId, state);
  }
  if (totalXp > (await repository.getTotalXp(profileId))) {
    await repository.saveTotalXp(profileId, totalXp);
  }
  await AsyncStorage.removeItem(LEGACY_LESSONS_STORE_KEY);
}
