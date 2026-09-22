// data/local/repositories/SqlitePetRepository.ts

import type { SQLiteDatabase } from 'expo-sqlite';
import { PetRecord, PetRepository } from '@/domain/repositories/PetRepository';

interface PetRow {
  id: number;
  profile_id: string;
  mood: number;
  last_mood_updated_at: string;
  base_recovery_rate: number;
}

function rowToPet(row: PetRow): PetRecord {
  return {
    id: row.id,
    profileId: row.profile_id,
    mood: row.mood,
    lastMoodUpdatedAt: row.last_mood_updated_at,
    baseRecoveryRate: row.base_recovery_rate,
  };
}

export class SqlitePetRepository implements PetRepository {
  constructor(private readonly getDb: () => Promise<SQLiteDatabase>) {}

  async getByProfileId(profileId: string): Promise<PetRecord | null> {
    const db = await this.getDb();
    const row = await db.getFirstAsync<PetRow>('SELECT * FROM pets WHERE profile_id = ? LIMIT 1', [
      profileId,
    ]);
    return row ? rowToPet(row) : null;
  }

  async create(pet: Omit<PetRecord, 'id'>): Promise<PetRecord> {
    const db = await this.getDb();
    const result = await db.runAsync(
      'INSERT INTO pets (profile_id, mood, last_mood_updated_at, base_recovery_rate) VALUES (?, ?, ?, ?)',
      [pet.profileId, pet.mood, pet.lastMoodUpdatedAt, pet.baseRecoveryRate]
    );
    return { id: result.lastInsertRowId, ...pet };
  }

  async updateMood(petId: number, mood: number, lastMoodUpdatedAt: string): Promise<void> {
    const db = await this.getDb();
    await db.runAsync('UPDATE pets SET mood = ?, last_mood_updated_at = ? WHERE id = ?', [
      mood,
      lastMoodUpdatedAt,
      petId,
    ]);
  }
}
