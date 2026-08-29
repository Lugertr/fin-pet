// components/ui/Button.tsx
// Переиспользуемая кнопка

import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Text, TouchableOpacity } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  className?: string;
}

const VARIANT_STYLES = {
  primary: 'bg-indigo-500 active:bg-indigo-600',
  secondary: 'bg-slate-700 active:bg-slate-600',
  success: 'bg-green-500 active:bg-green-600',
  danger: 'bg-red-500 active:bg-red-600',
  ghost: 'bg-transparent border border-slate-600 active:bg-slate-800',
};

const SIZE_STYLES = {
  sm: 'px-4 py-2 rounded-lg',
  md: 'px-6 py-3 rounded-xl',
  lg: 'px-8 py-4 rounded-xl',
};

const TEXT_STYLES = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  className = '',
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      className={`flex-row items-center justify-center gap-2 ${VARIANT_STYLES[variant]} ${SIZE_STYLES[size]} ${
        isDisabled ? 'opacity-50' : ''
      } ${className}`}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color="white" size="small" />
      ) : (
        <>
          {icon && <Ionicons name={icon} size={size === 'sm' ? 16 : 20} color="white" />}
          <Text className={`text-white font-semibold ${TEXT_STYLES[size]}`}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}
