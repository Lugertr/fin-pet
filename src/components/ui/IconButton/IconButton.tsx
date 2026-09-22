// src/components/ui/IconButton/IconButton.tsx
// Круглая кнопка-иконка (шапка «назад»/«закрыть» и любые другие компактные
// иконки-действия) — раньше один и тот же блок 36×36/radius:18 был
// скопирован вручную в 9+ .styles.ts файлов.

import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

import { useResponsive, useTheme } from '@/theme';
import { circleRadius } from '@/theme/tokens';
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
}

export function IconButton({
  icon,
  onPress,
  size = 36,
  iconSize = 20,
  variant = 'surface',
}: IconButtonProps) {
  const { theme } = useTheme();
  const { scale } = useResponsive();
  const styles = createIconButtonStyles({ theme, variant, size });
  const iconColor = variant === 'onGradient' ? theme.onGradient : theme.textPrimary;
  const scaledSize = scale(size);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.container,
        { width: scaledSize, height: scaledSize, borderRadius: circleRadius(scaledSize) },
      ]}
    >
      <Ionicons name={icon} size={scale(iconSize)} color={iconColor} />
    </TouchableOpacity>
  );
}
