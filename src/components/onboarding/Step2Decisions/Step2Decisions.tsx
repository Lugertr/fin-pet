// src/components/onboarding/Step2Decisions/Step2Decisions.tsx
// Шаг 2 онбординга — «Три типа решений»: объясняет ребёнку три категории
// трат до того, как он впервые получит монеты. Контент статичный и не
// завязан ни на одну игровую модель данных (в коде нет отдельной
// need/want/save-категоризации трат) — это чисто иллюстративный экран.

import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import { Text } from '@/components/ui/Text';
import Animated, { FadeInRight } from 'react-native-reanimated';

import { useResponsive, useTheme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import { colorPalettes } from '@/theme/tokens';
import { createOnboardingStepsStyles } from '../onboardingSteps.styles';

const DECISIONS = [
  {
    icon: 'cart' as const,
    color: colorPalettes.amber[500],
    label: 'Нужно',
    sublabel: 'еда и уход',
  },
  {
    icon: 'gift' as const,
    color: colorPalettes.violet[500],
    label: 'Хочу',
    sublabel: 'игрушки и украшения',
  },
  {
    icon: 'swap-horizontal' as const,
    color: colorPalettes.emerald[500],
    label: 'Коплю',
    sublabel: 'на большую цель',
  },
];

export function Step2Decisions() {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const styles = createOnboardingStepsStyles({ theme });

  return (
    <Animated.View entering={FadeInRight.duration(300)}>
      <View style={styles.decisionsCardsRow}>
        {DECISIONS.map((item) => (
          <View key={item.label} style={styles.decisionCard}>
            <View
              style={[styles.decisionIconBox, { backgroundColor: withAlpha(item.color, 0.15) }]}
            >
              <Ionicons name={item.icon} size={scale(20)} color={item.color} />
            </View>
            <Text style={[styles.decisionLabel, { fontSize: scaledFont('sm') }]}>{item.label}</Text>
            <Text style={[styles.decisionSubLabel, { fontSize: scaledFont('xxs') }]}>
              {item.sublabel}
            </Text>
          </View>
        ))}
      </View>

      <Text style={[styles.stepTitle, { fontSize: scaledFont('xxl') }]}>Три типа решений</Text>
      <Text style={[styles.stepSubtitle, { fontSize: scaledFont('md') }]}>
        Когда получаешь монеты, ты сам решаешь: потратить на нужное, на желаемое или отложить.
      </Text>
    </Animated.View>
  );
}
