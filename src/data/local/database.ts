// data/local/database.ts
// Единственная точка открытия локальной SQLite БД — источник истины офлайн-профиля.

import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
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
  /** Автоперезагрузка вкладки ради БД уже была на этой странице (см. openOrReload). */
  __finniDbReloadUsed__?: boolean;
}
const globalCache = globalThis as GlobalWithDbCache;

/** Метка в window.name — переживает перезагрузку вкладки (в отличие от
 * переменных) и не является хранилищем (localStorage/sessionStorage в проекте
 * не используются). Ставится перед автоперезагрузкой, снимается сразу после. */
const DB_RELOAD_MARK = 'finni-db-reload';

if (Platform.OS === 'web' && typeof window !== 'undefined' && window.name === DB_RELOAD_MARK) {
  window.name = '';
  globalCache.__finniDbReloadUsed__ = true;
}

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

/** true — та самая OPFS-коллизия хендла (см. комментарий выше): файлы БД
 * держит другой воркер — соседняя вкладка приложения или воркер предыдущей
 * страницы, ещё не завершившийся после перезагрузки. */
function isStaleOpfsHandleError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes('createSyncAccessHandle') || message.includes('Access Handles cannot');
}

/** Следствие ошибки выше, баг expo-sqlite 57 (web/worker.ts, maybeInitAsync):
 * воркер запоминает wa-sqlite ДО создания OPFS-VFS, и если создание упало
 * (хендл занят), каждый следующий вызов в этом воркере сразу бросает
 * «Invalid VFS state», а уже открытые хендлы так и висят. Воркер у
 * expo-sqlite один на страницу и пересоздать его нельзя — повторы в этой же
 * вкладке бесполезны, лечит только перезагрузка (новый воркер). */
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
    return 'Локальная база данных открыта в другой вкладке. Закройте другие вкладки приложения и перезагрузите страницу.';
  }
  return null;
}

/**
 * Открывает БД. На вебе при занятом OPFS-хендле воркер expo-sqlite ломается
 * до конца страницы (см. isInvalidVfsStateError), поэтому вместо повторов —
 * одна автоперезагрузка вкладки: к её концу воркер прошлой страницы уже
 * завершён, а новый воркер чистый. Это происходит при старте (первым БД
 * открывает useAppBootstrap), ребёнок ещё ничего не ввёл. Не помогло — значит,
 * базу держит другая открытая вкладка: второй раз не перезагружаем (иначе
 * цикл и потеря введённого в онбординге), ошибка уходит наверх, а
 * describeDatabaseError даёт понятный текст.
 */
async function openOrReload(): Promise<SQLite.SQLiteDatabase> {
  try {
    return await openAndMigrate();
  } catch (error) {
    const canReload =
      Platform.OS === 'web' &&
      typeof window !== 'undefined' &&
      isRecoverableOpenError(error) &&
      !globalCache.__finniDbReloadUsed__;
    if (!canReload) throw error;

    globalCache.__finniDbReloadUsed__ = true;
    console.warn('[Database] Файлы БД заняты другим воркером — перезагружаю вкладку', error);
    window.name = DB_RELOAD_MARK;
    window.location.reload();
    // Страница уходит на перезагрузку — промис намеренно не завершается.
    return new Promise<SQLite.SQLiteDatabase>(() => {});
  }
}

export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!globalCache.__finniDbPromise__) {
    globalCache.__finniDbPromise__ = openOrReload().catch((error) => {
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
