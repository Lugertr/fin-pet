// domain/repositories/ProfileRepository.ts
// Интерфейс спрятан от конкретного хранилища: сейчас SQLite (data/local),
// при появлении синхронизации/бэкенда меняется только реализация.

import { LocalProfile } from '@/domain/profile/Profile';

export interface ProfileRepository {
  getCurrent(): Promise<LocalProfile | null>;
  create(profile: LocalProfile): Promise<void>;
  update(profile: LocalProfile): Promise<void>;
  updateBalance(profileId: string, liquidBalance: number): Promise<void>;
  /** Полный сброс — используется разделом для взрослого (§17.2). */
  reset(): Promise<void>;
}
