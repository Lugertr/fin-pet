// src/components/onboarding/Step1Intro/Step1Intro.tsx
// Шаг 1 онбординга — приветственный экран, знакомство с Финни. Декоративный,
// без выбора — только заголовок/подзаголовок и переход дальше (см. общий
// футер в onboarding.tsx).

import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';

import { useResponsive, useTheme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import { circleRadius, colorPalettes, spacing } from '@/theme/tokens';
import { createOnboardingStepsStyles } from '../onboardingSteps.styles';

export function Step1Intro() {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const styles = createOnboardingStepsStyles({ theme });

  return (
    <Animated.View entering={FadeInRight.duration(300)}>
      <View
        style={[
          styles.introIllustrationBox,
          { width: scale(220), height: scale(220), marginBottom: scale(spacing.xxl) },
        ]}
      >
        <View
          style={[
            styles.introCenterCard,
            { width: scale(140), height: scale(140), borderRadius: scale(32) },
          ]}
        >
          <Text style={{ fontSize: scaledFont('hero'), color: theme.onGradient }}>?</Text>
          <View style={styles.introCenterDotsRow}>
            {[0, 1, 2].map((i) => (
              <View
                key={i}
                style={[
                  styles.introCenterDot,
                  { width: scale(6), height: scale(6), borderRadius: circleRadius(scale(6)) },
                ]}
              />
            ))}
          </View>
        </View>

        <View
          style={[
            styles.introBadgeCircle,
            styles.introBadgeTopLeft,
            { backgroundColor: colorPalettes.amber[500] },
          ]}
        >
          <Ionicons name="cart" size={scale(22)} color={theme.onGradient} />
        </View>
        <View
          style={[
            styles.introBadgeCircle,
            styles.introBadgeTopRight,
            { backgroundColor: colorPalettes.violet[500] },
          ]}
        >
          <Ionicons name="gift" size={scale(22)} color={theme.onGradient} />
        </View>
        <View
          style={[
            styles.introBadgeCircle,
            styles.introBadgeBottomLeft,
            { backgroundColor: colorPalettes.emerald[500] },
          ]}
        >
          <Ionicons name="swap-horizontal" size={scale(22)} color={theme.onGradient} />
        </View>
        <View
          style={[
            styles.introBadgeCircle,
            styles.introBadgeBottomRight,
            { backgroundColor: withAlpha(colorPalettes.amber[500], 0.9) },
          ]}
        >
          <Text style={{ fontSize: scaledFont('md') }}>🪙</Text>
        </View>
      </View>

      <Text style={[styles.stepTitle, { fontSize: scaledFont('xxl') }]}>Знакомься: это Финни</Text>
      <Text style={[styles.stepSubtitle, { fontSize: scaledFont('md') }]}>
        Здесь ты управляешь деньгами и видишь, к чему приводят решения. Питомец появится скоро — ты
        выберешь его сам.
      </Text>
    </Animated.View>
  );
}
