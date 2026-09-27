// domain/pet/species/CatPet.ts

import { PetMoodState } from '@/constants/petAssets';
import { PetEmotion, PetSpecies } from '../Pet';
import { PetAnimationAsset, PetAnimationBody } from '../petAnimation';

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

/** Lottie-анимации (assets/animations/pets, scripts/build-pet-animations.js);
 * скины 1/2 — перекраска по palettes.json. */
const ANIMATIONS: Partial<Record<PetMoodState, PetAnimationAsset>> = {
  idle: { json: require('../../../../assets/animations/pets/cat_happy.json'), loop: true },
  sleeping: { json: require('../../../../assets/animations/pets/cat_sleepy.json'), loop: true },
};

/** Рамка v0/idle.svg (655×921) в кадре анимаций 1200×1600 — подобрана
 * наложением SVG на кадр анимации. */
const ANIMATION_BODY: PetAnimationBody = { x: 272, y: 331, width: 655, height: 921 };

const FALLBACK_EMOJI: Record<PetMoodState, string> = {
  idle: '🐱',
  sleeping: '😴',
};

export class CatPet extends PetSpecies {
  readonly type = 'cat' as const;
  readonly displayName = 'Кот';
  protected readonly animations = ANIMATIONS;
  readonly animationBody = ANIMATION_BODY;

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
