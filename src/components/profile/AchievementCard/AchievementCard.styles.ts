// src/components/profile/AchievementCard/AchievementCard.styles.ts

import type { Theme } from '@/theme';
import { fontSizes, fontWeights, spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

interface AchievementCardStylesParams {
  theme: Theme;
}

export function createAchievementCardStyles({ theme }: AchievementCardStylesParams) {
  return StyleSheet.create({
    // Фон/паддинг/радиус/рамка — от <Card padding="md">; borderColor
    // переопределяется снаружи по статусу (получено/можно забрать/в процессе).
    achievementCardInner: {
      alignItems: 'center',
    },
    achievementTitle: {
      color: theme.textPrimary,
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.medium,
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
  });
}
