// src/app/(tabs)/savings.tsx
// Вкладка «Копилка» — накопления и финансовая цель (§11 ТЗ). По решению
// пользователя (27.09.2026) стоит в нижней панели на месте ИИ-помощника;
// копилка в комнате ведёт сюда же. Вёрстка — по макету «Копилка» (27.09):
// шапка с общей суммой, затем
//   «Коплю» — карточка цели: банк копится на цель (снять в кошелёк можно —
//             §11.4), там же остаток, награда за цель и бонус копилки;
//   «Хочу»  — кошелёк хаба, его тратит магазин;
//   история копилки — последние операции банка (§11.6).
// Без цели (достигнута или не выбрана), пока есть что покупать, — обязательный
// выбор цели (RequiredGoalPicker), когда другие окна экрана закрыты.
// «Коплю» на экране один раз (решение пользователя 27.09.2026): отдельная
// строка «Коплю» и пояснение внизу повторяли карточку цели — убраны.
// Корзины «Нужно» из макета нет: резерва на обязательные траты в хабе нет
// (решение пользователя 27.09.2026 — строку убрать).

import { useIsFocused, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { useAppHeaderPadding } from '@/components/shared';
import {
  GoalPickerModal,
  RequiredGoalPicker,
  SavingsAmountModal,
  SavingsAmountMode,
  SavingsBucketRow,
  SavingsGoalCard,
  SavingsHeader,
  SavingsHistory,
} from '@/components/savings';
import { PLAN_CATEGORY_COLORS, planCategoryTextColor } from '@/constants/planCategories';
import { getSavingsRepository } from '@/data/local/repositories';
import { BASE_SAVINGS_BONUS_RATE, SavingsTransactionRecord } from '@/domain/savings/Savings';
import { useFeedback } from '@/lib/hooks/useFeedback';
import { SHOP_CATALOG, ShopItem, useShopStore } from '@/lib/hooks/useShop';
import { useSavingsGoalGate } from '@/lib/savings/useSavingsGoalGate';
import { useAlertStore } from '@/lib/stores/alertStore';
import { useSavingsStore } from '@/lib/stores/savingsStore';
import { useUserStore } from '@/lib/stores/userStore';
import { Alert } from '@/lib/utils/alert';
import { useResponsive, useTheme } from '@/theme';
import { createSavingsStyles } from '@/styles/screens/tabs/_savings.styles';

/** Сколько последних операций банка показывать. */
const HISTORY_LIMIT = 5;

export default function SavingsScreen() {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const headerPadding = useAppHeaderPadding();
  const { scale } = useResponsive();
  const { trigger, triggerHaptic } = useFeedback();
  const isFocused = useIsFocused();
  const alertVisible = useAlertStore((s) => s.visible);
  const goalGate = useSavingsGoalGate();
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
  const [history, setHistory] = useState<SavingsTransactionRecord[] | null>(null);

  // Стор заменяет объект savings после каждой операции (операции пишутся в
  // SQLite раньше, чем обновляется стор) — по нему и перечитываем историю.
  useEffect(() => {
    if (!savings) return;
    let cancelled = false;
    getSavingsRepository()
      .listTransactions(savings.id, HISTORY_LIMIT)
      .then((rows) => {
        if (!cancelled) setHistory(rows);
      })
      .catch((error) => {
        console.warn('[Savings] Не удалось загрузить историю копилки:', error);
        if (!cancelled) setHistory([]);
      });
    return () => {
      cancelled = true;
    };
  }, [savings]);

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
        {/* «Коплю» — цель накопления (§11.2–11.5) */}
        <SavingsGoalCard
          targetItem={targetItem}
          saved={saved}
          bonusRate={effectiveBonusRate}
          canPickGoal={goalGate.availableGoals.length > 0}
          onDeposit={() => {
            triggerHaptic('light');
            setAmountMode('deposit');
          }}
          onWithdraw={() => {
            triggerHaptic('light');
            setAmountMode('withdraw');
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

        {history && <SavingsHistory items={history} />}
      </ScrollView>

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
        goals={goalGate.availableGoals}
        onClose={() => setShowGoalPicker(false)}
        onPick={handlePickGoal}
        selectedId={savings?.targetItemId ?? null}
      />

      {/* Цель достигнута пополнением — окно выбора после «Готово». */}
      <RequiredGoalPicker
        gate={goalGate}
        visible={isFocused && !alertVisible && amountMode === null && !showGoalPicker}
      />
    </View>
  );
}
