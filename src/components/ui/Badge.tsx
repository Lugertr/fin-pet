// components/ui/Badge.tsx
// Бейдж для статусов и меток

import { Text, View } from 'react-native';

interface BadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
}

const VARIANT_STYLES = {
  success: 'bg-green-500/20 border-green-500/30',
  warning: 'bg-amber-500/20 border-amber-500/30',
  danger: 'bg-red-500/20 border-red-500/30',
  info: 'bg-blue-500/20 border-blue-500/30',
  neutral: 'bg-slate-500/20 border-slate-500/30',
};

const TEXT_STYLES = {
  success: 'text-green-400',
  warning: 'text-amber-400',
  danger: 'text-red-400',
  info: 'text-blue-400',
  neutral: 'text-slate-400',
};

export function Badge({ label, variant = 'neutral' }: BadgeProps) {
  return (
    <View className={`px-3 py-1 rounded-full border ${VARIANT_STYLES[variant]} self-start`}>
      <Text className={`text-xs font-medium ${TEXT_STYLES[variant]}`}>{label}</Text>
    </View>
  );
}
