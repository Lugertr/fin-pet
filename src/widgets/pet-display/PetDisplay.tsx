import type { Pet, PetMood } from '@/shared/types';
import { ProgressBar } from '@/shared/ui';
import { memo, useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Pressable, Text, View } from 'react-native';

interface PetDisplayProps {
  pet: Pet;
  size?: 'sm' | 'md' | 'lg';
  onTap?: () => void;
}

const petEmojis: Record<string, string[]> = {
  cat: ['🥚', '🐱', '🐈', '🦁', '👑🦁'],
  dog: ['🥚', '🐶', '🐕', '🐺', '👑🐺'],
  dragon: ['🥚', '🐲', '🐉', '🔥🐉', '👑🐉'],
  fox: ['🥚', '🦊', '🦊', '🦊', '👑🦊'],
};

const moodEmojis: Record<PetMood, string> = {
  idle: '',
  happy: '😊',
  sad: '😢',
  hungry: '😫',
  sleeping: '😴',
};

function getPetMood(pet: Pet): PetMood {
  if (pet.hunger < 20 && pet.happiness < 20) return 'sad';
  if (pet.hunger < 40) return 'hungry';
  if (pet.happiness < 40) return 'sad';
  if (pet.energy < 40) return 'sleeping';
  if (pet.happiness > 70 && pet.hunger > 70) return 'happy';
  return 'idle';
}

const sizeMap = {
  sm: { container: 120, emoji: 'text-5xl', mood: 'text-2xl' },
  md: { container: 200, emoji: 'text-8xl', mood: 'text-4xl' },
  lg: { container: 280, emoji: 'text-9xl', mood: 'text-5xl' },
};

export const PetDisplay = memo(function PetDisplay({ pet, size = 'md', onTap }: PetDisplayProps) {
  const breatheAnim = useRef(new Animated.Value(0)).current;

  const mood = useMemo(() => getPetMood(pet), [pet.hunger, pet.happiness, pet.energy]);
  const sizeConfig = useMemo(() => sizeMap[size], [size]);
  const petEmoji = useMemo(() => {
    const stageEmojis = petEmojis[pet.type] || petEmojis.cat;
    return stageEmojis[pet.stage - 1] || '🥚';
  }, [pet.type, pet.stage]);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(breatheAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(breatheAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [breatheAnim]);

  const scale = breatheAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05],
  });

  return (
    <View className="items-center">
      <Pressable onPress={onTap}>
        <Animated.View style={{ transform: [{ scale }] }} className="items-center justify-center">
          <Text className={sizeConfig.emoji}>{petEmoji}</Text>
          {mood !== 'idle' && (
            <Text className={`${sizeConfig.mood} absolute -bottom-2 -right-2`}>
              {moodEmojis[mood]}
            </Text>
          )}
        </Animated.View>
      </Pressable>

      {size !== 'sm' && (
        <View className="w-full mt-4 gap-2">
          <ProgressBar value={pet.hunger} color="#4ECDC4" label="🍎 Сытость" showValue size="sm" />
          <ProgressBar
            value={pet.happiness}
            color="#FF6B6B"
            label="😊 Счастье"
            showValue
            size="sm"
          />
          <ProgressBar value={pet.energy} color="#FFE66D" label="⚡ Энергия" showValue size="sm" />
        </View>
      )}
    </View>
  );
});
