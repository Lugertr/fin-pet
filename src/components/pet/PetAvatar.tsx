// components/pet/PetAvatar.tsx
// Анимированный аватар питомца

import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withSpring,
    withTiming
} from 'react-native-reanimated';

interface PetAvatarProps {
  petType: 'robot' | 'dragon' | 'cat';
  mood: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  onPress?: () => void;
}

const PET_EMOJIS: Record<string, Record<string, string>> = {
  robot: {
    happy: '🤖',
    neutral: '🤖',
    sad: '🤖',
    sleeping: '😴',
  },
  dragon: {
    happy: '🐉',
    neutral: '🐉',
    sad: '🐉',
    sleeping: '😴',
  },
  cat: {
    happy: '😺',
    neutral: '🐱',
    sad: '😿',
    sleeping: '😴',
  },
};

const SIZE_STYLES = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32',
};

const TEXT_SIZES = {
  sm: 'text-3xl',
  md: 'text-5xl',
  lg: 'text-6xl',
};

export function PetAvatar({ petType, mood, size = 'md', onPress }: PetAvatarProps) {
  // Определяем эмоцию по настроению
  const getMoodState = () => {
    if (mood <= 0) return 'sleeping';
    if (mood <= 20) return 'sad';
    if (mood <= 50) return 'neutral';
    return 'happy';
  };

  const moodState = getMoodState();
  const emoji = PET_EMOJIS[petType]?.[moodState] || '🤖';

  // Анимации
  const breathScale = useSharedValue(1);
  const bounceScale = useSharedValue(1);
  const rotate = useSharedValue(0);

  // Дыхание (постоянная анимация)
  useEffect(() => {
    breathScale.value = withRepeat(
      withTiming(1.05, {
        duration: 2000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, []);

  // Анимация при нажатии
  const handlePress = () => {
    bounceScale.value = withSequence(
      withSpring(0.9, { damping: 10 }),
      withSpring(1.1, { damping: 10 }),
      withSpring(1, { damping: 10 })
    );

    rotate.value = withSequence(
      withTiming(-10, { duration: 100 }),
      withTiming(10, { duration: 100 }),
      withTiming(0, { duration: 100 })
    );

    if (onPress) {
      setTimeout(onPress, 300);
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breathScale.value * bounceScale.value }, { rotate: `${rotate.value}deg` }],
  }));

  // Цвет фона в зависимости от настроения
  const getBackgroundColor = () => {
    if (mood > 50) return 'rgba(34, 197, 94, 0.15)';
    if (mood > 20) return 'rgba(245, 158, 11, 0.15)';
    return 'rgba(239, 68, 68, 0.15)';
  };

  return (
    <Pressable onPress={handlePress}>
      <Animated.View style={animatedStyle}>
        <View
          className={`${SIZE_STYLES[size]} rounded-full items-center justify-center`}
          style={{ backgroundColor: getBackgroundColor() }}
        >
          <Text className={TEXT_SIZES[size]}>{emoji}</Text>
        </View>

        {/* Индикатор настроения */}
        {mood <= 20 && mood > 0 && (
          <View className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 items-center justify-center">
            <Text className="text-xs">💤</Text>
          </View>
        )}
        {mood > 80 && (
          <View className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-green-500 items-center justify-center">
            <Text className="text-xs">✨</Text>
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}
