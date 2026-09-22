// Онбординг: интро, объяснение решений, выбор и настройка питомца, выбор
// направления, стартовый капитал (6 шагов, с адаптивностью)
//
// Шаги живут в src/components/onboarding/ — этот файл отвечает только за
// пошаговое состояние, общий футер навигации (точки-пагинация + кнопки) и
// создание профиля (репозитории, сторы). Профиль по §4.2 ТЗ — только имя
// питомца + внешний вид, без личных данных ребёнка, поэтому username здесь
// не собирается (см. LocalProfile.username).

import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { v4 as uuidv4 } from 'uuid';

import {
  getSkinsForPetType,
  PetType,
  Step1Intro,
  Step2Decisions,
  Step3PetType,
  Step4PetCustomize,
  Step5BranchChoice,
  Step6Reward,
} from '@/components/onboarding';
import { IconButton } from '@/components/ui';
import { describeDatabaseError, getDatabase } from '@/data/local/database';
import {
  getPetRepository,
  getProfileRepository,
  getSavingsRepository,
} from '@/data/local/repositories';
import {
  LocalProfile,
  STARTING_SAVINGS_BALANCE,
  STARTING_WALLET_BALANCE,
} from '@/domain/profile/Profile';
import { PetRecord } from '@/domain/repositories/PetRepository';
import { BASE_SAVINGS_BONUS_RATE, SavingsRecord } from '@/domain/savings/Savings';
import { useFeedback } from '@/lib/hooks/useFeedback';
import { STARTER_FURNITURE_ITEM_IDS, useShopStore } from '@/lib/hooks/useShop';
import { usePetStore } from '@/lib/stores/petStore';
import { usePreferencesStore } from '@/lib/stores/preferencesStore';
import { useUserStore } from '@/lib/stores/userStore';
import { Alert } from '@/lib/utils/alert';
import { createOnboardingStyles } from '@/styles/screens/auth/onboarding.styles';
import { useResponsive, useTheme } from '@/theme';
import { circleRadius, colorPalettes, spacing } from '@/theme/tokens';
import { createOnboardingStepsStyles } from '@/components/onboarding/onboardingSteps.styles';

type Step = 1 | 2 | 3 | 4 | 5 | 6;
const TOTAL_STEPS = 6;
const STEPS: Step[] = [1, 2, 3, 4, 5, 6];

export default function OnboardingScreen() {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const insets = useSafeAreaInsets();
  // Только экшены (стабильные ссылки, без реактивных полей) — онбординг не
  // читает из этих сторов ничего, что менялось бы у него на глазах.
  const setUser = useUserStore((s) => s.setUser);
  const setOnboarded = useUserStore((s) => s.setOnboarded);
  const setPet = usePetStore((s) => s.setPet);
  const setPriorityBranches = usePreferencesStore((s) => s.setPriorityBranches);
  const setPetType = usePreferencesStore((s) => s.setPetType);
  const setPetName = usePreferencesStore((s) => s.setPetName);
  const completeOnboarding = usePreferencesStore((s) => s.completeOnboarding);
  const { trigger, triggerHaptic } = useFeedback();

  const styles = createOnboardingStyles();
  const stepStyles = createOnboardingStepsStyles({ theme });

  const [step, setStep] = useState<Step>(1);
  const [petType, setPetTypeLocal] = useState<PetType>('robot');
  const [colorVariant, setColorVariant] = useState(0);
  const [petNameLocal, setPetNameLocal] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const backgroundGradient: [string, string] = isDark
    ? [theme.background, theme.surfaceLight]
    : [theme.background, colorPalettes.indigo[50]];

  const handleSelectBranch = (branchId: number) => {
    triggerHaptic('selection');
    setSelectedBranch(branchId);
  };

  const handleNextStep = () => {
    triggerHaptic('light');
    if (step < TOTAL_STEPS) {
      setStep((prev) => (prev + 1) as Step);
    }
  };

  const handlePrevStep = () => {
    triggerHaptic('light');
    if (step > 1) {
      setStep((prev) => (prev - 1) as Step);
    }
  };

  const handleSubmit = async () => {
    if (!petNameLocal.trim() || selectedBranch === null) {
      trigger('error');
      Alert.alert('Ошибка', 'Заполните все поля и выберите направление');
      return;
    }

    setIsSubmitting(true);
    trigger('lessonComplete');

    try {
      const userId = uuidv4();
      const createdAt = new Date().toISOString();
      const startingBalance = STARTING_WALLET_BALANCE;

      const profile: LocalProfile = {
        id: userId,
        username: null,
        petName: petNameLocal.trim(),
        petType,
        appearance: { bodyVariant: 0, colorVariant, accessory: null },
        liquidBalance: startingBalance,
        isDemo: false,
        createdAt,
      };

      // Пять отдельных INSERT/UPDATE подряд — на вебе (OPFS-бэкенд expo-sqlite)
      // серия отдельных auto-commit операций иногда ловит InvalidStateError
      // («state had changed since it was read from disk») из-за гонки в
      // синхронизации WAL-файла между ними. Единая транзакция не только чинит
      // это (один commit вместо пяти), но и правильно отражает смысл: создание
      // профиля должно быть атомарным — либо всё, либо ничего.
      let petRecord!: PetRecord;
      let savingsRecord!: SavingsRecord;

      const db = await getDatabase();
      await db.withTransactionAsync(async () => {
        await getProfileRepository().create(profile);
        petRecord = await getPetRepository().create({
          profileId: userId,
          mood: 100,
          lastMoodUpdatedAt: createdAt,
          baseRecoveryRate: 12.5, // §6.1 ТЗ: +12,5⚡/час — полное восстановление за 8 часов
        });

        savingsRecord = await getSavingsRepository().create(userId, BASE_SAVINGS_BONUS_RATE);
        await getSavingsRepository().update({
          ...savingsRecord,
          currentAmount: STARTING_SAVINGS_BALANCE,
        });
        await getSavingsRepository().addTransaction({
          savingsId: savingsRecord.id,
          operationType: 'deposit',
          amount: STARTING_SAVINGS_BALANCE,
          balanceAfter: STARTING_SAVINGS_BALANCE,
          periodId: null,
        });
      });

      setUser({
        id: userId,
        username: profile.username ?? profile.petName,
        liquid_balance: startingBalance,
        created_at: createdAt,
        is_demo: profile.isDemo,
      });
      setPet({
        id: petRecord.id,
        user_id: userId,
        mood: petRecord.mood,
        last_mood_updated_at: petRecord.lastMoodUpdatedAt,
        base_recovery_rate: petRecord.baseRecoveryRate,
      });
      setOnboarded(true);

      // Выбранный на шаге 4 скин достаётся бесплатно (variant 0 «Классический»
      // встроен и не требует владения — только 1/2 проходят через инвентарь).
      const chosenSkin = getSkinsForPetType(petType).find((s) => s.variant === colorVariant);
      if (chosenSkin?.itemId !== null && chosenSkin?.itemId !== undefined) {
        useShopStore.getState().addItem(chosenSkin.itemId, 1);
      }
      usePetStore.getState().setEquippedSkinVariant(colorVariant);

      // 6 базовых предметов комнаты (ноутбук/диван/копилка/окно/ковёр/скин
      // комнаты) — всегда во владении с первого дня, сразу расставлены по местам.
      STARTER_FURNITURE_ITEM_IDS.forEach((itemId) => {
        useShopStore.getState().addItem(itemId, 1);
        useShopStore.getState().equipFurniture(itemId);
      });

      setPriorityBranches([selectedBranch]);
      setPetType(petType);
      setPetName(petNameLocal.trim());
      completeOnboarding();

      router.replace('/(tabs)' as never);
    } catch (error) {
      console.error('[Onboarding] Ошибка:', error);
      trigger('error');
      Alert.alert('Ошибка', describeDatabaseError(error) ?? 'Не удалось создать профиль');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed =
    step === 4 ? petNameLocal.trim().length >= 2 : step === 5 ? selectedBranch !== null : true;

  const isLastStep = step === TOTAL_STEPS;
  const nextButtonLabel = isLastStep ? (isSubmitting ? 'Создаём...' : 'Скорее в хаб! →') : 'Дальше';

  return (
    <LinearGradient
      colors={backgroundGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      {/* Кнопка назад — вне ScrollView, фиксированная зона сверху (как футер
          снизу): всегда одна и та же высота/позиция, не часть центрируемого
          контента шага, поэтому не влияет на его центрирование и не скачет
          между шагами. Рендерим IconButton всегда (просто скрываем на шаге 1),
          а не условно — иначе сама зона меняла бы высоту при появлении кнопки. */}
      <View style={styles.header}>
        <View style={step > 1 ? styles.backButtonVisible : styles.backButtonHidden}>
          <IconButton icon="chevron-back" onPress={handlePrevStep} variant="outlined" />
        </View>
      </View>

      <View style={styles.scrollArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentColumn}>
            {step === 1 && <Step1Intro />}
            {step === 2 && <Step2Decisions />}
            {step === 3 && <Step3PetType petType={petType} onChangePetType={setPetTypeLocal} />}
            {step === 4 && (
              <Step4PetCustomize
                petType={petType}
                colorVariant={colorVariant}
                onChangeColorVariant={setColorVariant}
                petName={petNameLocal}
                onChangePetName={setPetNameLocal}
              />
            )}
            {step === 5 && (
              <Step5BranchChoice
                selectedBranch={selectedBranch}
                onSelectBranch={handleSelectBranch}
              />
            )}
            {step === 6 && <Step6Reward />}
          </View>
        </ScrollView>
      </View>

      {/* Футер вне ScrollView — гарантированно внизу экрана независимо от
          высоты контента текущего шага, с учётом home indicator/жестовой зоны. */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + scale(spacing.md) }]}>
        <View style={stepStyles.bottomDotsRow}>
          {STEPS.map((s) => (
            <View
              key={s}
              style={[
                stepStyles.stepDot,
                { width: scale(6), height: scale(6), borderRadius: circleRadius(scale(6)) },
                s === step && stepStyles.stepDotActive,
                s < step && stepStyles.stepDotCompleted,
              ]}
            />
          ))}
          <Text style={[stepStyles.bottomStepCaption, { fontSize: scaledFont('xxs') }]}>
            Шаг {step} из {TOTAL_STEPS}
          </Text>
        </View>

        <TouchableOpacity
          onPress={isLastStep ? handleSubmit : handleNextStep}
          disabled={!canProceed || (isLastStep && isSubmitting)}
          activeOpacity={0.8}
          style={[
            stepStyles.navButtonNext,
            canProceed ? stepStyles.navButtonNextEnabled : stepStyles.navButtonNextDisabled,
            { paddingVertical: scale(spacing.lg) },
          ]}
        >
          <Text style={[stepStyles.navButtonNextText, { fontSize: scaledFont('lg') }]}>
            {nextButtonLabel}
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}
