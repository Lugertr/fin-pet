// src/components/adventure/ShiftBudgetCard/ShiftBudgetCard.tsx
// «Бюджет работы» на экране смены (макет «Работа», 28.09.2026): бюджет смены
// и три корзины — Нужно / Хочу / Коплю. План — «Потратить» и «Коплю»
// (решение пользователя 27–28.09.2026), поэтому у «Нужно» и «Хочу» — факт трат,
// а план трат — строкой под корзинами; у «Коплю» — отложено из плана.
// Тап — окно «План» с планом и фактом. Смысл корзины — в подписи, цвет —
// только оформление (§23).

import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/ui/Text';

import { PLAN_CATEGORY_COLORS, planCategoryTextColor } from '@/constants/planCategories';
import {
  AdventureRecord,
  actualSpend,
  computeAdventurePayout,
  plannedSpend,
} from '@/domain/adventure/Adventure';
import { formatCoins, formatNumber, formatPrice } from '@/lib/utils/formatters';
import { useResponsive, useTheme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import { createShiftBudgetCardStyles } from './ShiftBudgetCard.styles';

export function ShiftBudgetCard({
  adventure,
  onPress,
}: {
  adventure: AdventureRecord;
  onPress: () => void;
}) {
  const { theme, isDark } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const styles = createShiftBudgetCardStyles({ theme });

  const spendPlan = plannedSpend(adventure);
  const spendFact = actualSpend(adventure);
  // «Коплю», которое уйдёт на цель, если урок пройти сейчас: траты сверх
  // бюджета съедают отложенное (computeAdventurePayout).
  const saved = computeAdventurePayout(adventure.budget, adventure.plan.savings).toBank;

  const tiles = [
    {
      key: 'need',
      label: 'Нужно',
      value: formatPrice(adventure.fact.mandatory),
      a11y: `Нужно: потрачено ${formatCoins(adventure.fact.mandatory)}`,
      color: PLAN_CATEGORY_COLORS.need,
      text: planCategoryTextColor('need', isDark),
    },
    {
      key: 'want',
      label: 'Хочу',
      value: formatPrice(adventure.fact.optional),
      a11y: `Хочу: потрачено ${formatCoins(adventure.fact.optional)}`,
      color: PLAN_CATEGORY_COLORS.want,
      text: planCategoryTextColor('want', isDark),
    },
    {
      key: 'save',
      label: 'Коплю',
      value: `${formatNumber(saved)}/${formatPrice(adventure.plan.savings)}`,
      a11y: `Коплю: отложено ${formatCoins(saved)} из ${formatCoins(adventure.plan.savings)}`,
      color: PLAN_CATEGORY_COLORS.save,
      text: planCategoryTextColor('save', isDark),
    },
  ];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={styles.card}
      accessibilityRole="button"
      accessibilityLabel={`Бюджет смены ${formatCoins(adventure.budget)}. Открыть план`}
    >
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <Ionicons name="briefcase-outline" size={scale(18)} color={theme.primary} />
        </View>
        <Text style={[styles.title, { fontSize: scaledFont('lg') }]}>Бюджет смены</Text>
        <View style={styles.amountChip}>
          <Text style={[styles.amountText, { fontSize: scaledFont('md') }]}>
            {formatPrice(adventure.budget)}
          </Text>
        </View>
      </View>

      <View style={styles.tiles}>
        {tiles.map((tile) => (
          <View
            key={tile.key}
            style={[
              styles.tile,
              {
                backgroundColor: withAlpha(tile.color, 0.12),
                borderColor: withAlpha(tile.color, 0.4),
              },
            ]}
            accessible
            accessibilityLabel={tile.a11y}
          >
            <View style={styles.tileLabelRow}>
              <View style={[styles.dot, { backgroundColor: tile.color }]} />
              <Text style={[styles.tileLabel, { color: tile.text, fontSize: scaledFont('md') }]}>
                {tile.label}
              </Text>
            </View>
            <Text style={[styles.tileValue, { color: tile.text, fontSize: scaledFont('lg') }]}>
              {tile.value}
            </Text>
          </View>
        ))}
      </View>

      <Text style={[styles.caption, { fontSize: scaledFont('md') }]}>
        Потрачено {formatNumber(spendFact)} из {formatPrice(spendPlan)} по плану
      </Text>
    </TouchableOpacity>
  );
}
