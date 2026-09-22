// src/components/gifts/PendingGiftCard/PendingGiftCard.styles.ts
// Стили карточки неоткрытого подарка в списке подарков.

import type { Theme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import { fontSizes, fontWeights, radius, spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

interface PendingGiftCardStylesParams {
  theme: Theme;
}

export function createPendingGiftCardStyles({ theme }: PendingGiftCardStylesParams) {
  return StyleSheet.create({
    pendingCard: {
      borderRadius: radius.lg,
      overflow: 'hidden',
    },
    pendingCardInner: {
      padding: spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
    },
    pendingIconBox: {
      width: 56,
      height: 56,
      borderRadius: radius.lg,
      backgroundColor: withAlpha(theme.onGradient, 0.2),
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.lg,
    },
    pendingInfoContainer: {
      flex: 1,
    },
    pendingTitle: {
      color: theme.onGradient,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.md,
      marginBottom: spacing.xxs,
    },
    pendingSubtitle: {
      color: withAlpha(theme.onGradient, 0.8),
      fontSize: fontSizes.sm,
    },
    pendingOpenButton: {
      backgroundColor: withAlpha(theme.onGradient, 0.25),
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.md,
    },
    pendingOpenText: {
      color: theme.onGradient,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.sm,
    },
  });
}
