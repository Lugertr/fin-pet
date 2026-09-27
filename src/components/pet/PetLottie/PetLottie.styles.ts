// src/components/pet/PetLottie/PetLottie.styles.ts
// Кадр анимации больше рамки питомца (вокруг тела — сердечки, звёзды, «Zzz»),
// поэтому он растягивается так, чтобы рамка тела (PetAnimationBody) совпала
// с местом спрайта, и выходит за него во все стороны.

import { StyleSheet } from 'react-native';

import type { PetAnimation } from '@/domain/pet/petAnimation';

interface PetLottieStylesParams {
  animation: PetAnimation;
  /** Ширина места под тело питомца (как у SVG-спрайта). */
  width: number;
}

export function createPetLottieStyles({ animation, width }: PetLottieStylesParams) {
  const scale = width / animation.body.width;
  return StyleSheet.create({
    canvas: {
      position: 'absolute',
      left: -animation.body.x * scale,
      top: -animation.body.y * scale,
      width: animation.canvasWidth * scale,
      height: animation.canvasHeight * scale,
    },
    fill: {
      width: '100%',
      height: '100%',
    },
  });
}
