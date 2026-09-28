// src/components/adventure/AdventureAmountCard/AdventureAmountCard.tsx
// Плашка «иконка — заголовок с суммой — пояснение» по макету «Итоги работы»
// (28.09.2026, «Перенос в копилку: 55 C»). В итогах — куда ушли деньги
// приключения, в окне «План» — бюджет приключения сейчас.

import type { ReactNode } from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/Text';

import { formatCoins, formatPrice } from '@/lib/utils/formatters';
import { useResponsive, useTheme } from '@/theme';
import { createAdventureAmountCardStyles } from './AdventureAmountCard.styles';

export function AdventureAmountCard({
  icon,
  iconBackground,
  title,
  amount,
  lines,
}: {
  icon: ReactNode;
  iconBackground: string;
  /** Заголовок без суммы («Перенос в копилку:») — сумма идёт плашкой рядом. */
  title: string;
  amount: number;
  /** Строки пояснения под заголовком. */
  lines: string[];
}) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const styles = createAdventureAmountCardStyles({ theme });

  return (
    <View
      style={styles.card}
      accessible
      accessibilityLabel={`${title} ${formatCoins(amount)}. ${lines.join('. ')}`}
    >
      <View
        style={[
          styles.iconBox,
          { width: scale(56), height: scale(56), backgroundColor: iconBackground },
        ]}
      >
        {icon}
      </View>
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { fontSize: scaledFont('lg') }]}>{title}</Text>
          <View style={styles.amountChip}>
            <Text style={[styles.amountText, { fontSize: scaledFont('md') }]}>
              {formatPrice(amount)}
            </Text>
          </View>
        </View>
        {lines.map((line) => (
          <Text key={line} style={[styles.line, { fontSize: scaledFont('md') }]}>
            {line}
          </Text>
        ))}
      </View>
    </View>
  );
}
