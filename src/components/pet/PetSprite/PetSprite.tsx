// src/components/pet/PetSprite/PetSprite.tsx
// Спрайт питомца: переключается между состояниями в зависимости от настроения

import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { PET_RENDER_MODE, PetType, getMoodState } from '@/constants/petAssets';
import { getPetSpecies } from '@/domain/pet/petSpeciesRegistry';
import { useTheme } from '@/theme';
import { isPetTapReactionAvailable, PetTapReaction } from '../PetTapReaction';
import { createPetSpriteStyles } from './PetSprite.styles';

interface PetSpriteProps {
  petType: PetType;
  mood: number;
  /** Финальный размер в пикселях — вызывающий код сам решает, нужен ли
   * scale() (например PetRoom уже считает size пропорционально реальной
   * ширине комнаты и не должен масштабироваться повторно). */
  size?: number;
  /** Какой скин надет (0 — «Классический», встроенный). См. PetSpecies.getBodyAsset. */
  skinVariant?: number;
  onPress?: () => void;
}

export function PetSprite({ petType, mood, size = 120, skinVariant = 0, onPress }: PetSpriteProps) {
  const { theme } = useTheme();

  const moodState = getMoodState(mood);
  const species = getPetSpecies(petType);
  const emoji = species.getFallbackEmoji(moodState);

  const styles = createPetSpriteStyles({ theme, size, moodState });

  // Reaction — одноразовая Rive-анимация по тапу (см. PetTapReaction),
  // пока идёт — показываем её вместо статичного спрайта/эмодзи.
  const [showReaction, setShowReaction] = useState(false);

  // Анимации
  const breathScale = useSharedValue(1);
  const bounceY = useSharedValue(0);
  const wobble = useSharedValue(0);

  useEffect(() => {
    // Дыхание
    breathScale.value = withRepeat(
      withTiming(1.05, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    // Покачивание при хорошем настроении
    if (moodState === 'happy') {
      wobble.value = withRepeat(
        withTiming(5, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    } else {
      wobble.value = 0;
    }
  }, [moodState, breathScale, wobble]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: breathScale.value },
      { translateY: bounceY.value },
      { rotate: `${wobble.value}deg` },
    ],
  }));

  const handlePress = () => {
    bounceY.value = withSequence(withSpring(-20, { damping: 8 }), withSpring(0, { damping: 8 }));
    if (isPetTapReactionAvailable(petType)) setShowReaction(true);
    onPress?.();
  };

  const petAsset = species.getBodyAsset(moodState, skinVariant);

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity activeOpacity={0.8} onPress={handlePress}>
        <View style={styles.container}>
          {/* Рендер питомца — реакция по тапу (Rive), пока не готова,
              иначе статичный спрайт/эмодзи как обычно. */}
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

          {/* Индикатор счастья */}
          {moodState === 'happy' && mood > 80 && (
            <View style={[styles.badge, styles.badgeHappy]}>
              <Text style={styles.badgeEmoji}>✨</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}
