import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

const tutorialSteps = [
  {
    emoji: '📚',
    title: 'Выполняй задания',
    description: 'Каждый день тебя ждут 3 задания по финансам. Выполняй их и зарабатывай монеты!',
  },
  {
    emoji: '🛍️',
    title: 'Покупай в магазине',
    description: 'На заработанные монеты покупай еду, игрушки и аксессуары для питомца.',
  },
  {
    emoji: '💰',
    title: 'Копи и инвестируй',
    description:
      'Откладывай монеты в копилку под проценты или покупай инвестиции для пассивного дохода.',
  },
  {
    emoji: '🎉',
    title: 'Всё готово!',
    description: 'Теперь ты знаешь всё необходимое. Удачи в мире финансов!',
  },
];

export function TutorialPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      router.replace('/tabs');
    }
  };

  const step = tutorialSteps[currentStep];
  const isLastStep = currentStep === tutorialSteps.length - 1;

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-grow justify-center px-6"
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center">
          <Text className="text-8xl mb-8">{step.emoji}</Text>

          <Text className="text-3xl font-bold text-text text-center mb-4">{step.title}</Text>

          <Text className="text-lg text-gray-600 text-center leading-relaxed px-4">
            {step.description}
          </Text>

          <View className="flex-row gap-2 mt-12">
            {tutorialSteps.map((_, index) => (
              <View
                key={index}
                className={`h-2 rounded-full ${
                  index === currentStep ? 'w-8 bg-primary' : 'w-2 bg-gray-300'
                }`}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <View className="px-6 pb-8">
        <Pressable onPress={handleNext} className="bg-primary py-4 rounded-2xl active:opacity-80">
          <Text className="text-white text-center text-lg font-semibold">
            {isLastStep ? 'Начать!' : 'Далее'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
