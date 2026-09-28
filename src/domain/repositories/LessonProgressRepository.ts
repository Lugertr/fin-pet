// domain/repositories/LessonProgressRepository.ts
// Учебный прогресс профиля: состояние каждого урока (domain/lesson/lessonProgress.ts)
// и опыт игрока. Сейчас SQLite (data/local), интерфейс от хранилища не зависит.

import { LessonProgressState } from '@/domain/lesson/lessonProgress';

export interface LessonProgressRepository {
  getAllForProfile(profileId: string): Promise<LessonProgressState[]>;
  /** Вставляет или обновляет состояние урока целиком. */
  save(profileId: string, state: LessonProgressState): Promise<void>;
  deleteAllForProfile(profileId: string): Promise<void>;
  getTotalXp(profileId: string): Promise<number>;
  saveTotalXp(profileId: string, totalXp: number): Promise<void>;
}
