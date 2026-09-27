// src/components/savings/SavingsGoalCard/SavingsGoalCard.tsx
// Карточка главной цели «Копилки» (макет 27.09.2026). Карточка и есть
// «Коплю»: весь банк копится на цель, поэтому отдельной строки «Коплю» на
// экране нет (решение пользователя 27.09.2026). В карточке:
//   - вещь, что она даст (goalBonusCaption), «накоплено из цены» и прогресс;
//   - сколько осталось, награда за цель (§11.5) и бонус копилки (§11.4);
//   - «Дополнить из хотений» (из кошелька), «Снять» и «Сменить цель».
// Без цели (выбрана не была или уже достигнута) — приглашение выбрать цель
// (обычно поверх уже открыто обязательное окно выбора, RequiredGoalPicker),
// а если все улучшения уже куплены — что копить больше не на что. В обоих
// случаях, если в банке что-то осталось, — сумма и «Снять».
// Прогресс передаётся и полосой, и числами (§23).

import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/ui/Text';

import { ItemImage } from '@/components/shared';
import { AnimatedFill } from '@/components/ui';
import { PLAN_CATEGORY_COLORS, planCategoryTextColor } from '@/constants/planCategories';
import { goalCompletionBonus } from '@/domain/savings/Savings';
import { ShopItem } from '@/lib/hooks/useShop';
import { goalBonusCaption } from '@/lib/savings/goalOptions';
import { formatCoins, formatPrice } from '@/lib/utils/formatters';
import { useResponsive, useTheme } from '@/theme';
import type { IconName } from '@/types/icons';
import { createSavingsGoalCardStyles } from './SavingsGoalCard.styles';

export function SavingsGoalCard({
  targetItem,
  saved,
  bonusRate,
  canPickGoal,
  onDeposit,
  onWithdraw,
  onChangeGoal,
}: {
  targetItem: ShopItem | null;
  /** Сколько в банке («Коплю») — всё оно копится на цель. */
  saved: number;
  /** Текущий бонус копилки за новые монеты, % (§11.4). */
  bonusRate: number;
  /** Есть улучшения, которые ещё можно купить (иначе выбирать цель не из чего). */
  canPickGoal: boolean;
  onDeposit: () => void;
  /** Снять из «Коплю» в кошелёк — неприметная ссылка, показывается при saved > 0. */
  onWithdraw: () => void;
  onChangeGoal: () => void;
}) {
  const { theme, isDark } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const styles = createSavingsGoalCardStyles({ theme });
  const valueColor = planCategoryTextColor('save', isDark);

  const withdrawLink = saved > 0 && (
    <TouchableOpacity
      onPress={onWithdraw}
      activeOpacity={0.7}
      style={styles.linkButton}
      accessibilityRole="button"
      accessibilityLabel="Снять монеты из «Коплю» в кошелёк"
    >
      <Text style={[styles.linkButtonText, { fontSize: scaledFont('md') }]}>Снять</Text>
    </TouchableOpacity>
  );

  if (!targetItem) {
    return (
      <View style={styles.card}>
        <Text style={[styles.emptyTitle, { fontSize: scaledFont('xl') }]}>
          {canPickGoal ? 'Цель не выбрана' : 'Все улучшения твои!'}
        </Text>
        <Text style={[styles.emptyText, { fontSize: scaledFont('md') }]}>
          {canPickGoal
            ? 'Выбери, на что копить: улучшение ноутбука, копилки или кровати. Монеты из «Коплю» пойдут на неё.'
            : 'Ноутбук, копилка и кровать уже улучшены — копить больше не на что. Монеты из «Коплю» можно снять в «Хочу».'}
        </Text>
        {saved > 0 && (
          <Text
            style={[styles.emptySaved, { color: valueColor, fontSize: scaledFont('lg') }]}
            accessibilityLabel={`В «Коплю» уже ${formatCoins(saved)}`}
          >
            В «Коплю» уже {formatPrice(saved)}
          </Text>
        )}
        {canPickGoal && (
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
        )}
        {withdrawLink && <View style={styles.linkRow}>{withdrawLink}</View>}
      </View>
    );
  }

  // Цель покупается сама, как только накоплено ≥ цены (checkGoalCompletion),
  // так что здесь saved < price. floor — чтобы не показать 100% раньше покупки.
  const percent = Math.min(100, Math.floor((saved / targetItem.price) * 100));
  const remaining = Math.max(0, targetItem.price - saved);
  const reward = goalCompletionBonus(targetItem.price);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.imageBox}>
          <ItemImage item={targetItem} size={scale(40)} />
        </View>
        <View style={styles.info}>
          <Text style={[styles.overline, { fontSize: scaledFont('md') }]}>Коплю на цель</Text>
          <Text style={[styles.name, { fontSize: scaledFont('xl') }]} numberOfLines={2}>
            {targetItem.name}
          </Text>
          <Text style={[styles.caption, { fontSize: scaledFont('md') }]}>
            {goalBonusCaption(targetItem)}
          </Text>
        </View>
      </View>

      <View
        style={styles.amountRow}
        accessible
        accessibilityLabel={`Накоплено ${formatCoins(saved)} из ${formatCoins(targetItem.price)}, ${percent}%`}
      >
        <Text style={[styles.amountSaved, { color: valueColor, fontSize: scaledFont('xxl') }]}>
          {formatPrice(saved)}
        </Text>
        <Text style={[styles.amountTotal, { fontSize: scaledFont('md') }]}>
          из {formatPrice(targetItem.price)}
        </Text>
        <Text style={[styles.percent, { fontSize: scaledFont('lg') }]}>{percent}%</Text>
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

      <View style={styles.facts}>
        <GoalFact
          icon="flag-outline"
          text={`Осталось накопить: ${formatPrice(remaining)}`}
          accessibilityLabel={`Осталось накопить ${formatCoins(remaining)}`}
        />
        <GoalFact
          icon="gift-outline"
          text={`За цель: вещь и ещё +${formatPrice(reward)} в «Хочу»`}
          accessibilityLabel={`Когда накопишь, вещь станет твоей и придёт ещё ${formatCoins(reward)} в «Хочу»`}
        />
        <GoalFact
          icon="trending-up-outline"
          text={`Бонус копилки: +${bonusRate}% к новым монетам`}
        />
      </View>

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

      <View style={styles.linkRow}>
        {withdrawLink}
        <TouchableOpacity
          onPress={onChangeGoal}
          activeOpacity={0.7}
          style={styles.linkButton}
          accessibilityRole="button"
        >
          <Text style={[styles.linkButtonText, { fontSize: scaledFont('md') }]}>Сменить цель</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/** Строка-факт под прогрессом: иконка + текст (смысл — в тексте, §23). */
function GoalFact({
  icon,
  text,
  accessibilityLabel,
}: {
  icon: IconName;
  text: string;
  accessibilityLabel?: string;
}) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const styles = createSavingsGoalCardStyles({ theme });

  return (
    <View style={styles.factRow} accessible accessibilityLabel={accessibilityLabel ?? text}>
      <Ionicons name={icon} size={scale(20)} color={theme.textSecondary} />
      <Text style={[styles.factText, { fontSize: scaledFont('md') }]}>{text}</Text>
    </View>
  );
}
