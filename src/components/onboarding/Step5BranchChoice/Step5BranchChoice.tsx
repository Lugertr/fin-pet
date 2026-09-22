// src/components/onboarding/Step5BranchChoice/Step5BranchChoice.tsx
// Шаг 5 онбординга — выбор одного направления для старта (остальные 6 из 7
// открыты сразу же, приоритет просто определяет, с чего начать). Логика не
// менялась при переносе с позиции 1 на 5 — только визуальный стиль и то, что
// кнопка «Продолжить» теперь в общем футере onboarding.tsx, а не здесь.

import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';

import { BRANCH_GRADIENTS, BRANCH_ICONS } from '@/components/lessons/branchVisuals';
import { BRANCHES } from '@/lib/hooks/useLessons';
import { useResponsive, useTheme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import { circleRadius, radius, spacing } from '@/theme/tokens';
import { createOnboardingStepsStyles } from '../onboardingSteps.styles';

export function Step5BranchChoice({
  selectedBranch,
  onSelectBranch,
}: {
  selectedBranch: number | null;
  onSelectBranch: (branchId: number) => void;
}) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const styles = createOnboardingStepsStyles({ theme });

  return (
    <Animated.View entering={FadeInRight.duration(300)}>
      <Text style={[styles.stepTitle, { fontSize: scaledFont('xxl') }]}>Выбери направление</Text>
      <Text style={[styles.stepSubtitle, { fontSize: scaledFont('md') }]}>
        Что тебе интересней всего узнать?
      </Text>

      <View style={[styles.branchesContainer, { gap: scale(spacing.sm) }]}>
        {BRANCHES.map((branch) => {
          const isSelected = selectedBranch === branch.id;
          const accentColor = BRANCH_GRADIENTS[branch.id]?.[0] ?? theme.primary;
          return (
            <TouchableOpacity
              key={branch.id}
              onPress={() => onSelectBranch(branch.id)}
              activeOpacity={0.8}
              style={[
                styles.branchCard,
                isSelected ? styles.branchCardSelected : styles.branchCardUnselected,
                { padding: scale(spacing.md), gap: scale(spacing.md) },
              ]}
            >
              <View
                style={[
                  styles.branchIconBox,
                  {
                    width: scale(44),
                    height: scale(44),
                    borderRadius: scale(radius.md),
                    backgroundColor: withAlpha(accentColor, 0.125),
                  },
                ]}
              >
                <Ionicons
                  name={BRANCH_ICONS[branch.id] ?? 'book'}
                  size={scale(20)}
                  color={accentColor}
                />
              </View>

              <View style={styles.branchInfo}>
                <View style={styles.branchNameRow}>
                  <Text style={[styles.branchName, { fontSize: scaledFont('md') }]}>
                    {branch.name}
                  </Text>
                  {isSelected && (
                    <View
                      style={[styles.branchBonusBadge, { paddingHorizontal: scale(spacing.xs) }]}
                    >
                      <Text style={[styles.branchBonusBadgeText, { fontSize: scaledFont('xxs') }]}>
                        +10% коинов
                      </Text>
                    </View>
                  )}
                </View>
                {branch.description && (
                  <Text style={[styles.branchDescription, { fontSize: scaledFont('xs') }]}>
                    {branch.description}
                  </Text>
                )}
              </View>

              <View
                style={[
                  styles.branchRadio,
                  { width: scale(24), height: scale(24), borderRadius: circleRadius(scale(24)) },
                  isSelected ? styles.branchRadioSelected : styles.branchRadioUnselected,
                ]}
              >
                {isSelected && (
                  <Ionicons name="checkmark" size={scale(15)} color={theme.onGradient} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={[styles.footerHint, { marginBottom: scale(spacing.xl) }]}>
        <Ionicons name="information-circle-outline" size={scale(14)} color={theme.textMuted} />
        <Text style={[styles.footerHintText, { fontSize: scaledFont('xs') }]}>
          Ты сможешь пройти все 7 направлений, выбери лишь первое!
        </Text>
      </View>
    </Animated.View>
  );
}
