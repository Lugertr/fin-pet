// app/(modal)/adventure-planning.tsx
// Планирование «Приключения» в 2 шага (решение пользователя 27.09.2026):
//   1. бюджет приключения делится на «Потратить» и «Коплю» (§7.3); в каждом
//      поле заливка и «N%» показывают долю бюджета. Нужное/желаемое здесь
//      не планируется — его показывает факт трат событий;
//   2. выбор одной из тем обучения.
// Бюджет приключения — отдельный от хаба контур денег: его тратят события, а
// остаток в конце уходит в хаб («коплю» — в банк, остальное — в кошелёк).
// Открывается с хаба — тап по ноутбуку или кнопка «Начать приключение».

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { Text, TextInput } from '@/components/ui/Text';

import { BRANCH_GRADIENTS, BRANCH_ICONS } from '@/components/lessons/branchVisuals';
import { AppHeaderStats, CoinAmount, useAppHeaderPadding } from '@/components/shared';
import { AnimatedFill, Card } from '@/components/ui';
import { PLAN_CATEGORY_COLORS } from '@/constants/planCategories';
import { AdventureAllocation, clampAllocationAmount } from '@/domain/adventure/Adventure';
import { useFeedback } from '@/lib/hooks/useFeedback';
import { BRANCHES, useLessonsStore } from '@/lib/hooks/useLessons';
import { useAdventureStore } from '@/lib/stores/adventureStore';
import { usePetStore } from '@/lib/stores/petStore';
import { useUserStore } from '@/lib/stores/userStore';
import { Alert } from '@/lib/utils/alert';
import { formatCoins } from '@/lib/utils/formatters';
import { createAdventurePlanningStyles } from '@/styles/screens/modal/_adventure-planning.styles';
import { useResponsive, useTheme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import type { IconName } from '@/types/icons';

/** Две категории плана. «Потратить» хранится в plan.mandatory (optional = 0),
 * см. plannedSpend в domain/adventure/Adventure.ts. */
const CATEGORIES: {
  key: 'mandatory' | 'savings';
  title: string;
  description: string;
  icon: IconName;
  color: string;
}[] = [
  {
    key: 'mandatory',
    title: 'Потратить',
    description: 'На события приключения — нужное и желаемое',
    icon: 'wallet',
    color: PLAN_CATEGORY_COLORS.spend,
  },
  {
    key: 'savings',
    title: 'Коплю',
    description: 'В конце приключения уйдёт в банк — на твою цель',
    icon: 'trending-up',
    color: PLAN_CATEGORY_COLORS.save,
  },
];

const STEP = 10;

type WizardStep = 'allocate' | 'branch';

const STEP_SUBTITLES: Record<WizardStep, string> = {
  allocate: 'Сколько потратить, а сколько отложить?',
  branch: 'Что тебе интересней всего узнать?',
};

export default function AdventurePlanningScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const headerPadding = useAppHeaderPadding();
  const { trigger, triggerHaptic } = useFeedback();
  const user = useUserStore((s) => s.user);
  const currentMood = usePetStore((s) => s.currentMood);
  const currentAdventure = useAdventureStore((s) => s.currentAdventure);
  const startPlanning = useAdventureStore((s) => s.startPlanning);
  const setBranch = useAdventureStore((s) => s.setBranch);
  const updatePlan = useAdventureStore((s) => s.updatePlan);
  const confirmPlan = useAdventureStore((s) => s.confirmPlan);
  const getBranchProgress = useLessonsStore((s) => s.getBranchProgress);

  const styles = createAdventurePlanningStyles({ theme });

  // Если приключения ещё нет вообще (первый заход) — создаём запись в
  // статусе 'planning'. Если уже есть (вернулись с хаба, не закончив
  // планирование) — startPlanning просто вернёт её как есть.
  useEffect(() => {
    if (!currentAdventure && user?.id) {
      startPlanning(user.id);
    }
  }, [currentAdventure, user?.id, startPlanning]);

  const [wizardStep, setWizardStep] = useState<WizardStep>('allocate');
  const [amounts, setAmounts] = useState<AdventureAllocation>({
    mandatory: 0,
    optional: 0,
    savings: 0,
  });
  const [isConfirming, setIsConfirming] = useState(false);

  const available = currentAdventure?.projectedIncome ?? 0;
  const total = amounts.mandatory + amounts.optional + amounts.savings;
  const remainder = available - total;
  const canProceed = remainder >= 0 && total > 0;

  const setAmount = (key: 'mandatory' | 'savings', value: number) => {
    setAmounts((prev) => clampAllocationAmount(prev, key, value, available));
  };

  /** Доля бюджета в процентах (целое, 0–100) — для заливки поля. */
  const percentOf = (value: number) =>
    available > 0 ? Math.min(100, Math.round((value / available) * 100)) : 0;

  const handleSelectBranch = (branchId: number) => {
    const { completed, total: totalLessons } = getBranchProgress(branchId);
    const alreadyDone = totalLessons > 0 && completed === totalLessons;

    if (alreadyDone) {
      Alert.alert(
        'Эта тема уже пройдена',
        'Все уроки этой темы пройдены. Задания в приключении будут случайными вопросами на повторение. Выбрать всё равно?',
        [
          { text: 'Отмена', style: 'cancel' },
          {
            text: 'Выбрать',
            onPress: () => {
              triggerHaptic('selection');
              setBranch(branchId);
            },
          },
        ]
      );
      return;
    }

    triggerHaptic('selection');
    setBranch(branchId);
  };

  const handleConfirm = async () => {
    if (!currentAdventure || currentAdventure.branchId === null || isConfirming) return;
    triggerHaptic('medium');
    trigger('purchase');
    setIsConfirming(true);
    try {
      // Итоговый план — 3 направления: надо / хочу / коплю.
      updatePlan({ mandatory: amounts.mandatory, optional: 0, savings: amounts.savings });
      await confirmPlan();
      // Сразу на экран приключения (хаб остаётся под ним — «назад» вернёт туда).
      router.replace('/(modal)/adventure' as never);
    } catch (error) {
      console.error('[AdventurePlanning] Не удалось подтвердить план:', error);
      trigger('error');
      Alert.alert('Ошибка', 'Не удалось сохранить план. Попробуй ещё раз.');
      setIsConfirming(false);
    }
  };

  const renderStepper = (
    category: (typeof CATEGORIES)[number],
    value: number,
    onChange: (next: number) => void
  ) => {
    const percent = percentOf(value);
    return (
      <View style={styles.stepperRow}>
        <TouchableOpacity
          onPress={() => {
            triggerHaptic('selection');
            onChange(value - STEP);
          }}
          style={styles.stepperButton}
          accessibilityRole="button"
          accessibilityLabel={`${category.title}: уменьшить на ${STEP}`}
        >
          <Ionicons name="remove" size={scale(20)} color={theme.textPrimary} />
        </TouchableOpacity>
        {/* Поле с заливкой: ширина полоски = доля бюджета в этом направлении.
            Цвет — только оформление, долю дублирует подпись «N%» (§23). */}
        <View style={styles.stepperField}>
          <AnimatedFill
            percent={percent}
            color={withAlpha(category.color, 0.28)}
            style={styles.stepperFill}
          />
          <TextInput
            value={String(value)}
            onChangeText={(text) => onChange(parseInt(text, 10) || 0)}
            keyboardType="numeric"
            accessibilityLabel={`${category.title}: ${formatCoins(value)}, ${percent}% бюджета`}
            style={[styles.stepperInput, { fontSize: scaledFont('lg') }]}
          />
          <Text style={[styles.stepperPercent, { fontSize: scaledFont('sm') }]}>{percent}%</Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            triggerHaptic('selection');
            onChange(value + STEP);
          }}
          style={styles.stepperButton}
          accessibilityRole="button"
          accessibilityLabel={`${category.title}: увеличить на ${STEP}`}
        >
          <Ionicons name="add" size={scale(20)} color={theme.textPrimary} />
        </TouchableOpacity>
      </View>
    );
  };

  if (!currentAdventure) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={headerPadding}>
        <AppHeaderStats
          help="adventure_planning"
          energy={currentMood}
          coins={user?.liquid_balance ?? 0}
          leftAction={{
            icon: 'arrow-back',
            onPress: () => router.back(),
            accessibilityLabel: 'Назад',
          }}
        />
      </View>

      <LinearGradient
        colors={theme.gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.adventureInfoBar}
      >
        <Text style={[styles.headerTitle, { fontSize: scaledFont('xl') }]}>
          Приключение №{currentAdventure.adventureNumber}
        </Text>
        <Text style={[styles.headerSubtitle, { fontSize: scaledFont('sm') }]}>
          {STEP_SUBTITLES[wizardStep]}
        </Text>
      </LinearGradient>

      {wizardStep === 'allocate' && (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Card padding="md" style={styles.availableCardSpacing}>
            <Text style={[styles.availableLabel, { fontSize: scaledFont('sm') }]}>
              Бюджет приключения
            </Text>
            <CoinAmount
              amount={available}
              fontSize={scaledFont('hero')}
              textStyle={styles.availableValue}
            />
            <CoinAmount
              amount={remainder}
              prefix="Не распределено: "
              fontSize={scaledFont('md')}
              style={styles.remainderRow}
              textStyle={[
                styles.remainderValue,
                { color: remainder >= 0 ? theme.success : theme.error },
              ]}
            />
          </Card>

          {CATEGORIES.map((category) => (
            <Card key={category.key} padding="md" style={styles.categoryCardSpacing}>
              <View style={styles.categoryHeaderRow}>
                <Ionicons name={category.icon} size={scale(20)} color={category.color} />
                <Text style={[styles.categoryTitle, { fontSize: scaledFont('md') }]}>
                  {category.title}
                </Text>
              </View>
              <Text style={[styles.categoryDescription, { fontSize: scaledFont('xs') }]}>
                {category.description}
              </Text>
              {renderStepper(category, amounts[category.key], (next) =>
                setAmount(category.key, next)
              )}
            </Card>
          ))}

          <TouchableOpacity
            onPress={() => {
              triggerHaptic('light');
              setWizardStep('branch');
            }}
            disabled={!canProceed}
            activeOpacity={0.8}
            style={[styles.primaryButton, !canProceed && styles.primaryButtonDisabled]}
          >
            <Text style={[styles.primaryButtonText, { fontSize: scaledFont('lg') }]}>
              Далее — выбрать тему
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {wizardStep === 'branch' && (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity style={styles.backLink} onPress={() => setWizardStep('allocate')}>
            <Ionicons name="chevron-back" size={scale(16)} color={theme.primary} />
            <Text style={[styles.backLinkText, { fontSize: scaledFont('sm') }]}>Назад к плану</Text>
          </TouchableOpacity>

          {BRANCHES.map((branch) => {
            const { completed, total: totalLessons } = getBranchProgress(branch.id);
            const isDone = totalLessons > 0 && completed === totalLessons;
            const isSelected = currentAdventure.branchId === branch.id;
            const accentColor = BRANCH_GRADIENTS[branch.id]?.[0] ?? theme.primary;

            return (
              <TouchableOpacity
                key={branch.id}
                onPress={() => handleSelectBranch(branch.id)}
                activeOpacity={0.8}
                style={[
                  styles.branchCard,
                  isSelected ? styles.branchCardSelected : styles.branchCardUnselected,
                ]}
              >
                <View style={[styles.branchIconBox, { backgroundColor: `${accentColor}20` }]}>
                  <Ionicons
                    name={BRANCH_ICONS[branch.id] ?? 'book'}
                    size={scale(20)}
                    color={accentColor}
                  />
                </View>
                <View style={styles.branchInfo}>
                  <Text style={[styles.branchName, { fontSize: scaledFont('md') }]}>
                    {branch.name}
                  </Text>
                  {isDone && (
                    <View style={styles.branchDoneBadge}>
                      <Text style={[styles.branchDoneBadgeText, { fontSize: scaledFont('xxs') }]}>
                        Пройдено ✓
                      </Text>
                    </View>
                  )}
                </View>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={scale(22)} color={theme.primary} />
                )}
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            onPress={handleConfirm}
            disabled={currentAdventure.branchId === null || isConfirming}
            activeOpacity={0.8}
            style={[
              styles.primaryButton,
              (currentAdventure.branchId === null || isConfirming) && styles.primaryButtonDisabled,
            ]}
          >
            <Text style={[styles.primaryButtonText, { fontSize: scaledFont('lg') }]}>
              {isConfirming ? 'Начинаем...' : 'Начать приключение'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}
