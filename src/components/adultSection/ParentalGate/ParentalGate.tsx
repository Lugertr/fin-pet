// src/components/adultSection/ParentalGate/ParentalGate.tsx
// Барьер входа в раздел для взрослого (§17 ТЗ) — арифметический пример.

import { LinearGradient } from 'expo-linear-gradient';
import { TouchableOpacity, View } from 'react-native';
import { Text, TextInput } from '@/components/ui/Text';

import { IconButton } from '@/components/ui';
import { ADULT_SECTION_HEADER_GRADIENT } from '../adultSectionVisuals';
import { ArithmeticChallenge } from '@/domain/parentalGate/ParentalGate';
import { useResponsive, useTheme } from '@/theme';
import { createParentalGateStyles } from './ParentalGate.styles';

export function ParentalGate({
  challenge,
  answer,
  gateError,
  onAnswerChange,
  onCheck,
  onBack,
}: {
  challenge: ArithmeticChallenge;
  answer: string;
  gateError: boolean;
  onAnswerChange: (text: string) => void;
  onCheck: () => void;
  onBack: () => void;
}) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const styles = createParentalGateStyles({ theme });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={ADULT_SECTION_HEADER_GRADIENT}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerTopRow}>
          <IconButton icon="arrow-back" onPress={onBack} variant="onGradient" />
          <Text style={[styles.headerTitle, { fontSize: scaledFont('xl') }]}>Для взрослых</Text>
          <View style={{ width: scale(36) }} />
        </View>
      </LinearGradient>

      <View style={styles.gateContainer}>
        <Text style={styles.gateIcon}>🔒</Text>
        <Text style={[styles.gateTitle, { fontSize: scaledFont('xl') }]}>Раздел для взрослого</Text>
        <Text style={[styles.gateSubtitle, { fontSize: scaledFont('md') }]}>
          Решите пример, чтобы продолжить
        </Text>
        <Text style={[styles.gateChallenge, { fontSize: scaledFont('hero') }]}>
          {challenge.label}
        </Text>

        {gateError && (
          <Text style={[styles.gateErrorText, { fontSize: scaledFont('sm') }]}>
            Неверно, попробуйте ещё раз
          </Text>
        )}

        <TextInput
          value={answer}
          onChangeText={onAnswerChange}
          keyboardType="number-pad"
          style={[styles.gateInput, gateError && styles.gateInputError]}
          autoFocus
        />

        <TouchableOpacity
          onPress={onCheck}
          disabled={!answer}
          activeOpacity={0.8}
          style={[styles.gateButton, { opacity: answer ? 1 : 0.5 }]}
        >
          <Text style={styles.gateButtonText}>Войти</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
