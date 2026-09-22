// src/components/pet/PetTapReaction/PetTapReaction.web.tsx
// Веб-заглушка: rive-react-native — нативный модуль, на вебе не резолвится
// (тот же приём, что и в LessonsBackground.web.tsx). Сразу возвращаемся к
// статичному спрайту — PetSprite.tsx решает, показывать ли эту реакцию
// вообще, через isPetTapReactionAvailable(), эта заглушка нужна только
// чтобы Metro не пытался резолвить rive-react-native на вебе.

import { useEffect } from 'react';
import type { ViewStyle } from 'react-native';

import type { PetType } from '@/constants/petAssets';

export function PetTapReaction({
  onFinished,
}: {
  petType: PetType;
  style?: ViewStyle;
  onFinished: () => void;
}) {
  useEffect(() => {
    onFinished();
  }, [onFinished]);

  return null;
}
