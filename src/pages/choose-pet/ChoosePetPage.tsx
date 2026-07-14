import type { PetType } from '@/shared/types';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

const petTypes: { type: PetType; emoji: string; name: string; description: string }[] = [
  {
    type: 'cat',
    emoji: '🐱',
    name: 'Котик',
    description: 'Милый и ласковый помощник',
  },
  {
    type: 'dog',
    emoji: '🐶',
    name: 'Щенок',
    description: 'Верный и активный друг',
  },
  {
    type: 'dragon',
    emoji: '🐉',
    name: 'Дракончик',
    description: 'Мудрый и могучий защитник',
  },
  {
    type: 'fox',
    emoji: '🦊',
    name: 'Лисёнок',
    description: 'Хитрый и умный советник',
  },
];

export function ChoosePetPage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<PetType | null>(null);

  const handleContinue = () => {
    if (selectedType) {
      router.push({
        pathname: '/auth/customize-pet',
        params: { petType: selectedType },
      });
    }
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1 px-6 pt-12" showsVerticalScrollIndicator={false}>
        <Text className="text-3xl font-bold text-text text-center mb-2">Выбери питомца</Text>
        <Text className="text-base text-gray-500 text-center mb-8">
          Он будет твоим помощником в мире финансов
        </Text>

        <View className="gap-4">
          {petTypes.map((pet) => {
            const isSelected = selectedType === pet.type;
            return (
              <Pressable
                key={pet.type}
                onPress={() => setSelectedType(pet.type)}
                className={`bg-white rounded-2xl p-6 border-2 ${
                  isSelected ? 'border-primary' : 'border-transparent'
                } active:opacity-80`}
              >
                <View className="flex-row items-center">
                  <Text className="text-6xl mr-4">{pet.emoji}</Text>
                  <View className="flex-1">
                    <Text className="text-xl font-bold text-text mb-1">{pet.name}</Text>
                    <Text className="text-sm text-gray-500">{pet.description}</Text>
                  </View>
                  {isSelected && <Text className="text-2xl text-primary">✓</Text>}
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View className="px-6 pb-8 pt-4">
        <Pressable
          onPress={handleContinue}
          disabled={!selectedType}
          className={`py-4 rounded-2xl ${
            selectedType ? 'bg-primary' : 'bg-gray-300'
          } active:opacity-80`}
        >
          <Text
            className={`text-center text-lg font-semibold ${
              selectedType ? 'text-white' : 'text-gray-500'
            }`}
          >
            Продолжить
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
