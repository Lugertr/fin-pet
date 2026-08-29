// app/(auth)/onboarding.tsx
// Онбординг: выбор питомца, имени и приоритетных тем

import { COLORS, SPACING } from '@/constants/theme';
import { BRANCHES } from '@/lib/hooks/useLessons';
import { usePetStore } from '@/lib/stores/petStore';
import { useUserStore } from '@/lib/stores/userStore';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { v4 as uuidv4 } from 'uuid';

// Типы питомцев
const PET_TYPES = [
  { id: 'robot', name: 'Робот', emoji: '🤖', description: 'Логичный и точный' },
  { id: 'dragon', name: 'Дракончик', emoji: '🐉', description: 'Мудрый и спокойный' },
  { id: 'cat', name: 'Кот', emoji: '🐱', description: 'Игривый и любопытный' },
] as const;

type PetType = (typeof PET_TYPES)[number]['id'];

export default function OnboardingScreen() {
  const router = useRouter();
  const { setUser, setOnboarded } = useUserStore();
  const { setPet } = usePetStore();

  // Состояние формы
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [petType, setPetType] = useState<PetType>('robot');
  const [petName, setPetName] = useState('');
  const [username, setUsername] = useState('');
  const [selectedBranches, setSelectedBranches] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Обработчики
  const handleSelectBranch = (branchId: number) => {
    setSelectedBranches((prev) => {
      if (prev.includes(branchId)) {
        return prev.filter((id) => id !== branchId);
      }
      if (prev.length >= 3) {
        // Максимум 3 ветки
        return prev;
      }
      return [...prev, branchId];
    });
  };

  const handleNextStep = () => {
    if (step < 3) {
      setStep((prev) => (prev + 1) as 1 | 2 | 3);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as 1 | 2 | 3);
    }
  };

  const handleSubmit = async () => {
    if (!username.trim() || !petName.trim() || selectedBranches.length < 2) {
      Alert.alert('Ошибка', 'Заполните все поля и выберите минимум 2 темы');
      return;
    }

    setIsSubmitting(true);

    try {
      // Создаём пользователя
      const userId = uuidv4();
      const newUser = {
        id: userId,
        username: username.trim(),
        liquid_balance: 500, // Стартовый баланс
        created_at: new Date().toISOString(),
      };

      // Создаём питомца
      const newPet = {
        id: 1,
        user_id: userId,
        mood: 100,
        last_mood_updated_at: new Date().toISOString(),
        base_recovery_rate: 5,
      };

      // Сохраняем в сторы
      setUser(newUser);
      setPet(newPet);
      setOnboarded(true);

      // Сохраняем приоритетные ветки (можно добавить в отдельный стор)
      console.log('Priority branches:', selectedBranches);

      // Переходим на главный экран
      router.replace('/(tabs)' as any);
    } catch (error) {
      console.error('[Onboarding] Ошибка:', error);
      Alert.alert('Ошибка', 'Не удалось создать профиль');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceedStep1 = username.trim().length >= 3;
  const canProceedStep2 = petName.trim().length >= 2;
  const canSubmit = selectedBranches.length >= 2;

  return (
    <LinearGradient colors={[COLORS.background, COLORS.surface]} style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          padding: SPACING.lg,
          justifyContent: 'center',
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Прогресс */}
        <View className="flex-row justify-center mb-8 gap-2">
          {[1, 2, 3].map((s) => (
            <View
              key={s}
              className={`w-2 h-2 rounded-full ${s === step ? 'bg-indigo-500' : 'bg-slate-600'}`}
            />
          ))}
        </View>

        {/* Шаг 1: Имя пользователя */}
        {step === 1 && (
          <View className="gap-6">
            <Text className="text-3xl font-bold text-white text-center mb-2">
              Добро пожаловать в{'\n'}
              <Text className="text-indigo-400">ФинСпутник!</Text>
            </Text>
            <Text className="text-slate-400 text-center mb-8">
              Ваш помощник в мире финансовой грамотности
            </Text>

            <View className="gap-2">
              <Text className="text-slate-300 text-sm font-medium">Как вас называть?</Text>
              <TextInput
                value={username}
                onChangeText={setUsername}
                placeholder="Введите ваше имя"
                placeholderTextColor={COLORS.textMuted}
                className="bg-slate-800 rounded-xl px-4 py-4 text-white text-base"
                maxLength={30}
              />
            </View>

            <TouchableOpacity
              onPress={handleNextStep}
              disabled={!canProceedStep1}
              className={`rounded-xl py-4 items-center ${
                canProceedStep1 ? 'bg-indigo-500' : 'bg-slate-700'
              }`}
            >
              <Text className="text-white font-semibold text-base">Далее</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Шаг 2: Выбор питомца */}
        {step === 2 && (
          <View className="gap-6">
            <Text className="text-2xl font-bold text-white text-center">Выберите помощника</Text>
            <Text className="text-slate-400 text-center">Он будет сопровождать вас в обучении</Text>

            {/* Карточки питомцев */}
            <View className="flex-row justify-center gap-3">
              {PET_TYPES.map((pet) => (
                <TouchableOpacity
                  key={pet.id}
                  onPress={() => setPetType(pet.id)}
                  className={`flex-1 rounded-2xl p-4 items-center border-2 ${
                    petType === pet.id
                      ? 'border-indigo-500 bg-indigo-500/10'
                      : 'border-slate-700 bg-slate-800/50'
                  }`}
                >
                  <Text className="text-4xl mb-2">{pet.emoji}</Text>
                  <Text className="text-white font-medium text-sm">{pet.name}</Text>
                  <Text className="text-slate-400 text-xs text-center mt-1">{pet.description}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Имя питомца */}
            <View className="gap-2">
              <Text className="text-slate-300 text-sm font-medium">
                Как назовём {PET_TYPES.find((p) => p.id === petType)?.name.toLowerCase()}а?
              </Text>
              <TextInput
                value={petName}
                onChangeText={setPetName}
                placeholder="Имя питомца"
                placeholderTextColor={COLORS.textMuted}
                className="bg-slate-800 rounded-xl px-4 py-4 text-white text-base"
                maxLength={20}
              />
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={handlePrevStep}
                className="flex-1 rounded-xl py-4 items-center bg-slate-700"
              >
                <Text className="text-white font-semibold">Назад</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleNextStep}
                disabled={!canProceedStep2}
                className={`flex-1 rounded-xl py-4 items-center ${
                  canProceedStep2 ? 'bg-indigo-500' : 'bg-slate-700'
                }`}
              >
                <Text className="text-white font-semibold">Далее</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Шаг 3: Приоритетные темы */}
        {step === 3 && (
          <View className="gap-6">
            <Text className="text-2xl font-bold text-white text-center">
              Что вам интереснее всего?
            </Text>
            <Text className="text-slate-400 text-center">
              Выберите 2-3 темы — они получат отметку «Рекомендовано» и +10% коинов
            </Text>

            {/* Список веток */}
            <View className="gap-2">
              {BRANCHES.map((branch) => (
                <TouchableOpacity
                  key={branch.id}
                  onPress={() => handleSelectBranch(branch.id)}
                  className={`rounded-xl p-4 border ${
                    selectedBranches.includes(branch.id)
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-slate-700 bg-slate-800/50'
                  }`}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="text-white font-medium">{branch.name}</Text>
                      {branch.description && (
                        <Text className="text-slate-400 text-xs mt-1">{branch.description}</Text>
                      )}
                    </View>
                    {selectedBranches.includes(branch.id) && (
                      <Text className="text-green-500 text-xl">✓</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={handlePrevStep}
                className="flex-1 rounded-xl py-4 items-center bg-slate-700"
              >
                <Text className="text-white font-semibold">Назад</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={!canSubmit || isSubmitting}
                className={`flex-1 rounded-xl py-4 items-center ${
                  canSubmit && !isSubmitting ? 'bg-green-500' : 'bg-slate-700'
                }`}
              >
                <Text className="text-white font-semibold">
                  {isSubmitting ? 'Создаём...' : 'Начать!'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}
