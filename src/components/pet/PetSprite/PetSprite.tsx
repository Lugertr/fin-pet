// src/components/pet/PetSprite/PetSprite.tsx
// Спрайт питомца: переключается между состояниями в зависимости от настроения

import { Image } from 'expo-image';
import { useEffect } from 'react';
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

import {
  PET_ASSETS_SINGLE,
  PET_EMOJIS,
  PET_RENDER_MODE,
  PetType,
  getMoodState,
} from '@/constants/petAssets';
import { useResponsive, useTheme } from '@/theme';
import { createPetSpriteStyles } from './PetSprite.styles';

interface PetSpriteProps {
  petType: PetType;
  mood: number;
  size?: number;
  onPress?: () => void;
}

export function PetSprite({ petType, mood, size = 120, onPress }: PetSpriteProps) {
  const { theme } = useTheme();
  const { scale } = useResponsive();

  const moodState = getMoodState(mood);
  const emoji = PET_EMOJIS[petType][moodState];

  const styles = createPetSpriteStyles({ theme, size: scale(size), moodState });

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
    onPress?.();
  };

  const petAsset = PET_ASSETS_SINGLE[petType];

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity activeOpacity={0.8} onPress={handlePress}>
        <View style={styles.container}>
          {/* Рендер питомца */}
          {PET_RENDER_MODE === 'assets' && petAsset ? (
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
