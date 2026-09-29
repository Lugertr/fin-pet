// app/(modal)/adventure-planning.tsx
// Планирование смены («Работа») в 2 шага:
//   1. выбор темы. Смена = один урок — следующий непройденный урок темы
//      (решение пользователя 28.09.2026); тема с начатым уроком выбрана сразу
//      (урок продолжится с того же места), пройденную тему выбрать нельзя. У
//      темы видна зарплата её урока — price из lessons.json × надбавка
//      предметов (решение 29.09.2026), поэтому тема выбирается первой;
//   2. зарплата делится на «Потратить» и «Коплю» (§7.3); в каждом поле
//      заливка и «N%» показывают долю бюджета. Нужное/желаемое здесь не
//      планируется — его показывает факт трат в урока.
// Бюджет смены — отдельный от хаба контур денег: его тратят события урока, а
// остаток в конце уходит в хаб («коплю» — в банк, остальное — в кошелёк).
// К доходу смены можно добавить монеты из своего кошелька (решение
// пользователя 28.09.2026): кнопки «Из кошелька», списываются при «Начать
// работу»; при досрочном завершении возвращаются целиком (не по доле урока).
// Пока скрыто (SHOW_WALLET_CONTRIBUTION, решение 29.09.2026).
// Открывается с хаба — тап по ноутбуку или кнопка «Начать работу».

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
import {
  AdventureAllocation,
  clampAllocationAmount,
  totalAllocation,
} from '@/domain/adventure/Adventure';
import { useFeedback } from '@/lib/hooks/useFeedback';
import { BRANCHES, useLessonsStore } from '@/lib/hooks/useLessons';
import { useShopStore } from '@/lib/hooks/useShop';
import { shiftSalary, useAdventureStore } from '@/lib/stores/adventureStore';
import { usePetStore } from '@/lib/stores/petStore';
import { useUserStore } from '@/lib/stores/userStore';
import { Alert } from '@/lib/utils/alert';
import { formatCoins, formatPrice } from '@/lib/utils/formatters';
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
    description: 'На события урока — нужное и желаемое',
    icon: 'wallet',
    color: PLAN_CATEGORY_COLORS.spend,
  },
  {
    key: 'savings',
    title: 'Коплю',
    description: 'В конце смены уйдёт в банк — на твою цель',
    icon: 'trending-up',
    color: PLAN_CATEGORY_COLORS.save,
  },
];

const STEP = 10;

/** «Добавить из кошелька» на планировании — пока не используется (решение
 * пользователя 29.09.2026); механика и хранение остаются. */
const SHOW_WALLET_CONTRIBUTION = false;

type WizardStep = 'branch' | 'allocate';

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
  const setWalletContribution = useAdventureStore((s) => s.setWalletContribution);
  const confirmPlan = useAdventureStore((s) => s.confirmPlan);
  const getBranchProgress = useLessonsStore((s) => s.getBranchProgress);
  const getNextLessonInBranch = useLessonsStore((s) => s.getNextLessonInBranch);
  const lessonStates = useLessonsStore((s) => s.lessonStates);

  const styles = createAdventurePlanningStyles({ theme });

  // Если приключения ещё нет вообще (первый заход) — создаём запись в
  // статусе 'planning'. Если уже есть (вернулись с хаба, не закончив
  // планирование) — startPlanning просто вернёт её как есть.
  useEffect(() => {
    if (!currentAdventure && user?.id) {
      startPlanning(user.id);
    }
  }, [currentAdventure, user?.id, startPlanning]);

  const [wizardStep, setWizardStep] = useState<WizardStep>('branch');
  const [amounts, setAmounts] = useState<AdventureAllocation>({
    mandatory: 0,
    optional: 0,
    savings: 0,
  });
  const [isConfirming, setIsConfirming] = useState(false);

  // Монеты из кошелька в бюджет смены — до «Начать работу» только здесь.
  const wallet = user?.liquid_balance ?? 0;
  const income = currentAdventure?.projectedIncome ?? 0;
  const [fromWallet, setFromWallet] = useState(currentAdventure?.walletContribution ?? 0);
  const available = income + fromWallet;
  const total = amounts.mandatory + amounts.optional + amounts.savings;
  const remainder = available - total;
  const canProceed = remainder >= 0 && total > 0;

  /** Бюджет уменьшился (другая тема, меньше из кошелька) — распределённое
   * урезается: сначала «Коплю», затем «Потратить». */
  const fitToBudget = (nextAvailable: number) =>
    setAmounts((prev) => {
      const excess = totalAllocation(prev) - nextAvailable;
      if (excess <= 0) return prev;
      const savings = Math.max(0, prev.savings - excess);
      const mandatory = Math.max(0, prev.mandatory - (excess - (prev.savings - savings)));
      return { ...prev, mandatory, savings };
    });

  /** Сколько взять из кошелька (0…весь кошелёк); распределённое не больше бюджета. */
  const changeFromWallet = (next: number) => {
    const value = Math.max(0, Math.min(next, wallet));
    setFromWallet(value);
    fitToBudget(income + value);
  };

  /** Зарплата смены по теме — для подписи на карточке темы: урок уже начат —
   * за оставшиеся этапы (смена платит только за свои, решение 29.09.2026).
   * Подписка на бонус предметов — чтобы подпись обновилась с покупкой. */
  useShopStore((s) => s.getTotalCoinBonusPercent());
  const salaryFor = (branchId: number) => shiftSalary(branchId);

  const setAmount = (key: 'mandatory' | 'savings', value: number) => {
    setAmounts((prev) => clampAllocationAmount(prev, key, value, available));
  };

  /** Доля бюджета в процентах (целое, 0–100) — для заливки поля. */
  const percentOf = (value: number) =>
    available > 0 ? Math.min(100, Math.round((value / available) * 100)) : 0;

  /** Урок начат, но не закончен — смена по этой теме продолжит его с того же места. */
  const hasStartedLesson = (branchId: number) => {
    const next = getNextLessonInBranch(branchId);
    const state = next ? lessonStates[next.id] : undefined;
    return Boolean(state && (state.readNodes.length > 0 || Object.keys(state.results).length > 0));
  };

  // Незаконченный урок — тема выбрана сразу («в следующий раз продолжит с того же места»).
  const planningBranchId =
    currentAdventure?.status === 'planning' ? currentAdventure.branchId : undefined;
  useEffect(() => {
    if (planningBranchId !== null) return;
    const started = BRANCHES.find((branch) => hasStartedLesson(branch.id));
    if (started) setBranch(started.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planningBranchId]);

  const handleSelectBranch = (branchId: number) => {
    if (!getNextLessonInBranch(branchId)) {
      Alert.alert(
        'Эта тема уже пройдена',
        'Все уроки этой темы пройдены — их можно перечитать на вкладке «Уроки». Для смены выбери другую тему.'
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
      setWalletContribution(fromWallet);
      const started = await confirmPlan();
      if (!started) {
        const walletNow = useUserStore.getState().user?.liquid_balance ?? 0;
        Alert.alert(
          'Не получилось начать',
          walletNow < fromWallet
            ? 'В кошельке меньше монет, чем ты добавил в бюджет. Убери лишнее кнопкой «−».'
            : 'В этой теме нет непройденных уроков — выбери другую.'
        );
        setIsConfirming(false);
        return;
      }
      // Сразу на экран смены (хаб остаётся под ним — «назад» вернёт туда).
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
          Смена №{currentAdventure.adventureNumber}
        </Text>
        <Text style={[styles.headerSubtitle, { fontSize: scaledFont('sm') }]}>
          {STEP_SUBTITLES[wizardStep]}
        </Text>
      </LinearGradient>

      {wizardStep === 'branch' && (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {BRANCHES.map((branch) => {
            const { completed, total: totalLessons } = getBranchProgress(branch.id);
            const isDone = totalLessons > 0 && completed === totalLessons;
            const isSelected = currentAdventure.branchId === branch.id;
            const nextLesson = getNextLessonInBranch(branch.id);
            const started = hasStartedLesson(branch.id);
            const accentColor = BRANCH_GRADIENTS[branch.id]?.[0] ?? theme.primary;

            return (
              <TouchableOpacity
                key={branch.id}
                onPress={() => handleSelectBranch(branch.id)}
                activeOpacity={0.8}
                style={[
                  styles.branchCard,
                  isSelected ? styles.branchCardSelected : styles.branchCardUnselected,
                  isDone && styles.branchCardDone,
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected, disabled: isDone }}
                accessibilityLabel={
                  isDone
                    ? `${branch.name}. Все уроки пройдены`
                    : `${branch.name}. ${started ? 'Продолжить' : 'Урок'}: ${nextLesson?.title ?? ''}`
                }
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
                  {isDone ? (
                    <View style={styles.branchDoneBadge}>
                      <Text style={[styles.branchDoneBadgeText, { fontSize: scaledFont('xs') }]}>
                        Все уроки пройдены ✓
                      </Text>
                    </View>
                  ) : (
                    nextLesson && (
                      <Text style={[styles.branchLessonText, { fontSize: scaledFont('sm') }]}>
                        {started ? 'Продолжить: ' : 'Урок: '}
                        {nextLesson.title}
                        {salaryFor(branch.id) !== null &&
                          ` · зарплата ${salaryFor(branch.id)} C${started ? ' за оставшиеся этапы' : ''}`}
                      </Text>
                    )
                  )}
                </View>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={scale(22)} color={theme.primary} />
                )}
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            onPress={() => {
              triggerHaptic('light');
              fitToBudget(available);
              setWizardStep('allocate');
            }}
            disabled={currentAdventure.branchId === null}
            activeOpacity={0.8}
            style={[
              styles.primaryButton,
              currentAdventure.branchId === null && styles.primaryButtonDisabled,
            ]}
          >
            <Text style={[styles.primaryButtonText, { fontSize: scaledFont('lg') }]}>
              Далее — распределить зарплату
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}
      {wizardStep === 'allocate' && (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity style={styles.backLink} onPress={() => setWizardStep('branch')}>
            <Ionicons name="chevron-back" size={scale(16)} color={theme.primary} />
            <Text style={[styles.backLinkText, { fontSize: scaledFont('sm') }]}>Назад к теме</Text>
          </TouchableOpacity>

          <Card padding="md" style={styles.availableCardSpacing}>
            <Text style={[styles.availableLabel, { fontSize: scaledFont('sm') }]}>
              Бюджет смены — зарплата за урок
            </Text>
            <CoinAmount
              amount={available}
              fontSize={scaledFont('hero')}
              textStyle={styles.availableValue}
            />
            {fromWallet > 0 && (
              <Text style={[styles.incomeBreakdown, { fontSize: scaledFont('sm') }]}>
                {income} C за смену + {fromWallet} C из кошелька
              </Text>
            )}
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

            {/* Свои монеты в бюджет смены: что не потратишь — вернётся. */}
            {SHOW_WALLET_CONTRIBUTION && (
              <View style={styles.walletBlock}>
                <Text style={[styles.walletTitle, { fontSize: scaledFont('md') }]}>
                  Добавить из кошелька
                </Text>
                <View style={styles.stepperRow}>
                  <TouchableOpacity
                    onPress={() => {
                      triggerHaptic('selection');
                      changeFromWallet(fromWallet - STEP);
                    }}
                    style={styles.stepperButton}
                    accessibilityRole="button"
                    accessibilityLabel={`Из кошелька: убрать ${STEP}`}
                  >
                    <Ionicons name="remove" size={scale(20)} color={theme.textPrimary} />
                  </TouchableOpacity>
                  <Text
                    style={[styles.walletValue, { fontSize: scaledFont('lg') }]}
                    accessibilityLabel={`Из кошелька: ${formatCoins(fromWallet)}`}
                  >
                    {fromWallet} C
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      triggerHaptic('selection');
                      changeFromWallet(fromWallet + STEP);
                    }}
                    style={styles.stepperButton}
                    accessibilityRole="button"
                    accessibilityLabel={`Из кошелька: добавить ${STEP}`}
                  >
                    <Ionicons name="add" size={scale(20)} color={theme.textPrimary} />
                  </TouchableOpacity>
                </View>
                <Text style={[styles.walletCaption, { fontSize: scaledFont('sm') }]}>
                  В кошельке {formatPrice(wallet)}. Что не потратишь — вернётся после смены.
                </Text>
              </View>
            )}
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
            onPress={handleConfirm}
            disabled={!canProceed || isConfirming}
            activeOpacity={0.8}
            style={[
              styles.primaryButton,
              (!canProceed || isConfirming) && styles.primaryButtonDisabled,
            ]}
          >
            <Text style={[styles.primaryButtonText, { fontSize: scaledFont('lg') }]}>
              {isConfirming ? 'Начинаем...' : 'Начать смену'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}
