// jest.setup.js
// Моки нативных модулей, которых нет в Node/Jest-окружении. Тесты бьют по
// доменной логике и сторам; там, где стор пытается синхронизировать
// SQLite/AsyncStorage в фоне (fire-and-forget с .catch), эти моки не дают
// упасть исключению — реальная персистентность в тестах не нужна и не
// проверяется (это отдельный, ручной/e2e слой, не юнит-тесты).

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(async () => ({
    execAsync: jest.fn(async () => {}),
    getFirstAsync: jest.fn(async () => null),
    getAllAsync: jest.fn(async () => []),
    runAsync: jest.fn(async () => ({ lastInsertRowId: 1, changes: 0 })),
    withTransactionAsync: jest.fn(async (callback) => callback()),
  })),
}));
