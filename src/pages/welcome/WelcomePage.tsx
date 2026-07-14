import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

const slides = [
  {
    emoji: '👋',
    title: 'Привет, будущий финансист!',
    description: 'Я научу тебя управлять деньгами так, чтобы ты мог покупать всё, что хочешь!',
  },
  {
    emoji: '🐱',
    title: 'У тебя будет питомец',
    description:
      'Заботься о нём, корми и играй. Он будет расти вместе с твоими финансовыми навыками!',
  },
  {
    emoji: '💰',
    title: 'Зарабатывай монеты',
    description:
      'Выполняй задания, копи и инвестируй. Чем умнее ты обращаешься с деньгами, тем счастливее питомец!',
  },
];

export function WelcomePage() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      router.push('/auth/choose-pet');
    }
  };

  const handleSkip = () => {
    router.push('/auth/choose-pet');
  };

  const slide = slides[currentSlide];
  const isLastSlide = currentSlide === slides.length - 1;

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-grow justify-center px-6"
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center">
          <Text className="text-8xl mb-8">{slide.emoji}</Text>

          <Text className="text-3xl font-bold text-text text-center mb-4">{slide.title}</Text>

          <Text className="text-lg text-gray-600 text-center leading-relaxed px-4">
            {slide.description}
          </Text>

          <View className="flex-row gap-2 mt-12">
            {slides.map((_, index) => (
              <View
                key={index}
                className={`h-2 rounded-full ${
                  index === currentSlide ? 'w-8 bg-primary' : 'w-2 bg-gray-300'
                }`}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <View className="px-6 pb-8">
        <Pressable
          onPress={handleNext}
          className="bg-primary py-4 rounded-2xl mb-3 active:opacity-80"
        >
          <Text className="text-white text-center text-lg font-semibold">
            {isLastSlide ? 'Начать!' : 'Далее'}
          </Text>
        </Pressable>

        {!isLastSlide && (
          <Pressable onPress={handleSkip} className="py-3 active:opacity-60">
            <Text className="text-gray-500 text-center">Пропустить</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
