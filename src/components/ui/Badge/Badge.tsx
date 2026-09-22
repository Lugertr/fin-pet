// src/components/ui/Badge/Badge.tsx

import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useResponsive } from '@/theme';
import { createBadgeStyles, BadgeVariant, BadgeSize } from './Badge.styles';
import type { IconName } from '@/types/icons';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: IconName;
}

export function Badge({ label, variant = 'neutral', size = 'md', icon }: BadgeProps) {
  const { theme } = useTheme();
  const { scale } = useResponsive();

  const styles = createBadgeStyles({ theme, variant, size });

  // Извлекаем цвет отдельно для иконки
  const iconColor = styles.text.color;
  const iconSize = size === 'sm' ? 12 : 14;

  return (
    <View style={styles.container}>
      {icon && <Ionicons name={icon} size={scale(iconSize)} color={iconColor} />}
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}
