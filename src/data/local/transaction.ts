// data/local/transaction.ts
// Несколько записей в SQLite одной транзакцией: либо все, либо ни одной.
// Нужно там, где деньги двигаются между таблицами сразу (завершение смены:
// смена, банк и кошелёк) — иначе сбой посередине терял бы монеты или
// начислял их дважды (§4.5 «прогресс не теряется»). Репозитории пишут через
// то же соединение (getDatabase), поэтому их вызовы внутри work попадают в
// транзакцию.

import { getDatabase } from './database';

export async function runInTransaction(work: () => Promise<void>): Promise<void> {
  const db = await getDatabase();
  await db.withTransactionAsync(work);
}
