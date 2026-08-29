// components/pet/PetRoom.tsx
// Комната питомца с декором

import { Text, View } from 'react-native';
import Animated, {
    Easing,
    FadeIn,
    FadeInDown,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming
} from 'react-native-reanimated';
import { MoodIndicator } from './MoodIndicator';
import { PetAvatar } from './PetAvatar';

interface PetRoomProps {
  petType: 'robot' | 'dragon' | 'cat';
  petName: string;
  mood: number;
  placedDecor: { id: number; name: string; icon: string; position: 'left' | 'right' | 'center' }[];
  onPetPress?: () => void;
}

export function PetRoom({ petType, petName, mood, placedDecor, onPetPress }: PetRoomProps) {
  // Анимация парения для декора
  const floatY = useSharedValue(0);

  floatY.value = withRepeat(
    withTiming(-5, {
      duration: 2000,
      easing: Easing.inOut(Easing.ease),
    }),
    -1,
    true
  );

  const animatedFloatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));

  return (
    <View className="bg-slate-800/30 rounded-3xl p-6 border border-slate-700">
      {/* Комната */}
      <View className="relative h-64 items-center justify-center">
        {/* Задний фон - окно */}
        <View className="absolute top-0 right-4 w-16 h-20 rounded-lg bg-slate-700/30 border border-slate-600" />

        {/* Декор слева */}
        <View className="absolute left-4 bottom-8">
          {placedDecor
            .filter((d) => d.position === 'left')
            .map((item, index) => (
              <Animated.View
                key={item.id}
                entering={FadeInDown.delay(index * 200)}
                style={animatedFloatStyle}
                className="mb-2"
              >
                <Text className="text-3xl">{item.icon}</Text>
              </Animated.View>
            ))}
        </View>

        {/* Декор справа */}
        <View className="absolute right-4 bottom-8">
          {placedDecor
            .filter((d) => d.position === 'right')
            .map((item, index) => (
              <Animated.View
                key={item.id}
                entering={FadeInDown.delay(index * 200)}
                style={animatedFloatStyle}
                className="mb-2"
              >
                <Text className="text-3xl">{item.icon}</Text>
              </Animated.View>
            ))}
        </View>

        {/* Питомец в центре */}
        <Animated.View entering={FadeIn.duration(500)}>
          <PetAvatar petType={petType} mood={mood} size="lg" onPress={onPetPress} />
        </Animated.View>

        {/* Имя питомца */}
        <Text className="text-white font-semibold text-lg mt-4">{petName}</Text>
      </View>

      {/* Индикатор настроения */}
      <View className="mt-4">
        <MoodIndicator mood={mood} showTip />
      </View>
    </View>
  );
}
