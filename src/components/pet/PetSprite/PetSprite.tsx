// src/components/pet/PetSprite/PetSprite.tsx
// Спрайт питомца: переключается между состояниями (idle/sleeping) в
// зависимости от энергии. Без декоративного фона/обводки и без анимаций
// (дыхание/покачивание/подпрыгивание) — по решению пользователя: показываем
// сам рисунок как есть, в его реальных пропорциях (см. getAssetAspectRatio).

import { Image } from 'expo-image';
import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { PET_RENDER_MODE, PetType, getMoodState } from '@/constants/petAssets';
import { getPetSpecies } from '@/domain/pet/petSpeciesRegistry';
import { getAssetAspectRatio } from '@/lib/utils/imageAspectRatio';
import { useTheme } from '@/theme';
import { isPetTapReactionAvailable, PetTapReaction } from '../PetTapReaction';
import { createPetSpriteStyles } from './PetSprite.styles';

interface PetSpriteProps {
  petType: PetType;
  mood: number;
  /** Целевая ширина в пикселях — вызывающий код сам решает, нужен ли scale()
   * (например PetRoom уже считает size пропорционально реальной ширине
   * комнаты и не должен масштабироваться повторно). Высота считается из
   * реального соотношения сторон конкретного SVG, не задаётся отдельно. */
  size?: number;
  /** Целевая высота вместо ширины — ширина тогда считается из пропорций SVG.
   * Нужна там, где несколько питомцев стоят рядом (онбординг): при одной
   * ширине мишка заметно выше кота, при одной высоте они выглядят ровно. */
  height?: number;
  /** Какой скин надет (0 — «Классический», встроенный). См. PetSpecies.getBodyAsset. */
  skinVariant?: number;
  onPress?: () => void;
}

export function PetSprite({
  petType,
  mood,
  size = 120,
  height: targetHeight,
  skinVariant = 0,
  onPress,
}: PetSpriteProps) {
  const { theme } = useTheme();

  const moodState = getMoodState(mood);
  const species = getPetSpecies(petType);
  const emoji = species.getFallbackEmoji(moodState);
  const petAsset = species.getBodyAsset(moodState, skinVariant);
  // getBodyAsset объявлен через более общий ImageSourcePropType (см. Pet.ts),
  // но на практике это всегда локальный статический require() — число-id
  // ассета, как и в FURNITURE_ASSETS (см. getAssetAspectRatio).
  const aspectRatio = getAssetAspectRatio(petAsset as number);
  const width = targetHeight !== undefined ? targetHeight * aspectRatio : size;
  const height = targetHeight !== undefined ? targetHeight : size / aspectRatio;

  const styles = createPetSpriteStyles({ theme, width, height });

  // Reaction — одноразовая Rive-анимация по тапу (см. PetTapReaction), пока
  // идёт — показываем её вместо статичного спрайта/эмодзи.
  const [showReaction, setShowReaction] = useState(false);

  const handlePress = () => {
    if (isPetTapReactionAvailable(petType)) setShowReaction(true);
    onPress?.();
  };

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={handlePress}>
      <View style={styles.container}>
        {/* Рендер питомца — реакция по тапу (Rive), пока не готова, иначе
            статичный спрайт/эмодзи как обычно. */}
        {showReaction ? (
          <PetTapReaction
            petType={petType}
            style={styles.image}
            onFinished={() => setShowReaction(false)}
          />
        ) : PET_RENDER_MODE === 'assets' && petAsset ? (
          <Image source={petAsset} style={styles.image} contentFit="contain" transition={200} />
        ) : (
          <Text style={styles.emoji}>{emoji}</Text>
        )}

        {/* Индикатор сна */}
        {moodState === 'sleeping' && (
          <View style={[styles.badge, styles.badgeSleeping]}>
            <Text style={styles.badgeEmoji}>💤</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
