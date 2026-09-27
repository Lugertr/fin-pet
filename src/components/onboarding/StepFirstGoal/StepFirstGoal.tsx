// src/components/onboarding/StepFirstGoal/StepFirstGoal.tsx
// Шаг онбординга «Выбери первую цель» (макет, 27.09.2026) — после тура по
// комнате и до стартового капитала. Три карточки — ближайшие улучшения
// ноутбука, копилки и кровати (lib/savings/goalOptions), те же, что в выборе
// цели «Копилки». Стартовые монеты банка сразу начинают копиться на неё.

import { Text, View } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';

import { GoalOptionCard } from '@/components/savings';
import { useFeedback } from '@/lib/hooks/useFeedback';
import { getFirstGoalOptions } from '@/lib/savings/goalOptions';
import { useResponsive, useTheme } from '@/theme';
import { spacing } from '@/theme/tokens';
import { createOnboardingStepsStyles } from '../onboardingSteps.styles';

export function StepFirstGoal({
  goalId,
  onChangeGoal,
}: {
  goalId: number | null;
  onChangeGoal: (itemId: number) => void;
}) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const { triggerHaptic } = useFeedback();
  const styles = createOnboardingStepsStyles({ theme });
  const options = getFirstGoalOptions();

  return (
    <Animated.View entering={FadeInRight.duration(300)}>
      <View style={{ gap: scale(spacing.md), marginBottom: scale(spacing.xxl), paddingTop: 8 }}>
        {options.map((item) => (
          <GoalOptionCard
            key={item.id}
            item={item}
            selected={item.id === goalId}
            onPress={() => {
              triggerHaptic('selection');
              onChangeGoal(item.id);
            }}
          />
        ))}
      </View>

      <Text style={[styles.stepTitle, styles.centeredText, { fontSize: scaledFont('xxl') }]}>
        Выбери первую цель
      </Text>
      <Text style={[styles.stepSubtitle, styles.centeredText, { fontSize: scaledFont('md') }]}>
        Откладывай монеты — и предмет появится в комнате. Цель можно сменить позже в «Копилке».
      </Text>
    </Animated.View>
  );
}
