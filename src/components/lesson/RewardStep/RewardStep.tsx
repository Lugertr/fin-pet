// src/components/lesson/RewardStep/RewardStep.tsx
// Шаг «Награда» (новая композиция урока) — зачисляет монеты один раз при
// показе (§9.3)

import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { ScreenFooter } from '@/components/ui';
import { RewardStep as RewardStepData } from '@/domain/lesson/LessonStep';
import { useUserStore } from '@/lib/stores/userStore';
import { useResponsive, useTheme } from '@/theme';
import { emojiSizes, spacing } from '@/theme/tokens';
import { createLessonStepsStyles } from '../lessonSteps.styles';

export function RewardStep({ step, onCollect }: { step: RewardStepData; onCollect: () => void }) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const styles = createLessonStepsStyles({ theme });
  const hasCreditedRef = useRef(false);

  useEffect(() => {
    if (hasCreditedRef.current) return;
    hasCreditedRef.current = true;
    useUserStore.getState().recordTransaction(step.coins, 'lesson_reward', step.reason);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.stepContainer}>
      <View style={styles.rewardScrollArea}>
        <ScrollView contentContainerStyle={styles.rewardScrollContent}>
          <Text style={{ fontSize: scale(emojiSizes.xxl) }}>🎉</Text>
          <Text style={[styles.rewardCoinsText, { fontSize: scaledFont('hero') }]}>
            +{step.coins}⭐
          </Text>
          <Text style={[styles.rewardReasonText, { fontSize: scaledFont('md') }]}>
            {step.reason}
          </Text>
        </ScrollView>
      </View>

      <ScreenFooter>
        <TouchableOpacity onPress={onCollect} activeOpacity={0.8} style={styles.gradientButton}>
          <LinearGradient
            colors={theme.gradients.reward}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.gradientButtonInner, { padding: scale(spacing.lg) }]}
          >
            <Text style={[styles.gradientButtonText, { fontSize: scaledFont('lg') }]}>Забрать</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScreenFooter>
    </View>
  );
}
