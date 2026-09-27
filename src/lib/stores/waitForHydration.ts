// lib/stores/waitForHydration.ts
// zustand persist восстанавливает сторы из AsyncStorage асинхронно, а экраны
// не ждут этого явно. Для действий на холодном старте, которые пишут в такой
// стор (например, автозавершение приключения начисляет опыт в useLessonsStore),
// запись до окончания гидратации была бы затёрта восстановленным состоянием —
// прогресс потерялся бы. Этот хелпер дожидается гидратации.

interface PersistApi {
  persist: {
    hasHydrated: () => boolean;
    onFinishHydration: (fn: () => void) => () => void;
  };
}

/**
 * Если гидратация упала с ошибкой, zustand не вызывает onFinishHydration —
 * ждём не дольше этого, чтобы не зависнуть навсегда (восстанавливать всё равно
 * будет нечего).
 */
const HYDRATION_TIMEOUT_MS = 3_000;

export function waitForHydration(store: PersistApi): Promise<void> {
  if (store.persist.hasHydrated()) return Promise.resolve();
  return new Promise((resolve) => {
    const unsubscribe = store.persist.onFinishHydration(() => {
      clearTimeout(timeout);
      unsubscribe();
      resolve();
    });
    const timeout = setTimeout(() => {
      unsubscribe();
      resolve();
    }, HYDRATION_TIMEOUT_MS);
  });
}
