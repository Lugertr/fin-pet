// domain/pet/species/CatPet.ts

import { PetMoodState } from '@/constants/petAssets';
import { PetEmotion, PetSpecies } from '../Pet';
import { PetAnimationAsset } from '../petAnimation';

/** variant 0 — «Классический» (встроенный, не товар), 1/2 — покупные скины
 * (content/items.json, category 'skin', pet_type 'cat'). */
const BODY_ASSETS: Record<number, Record<PetMoodState, number>> = {
  0: {
    idle: require('../../../../assets/images/pets/cat/v0/idle.svg'),
    sleeping: require('../../../../assets/images/pets/cat/v0/sleeping.svg'),
  },
  1: {
    idle: require('../../../../assets/images/pets/cat/v1/idle.svg'),
    sleeping: require('../../../../assets/images/pets/cat/v1/sleeping.svg'),
  },
  2: {
    idle: require('../../../../assets/images/pets/cat/v2/idle.svg'),
    sleeping: require('../../../../assets/images/pets/cat/v2/sleeping.svg'),
  },
};

const EMOTION_ASSETS: Record<number, Partial<Record<PetEmotion, number>>> = {
  0: {
    question: require('../../../../assets/images/pets/cat/v0/question.svg'),
    reward: require('../../../../assets/images/pets/cat/v0/reward.svg'),
  },
  1: {
    question: require('../../../../assets/images/pets/cat/v1/question.svg'),
    reward: require('../../../../assets/images/pets/cat/v1/reward.svg'),
  },
  2: {
    question: require('../../../../assets/images/pets/cat/v2/question.svg'),
    reward: require('../../../../assets/images/pets/cat/v2/reward.svg'),
  },
};

/** Lottie-анимации по нажатию (assets/animations/pets, scripts/build-pet-animations.js);
 * скины 1/2 — перекраска по palettes.json. body — рамка SVG того же
 * состояния в кадре 1200×1600 (подобрана наложением SVG на первый кадр),
 * endFrame — кадр, совпадающий с первым: радость — два цикла танца (4,8 с),
 * сонливость — 4 с. */
const ANIMATIONS: Partial<Record<PetMoodState, PetAnimationAsset>> = {
  idle: {
    json: require('../../../../assets/animations/pets/cat_happy.json'),
    body: { x: 272, y: 331, width: 655, height: 921 },
    endFrame: 144,
  },
  sleeping: {
    json: require('../../../../assets/animations/pets/cat_sleepy.json'),
    body: { x: 272, y: 330, width: 655, height: 922 },
    endFrame: 120,
  },
};

const FALLBACK_EMOJI: Record<PetMoodState, string> = {
  idle: '🐱',
  sleeping: '😴',
};

export class CatPet extends PetSpecies {
  readonly type = 'cat' as const;
  readonly displayName = 'Кот';
  protected readonly animations = ANIMATIONS;

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
