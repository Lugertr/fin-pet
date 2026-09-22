// data/local/database.ts
// Единственная точка открытия локальной SQLite БД — источник истины офлайн-профиля.

import * as SQLite from 'expo-sqlite';
import { MIGRATIONS } from './migrations';

const DB_NAME = 'finni.db';

// На вебе expo-sqlite открывает файл через воркер + эксклюзивный OPFS-хендл
// (createSyncAccessHandle — только одна открытая ручка на файл во всей
// вкладке). Fast Refresh в Metro при dev-правках переисполняет этот модуль,
// обнуляя обычную module-level переменную — старый воркер при этом не
// закрывается и продолжает держать хендл, а новый getDatabase() пытается
// открыть тот же файл второй раз и падает с
// NoModificationAllowedError/createSyncAccessHandle. globalThis переживает
// переисполнение модуля Fast Refresh'ем, поэтому кладём промис туда — в
// проде модуль и так исполняется один раз, это чисто dev-фикс.
interface GlobalWithDbCache {
  __finniDbPromise__?: Promise<SQLite.SQLiteDatabase>;
}
const globalCache = globalThis as GlobalWithDbCache;

async function runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let currentVersion = row?.user_version ?? 0;

  const pending = MIGRATIONS.filter((m) => m.version > currentVersion).sort(
    (a, b) => a.version - b.version
  );

  for (const migration of pending) {
    await db.execAsync(migration.sql);
    await db.execAsync(`PRAGMA user_version = ${migration.version}`);
    currentVersion = migration.version;
  }
}

async function openAndMigrate(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync(DB_NAME);
  await db.execAsync('PRAGMA journal_mode = WAL;');
  await db.execAsync('PRAGMA foreign_keys = ON;');
  await runMigrations(db);
  return db;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** true — та самая OPFS-коллизия хендла (см. комментарий выше): почти всегда
 * временная, старый хендл на вебе иногда освобождается с небольшой задержкой
 * после того, как предыдущая вкладка/воркер реально завершились. */
function isStaleOpfsHandleError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes('createSyncAccessHandle') || message.includes('Access Handles cannot');
}

/** wa-sqlite (веб-бэкенд expo-sqlite поверх OPFS) бросает эту ошибку, когда
 * состояние VFS в этой вкладке уже несогласовано — обычно после того, как
 * предыдущий воркер этой же вкладки оборвался посреди операции (например,
 * dev-сервер перезапустили, пока страница была открыта). В отличие от
 * isStaleOpfsHandleError выше, это НЕ гарантированно временно: иногда пара
 * попыток с паузой всё же помогает (гонка с ещё не до конца завершившимся
 * terminate() старого воркера), но если нет — само не пройдёт, нужна ПОЛНАЯ
 * перезагрузка вкладки (закрыть все вкладки приложения, не просто F5), а
 * если и это не помогло — сброс OPFS-хранилища сайта в браузере. */
function isInvalidVfsStateError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes('Invalid VFS state');
}

function isRecoverableOpenError(error: unknown): boolean {
  return isStaleOpfsHandleError(error) || isInvalidVfsStateError(error);
}

/** Человеко-понятное сообщение для известных веб-специфичных сбоев открытия
 * БД — то, что реально показать игроку/родителю вместо сырого текста ошибки
 * VFS. null — ошибка не из этой категории, вызывающий код показывает свой
 * обычный (не БД-специфичный) текст. */
export function describeDatabaseError(error: unknown): string | null {
  if (isInvalidVfsStateError(error)) {
    return 'Не удалось открыть локальную базу данных в этой вкладке. Закройте ВСЕ вкладки приложения и откройте заново. Если не помогло — очистите данные сайта в браузере (Настройки сайта → Очистить данные) и зайдите снова.';
  }
  if (isStaleOpfsHandleError(error)) {
    return 'Локальная база данных ещё занята предыдущей вкладкой. Подождите пару секунд и перезагрузите страницу.';
  }
  return null;
}

/** Несколько попыток с паузой — самолечится, если старый хендл/воркер ещё не
 * успел освободиться. Не помогает, если хендл держит ДРУГАЯ реально открытая
 * вкладка того же сайта, или если состояние VFS повреждено по-настоящему —
 * тогда после исчерпания попыток наверх летит ошибка, а describeDatabaseError
 * выше даёт вызывающему коду понятный текст для пользователя. */
async function openWithRetry(attempts = 4, delayMs = 400): Promise<SQLite.SQLiteDatabase> {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await openAndMigrate();
    } catch (error) {
      const isLastAttempt = attempt === attempts;
      if (!isRecoverableOpenError(error) || isLastAttempt) {
        throw error;
      }
      console.warn(
        `[Database] ${describeDatabaseError(error)} Повтор ${attempt}/${attempts - 1}...`
      );
      await sleep(delayMs * attempt);
    }
  }
  // Недостижимо (цикл либо возвращает, либо бросает выше), но нужно для типов.
  throw new Error('[Database] Не удалось открыть БД');
}

export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!globalCache.__finniDbPromise__) {
    globalCache.__finniDbPromise__ = openWithRetry().catch((error) => {
      // Не кэшируем отклонённый промис — иначе любой следующий вызов
      // getDatabase() в этой же вкладке будет молча получать ту же ошибку
      // навсегда, даже если проблема на самом деле уже исчезла.
      globalCache.__finniDbPromise__ = undefined;
      throw error;
    });
  }
  return globalCache.__finniDbPromise__;
}

/** Только для раздела «для взрослого» / демо-режима — пересоздаёт БД с нуля. */
export async function resetDatabase(): Promise<void> {
  const db = await getDatabase();
  await db.execAsync(`
    DELETE FROM transactions;
    DELETE FROM pets;
    DELETE FROM profiles;
  `);
}
