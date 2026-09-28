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
  {
    version: 5,
    sql: `
      CREATE TABLE IF NOT EXISTS adventures (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        profile_id TEXT NOT NULL REFERENCES profiles(id),
        adventure_number INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'planning',
        branch_id INTEGER,
        projected_income INTEGER NOT NULL DEFAULT 0,
        plan_mandatory INTEGER NOT NULL DEFAULT 0,
        plan_optional INTEGER NOT NULL DEFAULT 0,
        plan_savings INTEGER NOT NULL DEFAULT 0,
        fact_mandatory INTEGER NOT NULL DEFAULT 0,
        fact_optional INTEGER NOT NULL DEFAULT 0,
        fact_savings INTEGER NOT NULL DEFAULT 0,
        started_at TEXT,
        planned_end_at TEXT,
        completed_at TEXT,
        time_adjustment_ms INTEGER NOT NULL DEFAULT 0,
        quests_completed INTEGER NOT NULL DEFAULT 0,
        xp_awarded INTEGER,
        created_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_adventures_profile_id ON adventures(profile_id, adventure_number);
    `,
  },
  {
    version: 6,
    sql: `
      ALTER TABLE adventures ADD COLUMN pending_event_template_id TEXT;
      ALTER TABLE adventures ADD COLUMN pending_event_rolled_at TEXT;
      ALTER TABLE adventures ADD COLUMN next_event_check_at TEXT;

      CREATE TABLE IF NOT EXISTS adventure_event_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        adventure_id INTEGER NOT NULL REFERENCES adventures(id),
        template_id TEXT NOT NULL,
        option_id TEXT NOT NULL,
        category TEXT,
        coin_amount INTEGER NOT NULL DEFAULT 0,
        time_delta_ms INTEGER NOT NULL DEFAULT 0,
        resolved_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_adventure_event_log_adventure_id ON adventure_event_log(adventure_id);
    `,
  },
  {
    version: 7,
    // Финальная зачистка «переосмысления в Приключение» (см. память проекта):
    // periods (§7, GamePeriod) и pet_progress (§8, стадии роста) полностью
    // заменены таблицей adventures и системой уровней (PlayerLevel.ts) —
    // обе таблицы никогда не читаются и не пишутся кодом после Этапа 20.
    sql: `
      DROP TABLE IF EXISTS periods;
      DROP TABLE IF EXISTS pet_progress;
    `,
  },
  {
    version: 8,
    // Два денежных контура (решение пользователя 27.09.2026): у приключения
    // свой бюджет (adventures.budget — доход приключения и расходы событий,
    // остаток в конце уходит в хаб), а банк хаба помнит снятое и не
    // возвращённое (savings.withdrawal_credit) — бонус только за новые деньги.
    // Уже идущим приключениям бюджет 0: их доход уже был зачислен в кошелёк хаба.
    sql: `
      ALTER TABLE savings ADD COLUMN withdrawal_credit INTEGER NOT NULL DEFAULT 0;
      ALTER TABLE adventures ADD COLUMN budget INTEGER NOT NULL DEFAULT 0;
    `,
  },
  {
    version: 9,
    // Учебный прогресс в SQLite (решение пользователя 28.09.2026; раньше —
    // AsyncStorage, на вебе это localStorage). Урок из узлов продолжается с
    // того же места в следующую смену: lesson_progress хранит состояние
    // domain/lesson/lessonProgress.ts — прочитанные узлы, результаты действий
    // и выпавшие события (JSON), первое завершение и первую звезду. Опыт
    // игрока — profiles.total_xp. Старый прогресс переносится один раз
    // (lib/lessons/importLegacyLessonProgress.ts).
    sql: `
      CREATE TABLE IF NOT EXISTS lesson_progress (
        profile_id TEXT NOT NULL REFERENCES profiles(id),
        lesson_id INTEGER NOT NULL,
        read_nodes TEXT NOT NULL DEFAULT '[]',
        results TEXT NOT NULL DEFAULT '{}',
        event_picks TEXT NOT NULL DEFAULT '{}',
        completed_at TEXT,
        perfect_at TEXT,
        updated_at TEXT NOT NULL,
        PRIMARY KEY (profile_id, lesson_id)
      );
      ALTER TABLE profiles ADD COLUMN total_xp INTEGER NOT NULL DEFAULT 0;
    `,
  },
  {
    version: 10,
    // Смена = один урок (решение пользователя 28.09.2026): урок смены
    // фиксируется при старте. Таймер 24 часа без ускорений, событий по
    // времени больше нет — колонки time_adjustment_ms, quests_completed,
    // pending_event_*, next_event_check_at остаются, но не используются.
    sql: `
      ALTER TABLE adventures ADD COLUMN lesson_id INTEGER;
    `,
  },
];
