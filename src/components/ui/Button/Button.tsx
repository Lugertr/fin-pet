// src/components/ui/Button/Button.tsx

import React from 'react';
import { Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useResponsive } from '@/theme';
import { createButtonStyles, ButtonVariant, ButtonSize } from './Button.styles';
import type { IconName } from '@/types/icons';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
  gradient?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  gradient = false,
}: ButtonProps) {
  const { theme } = useTheme();
  const { scale } = useResponsive();

  const styles = createButtonStyles({ theme, variant, size, disabled });

  // Извлекаем цвет текста отдельно для иконки
  const iconColor = styles.text.color;
  const iconSize = size === 'sm' ? 16 : size === 'md' ? 18 : 22;

  const content = loading ? (
    <ActivityIndicator size="small" color={iconColor} />
  ) : (
    <>
      {icon && iconPosition === 'left' && (
        <Ionicons name={icon} size={scale(iconSize)} color={iconColor} />
      )}
      <Text style={styles.text}>{title}</Text>
      {icon && iconPosition === 'right' && (
        <Ionicons name={icon} size={scale(iconSize)} color={iconColor} />
      )}
    </>
  );

  // Градиентная версия
  if (gradient && !disabled) {
    return (
      <TouchableOpacity onPress={onPress} disabled={disabled || loading} activeOpacity={0.8}>
        <LinearGradient
          colors={theme.gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.container}
        >
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={styles.container}
    >
      {content}
    </TouchableOpacity>
  );
}
