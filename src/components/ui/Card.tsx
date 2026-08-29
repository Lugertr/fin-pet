// components/ui/Card.tsx
// Карточка с фоном и рамкой

import { View, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'sm' | 'md' | 'lg';
}

const VARIANT_STYLES = {
  default: 'bg-slate-800/50',
  elevated: 'bg-slate-800 shadow-lg',
  outlined: 'bg-transparent border border-slate-700',
};

const PADDING_STYLES = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export function Card({
  variant = 'default',
  padding = 'md',
  className = '',
  children,
  ...props
}: CardProps) {
  return (
    <View
      className={`rounded-2xl ${VARIANT_STYLES[variant]} ${PADDING_STYLES[padding]} ${className}`}
      {...props}
    >
      {children}
    </View>
  );
}
