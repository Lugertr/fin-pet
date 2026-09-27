// src/components/pet/PetLottie/PetLottie.tsx
// Разовая Lottie-анимация тела питомца (уже в цветах скина и обрезанная до
// нужного кадра — см. PetSpecies.getAnimation). Рисуется внутри контейнера
// PetSprite поверх статичного SVG, совмещённая с его рамкой; касания проходят
// к PetSprite. На Android играет lottie-android, в вебе — dotlottie-web
// (WASM из бандла, см. configureLottieRenderer.web.ts).

import LottieView from 'lottie-react-native';
import { useEffect } from 'react';
import { View } from 'react-native';

import type { PetAnimation } from '@/domain/pet/petAnimation';
import './configureLottieRenderer';
import { createPetLottieStyles } from './PetLottie.styles';

/** Если плеер не сообщил о загрузке (в вебе событие может прийти раньше, чем
 * подписка), SVG всё равно прячется — первый кадр анимации с ним совпадает. */
const READY_FALLBACK_MS = 400;

interface PetLottieProps {
  animation: PetAnimation;
  /** Ширина места под тело питомца (как у SVG-спрайта). */
  width: number;
  /** Анимация загрузилась — можно прятать статичный SVG под ней. */
  onReady: () => void;
  /** Доиграла (или не смогла загрузиться) — вернуть статичный SVG. */
  onFinish: () => void;
}

const WEB_FILL = { width: '100%', height: '100%' } as const;

export function PetLottie({ animation, width, onReady, onFinish }: PetLottieProps) {
  const styles = createPetLottieStyles({ animation, width });

  useEffect(() => {
    const timer = setTimeout(onReady, READY_FALLBACK_MS);
    return () => clearTimeout(timer);
  }, [onReady]);

  return (
    <View style={styles.canvas} pointerEvents="none">
      <LottieView
        source={animation.source}
        autoPlay
        loop={false}
        resizeMode="contain"
        style={styles.fill}
        webStyle={WEB_FILL}
        onAnimationLoaded={onReady}
        onAnimationFinish={onFinish}
        onAnimationFailure={onFinish}
      />
    </View>
  );
}
