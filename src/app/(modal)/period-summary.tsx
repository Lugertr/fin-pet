// app/(modal)/period-summary.tsx
// Завершение периода (§7.4 ТЗ): план vs факт + нейтральная обратная связь,
// без оценки ребёнка. Затем переход к следующему периоду.

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { getStageName } from '@/domain/pet/PetProgress';
import { BudgetCategory, GamePeriodRecord } from '@/domain/period/GamePeriod';
import { useFeedback } from '@/lib/hooks/useFeedback';
import { PeriodCompletionSummary, usePeriodStore } from '@/lib/stores/periodStore';
import { useUserStore } from '@/lib/stores/userStore';
import { createPeriodSummaryStyles } from '@/styles/screens/modal/_period-summary.styles';
import { useResponsive, useTheme } from '@/theme';

const ROWS: { key: BudgetCategory; label: string }[] = [
  { key: 'mandatory', label: 'Обязательное' },
  { key: 'optional', label: 'Желаемое' },
  { key: 'savings', label: 'Накопления' },
];

function getPetComment(period: GamePeriodRecord): string {
  const factSpent = period.fact.mandatory + period.fact.optional;
  const plannedSpent = period.plan.mandatory + period.plan.optional;

  if (factSpent <= plannedSpent) {
    return 'Ты уложился в план на этот период! Так и будем копить на цели дальше.';
  }
  return 'В этот раз потратилось больше, чем планировали — в следующем периоде можно скорректировать бюджет.';
}

export default function PeriodSummaryScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { scaledFont } = useResponsive();
  const { trigger, triggerHaptic } = useFeedback();
  const user = useUserStore((s) => s.user);
  // Только экшены — экран ведёт свой собственный локальный summary,
  // ему не нужно перерисовываться при изменениях currentPeriod.
  const completePeriod = usePeriodStore((s) => s.completePeriod);
  const loadOrStartPeriod = usePeriodStore((s) => s.loadOrStartPeriod);

  const styles = createPeriodSummaryStyles({ theme });

  const [summary, setSummary] = useState<PeriodCompletionSummary | null>(null);
  const hasCompletedRef = useRef(false);

  useEffect(() => {
    if (hasCompletedRef.current) return;
    hasCompletedRef.current = true;

    (async () => {
      const result = await completePeriod();
      if (result) {
        setSummary(result);
        trigger(result.bonusAwarded > 0 ? 'earnCoins' : 'buttonClick');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNextPeriod = async () => {
    if (!user?.id) return;
    triggerHaptic('medium');
    await loadOrStartPeriod(user.id);
    router.replace('/(tabs)' as never);
  };

  if (!summary) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const { period, bonusAwarded, wasSuccessful, stageUp } = summary;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { fontSize: scaledFont('xxl') }]}>
          Период №{period.periodNumber} завершён
        </Text>
        <Text style={[styles.subtitle, { fontSize: scaledFont('md') }]}>
          План и факт по направлениям
        </Text>

        {/* §8.4: при переходе стадии — анимация и объяснение причины */}
        {stageUp && (
          <Animated.View entering={ZoomIn.duration(400)} style={styles.stageUpCard}>
            <Text style={styles.stageUpEmoji}>🎉</Text>
            <Text style={[styles.stageUpTitle, { fontSize: scaledFont('lg') }]}>
              Питомец подрос! Теперь он «{getStageName(stageUp.to)}»
            </Text>
            <Text style={[styles.stageUpReason, { fontSize: scaledFont('sm') }]}>
              Причина: энергии хватало и накопления пополнялись уже{' '}
              {period.fact.savings > 0 ? 'в этот период' : 'достаточно раз'} — так набралось нужное
              число успешных периодов.
            </Text>
          </Animated.View>
        )}

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={styles.tableHeaderCellLabel}>Направление</Text>
            <Text style={styles.tableHeaderCell}>План</Text>
            <Text style={styles.tableHeaderCell}>Факт</Text>
            <Text style={styles.tableHeaderCell}>Разница</Text>
          </View>
          {ROWS.map((row) => {
            const plan = period.plan[row.key];
            const fact = period.fact[row.key];
            const diff = fact - plan;
            return (
              <View key={row.key} style={styles.tableRow}>
                <Text style={styles.tableCellLabel}>{row.label}</Text>
                <Text style={styles.tableCell}>{plan}</Text>
                <Text style={styles.tableCell}>{fact}</Text>
                <Text style={styles.tableCell}>{diff > 0 ? `+${diff}` : diff}</Text>
              </View>
            );
          })}
        </View>

        <View
          style={[
            styles.bonusBanner,
            bonusAwarded > 0 ? styles.bonusBannerSuccess : styles.bonusBannerNeutral,
          ]}
        >
          <Ionicons
            name={bonusAwarded > 0 ? 'checkmark-circle' : 'information-circle'}
            size={22}
            color={bonusAwarded > 0 ? theme.success : theme.primary}
          />
          <Text style={styles.bonusText}>
            {getPetComment(period)}
            {bonusAwarded > 0 ? ` +${bonusAwarded}⭐ бонус за план.` : ''}
          </Text>
        </View>

        {!stageUp && (
          <Text style={styles.successHint}>
            {wasSuccessful
              ? 'Этот период засчитан как успешный — энергии хватало, и накопления пополнялись.'
              : 'Этот период не засчитан в рост питомца: для этого энергия должна быть ≥30⚡ и должно быть хотя бы одно пополнение накоплений.'}
          </Text>
        )}

        <TouchableOpacity onPress={handleNextPeriod} activeOpacity={0.8} style={styles.nextButton}>
          <Text style={[styles.nextButtonText, { fontSize: scaledFont('lg') }]}>
            Следующий период
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
