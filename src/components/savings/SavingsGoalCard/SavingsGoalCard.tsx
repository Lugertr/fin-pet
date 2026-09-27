// src/components/savings/SavingsGoalCard/SavingsGoalCard.tsx
// Карточка главной цели «Копилки» (макет 27.09.2026): картинка вещи в
// зелёной плашке, название, «накоплено / цена», плавный прогресс-бар,
// откуда копится и кнопка «Дополнить из хотений» (перевод из кошелька).
// Без цели (выбрана не была или уже достигнута) — приглашение выбрать цель.
// Прогресс передаётся и полосой, и числами (§23).

import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/ui/Text';

import { ItemImage } from '@/components/shared';
import { AnimatedFill } from '@/components/ui';
import { PLAN_CATEGORY_COLORS, planCategoryTextColor } from '@/constants/planCategories';
import { ShopItem } from '@/lib/hooks/useShop';
import { formatCoins, formatNumber, formatPrice } from '@/lib/utils/formatters';
import { useResponsive, useTheme } from '@/theme';
import { createSavingsGoalCardStyles } from './SavingsGoalCard.styles';

export function SavingsGoalCard({
  targetItem,
  saved,
  onDeposit,
  onChangeGoal,
}: {
  targetItem: ShopItem | null;
  /** Сколько в банке («Коплю») — всё оно копится на цель. */
  saved: number;
  onDeposit: () => void;
  onChangeGoal: () => void;
}) {
  const { theme, isDark } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const styles = createSavingsGoalCardStyles({ theme });
  const valueColor = planCategoryTextColor('save', isDark);

  if (!targetItem) {
    return (
      <View style={styles.card}>
        <Text style={[styles.emptyTitle, { fontSize: scaledFont('xl') }]}>Цель не выбрана</Text>
        <Text style={[styles.emptyText, { fontSize: scaledFont('md') }]}>
          Выбери, на что копить: улучшение ноутбука, копилки или кровати. Монеты из «Коплю» пойдут
          на неё.
        </Text>
        <TouchableOpacity
          onPress={onChangeGoal}
          activeOpacity={0.85}
          style={styles.primaryButton}
          accessibilityRole="button"
        >
          <Text style={[styles.primaryButtonText, { fontSize: scaledFont('lg') }]}>
            Выбрать цель
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const percent = Math.min(100, Math.round((saved / targetItem.price) * 100));

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.imageBox}>
          <ItemImage item={targetItem} size={scale(40)} />
        </View>
        <View style={styles.info}>
          <Text style={[styles.name, { fontSize: scaledFont('xl') }]} numberOfLines={2}>
            {targetItem.name}
          </Text>
          <Text style={[styles.caption, { fontSize: scaledFont('md') }]}>Главная цель</Text>
        </View>
        <Text
          style={[styles.progressValue, { color: valueColor, fontSize: scaledFont('xl') }]}
          accessibilityLabel={`Накоплено ${formatCoins(saved)} из ${formatCoins(targetItem.price)}`}
        >
          {formatNumber(Math.min(saved, targetItem.price))} / {formatPrice(targetItem.price)}
        </Text>
      </View>

      <View
        style={styles.progressTrack}
        accessible
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: percent }}
        accessibilityLabel={`Цель накоплена на ${percent}%`}
      >
        <AnimatedFill
          percent={percent}
          color={PLAN_CATEGORY_COLORS.save}
          style={styles.progressFill}
        />
      </View>
      <Text style={[styles.hint, { fontSize: scaledFont('md') }]}>
        Копится из «Коплю» после каждого приключения
      </Text>

      <TouchableOpacity
        onPress={onDeposit}
        activeOpacity={0.85}
        style={styles.outlineButton}
        accessibilityRole="button"
        accessibilityLabel="Дополнить из хотений — перевести монеты из «Хочу» в «Коплю»"
      >
        <Ionicons name="add" size={scale(22)} color={theme.primary} />
        <Text style={[styles.outlineButtonText, { fontSize: scaledFont('lg') }]}>
          Дополнить из хотений
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onChangeGoal}
        activeOpacity={0.7}
        style={styles.linkButton}
        accessibilityRole="button"
      >
        <Text style={[styles.linkButtonText, { fontSize: scaledFont('md') }]}>Сменить цель</Text>
      </TouchableOpacity>
    </View>
  );
}
