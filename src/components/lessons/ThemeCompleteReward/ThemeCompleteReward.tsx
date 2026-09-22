// src/components/lessons/ThemeCompleteReward/ThemeCompleteReward.tsx
// Награда за завершение всей темы (интеграция с подарками, §14 ТЗ)

import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useFeedback } from '@/lib/hooks/useFeedback';
import { useGifts } from '@/lib/stores/giftsStore';
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

export function ThemeCompleteReward({
  branchId,
  branchName,
}: {
  branchId: number;
  branchName: string;
}) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const { triggerHaptic } = useFeedback();
  const router = useRouter();
  const { hasUnopenedGiftForBranch, addRandomGift, pendingGifts } = useGifts();

  const hasGift = hasUnopenedGiftForBranch(branchId);
  const branchGift = pendingGifts.find((g) => g.branchId === branchId && !g.isOpened);

  const handleGetGift = () => {
    triggerHaptic('success');
    const giftToOpen = branchGift || addRandomGift('branch_complete', branchId, branchName);
    router.push({
      pathname: '/(modal)/theme-reward',
      params: { giftId: giftToOpen.id },
    } as never);
  };

  return (
    <Animated.View entering={FadeInDown.delay(300)} style={{ marginTop: scale(spacing.xxxl) }}>
      <TouchableOpacity
        onPress={handleGetGift}
        activeOpacity={0.8}
        style={{ borderRadius: scale(radius.xl), overflow: 'hidden' }}
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
            <Text style={{ fontSize: scale(emojiSizes.md) }}>🎁</Text>
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
              marginBottom: scale(spacing.lg),
            }}
          >
            Вы прошли всю тему «{branchName}»!
          </Text>
          <View
            style={{
              backgroundColor: withAlpha(theme.onGradient, 0.25),
              paddingHorizontal: scale(spacing.xl),
              paddingVertical: scale(spacing.sm),
              borderRadius: scale(radius.xl),
            }}
          >
            <Text
              style={{
                color: theme.onGradient,
                fontWeight: fontWeights.bold,
                fontSize: scaledFont('md'),
              }}
            >
              {hasGift ? 'Открыть подарок 🎁' : 'Получить подарок 🎁'}
            </Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}
