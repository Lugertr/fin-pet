// jest.config.js
// Тесты покрывают доменную логику расчётов (CLAUDE.md: план бюджета,
// покупки, накопления, план vs факт, рост уровня, восстановление энергии) —
// не UI. Поэтому react-test-renderer/@testing-library не подключены.

module.exports = {
  preset: 'jest-expo',
  setupFiles: ['./jest.setup.js'],
  testPathIgnorePatterns: ['/node_modules/', '/android/', '/ios/'],
};
