// domain/pet/Pet.ts
// Доменный слой питомца: один класс на вид питомца, чтобы добавление нового
// вида (напр. новый маскот) не трогало логику, которая с ним работает.

import { ImageSourcePropType } from 'react-native';
import { PetMoodState, PetType } from '@/constants/petAssets';
import { getSkinPalette, PetAnimation, PetAnimationAsset, recolorLottie } from './petAnimation';

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

  /** SVG-сцена «питомец работает» (work.svg, 297×275, фон уже внутри) для
   * экрана приключения, для выбранного скина. */
  abstract getWorkAsset(skinVariant?: number): ImageSourcePropType;

  /** Эмодзи-заглушка на случай PET_RENDER_MODE === 'emoji' или отсутствия ассета. */
  abstract getFallbackEmoji(state: PetMoodState): string;

  /** Lottie-анимации тела по состоянию, по нажатию на питомца: idle —
   * радость (happy), sleeping — сонливость (sleepy). Без анимации нажатие
   * ничего не проигрывает — остаётся SVG getBodyAsset. */
  protected abstract readonly animations: Partial<Record<PetMoodState, PetAnimationAsset>>;

  private readonly animationCache = new Map<string, PetAnimation>();

  /** Анимация состояния в цветах скина; null — для состояния анимации нет.
   * Перекраска считается один раз на пару «состояние + скин». */
  getAnimation(state: PetMoodState, skinVariant = 0): PetAnimation | null {
    const asset = this.animations[state];
    if (!asset) return null;
    // Скин со своим рисунком (не перекраска классического, например облики
    // мишки) палитры не имеет — анимация классического облика на нём была бы
    // чужой, поэтому по нажатию ничего не играет, остаётся SVG.
    const palette = getSkinPalette(this.type, skinVariant);
    if (skinVariant > 0 && !palette) return null;

    const key = `${state}:${skinVariant}`;
    let animation = this.animationCache.get(key);
    if (!animation) {
      const recolored = recolorLottie(asset.json, palette);
      animation = {
        // op — последний кадр композиции: плеер доиграет до endFrame и остановится.
        source: { ...recolored, op: asset.endFrame },
        canvasWidth: asset.json.w,
        canvasHeight: asset.json.h,
        body: asset.body,
      };
      this.animationCache.set(key, animation);
    }
    return animation;
  }
}
