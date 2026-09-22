// domain/pet/species/DragonPet.ts

import { PetMoodState } from '@/constants/petAssets';
import { PetEmotion, PetSpecies } from '../Pet';

/** variant 0 — «Классический» (встроенный, не товар), 1/2 — покупные скины
 * (content/items.json, category 'skin', pet_type 'dragon'). */
const BODY_ASSETS: Record<number, Record<PetMoodState, number>> = {
  0: {
    happy: require('../../../../assets/images/pets/dragon/v0/happy.svg'),
    neutral: require('../../../../assets/images/pets/dragon/v0/idle.svg'),
    sad: require('../../../../assets/images/pets/dragon/v0/sad.svg'),
    sleeping: require('../../../../assets/images/pets/dragon/v0/sleeping.svg'),
  },
  1: {
    happy: require('../../../../assets/images/pets/dragon/v1/happy.svg'),
    neutral: require('../../../../assets/images/pets/dragon/v1/idle.svg'),
    sad: require('../../../../assets/images/pets/dragon/v1/sad.svg'),
    sleeping: require('../../../../assets/images/pets/dragon/v1/sleeping.svg'),
  },
  2: {
    happy: require('../../../../assets/images/pets/dragon/v2/happy.svg'),
    neutral: require('../../../../assets/images/pets/dragon/v2/idle.svg'),
    sad: require('../../../../assets/images/pets/dragon/v2/sad.svg'),
    sleeping: require('../../../../assets/images/pets/dragon/v2/sleeping.svg'),
  },
};

const FALLBACK_EMOJI: Record<PetMoodState, string> = {
  happy: '🐉',
  neutral: '🐉',
  sad: '🐉',
  sleeping: '😴',
};

export class DragonPet extends PetSpecies {
  readonly type = 'dragon' as const;
  readonly displayName = 'Дракончик';

  getBodyAsset(state: PetMoodState, skinVariant = 0) {
    return (BODY_ASSETS[skinVariant] ?? BODY_ASSETS[0])[state];
  }

  getEmotionAsset(_emotion: PetEmotion) {
    return null;
  }

  getFallbackEmoji(state: PetMoodState) {
    return FALLBACK_EMOJI[state];
  }
}
