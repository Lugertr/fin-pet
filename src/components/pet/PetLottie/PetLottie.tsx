// src/components/pet/PetLottie/PetLottie.tsx
// Lottie-анимация тела питомца (уже в цветах скина — см. PetSpecies.getAnimation).
// Рисуется внутри контейнера PetSprite, совмещённая с рамкой тела; касания
// проходят к PetSprite. На Android играет lottie-android, в вебе —
// dotlottie-web (WASM из бандла, см. configureLottieRenderer.web.ts).

import LottieView from 'lottie-react-native';
import { View } from 'react-native';

import type { PetAnimation } from '@/domain/pet/petAnimation';
import './configureLottieRenderer';
import { createPetLottieStyles } from './PetLottie.styles';

interface PetLottieProps {
  animation: PetAnimation;
  /** Ширина места под тело питомца (как у SVG-спрайта). */
  width: number;
}

const WEB_FILL = { width: '100%', height: '100%' } as const;

export function PetLottie({ animation, width }: PetLottieProps) {
  const styles = createPetLottieStyles({ animation, width });

  return (
    <View style={styles.canvas} pointerEvents="none">
      <LottieView
        source={animation.source}
        autoPlay
        loop={animation.loop}
        resizeMode="contain"
        style={styles.fill}
        webStyle={WEB_FILL}
      />
    </View>
  );
}
