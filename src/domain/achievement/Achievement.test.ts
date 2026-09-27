// domain/achievement/Achievement.test.ts
// Подпись открытого достижения на экране «Достижения».

import { achievementUnlockedCaption } from './Achievement';

describe('achievementUnlockedCaption', () => {
  // Среда, 23.09.2026; неделя начинается с понедельника 21.09.
  const now = new Date(2026, 8, 23, 12, 0);

  it('открыто на текущей неделе', () => {
    expect(achievementUnlockedCaption(new Date(2026, 8, 21, 9, 0).toISOString(), now)).toBe(
      'открыто на этой неделе'
    );
  });

  it('открыто раньше — с датой', () => {
    expect(achievementUnlockedCaption(new Date(2026, 8, 12, 9, 0).toISOString(), now)).toBe(
      'открыто 12.09'
    );
  });

  it('дата неизвестна (старая запись) — просто «открыто»', () => {
    expect(achievementUnlockedCaption(undefined, now)).toBe('открыто');
  });
});
