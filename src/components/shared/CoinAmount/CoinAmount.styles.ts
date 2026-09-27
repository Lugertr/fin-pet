// src/components/shared/CoinAmount/CoinAmount.styles.ts

import { spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

export const coinAmountStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs + 1,
  },
});
