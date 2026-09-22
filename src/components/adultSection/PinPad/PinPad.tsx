// src/components/adultSection/PinPad/PinPad.tsx
// Презентационная клавиатура ввода 4-значного PIN-кода — переиспользуется и
// для настройки PIN, и для входа (заголовок/подзаголовок и число точек задаёт
// вызывающий компонент через PinGate).

import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

import { useResponsive, useTheme } from '@/theme';
import { createPinPadStyles } from './PinPad.styles';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'backspace'] as const;

export function PinPad({
  filledCount,
  error,
  onDigit,
  onBackspace,
}: {
  filledCount: number;
  error: boolean;
  onDigit: (digit: string) => void;
  onBackspace: () => void;
}) {
  const { theme } = useTheme();
  const { scale } = useResponsive();
  const styles = createPinPadStyles({ theme });

  return (
    <View>
      <View style={styles.dotsRow}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={[styles.dot, i < filledCount && styles.dotFilled, error && styles.dotError]}
          />
        ))}
      </View>

      <View style={styles.keypad}>
        {KEYS.map((key, index) => {
          if (key === '') {
            return <View key={index} style={[styles.key, styles.keyEmpty]} />;
          }
          if (key === 'backspace') {
            return (
              <TouchableOpacity
                key={index}
                onPress={onBackspace}
                style={[styles.key, styles.keyEmpty]}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="backspace-outline" size={scale(24)} color={theme.textPrimary} />
              </TouchableOpacity>
            );
          }
          return (
            <TouchableOpacity
              key={index}
              onPress={() => onDigit(key)}
              style={styles.key}
              activeOpacity={0.7}
            >
              <Text style={styles.keyText}>{key}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
