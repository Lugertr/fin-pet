// src/components/ui/SectionTitle/SectionTitle.tsx
// Заголовок секции экрана (жирный, textPrimary, крупный) с responsive-масштабом
// размера и отступа.

import { ReactNode } from 'react';
import { Text } from 'react-native';

import { useResponsive, useTheme } from '@/theme';
import { fontSizes, spacing } from '@/theme/tokens';
import { createSectionTitleStyles } from './SectionTitle.styles';

interface SectionTitleProps {
  children: ReactNode;
  size?: keyof typeof fontSizes;
  /** В px, до масштабирования; 0 — без отступа снизу (например, когда заголовок
   * стоит в одной строке рядом с бейджем/кнопкой). */
  marginBottom?: number;
}

export function SectionTitle({
  children,
  size = 'xxl',
  marginBottom = spacing.lg,
}: SectionTitleProps) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const styles = createSectionTitleStyles({ theme });

  return (
    <Text style={[styles.text, { fontSize: scaledFont(size), marginBottom: scale(marginBottom) }]}>
      {children}
    </Text>
  );
}
