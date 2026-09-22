// src/components/lesson/ResourcePlanningStep/ResourcePlanningStep.tsx
// Шаг «Планирование ресурсов» (§9.6) — куда идут только что полученные монеты.
// Кошелёк уже пополнен наградой; доля «в накопления» реально переводится в
// Savings (§11) — включая мгновенный бонус за взаимодействие (§11.4).

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { ScreenFooter } from '@/components/ui';
import { useFeedback } from '@/lib/hooks/useFeedback';
import { useSavingsStore } from '@/lib/stores/savingsStore';
import { useResponsive, useTheme } from '@/theme';
import { fontWeights, spacing } from '@/theme/tokens';
import { createLessonStepsStyles } from '../lessonSteps.styles';

const PLANNING_PRESETS = [
  { label: 'Всё в накопления', percent: 100 },
  { label: '50/50', percent: 50 },
  { label: 'Всё в кошелёк', percent: 0 },
];

export function ResourcePlanningStep({ coins, onDone }: { coins: number; onDone: () => void }) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const { triggerHaptic } = useFeedback();
  const styles = createLessonStepsStyles({ theme });

  const [savingsPercent, setSavingsPercent] = useState(50); // §9.6 дефолт 50/50

  const savingsAmount = Math.round((coins * savingsPercent) / 100);
  const walletAmount = coins - savingsAmount;

  const handleConfirm = async () => {
    if (savingsAmount > 0) {
      await useSavingsStore.getState().deposit(savingsAmount);
    }
    onDone();
  };

  return (
    <View style={styles.planningContainer}>
      <View style={styles.planningScrollArea}>
        <ScrollView
          contentContainerStyle={styles.planningScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text
            style={{
              color: theme.textPrimary,
              fontSize: scaledFont('xl'),
              fontWeight: fontWeights.bold,
            }}
          >
            Куда отправим {coins}⭐?
          </Text>

          <View style={styles.planningSplitRow}>
            <View style={styles.planningSplitBox}>
              <Text style={styles.planningSplitLabel}>Кошелёк</Text>
              <Text style={styles.planningSplitValue}>{walletAmount}⭐</Text>
            </View>
            <View style={styles.planningSplitBox}>
              <Text style={styles.planningSplitLabel}>Накопления</Text>
              <Text style={styles.planningSplitValue}>{savingsAmount}⭐</Text>
            </View>
          </View>

          <View style={styles.planningPresetsRow}>
            {PLANNING_PRESETS.map((preset) => (
              <TouchableOpacity
                key={preset.label}
                onPress={() => {
                  triggerHaptic('selection');
                  setSavingsPercent(preset.percent);
                }}
                style={[
                  styles.planningPresetButton,
                  savingsPercent === preset.percent && styles.planningPresetButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.planningPresetText,
                    savingsPercent === preset.percent && styles.planningPresetTextActive,
                  ]}
                >
                  {preset.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.planningStepperRow}>
            <TouchableOpacity
              onPress={() => setSavingsPercent((p) => Math.max(0, p - 10))}
              style={styles.planningStepperButton}
            >
              <Ionicons name="remove" size={scale(20)} color={theme.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.planningStepperValue}>{savingsPercent}%</Text>
            <TouchableOpacity
              onPress={() => setSavingsPercent((p) => Math.min(100, p + 10))}
              style={styles.planningStepperButton}
            >
              <Ionicons name="add" size={scale(20)} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      <ScreenFooter>
        <TouchableOpacity onPress={handleConfirm} activeOpacity={0.8} style={styles.gradientButton}>
          <LinearGradient
            colors={theme.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.gradientButtonInner, { padding: scale(spacing.lg) }]}
          >
            <Text style={[styles.gradientButtonText, { fontSize: scaledFont('lg') }]}>
              Подтвердить
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScreenFooter>
    </View>
  );
}
