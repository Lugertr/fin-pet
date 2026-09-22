// src/components/gifts/HistoryGiftCard/HistoryGiftCard.styles.ts
// Стили карточки истории открытых подарков.

import type { Theme } from '@/theme';
import { fontSizes, fontWeights, radius, spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

interface HistoryGiftCardStylesParams {
  theme: Theme;
}

export function createHistoryGiftCardStyles({ theme }: HistoryGiftCardStylesParams) {
  return StyleSheet.create({
    // Фон/паддинг/радиус/рамка — от <Card padding="md"> (src/components/ui/Card).
    historyCardRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    historyIconBox: {
      width: 44,
      height: 44,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
    },
    historyInfoContainer: {
      flex: 1,
    },
    historyItemName: {
      color: theme.textPrimary,
      fontWeight: fontWeights.semibold,
      fontSize: fontSizes.md,
    },
    historyRarityText: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.medium,
    },
    historyDate: {
      color: theme.textMuted,
      fontSize: fontSizes.xs,
    },
  });
}
