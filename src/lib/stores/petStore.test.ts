// lib/stores/petStore.test.ts
// Трата и восстановление энергии считаются от актуального значения (§6.3), а
// не от устаревшего кэша — иначе чекпоинт стирал накопленную по времени энергию.

import { usePetStore } from './petStore';

const HOUR = 60 * 60 * 1000;

function seedPet(mood: number, updatedHoursAgo: number): void {
  usePetStore.setState({
    pet: {
      id: 1,
      user_id: 'test-profile',
      mood,
      last_mood_updated_at: new Date(Date.now() - updatedHoursAgo * HOUR).toISOString(),
      base_recovery_rate: 12.5,
    },
    // Кэш намеренно устаревший — как если бы экран не пересчитывал энергию часами.
    currentMood: mood,
    moodBuffs: 0,
    moodMaxBonus: 0,
  });
}

describe('petStore — энергия от актуального значения', () => {
  it('трата не стирает энергию, восстановившуюся за время простоя', () => {
    seedPet(50, 2); // за 2 часа восстановилось +25 -> 75

    usePetStore.getState().spendEnergy(5);

    expect(usePetStore.getState().currentMood).toBe(70);
    expect(usePetStore.getState().pet?.mood).toBe(70);
  });

  it('еда прибавляется к восстановившейся энергии, а не к устаревшей', () => {
    seedPet(50, 2); // 75 актуально

    usePetStore.getState().restoreEnergy(10);

    expect(usePetStore.getState().currentMood).toBe(85);
  });
});
