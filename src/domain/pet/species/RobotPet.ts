// domain/pet/species/RobotPet.ts

import { PetMoodState } from '@/constants/petAssets';
import { PetEmotion, PetSpecies } from '../Pet';

/** variant 0 — «Классический» (встроенный, не товар), 1/2 — покупные скины
 * (content/items.json, category 'skin', pet_type 'robot'). */
const BODY_ASSETS: Record<number, Record<PetMoodState, number>> = {
  0: {
    happy: require('../../../../assets/images/pets/robot/v0/happy.svg'),
    neutral: require('../../../../assets/images/pets/robot/v0/idle.svg'),
    sad: require('../../../../assets/images/pets/robot/v0/sad.svg'),
    sleeping: require('../../../../assets/images/pets/robot/v0/sleeping.svg'),
  },
  1: {
    happy: require('../../../../assets/images/pets/robot/v1/happy.svg'),
    neutral: require('../../../../assets/images/pets/robot/v1/idle.svg'),
    sad: require('../../../../assets/images/pets/robot/v1/sad.svg'),
    sleeping: require('../../../../assets/images/pets/robot/v1/sleeping.svg'),
  },
  2: {
    happy: require('../../../../assets/images/pets/robot/v2/happy.svg'),
    neutral: require('../../../../assets/images/pets/robot/v2/idle.svg'),
    sad: require('../../../../assets/images/pets/robot/v2/sad.svg'),
    sleeping: require('../../../../assets/images/pets/robot/v2/sleeping.svg'),
  },
};

const FALLBACK_EMOJI: Record<PetMoodState, string> = {
  happy: '🤖',
  neutral: '🤖',
  sad: '🤖',
  sleeping: '😴',
};

export class RobotPet extends PetSpecies {
  readonly type = 'robot' as const;
  readonly displayName = 'Робот';

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
