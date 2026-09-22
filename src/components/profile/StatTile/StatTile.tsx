// src/components/profile/StatTile/StatTile.tsx
// Карточка статистики в профиле. Стили целиком инлайн (не .styles.ts) —
// почти все значения зависят от scale()/scaledFont(), которые доступны
// только в теле компонента; так было и в исходном коде до разбиения.

import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { useResponsive, useTheme } from '@/theme';
import { fontWeights, radius, spacing } from '@/theme/tokens';
import type { IconName } from '@/types/icons';

export function StatTile({
  icon,
  label,
  value,
  color,
}: {
  icon: IconName;
  label: string;
  value: string;
  color: string;
}) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.surfaceLight,
        borderRadius: scale(radius.md),
        padding: scale(spacing.sm),
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.border,
      }}
    >
      <Ionicons name={icon} size={scale(18)} color={color} />
      <Text
        style={{
          color: theme.textPrimary,
          fontWeight: fontWeights.bold,
          fontSize: scaledFont('sm'),
          marginTop: scale(spacing.xs),
          marginBottom: scale(spacing.xxs),
        }}
        numberOfLines={1}
      >
        {value}
      </Text>
      <Text
        style={{
          color: theme.textSecondary,
          fontSize: scaledFont('xxs'),
        }}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}
