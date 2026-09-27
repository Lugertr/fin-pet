// domain/pet/species/BearPet.ts

import { PetMoodState } from '@/constants/petAssets';
import { PetEmotion, PetSpecies } from '../Pet';
import { PetAnimationAsset, PetAnimationBody } from '../petAnimation';

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

/** Lottie-анимация (assets/animations/pets, scripts/build-pet-animations.js).
 * bear_happy — не цикл, а «сборка» статичного рисунка по деталям за ~0,3 с:
 * играется один раз и остаётся на последнем кадре (решение 27.09.2026).
 * Спящей анимации у мишки пока нет — уставший рисуется SVG sleeping. */
const ANIMATIONS: Partial<Record<PetMoodState, PetAnimationAsset>> = {
  idle: { json: require('../../../../assets/animations/pets/bear_happy.json'), loop: false },
};

/** Рамка v0/idle.svg (533×917) в кадре анимации 1200×1600 — подобрана
 * наложением SVG на кадр анимации. */
const ANIMATION_BODY: PetAnimationBody = { x: 333, y: 329, width: 533, height: 917 };

const FALLBACK_EMOJI: Record<PetMoodState, string> = {
  idle: '🐻',
  sleeping: '😴',
};

export class BearPet extends PetSpecies {
  readonly type = 'bear' as const;
  readonly displayName = 'Медведь';
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
