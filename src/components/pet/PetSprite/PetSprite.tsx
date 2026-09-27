// src/components/pet/PetSprite/PetSprite.tsx
// Спрайт питомца: переключается между состояниями (idle/sleeping) в
// зависимости от энергии. Без декоративного фона/обводки — по решению
// пользователя: показываем сам рисунок в его реальных пропорциях (см.
// getAssetAspectRatio). С animateOnPress нажатие проигрывает Lottie-анимацию
// текущего состояния в цветах скина (бодрый — радость, уставший —
// сонливость) один раз, затем снова статичный SVG.

import { Image } from 'expo-image';
import { useCallback, useState } from 'react';
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
  /** Нажатие проигрывает анимацию состояния (хаб, онбординг). */
  animateOnPress?: boolean;
  onPress?: () => void;
}

/** Какая анимация играет и загрузилась ли она (тогда SVG под ней прячется). */
interface Playback {
  key: string;
  ready: boolean;
}

export function PetSprite({
  petType,
  mood,
  size = 120,
  height: targetHeight,
  skinVariant = 0,
  animateOnPress = false,
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

  const animation =
    animateOnPress && PET_RENDER_MODE === 'assets'
      ? species.getAnimation(moodState, skinVariant)
      : null;
  // Сменилось состояние или скин посреди анимации — она обрывается, и
  // показывается SVG нового состояния.
  const playbackKey = `${petType}-${moodState}-${skinVariant}`;
  const [playback, setPlayback] = useState<Playback | null>(null);
  const isPlaying = animation !== null && playback?.key === playbackKey;
  const hideStatic = isPlaying && playback.ready;

  const handleReady = useCallback(
    () =>
      setPlayback((current) => (current && !current.ready ? { ...current, ready: true } : current)),
    []
  );
  const handleFinish = useCallback(() => setPlayback(null), []);

  const handlePress = () => {
    // Повторное нажатие не перезапускает идущую анимацию.
    if (animation && !isPlaying) setPlayback({ key: playbackKey, ready: false });
    onPress?.();
  };

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={handlePress}>
      <View style={styles.container}>
        {PET_RENDER_MODE === 'assets' && petAsset ? (
          <Image
            source={petAsset}
            style={[styles.image, hideStatic && styles.hidden]}
            contentFit="contain"
            transition={200}
          />
        ) : (
          <Text style={styles.emoji}>{emoji}</Text>
        )}

        {isPlaying && (
          <PetLottie
            key={playbackKey}
            animation={animation}
            width={width}
            onReady={handleReady}
            onFinish={handleFinish}
          />
        )}

        {/* Индикатор сна — у сонной анимации свои «Zzz». */}
        {moodState === 'sleeping' && !hideStatic && (
          <View style={[styles.badge, styles.badgeSleeping]}>
            <Text style={styles.badgeEmoji}>💤</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
