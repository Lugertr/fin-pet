// domain/pet/species/BearPet.ts

import { PetMoodState } from '@/constants/petAssets';
import { PetEmotion, PetSpecies } from '../Pet';

/** Только вариант 0 («Классический», встроенный) — покупных скинов у медведя
 * пока нет (не готов альтернативный арт тела, в отличие от робота/кота). */
const BODY_ASSETS: Record<number, Record<PetMoodState, number>> = {
  0: {
    idle: require('../../../../assets/images/pets/bear/v0/idle.svg'),
    sleeping: require('../../../../assets/images/pets/bear/v0/sleeping.svg'),
  },
};

const EMOTION_ASSETS: Record<number, Partial<Record<PetEmotion, number>>> = {
  0: {
    question: require('../../../../assets/images/pets/bear/v0/question.svg'),
    reward: require('../../../../assets/images/pets/bear/v0/reward.svg'),
  },
};

const FALLBACK_EMOJI: Record<PetMoodState, string> = {
  idle: '🐻',
  sleeping: '😴',
};

export class BearPet extends PetSpecies {
  readonly type = 'bear' as const;
  readonly displayName = 'Медведь';

  getBodyAsset(state: PetMoodState, skinVariant = 0) {
    return (BODY_ASSETS[skinVariant] ?? BODY_ASSETS[0])[state];
  }

  getEmotionAsset(emotion: PetEmotion, skinVariant = 0) {
    return (EMOTION_ASSETS[skinVariant] ?? EMOTION_ASSETS[0])[emotion] ?? null;
  }

  getFallbackEmoji(state: PetMoodState) {
    return FALLBACK_EMOJI[state];
  }
}
