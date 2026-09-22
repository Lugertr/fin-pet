// data/local/repositories/SqlitePetProgressRepository.ts

import type { SQLiteDatabase } from 'expo-sqlite';
import { PetProgressRecord } from '@/domain/pet/PetProgress';
import { PetProgressRepository } from '@/domain/repositories/PetProgressRepository';

interface PetProgressRow {
  id: number;
  profile_id: string;
  successful_periods_count: number;
  current_stage: number;
}

function rowToRecord(row: PetProgressRow): PetProgressRecord {
  return {
    id: row.id,
    profileId: row.profile_id,
    successfulPeriodsCount: row.successful_periods_count,
    currentStage: row.current_stage,
  };
}

export class SqlitePetProgressRepository implements PetProgressRepository {
  constructor(private readonly getDb: () => Promise<SQLiteDatabase>) {}

  async getByProfileId(profileId: string): Promise<PetProgressRecord | null> {
    const db = await this.getDb();
    const row = await db.getFirstAsync<PetProgressRow>(
      'SELECT * FROM pet_progress WHERE profile_id = ? LIMIT 1',
      [profileId]
    );
    return row ? rowToRecord(row) : null;
  }

  async create(profileId: string): Promise<PetProgressRecord> {
    const db = await this.getDb();
    const result = await db.runAsync(
      'INSERT INTO pet_progress (profile_id, successful_periods_count, current_stage) VALUES (?, 0, 1)',
      [profileId]
    );
    return { id: result.lastInsertRowId, profileId, successfulPeriodsCount: 0, currentStage: 1 };
  }

  async update(id: number, successfulPeriodsCount: number, currentStage: number): Promise<void> {
    const db = await this.getDb();
    await db.runAsync(
      'UPDATE pet_progress SET successful_periods_count = ?, current_stage = ? WHERE id = ?',
      [successfulPeriodsCount, currentStage, id]
    );
  }
}
