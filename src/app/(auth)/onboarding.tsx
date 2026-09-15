// Онбординг: выбор питомца, имени и приоритетных тем (с адаптивностью)
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { v4 as uuidv4 } from 'uuid';

import { useFeedback } from '@/lib/hooks/useFeedback';
import { BRANCHES } from '@/lib/hooks/useLessons';
import { usePetStore } from '@/lib/stores/petStore';
import { usePreferences } from '@/lib/stores/preferencesStore';
import { useUserStore } from '@/lib/stores/userStore';
import { createOnboardingStyles } from '@/styles/screens/auth/onboarding.styles';
import { useResponsive, useTheme } from '@/theme';
import { spacing } from '@/theme/tokens';

const PET_TYPES = [
  {
    id: 'robot' as const,
    name: 'Робот',
    emoji: '🤖',
    description: 'Логичный и точный',
    gradient: ['#10B981', '#06B6D4'] as [string, string],
  },
  {
    id: 'dragon' as const,
    name: 'Дракончик',
    emoji: '🐉',
    description: 'Мудрый и спокойный',
    gradient: ['#06B6D4', '#10B981'] as [string, string],
  },
  {
    id: 'cat' as const,
    name: 'Кот',
    emoji: '🐱',
    description: 'Игривый и любопытный',
    gradient: ['#F59E0B', '#F97316'] as [string, string],
  },
];

type PetType = (typeof PET_TYPES)[number]['id'];

export default function OnboardingScreen() {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const { scale, scaledFont } = useResponsive(); // ✅ Используем scale и scaledFont
  const { setUser, setOnboarded } = useUserStore();
  const { setPet } = usePetStore();
  const { setPriorityBranches, setPetType, setPetName, completeOnboarding } = usePreferences();
  const { trigger, triggerHaptic } = useFeedback();

  const styles = createOnboardingStyles({ theme });

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [petType, setPetTypeLocal] = useState<PetType>('robot');
  const [petNameLocal, setPetNameLocal] = useState('');
  const [username, setUsername] = useState('');
  const [selectedBranches, setSelectedBranches] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedPet = PET_TYPES.find((p) => p.id === petType);

  const backgroundGradient: [string, string, string] = isDark
    ? ['#0F172A', '#1E1B4B', '#312E81']
    : ['#F8FAFC', '#E2E8F0', '#DBEAFE'];

  const handleSelectBranch = (branchId: number) => {
    triggerHaptic('selection');
    setSelectedBranches((prev) => {
      if (prev.includes(branchId)) {
        return prev.filter((id) => id !== branchId);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, branchId];
    });
  };

  const handleNextStep = () => {
    triggerHaptic('light');
    if (step < 3) {
      setStep((prev) => (prev + 1) as 1 | 2 | 3);
    }
  };

  const handlePrevStep = () => {
    triggerHaptic('light');
    if (step > 1) {
      setStep((prev) => (prev - 1) as 1 | 2 | 3);
    }
  };

  const handleSubmit = async () => {
    if (!username.trim() || !petNameLocal.trim() || selectedBranches.length < 2) {
      trigger('error');
      Alert.alert('Ошибка', 'Заполните все поля и выберите минимум 2 темы');
      return;
    }

    setIsSubmitting(true);
    trigger('lessonComplete');

    try {
      const userId = uuidv4();
      const newUser = {
        id: userId,
        username: username.trim(),
        liquid_balance: 500,
        created_at: new Date().toISOString(),
      };

      const newPet = {
        id: 1,
        user_id: userId,
        mood: 100,
        last_mood_updated_at: new Date().toISOString(),
        base_recovery_rate: 5,
      };

      setUser(newUser);
      setPet(newPet);
      setOnboarded(true);

      setPriorityBranches(selectedBranches);
      setPetType(petType);
      setPetName(petNameLocal.trim());
      completeOnboarding();

      router.replace('/(tabs)' as never);
    } catch (error) {
      console.error('[Onboarding] Ошибка:', error);
      trigger('error');
      Alert.alert('Ошибка', 'Не удалось создать профиль');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceedStep1 = username.trim().length >= 3;
  const canProceedStep2 = petNameLocal.trim().length >= 2;
  const canSubmit = selectedBranches.length >= 2;

  return (
    <LinearGradient
      colors={backgroundGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { padding: scale(spacing.xxl) }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Прогресс-бар */}
        <View
          style={[
            styles.progressRow,
            { marginBottom: scale(spacing.xxxl), gap: scale(spacing.sm) },
          ]}
        >
          {[1, 2, 3].map((s) => (
            <View
              key={s}
              style={[
                styles.progressDot,
                s === step && [styles.progressDotActive, { width: scale(32) }],
                s < step && styles.progressDotCompleted,
              ]}
            />
          ))}
        </View>

        {/* Шаг 1: Имя пользователя */}
        {step === 1 && (
          <Animated.View entering={FadeInRight.duration(300)}>
            <View style={[styles.welcomeContainer, { marginBottom: scale(spacing.xxxl) }]}>
              <Text style={{ fontSize: scale(72), marginBottom: scale(spacing.lg) }}>🚀</Text>
              <Text
                style={[
                  styles.welcomeTitle,
                  { fontSize: scaledFont('hero'), marginBottom: scale(spacing.sm) },
                ]}
              >
                Добро пожаловать в{'\n'}
                <Text style={styles.welcomeAccent}>ФинСпутник!</Text>
              </Text>
              <Text style={[styles.welcomeSubtitle, { fontSize: scaledFont('lg') }]}>
                Ваш помощник в мире финансовой грамотности
              </Text>
            </View>

            <View style={[styles.inputContainer, { marginBottom: scale(spacing.xxl) }]}>
              <Text
                style={[
                  styles.inputLabel,
                  { fontSize: scaledFont('md'), marginBottom: scale(spacing.sm) },
                ]}
              >
                Как вас называть?
              </Text>
              <TextInput
                value={username}
                onChangeText={setUsername}
                placeholder="Введите ваше имя"
                placeholderTextColor={theme.textMuted}
                style={[styles.inputField, { fontSize: scaledFont('lg') }]}
                maxLength={30}
              />
            </View>

            <TouchableOpacity
              onPress={handleNextStep}
              disabled={!canProceedStep1}
              activeOpacity={0.8}
              style={[
                styles.navButtonNext,
                canProceedStep1 ? styles.navButtonNextEnabled : styles.navButtonNextDisabled,
                { paddingVertical: scale(spacing.lg) },
              ]}
            >
              <Text style={[styles.navButtonNextText, { fontSize: scaledFont('lg') }]}>Далее</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Шаг 2: Выбор питомца */}
        {step === 2 && (
          <Animated.View entering={FadeInRight.duration(300)}>
            <Text
              style={[
                styles.stepTitle,
                { fontSize: scaledFont('xxl'), marginBottom: scale(spacing.sm) },
              ]}
            >
              Выберите помощника
            </Text>
            <Text
              style={[
                styles.stepSubtitle,
                { fontSize: scaledFont('md'), marginBottom: scale(spacing.xxl) },
              ]}
            >
              Он будет сопровождать вас в обучении
            </Text>

            {/* Карточки питомцев */}
            <View
              style={[styles.petsRow, { gap: scale(spacing.md), marginBottom: scale(spacing.xxl) }]}
            >
              {PET_TYPES.map((pet) => (
                <TouchableOpacity
                  key={pet.id}
                  onPress={() => {
                    triggerHaptic('selection');
                    setPetTypeLocal(pet.id);
                  }}
                  activeOpacity={0.8}
                  style={[styles.petCard, petType === pet.id && styles.petCardSelected]}
                >
                  <LinearGradient
                    colors={pet.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.petCardInner, { padding: scale(spacing.lg) }]}
                  >
                    <Text style={{ fontSize: scale(48), marginBottom: scale(spacing.sm) }}>
                      {pet.emoji}
                    </Text>
                    <Text
                      style={[
                        styles.petName,
                        { fontSize: scaledFont('md'), marginBottom: scale(spacing.xs) },
                      ]}
                    >
                      {pet.name}
                    </Text>
                    <Text style={[styles.petDescription, { fontSize: scaledFont('xs') }]}>
                      {pet.description}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>

            {/* Имя питомца */}
            <View style={[styles.inputContainer, { marginBottom: scale(spacing.xxl) }]}>
              <Text
                style={[
                  styles.inputLabel,
                  { fontSize: scaledFont('md'), marginBottom: scale(spacing.sm) },
                ]}
              >
                Как назовём {selectedPet?.name.toLowerCase()}а?
              </Text>
              <TextInput
                value={petNameLocal}
                onChangeText={setPetNameLocal}
                placeholder="Имя питомца"
                placeholderTextColor={theme.textMuted}
                style={[styles.inputField, { fontSize: scaledFont('lg') }]}
                maxLength={20}
              />
            </View>

            <View style={[styles.navButtonsRow, { gap: scale(spacing.md) }]}>
              <TouchableOpacity
                onPress={handlePrevStep}
                activeOpacity={0.8}
                style={[styles.navButtonBack, { paddingVertical: scale(spacing.lg) }]}
              >
                <Text style={[styles.navButtonBackText, { fontSize: scaledFont('lg') }]}>
                  Назад
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleNextStep}
                disabled={!canProceedStep2}
                activeOpacity={0.8}
                style={[
                  styles.navButtonNext,
                  canProceedStep2 ? styles.navButtonNextEnabled : styles.navButtonNextDisabled,
                  { paddingVertical: scale(spacing.lg) },
                ]}
              >
                <Text style={[styles.navButtonNextText, { fontSize: scaledFont('lg') }]}>
                  Далее
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        {/* Шаг 3: Приоритетные темы */}
        {step === 3 && (
          <Animated.View entering={FadeInRight.duration(300)}>
            <Text
              style={[
                styles.stepTitle,
                { fontSize: scaledFont('xxl'), marginBottom: scale(spacing.sm) },
              ]}
            >
              Что вам интереснее всего?
            </Text>
            <Text
              style={[
                styles.stepSubtitle,
                { fontSize: scaledFont('md'), marginBottom: scale(spacing.xxl) },
              ]}
            >
              Выберите 2-3 темы — они получат отметку «Рекомендовано» и +10% коинов за уроки
            </Text>

            {/* Список веток */}
            <View
              style={[
                styles.branchesContainer,
                { gap: scale(spacing.sm), marginBottom: scale(spacing.xxl) },
              ]}
            >
              {BRANCHES.map((branch) => {
                const isSelected = selectedBranches.includes(branch.id);
                return (
                  <TouchableOpacity
                    key={branch.id}
                    onPress={() => handleSelectBranch(branch.id)}
                    activeOpacity={0.8}
                    style={[
                      styles.branchCard,
                      isSelected ? styles.branchCardSelected : styles.branchCardUnselected,
                      { padding: scale(spacing.lg) },
                    ]}
                  >
                    <View style={styles.branchInfo}>
                      <Text style={[styles.branchName, { fontSize: scaledFont('lg') }]}>
                        {branch.name}
                      </Text>
                      {branch.description && (
                        <Text
                          style={[
                            styles.branchDescription,
                            { fontSize: scaledFont('sm'), marginTop: scale(spacing.xxs) },
                          ]}
                        >
                          {branch.description}
                        </Text>
                      )}
                    </View>
                    {isSelected && (
                      <View
                        style={[
                          styles.branchCheckmark,
                          { width: scale(24), height: scale(24), borderRadius: scale(12) },
                        ]}
                      >
                        <Ionicons name="checkmark" size={scale(16)} color="#FFFFFF" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Информационный баннер */}
            <View
              style={[
                styles.infoBanner,
                {
                  padding: scale(spacing.lg),
                  gap: scale(spacing.sm),
                  marginBottom: scale(spacing.xxl),
                },
              ]}
            >
              <Ionicons name="sparkles" size={scale(20)} color={theme.primary} />
              <Text style={[styles.infoBannerText, { fontSize: scaledFont('sm') }]}>
                Приоритетные темы дают +10% коинов за каждый пройденный урок!
              </Text>
            </View>

            <View style={[styles.navButtonsRow, { gap: scale(spacing.md) }]}>
              <TouchableOpacity
                onPress={handlePrevStep}
                activeOpacity={0.8}
                style={[styles.navButtonBack, { paddingVertical: scale(spacing.lg) }]}
              >
                <Text style={[styles.navButtonBackText, { fontSize: scaledFont('lg') }]}>
                  Назад
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={!canSubmit || isSubmitting}
                activeOpacity={0.8}
                style={[
                  styles.navButtonNext,
                  canSubmit && !isSubmitting
                    ? styles.startButtonEnabled
                    : styles.startButtonDisabled,
                  { paddingVertical: scale(spacing.lg) },
                ]}
              >
                <Text style={[styles.navButtonNextText, { fontSize: scaledFont('lg') }]}>
                  {isSubmitting ? 'Создаём...' : 'Начать! 🚀'}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}
