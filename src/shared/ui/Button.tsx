import { ActivityIndicator, Pressable, Text, type PressableProps } from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends PressableProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, { enabled: string; disabled: string }> = {
  primary: {
    enabled: 'bg-primary',
    disabled: 'bg-gray-300',
  },
  secondary: {
    enabled: 'bg-secondary',
    disabled: 'bg-gray-300',
  },
  ghost: {
    enabled: 'bg-transparent',
    disabled: 'bg-transparent',
  },
  danger: {
    enabled: 'bg-red-500',
    disabled: 'bg-gray-300',
  },
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'py-2 px-4',
  md: 'py-3 px-6',
  lg: 'py-4 px-8',
};

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const variantClass = isDisabled
    ? variantClasses[variant].disabled
    : variantClasses[variant].enabled;

  return (
    <Pressable
      disabled={isDisabled}
      className={`
        ${variantClass}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        rounded-2xl
        active:opacity-80
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'ghost' ? '#2C3E50' : '#FFFFFF'} />
      ) : (
        <Text
          className={`
            text-center
            font-semibold
            ${size === 'sm' ? 'text-sm' : size === 'md' ? 'text-base' : 'text-lg'}
            ${variant === 'ghost' ? 'text-text' : 'text-white'}
            ${isDisabled && variant !== 'ghost' ? 'text-gray-500' : ''}
          `}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}
