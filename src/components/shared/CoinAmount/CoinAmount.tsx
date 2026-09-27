// src/components/shared/CoinAmount/CoinAmount.tsx
// Сумма как значение: «120 C». Единый вид валюты везде, где сумма показывается
// числом (шапка, цены, план/факт, награды, итоги) — см. formatPrice.
// Для скринридера — «120 монет» (буква «C» вслух непонятна).

import { StyleProp, Text, TextStyle, View, ViewStyle } from 'react-native';

import { formatCoins, formatPrice } from '@/lib/utils/formatters';
import { coinAmountStyles as styles } from './CoinAmount.styles';

export function CoinAmount({
  amount,
  fontSize,
  prefix = '',
  textStyle,
  style,
}: {
  /** Сумма без знака — знак передаётся через prefix ('+', '−'). */
  amount: number;
  /** Уже масштабированный размер шрифта (scaledFont(...)). */
  fontSize: number;
  prefix?: string;
  textStyle?: StyleProp<TextStyle>;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      style={[styles.row, style]}
      accessible
      accessibilityLabel={`${prefix}${formatCoins(amount)}`}
    >
      <Text style={[textStyle, { fontSize }]}>
        {prefix}
        {formatPrice(amount)}
      </Text>
    </View>
  );
}
