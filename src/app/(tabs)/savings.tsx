// src/app/(tabs)/savings.tsx
// Вкладка «Копилка» — накопления и финансовая цель (§11 ТЗ). По решению
// пользователя (27.09.2026) стоит в нижней панели на месте ИИ-помощника;
// копилка в комнате ведёт сюда же. Вёрстка — по макету «Копилка» (27.09):
// шапка с общей суммой, карточка главной цели и «корзины» денег:
//   «Хочу»  — кошелёк хаба, его тратит магазин;
//   «Коплю» — банк, копится на цель (снять в кошелёк можно — §11.4).
// Корзины «Нужно» из макета нет: резерва на обязательные траты в хабе нет
// (решение пользователя 27.09.2026 — строку убрать).

import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Text } from '@/components/ui/Text';
import { Ionicons } from '@expo/vector-icons';

import { useAppHeaderPadding } from '@/components/shared';
import {
  GoalPickerModal,
  SavingsAmountModal,
  SavingsAmountMode,
  SavingsBucketRow,
  SavingsGoalCard,
  SavingsHeader,
} from '@/components/savings';
import { PLAN_CATEGORY_COLORS, planCategoryTextColor } from '@/constants/planCategories';
import { BASE_SAVINGS_BONUS_RATE } from '@/domain/savings/Savings';
import { useFeedback } from '@/lib/hooks/useFeedback';
import { SHOP_CATALOG, ShopItem, useShopStore } from '@/lib/hooks/useShop';
import { useSavingsStore } from '@/lib/stores/savingsStore';
import { useUserStore } from '@/lib/stores/userStore';
import { Alert } from '@/lib/utils/alert';
import { useResponsive, useTheme } from '@/theme';
import { createSavingsStyles } from '@/styles/screens/tabs/_savings.styles';

export default function SavingsScreen() {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const headerPadding = useAppHeaderPadding();
  const { scale, scaledFont } = useResponsive();
  const { trigger, triggerHaptic } = useFeedback();
  const user = useUserStore((s) => s.user);
  const savings = useSavingsStore((s) => s.savings);
  const setTarget = useSavingsStore((s) => s.setTarget);
  const deposit = useSavingsStore((s) => s.deposit);
  const withdraw = useSavingsStore((s) => s.withdraw);
  // Живой бонус (копилки), не сохранённое при создании записи savings.bonusRate
  // — иначе купленная/подаренная копилка визуально ничего бы не меняла.
  const savingsBonusRateBonus = useShopStore((s) => s.getSavingsBonusRateBonus());
  const effectiveBonusRate = BASE_SAVINGS_BONUS_RATE + savingsBonusRateBonus;

  const styles = createSavingsStyles({ theme });

  const [amountMode, setAmountMode] = useState<SavingsAmountMode | null>(null);
  const [showGoalPicker, setShowGoalPicker] = useState(false);

  const walletBalance = user?.liquid_balance ?? 0;
  const saved = savings?.currentAmount ?? 0;
  const targetItem = savings?.targetItemId
    ? (SHOP_CATALOG.find((i) => i.id === savings.targetItemId) ?? null)
    : null;

  const handleAmountSubmit = async (amount: number): Promise<string | null> => {
    const result = amountMode === 'withdraw' ? await withdraw(amount) : await deposit(amount);
    if (!result.success) {
      trigger('error');
      return result.message;
    }
    trigger('purchase');
    triggerHaptic('success');
    setAmountMode(null);
    Alert.alert('Готово', result.message);
    return null;
  };

  const handlePickGoal = (item: ShopItem) => {
    triggerHaptic('selection');
    setTarget(item.id);
    setShowGoalPicker(false);
  };

  return (
    <View style={styles.container}>
      <View style={headerPadding}>
        <SavingsHeader help="savings" wallet={walletBalance} bank={saved} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { gap: scale(14) }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Цель накопления (§11.2–11.3) */}
        <SavingsGoalCard
          targetItem={targetItem}
          saved={saved}
          onDeposit={() => {
            triggerHaptic('light');
            setAmountMode('deposit');
          }}
          onChangeGoal={() => setShowGoalPicker(true)}
        />

        <SavingsBucketRow
          icon="gift-outline"
          color={PLAN_CATEGORY_COLORS.want}
          amountColor={planCategoryTextColor('want', isDark)}
          title="Хочу"
          description="Кошелёк — на еду и вещи из магазина"
          amount={walletBalance}
          action={{
            label: 'В магазин',
            variant: 'filled',
            onPress: () => {
              triggerHaptic('light');
              router.navigate('/(tabs)/shop' as never);
            },
          }}
        />

        <SavingsBucketRow
          icon="radio-button-on-outline"
          color={PLAN_CATEGORY_COLORS.save}
          amountColor={planCategoryTextColor('save', isDark)}
          title="Коплю"
          description="Копится на цель — в магазине не тратится"
          amount={saved}
          action={{
            label: 'Снять',
            variant: 'link',
            accessibilityLabel: 'Снять монеты из «Коплю» в кошелёк',
            onPress: () => {
              triggerHaptic('light');
              setAmountMode('withdraw');
            },
          }}
        />
      </ScrollView>

      <View style={styles.infoBanner}>
        <Ionicons name="information-circle-outline" size={scale(22)} color={theme.primary} />
        <Text style={[styles.infoBannerText, { fontSize: scaledFont('md') }]}>
          Магазин берёт монеты только из «Хочу» — «Коплю» копится на цель. За новые монеты в «Коплю»
          копилка добавляет +{effectiveBonusRate}%.
        </Text>
      </View>

      {amountMode && (
        <SavingsAmountModal
          mode={amountMode}
          available={amountMode === 'withdraw' ? saved : walletBalance}
          bonusRate={effectiveBonusRate}
          onSubmit={handleAmountSubmit}
          onClose={() => setAmountMode(null)}
        />
      )}

      <GoalPickerModal
        visible={showGoalPicker}
        onClose={() => setShowGoalPicker(false)}
        onPick={handlePickGoal}
        selectedId={savings?.targetItemId ?? null}
      />
    </View>
  );
}
