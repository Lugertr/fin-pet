import { useGameStore } from '@/app/providers/store';
import { PET_COLORS, PET_EMOJIS, isValidPetName } from '@/entities/pet';
import type { PetType } from '@/shared/types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

export function CustomizePetPage() {
  const router = useRouter();
  const { petType } = useLocalSearchParams<{ petType: PetType }>();
  const createPet = useGameStore((state) => state.createPet);

  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PET_COLORS[0].id);

  const isValidName = isValidPetName(name);
  const petEmoji = PET_EMOJIS[petType as PetType] || '🐱';
  const selectedColorHex = PET_COLORS.find((c) => c.id === selectedColor)?.hex || '#FF6B6B';

  const handleFinish = () => {
    if (isValidName && petType) {
      createPet(petType, name, selectedColor);
      router.replace('/auth/tutorial');
    }
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1 px-6 pt-12" showsVerticalScrollIndicator={false}>
        <Text className="text-3xl font-bold text-text text-center mb-2">Настрой питомца</Text>
        <Text className="text-base text-gray-500 text-center mb-8">Дай ему имя и выбери цвет</Text>

        <View className="items-center mb-8">
          <View
            className="w-32 h-32 rounded-full items-center justify-center mb-4"
            style={{ backgroundColor: `${selectedColorHex}30` }}
          >
            <Text className="text-7xl">{petEmoji}</Text>
          </View>
          <Text className="text-xl font-semibold text-text">{name || 'Имя питомца'}</Text>
        </View>

        <View className="mb-6">
          <Text className="text-base font-semibold text-text mb-2">Имя питомца</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Например, Копикот"
            maxLength={15}
            className="bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-base text-text"
            placeholderTextColor="#999"
          />
          <View className="flex-row justify-between mt-1">
            <Text className="text-xs text-gray-500">{name.length}/15 символов</Text>
            {name.length > 0 && !isValidName && (
              <Text className="text-xs text-red-500">Минимум 3 символа</Text>
            )}
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-base font-semibold text-text mb-3">Цвет питомца</Text>
          <View className="flex-row gap-3">
            {PET_COLORS.map((color) => {
              const isSelected = selectedColor === color.id;
              return (
                <Pressable
                  key={color.id}
                  onPress={() => setSelectedColor(color.id)}
                  className={`w-16 h-16 rounded-full border-4 items-center justify-center ${
                    isSelected ? 'border-primary' : 'border-transparent'
                  } active:opacity-80`}
                  style={{ backgroundColor: color.hex }}
                >
                  {isSelected && <Text className="text-white text-2xl font-bold">✓</Text>}
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View className="px-6 pb-8 pt-4">
        <Pressable
          onPress={handleFinish}
          disabled={!isValidName}
          className={`py-4 rounded-2xl ${
            isValidName ? 'bg-primary' : 'bg-gray-300'
          } active:opacity-80`}
        >
          <Text
            className={`text-center text-lg font-semibold ${
              isValidName ? 'text-white' : 'text-gray-500'
            }`}
          >
            Начать приключение!
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
