// app/(modal)/budget-planning.tsx
// Планирование бюджета периода (§7.3 ТЗ): распределение доступной суммы
// по 3 направлениям до начала «тела» периода. Открывается автоматически
// с хаба, пока currentPeriod.status === 'planning'.

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { Card } from '@/components/ui';
import { useFeedback } from '@/lib/hooks/useFeedback';
import { Alert } from '@/lib/utils/alert';
import { usePeriodStore } from '@/lib/stores/periodStore';
import { useUserStore } from '@/lib/stores/userStore';
import { createBudgetPlanningStyles } from '@/styles/screens/modal/_budget-planning.styles';
import { useResponsive, useTheme } from '@/theme';
import { colorPalettes } from '@/theme/tokens';

const CATEGORIES = [
  {
    key: 'mandatory' as const,
    title: 'Обязательное',
    description: 'Еда для питомца — без неё энергия не восстановится полностью',
    icon: 'restaurant' as const,
    color: colorPalettes.red[500],
  },
  {
    key: 'optional' as const,
    title: 'Желаемое',
    description: 'Игрушки, декор, скины',
    icon: 'sparkles' as const,
    color: colorPalettes.amber[500],
  },
  {
    key: 'savings' as const,
    title: 'Накопления',
    description: 'На финансовую цель',
    icon: 'trending-up' as const,
    color: colorPalettes.emerald[500],
  },
];

export default function BudgetPlanningScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const { trigger, triggerHaptic } = useFeedback();
  const user = useUserStore((s) => s.user);
  const currentPeriod = usePeriodStore((s) => s.currentPeriod);
  const updatePlan = usePeriodStore((s) => s.updatePlan);
  const confirmPlan = usePeriodStore((s) => s.confirmPlan);

  const styles = createBudgetPlanningStyles({ theme });

  const available = user?.liquid_balance ?? 0;
  const [amounts, setAmounts] = useState({ mandatory: 0, optional: 0, savings: 0 });
  const [isConfirming, setIsConfirming] = useState(false);

  const total = amounts.mandatory + amounts.optional + amounts.savings;
  const remainder = available - total;
  const canConfirm = remainder >= 0 && total > 0;

  const setAmount = (key: keyof typeof amounts, value: number) => {
    // Клампим не просто в [0, available] для одной категории (тогда каждую
    // из трёх можно было независимо докрутить до available и уйти в общий
    // минус, кнопка "+" продолжала работать даже когда остаток уже 0) — а в
    // [0, available - сумма двух других категорий], чтобы общая сумма по
    // трём категориям физически не могла превысить доступный баланс.
    setAmounts((prev) => {
      const otherTotal = prev.mandatory + prev.optional + prev.savings - prev[key];
      const maxForKey = Math.max(0, available - otherTotal);
      const clamped = Math.max(0, Math.min(value, maxForKey));
      return { ...prev, [key]: clamped };
    });
  };

  const handleConfirm = async () => {
    if (!canConfirm || !currentPeriod || isConfirming) return;
    triggerHaptic('medium');
    trigger('purchase');
    setIsConfirming(true);
    try {
      updatePlan(amounts);
      // Дожидаемся записи в БД и смены статуса на 'active' — иначе хаб
      // успевает смонтироваться, увидеть ещё 'planning' и тут же вернуть
      // назад на этот экран (выглядит как "нажал — ничего не произошло").
      await confirmPlan();
      router.replace('/(tabs)' as never);
    } catch (error) {
      console.error('[BudgetPlanning] Не удалось подтвердить план:', error);
      trigger('error');
      Alert.alert('Ошибка', 'Не удалось сохранить план. Попробуйте ещё раз.');
      setIsConfirming(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={theme.gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <Text style={[styles.headerTitle, { fontSize: scaledFont('xl') }]}>
          Период №{currentPeriod?.periodNumber ?? 1}
        </Text>
        <Text style={[styles.headerSubtitle, { fontSize: scaledFont('sm') }]}>
          Распредели доступные монеты, прежде чем начать
        </Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Card padding="md" style={styles.availableCardSpacing}>
          <Text style={[styles.availableLabel, { fontSize: scaledFont('sm') }]}>
            Доступно для распределения
          </Text>
          <Text style={[styles.availableValue, { fontSize: scaledFont('hero') }]}>
            {available} ⭐
          </Text>
          <Text
            style={[
              styles.remainderValue,
              { fontSize: scaledFont('md'), color: remainder >= 0 ? theme.success : theme.error },
            ]}
          >
            Остаток: {remainder} ⭐
          </Text>
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
            <View style={styles.stepperRow}>
              <TouchableOpacity
                onPress={() => {
                  triggerHaptic('selection');
                  setAmount(category.key, amounts[category.key] - 10);
                }}
                style={styles.stepperButton}
              >
                <Ionicons name="remove" size={scale(20)} color={theme.textPrimary} />
              </TouchableOpacity>
              <TextInput
                value={String(amounts[category.key])}
                onChangeText={(text) => setAmount(category.key, parseInt(text, 10) || 0)}
                keyboardType="numeric"
                style={[styles.stepperInput, { fontSize: scaledFont('lg') }]}
              />
              <TouchableOpacity
                onPress={() => {
                  triggerHaptic('selection');
                  setAmount(category.key, amounts[category.key] + 10);
                }}
                style={styles.stepperButton}
              >
                <Ionicons name="add" size={scale(20)} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>
          </Card>
        ))}

        <TouchableOpacity
          onPress={handleConfirm}
          disabled={!canConfirm || isConfirming}
          activeOpacity={0.8}
          style={[
            styles.confirmButton,
            (!canConfirm || isConfirming) && styles.confirmButtonDisabled,
          ]}
        >
          <Text style={[styles.confirmButtonText, { fontSize: scaledFont('lg') }]}>
            {isConfirming ? 'Сохраняем...' : 'Подтвердить план'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
