// src/components/pet/PetTapReaction/PetTapReaction.tsx
// Одноразовая Rive-реакция питомца по тапу (нативная реализация). Рендерится
// PetSprite вместо статичного спрайта, пока идёт реакция; см.
// PetTapReaction.constants.ts за контрактом .riv-файла и объяснением, почему
// URL пока пустой. На вебе rive-react-native не резолвится — см.
// PetTapReaction.web.tsx (тот же приём, что и в LessonsBackground.web.tsx).

import { useEffect, useRef } from 'react';
import type { ViewStyle } from 'react-native';
import Rive, { Fit, RiveRef } from 'rive-react-native';

import type { PetType } from '@/constants/petAssets';
import {
  PET_TAP_RIVE_FALLBACK_MS,
  PET_TAP_RIVE_IDLE_STATE,
  PET_TAP_RIVE_STATE_MACHINE,
  PET_TAP_RIVE_TRIGGER,
  PET_TAP_RIVE_URLS,
} from './PetTapReaction.constants';

export function PetTapReaction({
  petType,
  style,
  onFinished,
}: {
  petType: PetType;
  /** Тот же размер, что и обычный спрайт (PetSprite.styles.ts `image`) —
   * вызывающий код решает, каким должно быть визуальное пятно реакции. */
  style?: ViewStyle;
  onFinished: () => void;
}) {
  const riveRef = useRef<RiveRef>(null);
  const url = PET_TAP_RIVE_URLS[petType];

  useEffect(() => {
    const fallback = setTimeout(onFinished, PET_TAP_RIVE_FALLBACK_MS);
    return () => clearTimeout(fallback);
  }, [onFinished]);

  return (
    <Rive
      ref={riveRef}
      url={url}
      stateMachineName={PET_TAP_RIVE_STATE_MACHINE}
      autoplay
      fit={Fit.Contain}
      style={style}
      onPlay={() => riveRef.current?.fireState(PET_TAP_RIVE_STATE_MACHINE, PET_TAP_RIVE_TRIGGER)}
      onStateChanged={(_stateMachineName, stateName) => {
        if (stateName === PET_TAP_RIVE_IDLE_STATE) onFinished();
      }}
      onError={onFinished}
    />
  );
}
