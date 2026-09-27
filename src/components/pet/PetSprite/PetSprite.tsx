// src/components/pet/PetSprite/PetSprite.tsx
// Спрайт питомца: переключается между состояниями (idle/sleeping) в
// зависимости от энергии. Без декоративного фона/обводки — по решению
// пользователя: показываем сам рисунок в его реальных пропорциях (см.
// getAssetAspectRatio). С animated — Lottie-анимация состояния в цветах
// скина (бодрый — весёлая, уставший — спящая), там, где она есть; иначе
// статичный SVG.

import { Image } from 'expo-image';
import { Text, TouchableOpacity, View } from 'react-native';

import { PET_RENDER_MODE, PetType, getMoodState } from '@/constants/petAssets';
import { getPetSpecies } from '@/domain/pet/petSpeciesRegistry';
import { getAssetAspectRatio } from '@/lib/utils/imageAspectRatio';
import { useTheme } from '@/theme';
import { PetLottie } from '../PetLottie';
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
  /** Играть Lottie-анимацию состояния (хаб, выбранный питомец в онбординге).
   * Без неё — статичный SVG. */
  animated?: boolean;
  onPress?: () => void;
}

export function PetSprite({
  petType,
  mood,
  size = 120,
  height: targetHeight,
  skinVariant = 0,
  animated = false,
  onPress,
}: PetSpriteProps) {
  const { theme } = useTheme();

  const moodState = getMoodState(mood);
  const species = getPetSpecies(petType);
  const emoji = species.getFallbackEmoji(moodState);
  const petAsset = species.getBodyAsset(moodState, skinVariant);
  const animation =
    animated && PET_RENDER_MODE === 'assets' ? species.getAnimation(moodState, skinVariant) : null;
  // У анимации одна рамка тела на оба состояния (idle-SVG), чтобы питомец не
  // прыгал при засыпании. getBodyAsset объявлен через более общий
  // ImageSourcePropType (см. Pet.ts), но на практике это всегда локальный
  // статический require() — число-id ассета, как и в FURNITURE_ASSETS.
  const aspectRatio = animation
    ? animation.body.width / animation.body.height
    : getAssetAspectRatio(petAsset as number);
  const width = targetHeight !== undefined ? targetHeight * aspectRatio : size;
  const height = targetHeight !== undefined ? targetHeight : size / aspectRatio;

  const styles = createPetSpriteStyles({ theme, width, height });

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
      <View style={styles.container}>
        {animation ? (
          // key — чтобы при смене состояния/скина анимация запускалась заново.
          <PetLottie
            key={`${petType}-${moodState}-${skinVariant}`}
            animation={animation}
            width={width}
          />
        ) : PET_RENDER_MODE === 'assets' && petAsset ? (
          <Image source={petAsset} style={styles.image} contentFit="contain" transition={200} />
        ) : (
          <Text style={styles.emoji}>{emoji}</Text>
        )}

        {/* Индикатор сна — у спящей анимации свои «Zzz». */}
        {moodState === 'sleeping' && !animation && (
          <View style={[styles.badge, styles.badgeSleeping]}>
            <Text style={styles.badgeEmoji}>💤</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
