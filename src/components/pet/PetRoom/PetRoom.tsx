// src/components/pet/PetRoom/PetRoom.tsx
// Комната питомца: фон + декор + питомец

import { Image } from 'expo-image';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import {
  DECOR_ASSETS,
  DECOR_EMOJIS,
  PET_RENDER_MODE,
  PetType,
  ROOM_BACKGROUND,
} from '@/constants/petAssets';
import { useResponsive, useTheme } from '@/theme';
import { MoodIndicator } from '../MoodIndicator';
import { PetSprite } from '../PetSprite';
import { createPetRoomStyles } from './PetRoom.styles';

interface DecorItem {
  id: number;
  name: string;
  icon: string;
  position: 'left' | 'right' | 'center';
}

interface PetRoomProps {
  petType: PetType;
  petName: string;
  mood: number;
  placedDecor: DecorItem[];
  onPetPress?: () => void;
}

export function PetRoom({ petType, petName, mood, placedDecor, onPetPress }: PetRoomProps) {
  const { theme } = useTheme();
  const { width, scale } = useResponsive();

  const roomHeight = Math.min(width * 0.75, 320);
  const styles = createPetRoomStyles({ theme, roomHeight });

  // Анимация парения декора
  const floatY = useSharedValue(0);

  useEffect(() => {
    floatY.value = withRepeat(
      withTiming(-5, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [floatY]);

  const animatedFloatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));

  const leftDecor = placedDecor.filter((d) => d.position === 'left');
  const rightDecor = placedDecor.filter((d) => d.position === 'right');

  return (
    <View style={styles.container}>
      {/* Фон комнаты */}
      {PET_RENDER_MODE === 'assets' && ROOM_BACKGROUND ? (
        <Image
          source={ROOM_BACKGROUND}
          style={styles.background}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View style={styles.background} />
      )}

      {/* Декор: левая сторона */}
      <View style={styles.decorLeft}>
        {leftDecor.map((item, index) => (
          <Animated.View
            key={item.id}
            entering={FadeInDown.delay(index * 200)}
            style={animatedFloatStyle}
          >
            <DecorIcon item={item} />
          </Animated.View>
        ))}
      </View>

      {/* Декор: правая сторона */}
      <View style={styles.decorRight}>
        {rightDecor.map((item, index) => (
          <Animated.View
            key={item.id}
            entering={FadeInDown.delay(index * 200 + 100)}
            style={animatedFloatStyle}
          >
            <DecorIcon item={item} />
          </Animated.View>
        ))}
      </View>

      {/* Питомец в центре */}
      <View style={styles.petContainer}>
        <PetSprite petType={petType} mood={mood} size={scale(120)} onPress={onPetPress} />

        {/* Имя питомца */}
        <View style={styles.petNameBadge}>
          <Text style={styles.petNameText}>{petName}</Text>
        </View>
      </View>

      {/* Индикатор настроения внизу комнаты */}
      <View style={styles.moodIndicatorContainer}>
        <MoodIndicator mood={mood} showLabel showTip={false} />
      </View>
    </View>
  );
}

/**
 * Иконка декора (эмодзи или картинка)
 */
function DecorIcon({ item }: { item: DecorItem }) {
  const { theme } = useTheme();
  const styles = createPetRoomStyles({ theme, roomHeight: 320 });

  const emoji = DECOR_EMOJIS[item.name] || item.icon;
  const asset = DECOR_ASSETS[item.name];

  return (
    <View style={styles.decorItemContainer}>
      {asset ? (
        <Image source={asset} style={styles.decorItemImage} contentFit="contain" transition={200} />
      ) : (
        <Text style={styles.decorItemEmoji}>{emoji}</Text>
      )}
    </View>
  );
}
