// constants/petAssets.test.ts
// Переосмысление питомца: тело только в 2 состояниях (idle/sleeping) — старая
// граница mood<=20 (раньше отделяла 'sad' от 'neutral') теперь отделяет
// 'sleeping' от 'idle'.

import { getMoodState } from './petAssets';

describe('getMoodState', () => {
  it('sleeping при mood 0', () => {
    expect(getMoodState(0)).toBe('sleeping');
  });

  it('sleeping на границе (mood 20)', () => {
    expect(getMoodState(20)).toBe('sleeping');
  });

  it('idle сразу после границы (mood 21)', () => {
    expect(getMoodState(21)).toBe('idle');
  });

  it('idle при высокой энергии (mood 100)', () => {
    expect(getMoodState(100)).toBe('idle');
  });
});
