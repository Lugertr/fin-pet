// domain/pet/species/BearPet.ts

import { PetMoodState } from '@/constants/petAssets';
import { PetEmotion, PetSpecies } from '../Pet';
import { PetAnimationAsset } from '../petAnimation';

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

const WORK_ASSETS: Record<number, number> = {
  0: require('../../../../assets/images/pets/bear/v0/work.svg'),
};

/** Lottie-анимация по нажатию (assets/animations/pets, scripts/build-pet-animations.js).
 * bear_happy — «сборка» статичного рисунка по деталям (0,8 с), играется
 * целиком. body — рамка v0/idle.svg в кадре 1200×1600 (подобрана наложением
 * SVG на кадр). Спящей анимации у мишки пока нет — нажатие на уставшего
 * мишку ничего не проигрывает. */
const ANIMATIONS: Partial<Record<PetMoodState, PetAnimationAsset>> = {
  idle: {
    json: require('../../../../assets/animations/pets/bear_happy.json'),
    body: { x: 333, y: 329, width: 533, height: 917 },
    endFrame: 50,
  },
};

const FALLBACK_EMOJI: Record<PetMoodState, string> = {
  idle: '🐻',
  sleeping: '😴',
};

export class BearPet extends PetSpecies {
  readonly type = 'bear' as const;
  readonly displayName = 'Медведь';
  protected readonly animations = ANIMATIONS;

  getBodyAsset(state: PetMoodState, skinVariant = 0) {
    return (BODY_ASSETS[skinVariant] ?? BODY_ASSETS[0])[state];
  }

  getEmotionAsset(emotion: PetEmotion, skinVariant = 0) {
    return (EMOTION_ASSETS[skinVariant] ?? EMOTION_ASSETS[0])[emotion] ?? null;
  }

  getWorkAsset(skinVariant = 0) {
    return WORK_ASSETS[skinVariant] ?? WORK_ASSETS[0];
  }

  getFallbackEmoji(state: PetMoodState) {
    return FALLBACK_EMOJI[state];
  }
}
