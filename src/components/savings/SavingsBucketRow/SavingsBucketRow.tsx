// src/components/savings/SavingsBucketRow/SavingsBucketRow.tsx
// Строка «корзины» денег в «Копилке» (макет 27.09.2026): иконка в цветной
// плашке, название, пояснение, сумма и необязательное действие справа —
// заливная кнопка («В магазин») или неприметная ссылка («Снять»). Смысл
// корзины передают название и пояснение, цвет — только оформление (§23).

import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

import { formatCoins, formatPrice } from '@/lib/utils/formatters';
import { useResponsive, useTheme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import type { IconName } from '@/types/icons';
import { createSavingsBucketRowStyles } from './SavingsBucketRow.styles';

export interface SavingsBucketAction {
  label: string;
  onPress: () => void;
  /** filled — заметная кнопка; link — неприметная ссылка. */
  variant: 'filled' | 'link';
  accessibilityLabel?: string;
}

export function SavingsBucketRow({
  icon,
  color,
  amountColor,
  title,
  description,
  amount,
  action,
}: {
  icon: IconName;
  /** Цвет иконки и плашки. */
  color: string;
  /** Цвет суммы (контрастный оттенок того же цвета). */
  amountColor: string;
  title: string;
  description: string;
  amount: number;
  action?: SavingsBucketAction;
}) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const styles = createSavingsBucketRowStyles({ theme });

  return (
    <View style={styles.card}>
      <View
        style={[
          styles.iconBox,
          { backgroundColor: withAlpha(color, 0.14), width: scale(52), height: scale(52) },
        ]}
      >
        <Ionicons name={icon} size={scale(26)} color={color} />
      </View>

      <View style={styles.info}>
        <Text style={[styles.title, { fontSize: scaledFont('xl') }]}>{title}</Text>
        <Text style={[styles.description, { fontSize: scaledFont('md') }]}>{description}</Text>
      </View>

      <View style={styles.side}>
        <Text
          style={[styles.amount, { color: amountColor, fontSize: scaledFont('xl') }]}
          accessibilityLabel={`${title}: ${formatCoins(amount)}`}
        >
          {formatPrice(amount)}
        </Text>
        {action && (
          <TouchableOpacity
            onPress={action.onPress}
            activeOpacity={0.8}
            style={action.variant === 'filled' ? styles.filledButton : styles.linkButton}
            accessibilityRole="button"
            accessibilityLabel={action.accessibilityLabel ?? action.label}
          >
            <Text
              style={[
                action.variant === 'filled' ? styles.filledButtonText : styles.linkButtonText,
                { fontSize: scaledFont('md') },
              ]}
            >
              {action.label}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
