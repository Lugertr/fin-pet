// src/components/onboarding/Step6Reward/Step6Reward.tsx
// Шаг 6 онбординга — стартовый капитал зачислен, последний шаг перед хабом.
// Кнопка отправки («Скорее в хаб!») и сам сабмит (создание профиля) теперь
// живут в общем футере onboarding.tsx — этот компонент только показывает
// награду.

import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { STARTING_WALLET_BALANCE } from '@/domain/profile/Profile';
import { useResponsive, useTheme } from '@/theme';
import { emojiSizes, spacing } from '@/theme/tokens';
import { createOnboardingStepsStyles } from '../onboardingSteps.styles';

export function Step6Reward() {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const styles = createOnboardingStepsStyles({ theme });

  const bounce = useSharedValue(0);

  useEffect(() => {
    bounce.value = withRepeat(
      withSequence(withTiming(-6, { duration: 500 }), withTiming(0, { duration: 500 })),
      -1,
      true
    );
  }, [bounce]);

  const animatedBounceStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bounce.value }],
  }));

  return (
    <Animated.View entering={FadeInRight.duration(300)} style={styles.rewardContainer}>
      <View style={[styles.rewardIllustrationBox, { marginBottom: scale(spacing.xl) }]}>
        <Animated.View style={animatedBounceStyle}>
          <Text style={{ fontSize: scale(emojiSizes.huge) }}>🪙</Text>
        </Animated.View>
      </View>

      <Text style={[styles.rewardTitle, { fontSize: scaledFont('xxl') }]}>
        Твой стартовый капитал! 🎉
      </Text>

      <LinearGradient
        colors={theme.gradients.reward}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.rewardCard, { padding: scale(spacing.xl) }]}
      >
        <Text style={[styles.rewardCardLabel, { fontSize: scaledFont('sm') }]}>
          ПРИВЕТСТВЕННЫЙ КУШ
        </Text>
        <Text style={[styles.rewardCardValue, { fontSize: scaledFont('hero') }]}>
          +{STARTING_WALLET_BALANCE} 💰
        </Text>
        <View style={[styles.rewardCardBadge, { paddingHorizontal: scale(spacing.md) }]}>
          <View style={styles.rewardCardBadgeDot} />
          <Text style={[styles.rewardCardBadgeText, { fontSize: scaledFont('xs') }]}>
            НАЧИСЛЕНО на баланс
          </Text>
        </View>
      </LinearGradient>

      <View style={[styles.confirmationPill, { paddingHorizontal: scale(spacing.lg) }]}>
        <Text style={[styles.confirmationPillText, { fontSize: scaledFont('sm') }]}>
          ✅ Бонус новичка активирован 🎉
        </Text>
      </View>

      <Text style={[styles.rewardFooterHint, { fontSize: scaledFont('xs') }]}>
        🐾 Твой питомец уже ждёт тебя в комнате!
      </Text>
    </Animated.View>
  );
}
