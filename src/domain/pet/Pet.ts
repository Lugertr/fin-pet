// domain/pet/Pet.ts
// Доменный слой питомца: один класс на вид питомца, чтобы добавление нового
// вида (напр. новый маскот) не трогало логику, которая с ним работает.

import { ImageSourcePropType } from 'react-native';
import { PetMoodState, PetType } from '@/constants/petAssets';
import {
  getSkinPalette,
  PetAnimation,
  PetAnimationAsset,
  PetAnimationBody,
  recolorLottie,
} from './petAnimation';

/**
 * Иконки эмоций питомца для диалогов/шагов урока (радостный/получивший
 * награду/задающий вопрос/сожалеющий). Отдельный набор от 2 состояний тела
 * (idle/sleeping) — используется в PetAvatarBubble, а не в комнате. SVG есть
 * пока только для 'question'/'reward', по одной паре на каждый скин-вариант
 * (см. assets/images/pets/<type>/v<variant>/{question,reward}.svg) — для
 * 'happy'/'regretful' getEmotionAsset() вернёт null, и PetAvatarBubble
 * нарисует эмодзи-плейсхолдер.
 */
export type PetEmotion = 'happy' | 'reward' | 'question' | 'regretful';

/** Плейсхолдер-бейдж поверх базового эмодзи вида, пока не готовы SVG для
 * PetEmotion — используется PetAvatarBubble, когда getEmotionAsset() вернул null. */
export const EMOTION_BADGE_EMOJI: Record<PetEmotion, string> = {
  happy: '✨',
  reward: '🎁',
  question: '❓',
  regretful: '😔',
};

export abstract class PetSpecies {
  abstract readonly type: PetType;
  abstract readonly displayName: string;

  /** SVG тела питомца для текущего состояния (idle/sleeping) и выбранного
   * скина (0 — встроенный «Классический», 1/2 — покупные). */
  abstract getBodyAsset(state: PetMoodState, skinVariant?: number): ImageSourcePropType;

  /** SVG-иконка эмоции для модалок, для выбранного скина; null — ассет ещё
   * не поставлен для этой эмоции (сейчас есть только question/reward). */
  abstract getEmotionAsset(emotion: PetEmotion, skinVariant?: number): ImageSourcePropType | null;

  /** Эмодзи-заглушка на случай PET_RENDER_MODE === 'emoji' или отсутствия ассета. */
  abstract getFallbackEmoji(state: PetMoodState): string;

  /** Lottie-анимации тела по состоянию: idle — бодрый (happy), sleeping —
   * уставший (sleepy). Состояния без анимации рисуются SVG getBodyAsset. */
  protected abstract readonly animations: Partial<Record<PetMoodState, PetAnimationAsset>>;

  /** Рамка idle-SVG в кадре анимаций этого вида (см. PetAnimationBody). */
  abstract readonly animationBody: PetAnimationBody;

  private readonly animationCache = new Map<string, PetAnimation>();

  /** Анимация состояния в цветах скина; null — для состояния анимации нет.
   * Перекраска считается один раз на пару «состояние + скин». */
  getAnimation(state: PetMoodState, skinVariant = 0): PetAnimation | null {
    const asset = this.animations[state];
    if (!asset) return null;

    const key = `${state}:${skinVariant}`;
    let animation = this.animationCache.get(key);
    if (!animation) {
      animation = {
        source: recolorLottie(asset.json, getSkinPalette(this.type, skinVariant)),
        loop: asset.loop,
        canvasWidth: asset.json.w,
        canvasHeight: asset.json.h,
        body: this.animationBody,
      };
      this.animationCache.set(key, animation);
    }
    return animation;
  }
}
