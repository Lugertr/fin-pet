// domain/pet/species/RobotPet.ts

import { PetMoodState } from '@/constants/petAssets';
import { PetEmotion, PetSpecies } from '../Pet';
import { PetAnimationAsset } from '../petAnimation';

/** variant 0 — «Классический» (встроенный, не товар), 1/2 — покупные скины
 * (content/items.json, category 'skin', pet_type 'robot'). */
const BODY_ASSETS: Record<number, Record<PetMoodState, number>> = {
  0: {
    idle: require('../../../../assets/images/pets/robot/v0/idle.svg'),
    sleeping: require('../../../../assets/images/pets/robot/v0/sleeping.svg'),
  },
  1: {
    idle: require('../../../../assets/images/pets/robot/v1/idle.svg'),
    sleeping: require('../../../../assets/images/pets/robot/v1/sleeping.svg'),
  },
  2: {
    idle: require('../../../../assets/images/pets/robot/v2/idle.svg'),
    sleeping: require('../../../../assets/images/pets/robot/v2/sleeping.svg'),
  },
};

const EMOTION_ASSETS: Record<number, Partial<Record<PetEmotion, number>>> = {
  0: {
    question: require('../../../../assets/images/pets/robot/v0/question.svg'),
    reward: require('../../../../assets/images/pets/robot/v0/reward.svg'),
  },
  1: {
    question: require('../../../../assets/images/pets/robot/v1/question.svg'),
    reward: require('../../../../assets/images/pets/robot/v1/reward.svg'),
  },
  2: {
    question: require('../../../../assets/images/pets/robot/v2/question.svg'),
    reward: require('../../../../assets/images/pets/robot/v2/reward.svg'),
  },
};

const WORK_ASSETS: Record<number, number> = {
  0: require('../../../../assets/images/pets/robot/v0/work.svg'),
  1: require('../../../../assets/images/pets/robot/v1/work.svg'),
  2: require('../../../../assets/images/pets/robot/v2/work.svg'),
};

/** Lottie-анимации по нажатию (assets/animations/pets, scripts/build-pet-animations.js);
 * скины 1/2 — перекраска по palettes.json. body — рамка SVG того же
 * состояния в кадре 1200×1600 (подобрана наложением SVG на первый кадр),
 * endFrame — кадр, совпадающий с первым: радость — два цикла (3,2 с),
 * сонливость — 4 с. */
const ANIMATIONS: Partial<Record<PetMoodState, PetAnimationAsset>> = {
  idle: {
    json: require('../../../../assets/animations/pets/robot_happy.json'),
    body: { x: 297, y: 340, width: 582, height: 892 },
    endFrame: 96,
  },
  sleeping: {
    json: require('../../../../assets/animations/pets/robot_sleepy.json'),
    body: { x: 310, y: 406, width: 582, height: 873 },
    endFrame: 120,
  },
};

const FALLBACK_EMOJI: Record<PetMoodState, string> = {
  idle: '🤖',
  sleeping: '😴',
};

export class RobotPet extends PetSpecies {
  readonly type = 'robot' as const;
  readonly displayName = 'Робот';
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
