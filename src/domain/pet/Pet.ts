// domain/pet/Pet.ts
// Доменный слой питомца: один класс на вид питомца, чтобы добавление нового
// вида (напр. новый маскот) не трогало логику, которая с ним работает.

import { ImageSourcePropType } from 'react-native';
import { PetMoodState, PetType } from '@/constants/petAssets';

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
}
