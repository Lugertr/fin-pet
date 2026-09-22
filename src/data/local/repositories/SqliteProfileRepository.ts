// data/local/repositories/SqliteProfileRepository.ts

import type { SQLiteDatabase } from 'expo-sqlite';
import { LocalProfile } from '@/domain/profile/Profile';
import { ProfileRepository } from '@/domain/repositories/ProfileRepository';
import { PetType } from '@/constants/petAssets';

interface ProfileRow {
  id: string;
  username: string | null;
  pet_name: string;
  pet_type: string;
  body_variant: number;
  color_variant: number;
  accessory: string | null;
  liquid_balance: number;
  is_demo: number;
  created_at: string;
}

function rowToProfile(row: ProfileRow): LocalProfile {
  return {
    id: row.id,
    username: row.username,
    petName: row.pet_name,
    petType: row.pet_type as PetType,
    appearance: {
      bodyVariant: row.body_variant,
      colorVariant: row.color_variant,
      accessory: row.accessory,
    },
    liquidBalance: row.liquid_balance,
    isDemo: row.is_demo === 1,
    createdAt: row.created_at,
  };
}

export class SqliteProfileRepository implements ProfileRepository {
  constructor(private readonly getDb: () => Promise<SQLiteDatabase>) {}

  async getCurrent(): Promise<LocalProfile | null> {
    const db = await this.getDb();
    const row = await db.getFirstAsync<ProfileRow>(
      'SELECT * FROM profiles ORDER BY created_at ASC LIMIT 1'
    );
    return row ? rowToProfile(row) : null;
  }

  async create(profile: LocalProfile): Promise<void> {
    const db = await this.getDb();
    await db.runAsync(
      `INSERT INTO profiles
        (id, username, pet_name, pet_type, body_variant, color_variant, accessory, liquid_balance, is_demo, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        profile.id,
        profile.username,
        profile.petName,
        profile.petType,
        profile.appearance.bodyVariant,
        profile.appearance.colorVariant,
        profile.appearance.accessory,
        profile.liquidBalance,
        profile.isDemo ? 1 : 0,
        profile.createdAt,
      ]
    );
  }

  async update(profile: LocalProfile): Promise<void> {
    const db = await this.getDb();
    await db.runAsync(
      `UPDATE profiles SET
        username = ?, pet_name = ?, pet_type = ?, body_variant = ?, color_variant = ?,
        accessory = ?, liquid_balance = ?, is_demo = ?
       WHERE id = ?`,
      [
        profile.username,
        profile.petName,
        profile.petType,
        profile.appearance.bodyVariant,
        profile.appearance.colorVariant,
        profile.appearance.accessory,
        profile.liquidBalance,
        profile.isDemo ? 1 : 0,
        profile.id,
      ]
    );
  }

  async updateBalance(profileId: string, liquidBalance: number): Promise<void> {
    const db = await this.getDb();
    await db.runAsync('UPDATE profiles SET liquid_balance = ? WHERE id = ?', [
      liquidBalance,
      profileId,
    ]);
  }

  async reset(): Promise<void> {
    const db = await this.getDb();
    // Таблицы periods/pet_progress/savings/savings_transactions появились после
    // того, как этот метод был написан (Этап 0) — каскад не был обновлён вместе
    // с ними; полное удаление профиля (§17.2) требует чистки всех таблиц.
    await db.execAsync(
      `DELETE FROM savings_transactions;
       DELETE FROM savings;
       DELETE FROM pet_progress;
       DELETE FROM periods;
       DELETE FROM transactions;
       DELETE FROM pets;
       DELETE FROM profiles;`
    );
  }
}
