// src/components/adventure/AdventurePlanFactCard/AdventurePlanFactCard.tsx
// Карточка «План и факт» приключения по макету «Итоги работы» (28.09.2026):
// заголовок с плашкой статуса, строки «точка — название — план · факт» и
// полоска под каждой. Общая для итогов (AdventureSummaryModal) и окна «План»
// во время приключения (AdventureActiveView).
// В макете три строки «Нужно / Хочу / Коплю» с планом у каждой, но план
// приключения — только «Потратить» и «Коплю» (решение пользователя
// 27.09.2026), нужное/желаемое есть лишь в факте трат. Поэтому строк две, а
// факт «Потратить» на полоске разделён на нужное и желаемое (с подписью —
// цвет не единственный носитель смысла, §23).

import { View } from 'react-native';
import { Text } from '@/components/ui/Text';

import { PLAN_CATEGORY_COLORS } from '@/constants/planCategories';
import { AdventureRecord, actualSpend, plannedSpend } from '@/domain/adventure/Adventure';
import { formatCoins, formatNumber, formatPrice } from '@/lib/utils/formatters';
import { useResponsive, useTheme } from '@/theme';
import { createAdventurePlanFactCardStyles } from './AdventurePlanFactCard.styles';

/** Доля для полоски (0–100) относительно base; base 0 — пусто или полная. */
function percentOf(value: number, base: number): number {
  if (base <= 0) return value > 0 ? 100 : 0;
  return Math.min(100, (value / base) * 100);
}

export function AdventurePlanFactCard({
  adventure,
  tag,
  savingsFact,
  savingsFactLabel = 'факт',
}: {
  adventure: AdventureRecord;
  /** Плашка статуса справа от заголовка («Приключение закрыто», «Идёт»). */
  tag: string;
  /** Сколько «Коплю» дошло (итоги) или дойдёт, если закончить сейчас (во время приключения). */
  savingsFact: number;
  /** Подпись к savingsFact: «факт» в итогах, «сейчас» во время приключения. */
  savingsFactLabel?: string;
}) {
  const { theme } = useTheme();
  const { scaledFont } = useResponsive();
  const styles = createAdventurePlanFactCardStyles({ theme });

  const spendPlan = plannedSpend(adventure);
  const spendFact = actualSpend(adventure);
  const savingsPlan = adventure.plan.savings;
  // Потрачено больше плана — полоска полная, доли нужного/желаемого от факта.
  const spendBase = Math.max(spendPlan, spendFact);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={[styles.title, { fontSize: scaledFont('xl') }]} accessibilityRole="header">
          План и факт
        </Text>
        <View style={styles.tag}>
          <Text style={[styles.tagText, { fontSize: scaledFont('sm') }]}>{tag}</Text>
        </View>
      </View>

      <View
        style={styles.row}
        accessible
        accessibilityLabel={`Потратить: план ${formatCoins(spendPlan)}, факт ${formatCoins(spendFact)}: на нужное ${formatCoins(adventure.fact.mandatory)}, на желаемое ${formatCoins(adventure.fact.optional)}`}
      >
        <View style={styles.rowHeader}>
          <View style={[styles.dot, { backgroundColor: PLAN_CATEGORY_COLORS.spend }]} />
          <Text style={[styles.label, { fontSize: scaledFont('lg') }]}>Потратить</Text>
          <Text style={[styles.values, { fontSize: scaledFont('md') }]}>
            план {formatNumber(spendPlan)} · факт{' '}
            <Text style={styles.fact}>{formatPrice(spendFact)}</Text>
          </Text>
        </View>
        <View style={styles.track}>
          <View
            style={{
              width: `${percentOf(adventure.fact.mandatory, spendBase)}%`,
              backgroundColor: PLAN_CATEGORY_COLORS.need,
            }}
          />
          <View
            style={{
              width: `${percentOf(adventure.fact.optional, spendBase)}%`,
              backgroundColor: PLAN_CATEGORY_COLORS.want,
            }}
          />
        </View>
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: PLAN_CATEGORY_COLORS.need }]} />
            <Text style={[styles.legendText, { fontSize: scaledFont('md') }]}>
              нужное {formatPrice(adventure.fact.mandatory)}
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: PLAN_CATEGORY_COLORS.want }]} />
            <Text style={[styles.legendText, { fontSize: scaledFont('md') }]}>
              желаемое {formatPrice(adventure.fact.optional)}
            </Text>
          </View>
        </View>
      </View>

      <View
        style={styles.row}
        accessible
        accessibilityLabel={`Коплю: план ${formatCoins(savingsPlan)}, ${savingsFactLabel} ${formatCoins(savingsFact)}`}
      >
        <View style={styles.rowHeader}>
          <View style={[styles.dot, { backgroundColor: PLAN_CATEGORY_COLORS.save }]} />
          <Text style={[styles.label, { fontSize: scaledFont('lg') }]}>Коплю</Text>
          <Text style={[styles.values, { fontSize: scaledFont('md') }]}>
            план {formatNumber(savingsPlan)} · {savingsFactLabel}{' '}
            <Text style={styles.fact}>{formatPrice(savingsFact)}</Text>
          </Text>
        </View>
        <View style={styles.track}>
          <View
            style={{
              width: `${percentOf(savingsFact, savingsPlan)}%`,
              backgroundColor: PLAN_CATEGORY_COLORS.save,
            }}
          />
        </View>
      </View>
    </View>
  );
}
