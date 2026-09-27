// src/components/ui/IconButton/IconButton.tsx
// Круглая кнопка-иконка (шапка «назад»/«закрыть» и любые другие компактные
// иконки-действия) — раньше один и тот же блок 36×36/radius:18 был
// скопирован вручную в 9+ .styles.ts файлов.

import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

import { useResponsive, useTheme } from '@/theme';
import { circleRadius, touchTarget } from '@/theme/tokens';
import type { IconName } from '@/types/icons';
import { createIconButtonStyles, IconButtonVariant } from './IconButton.styles';

interface IconButtonProps {
  icon: IconName;
  onPress: () => void;
  /** Диаметр кнопки (до масштабирования под экран). */
  size?: number;
  iconSize?: number;
  /** onGradient — полупрозрачно-белая кнопка поверх цветной шапки;
   * surface — обычная кнопка на фоне экрана. */
  variant?: IconButtonVariant;
  /** Текст для скринридера — у кнопки-иконки нет видимой подписи (§23). */
  accessibilityLabel?: string;
}

export function IconButton({
  icon,
  onPress,
  size = 36,
  iconSize = 20,
  variant = 'surface',
  accessibilityLabel,
}: IconButtonProps) {
  const { theme } = useTheme();
  const { scale } = useResponsive();
  const styles = createIconButtonStyles({ theme, variant, size });
  const iconColor = variant === 'onGradient' ? theme.onGradient : theme.textPrimary;
  const scaledSize = scale(size);
  // §23: тап-зона ≥48×48dp — визуальный размер кнопки часто меньше (36 по
  // умолчанию), поэтому область нажатия дополняется невидимым hitSlop до
  // рекомендованного минимума, не меняя ничего в вёрстке/внешнем виде.
  const hitSlopValue = Math.max(0, Math.round((touchTarget.recommended - scaledSize) / 2));

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={{
        top: hitSlopValue,
        bottom: hitSlopValue,
        left: hitSlopValue,
        right: hitSlopValue,
      }}
      style={[
        styles.container,
        { width: scaledSize, height: scaledSize, borderRadius: circleRadius(scaledSize) },
      ]}
    >
      <Ionicons name={icon} size={scale(iconSize)} color={iconColor} />
    </TouchableOpacity>
  );
}
