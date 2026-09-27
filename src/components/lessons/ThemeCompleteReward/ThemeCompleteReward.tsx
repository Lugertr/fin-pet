// src/components/lessons/ThemeCompleteReward/ThemeCompleteReward.tsx
// Поздравление за тему, пройденную целиком. Подарка за тему больше нет —
// подарки дают только за 7 дней подряд (решение пользователя 27.09.2026);
// награда за тему — монеты уроков и достижения («Кибер-защитник» и др.).

import { LinearGradient } from 'expo-linear-gradient';
import { Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useResponsive, useTheme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import {
  circleRadius,
  colorPalettes,
  emojiSizes,
  fontWeights,
  radius,
  spacing,
} from '@/theme/tokens';

export function ThemeCompleteReward({ branchName }: { branchName: string }) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();

  return (
    <Animated.View
      entering={FadeInDown.delay(300)}
      style={{ marginTop: scale(spacing.xxxl), borderRadius: scale(radius.xl), overflow: 'hidden' }}
      accessible
      accessibilityLabel={`Тема «${branchName}» пройдена целиком`}
    >
      <LinearGradient
        colors={[colorPalettes.amber[500], colorPalettes.red[500], colorPalettes.violet[500]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ padding: scale(spacing.xxl), alignItems: 'center' }}
      >
        <View
          style={{
            width: scale(80),
            height: scale(80),
            borderRadius: circleRadius(scale(80)),
            backgroundColor: withAlpha(theme.onGradient, 0.25),
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: scale(spacing.lg),
          }}
        >
          <Text style={{ fontSize: scale(emojiSizes.md) }}>🏆</Text>
        </View>
        <Text
          style={{
            color: theme.onGradient,
            fontSize: scaledFont('xxl'),
            fontWeight: fontWeights.bold,
            textAlign: 'center',
            marginBottom: scale(spacing.xs),
          }}
        >
          Поздравляем!
        </Text>
        <Text
          style={{
            color: withAlpha(theme.onGradient, 0.9),
            fontSize: scaledFont('md'),
            textAlign: 'center',
          }}
        >
          Тема «{branchName}» пройдена целиком! Уроки можно повторять, а тренироваться — в Аркаде
          приключения.
        </Text>
      </LinearGradient>
    </Animated.View>
  );
}
