// data/local/migrations/index.ts
// Версионируемые миграции схемы (CLAUDE.md: "миграции БД будут меняться между
// спринтами"). Каждый этап добавляет новую запись сюда, старые не редактируются.

export interface Migration {
  version: number;
  sql: string;
}

export const MIGRATIONS: Migration[] = [
  {
    version: 1,
    sql: `
      CREATE TABLE IF NOT EXISTS profiles (
        id TEXT PRIMARY KEY NOT NULL,
        username TEXT,
        pet_name TEXT NOT NULL,
        pet_type TEXT NOT NULL,
        body_variant INTEGER NOT NULL DEFAULT 0,
        color_variant INTEGER NOT NULL DEFAULT 0,
        accessory TEXT,
        liquid_balance INTEGER NOT NULL DEFAULT 0,
        is_demo INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS pets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        profile_id TEXT NOT NULL REFERENCES profiles(id),
        mood INTEGER NOT NULL DEFAULT 100,
        last_mood_updated_at TEXT NOT NULL,
        base_recovery_rate REAL NOT NULL DEFAULT 12.5
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        profile_id TEXT NOT NULL REFERENCES profiles(id),
        amount INTEGER NOT NULL,
        transaction_type TEXT NOT NULL,
        description TEXT,
        created_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_pets_profile_id ON pets(profile_id);
      CREATE INDEX IF NOT EXISTS idx_transactions_profile_id ON transactions(profile_id, created_at);
    `,
  },
  {
    version: 2,
    sql: `
      CREATE TABLE IF NOT EXISTS periods (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        profile_id TEXT NOT NULL REFERENCES profiles(id),
        period_number INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'planning',
        income_awarded INTEGER NOT NULL DEFAULT 0,
        plan_mandatory INTEGER NOT NULL DEFAULT 0,
        plan_optional INTEGER NOT NULL DEFAULT 0,
        plan_savings INTEGER NOT NULL DEFAULT 0,
        fact_mandatory INTEGER NOT NULL DEFAULT 0,
        fact_optional INTEGER NOT NULL DEFAULT 0,
        fact_savings INTEGER NOT NULL DEFAULT 0,
        started_at TEXT NOT NULL,
        ended_at TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_periods_profile_id ON periods(profile_id, period_number);
    `,
  },
  {
    version: 3,
    sql: `
      CREATE TABLE IF NOT EXISTS pet_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        profile_id TEXT NOT NULL REFERENCES profiles(id),
        successful_periods_count INTEGER NOT NULL DEFAULT 0,
        current_stage INTEGER NOT NULL DEFAULT 1
      );

      CREATE INDEX IF NOT EXISTS idx_pet_progress_profile_id ON pet_progress(profile_id);
    `,
  },
  {
    version: 4,
    sql: `
      CREATE TABLE IF NOT EXISTS savings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        profile_id TEXT NOT NULL REFERENCES profiles(id),
        current_amount INTEGER NOT NULL DEFAULT 0,
        bonus_rate REAL NOT NULL DEFAULT 1,
        target_item_id INTEGER,
        periods_since_withdrawal INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS savings_transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        savings_id INTEGER NOT NULL REFERENCES savings(id),
        operation_type TEXT NOT NULL,
        amount INTEGER NOT NULL,
        balance_after INTEGER NOT NULL,
        period_id INTEGER,
        created_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_savings_profile_id ON savings(profile_id);
      CREATE INDEX IF NOT EXISTS idx_savings_transactions_savings_id ON savings_transactions(savings_id, created_at);
    `,
  },
];
