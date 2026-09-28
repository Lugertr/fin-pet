// data/local/repositories/SqliteLessonProgressRepository.ts

import type { SQLiteDatabase } from 'expo-sqlite';
import { LessonProgressState } from '@/domain/lesson/lessonProgress';
import { LessonProgressRepository } from '@/domain/repositories/LessonProgressRepository';

interface LessonProgressRow {
  lesson_id: number;
  read_nodes: string;
  results: string;
  event_picks: string;
  completed_at: string | null;
  perfect_at: string | null;
}

/** Битый JSON (не должен случаться) не роняет загрузку — урок просто начнётся с начала. */
function parseJson<T>(text: string, fallback: T): T {
  try {
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
}

function rowToState(row: LessonProgressRow): LessonProgressState {
  return {
    lessonId: row.lesson_id,
    readNodes: parseJson(row.read_nodes, []),
    results: parseJson(row.results, {}),
    eventPicks: parseJson(row.event_picks, {}),
    completedAt: row.completed_at,
    perfectAt: row.perfect_at,
  };
}

export class SqliteLessonProgressRepository implements LessonProgressRepository {
  constructor(private readonly getDb: () => Promise<SQLiteDatabase>) {}

  async getAllForProfile(profileId: string): Promise<LessonProgressState[]> {
    const db = await this.getDb();
    const rows = await db.getAllAsync<LessonProgressRow>(
      'SELECT * FROM lesson_progress WHERE profile_id = ?',
      [profileId]
    );
    return rows.map(rowToState);
  }

  async save(profileId: string, state: LessonProgressState): Promise<void> {
    const db = await this.getDb();
    await db.runAsync(
      `INSERT INTO lesson_progress
        (profile_id, lesson_id, read_nodes, results, event_picks, completed_at, perfect_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT (profile_id, lesson_id) DO UPDATE SET
        read_nodes = excluded.read_nodes,
        results = excluded.results,
        event_picks = excluded.event_picks,
        completed_at = excluded.completed_at,
        perfect_at = excluded.perfect_at,
        updated_at = excluded.updated_at`,
      [
        profileId,
        state.lessonId,
        JSON.stringify(state.readNodes),
        JSON.stringify(state.results),
        JSON.stringify(state.eventPicks),
        state.completedAt,
        state.perfectAt,
        new Date().toISOString(),
      ]
    );
  }

  async deleteAllForProfile(profileId: string): Promise<void> {
    const db = await this.getDb();
    await db.runAsync('DELETE FROM lesson_progress WHERE profile_id = ?', [profileId]);
  }

  async getTotalXp(profileId: string): Promise<number> {
    const db = await this.getDb();
    const row = await db.getFirstAsync<{ total_xp: number }>(
      'SELECT total_xp FROM profiles WHERE id = ?',
      [profileId]
    );
    return row?.total_xp ?? 0;
  }

  async saveTotalXp(profileId: string, totalXp: number): Promise<void> {
    const db = await this.getDb();
    await db.runAsync('UPDATE profiles SET total_xp = ? WHERE id = ?', [totalXp, profileId]);
  }
}
