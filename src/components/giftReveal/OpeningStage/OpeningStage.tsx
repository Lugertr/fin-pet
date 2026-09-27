// src/components/giftReveal/OpeningStage/OpeningStage.tsx
// Стадия "opening": анимация раскрытия подарка (random).

import { LinearGradient } from 'expo-linear-gradient';
import { ViewStyle } from 'react-native';
import { Text } from '@/components/ui/Text';
import Animated, { AnimatedStyle } from 'react-native-reanimated';

import { GiftRarityConfig } from '@/types/gifts';
import { useResponsive, useTheme } from '@/theme';
import { emojiSizes } from '@/theme/tokens';
import { createGiftRevealStagesStyles } from '../giftRevealStages.styles';

export function OpeningStage({
  config,
  animatedGiftStyle,
}: {
  config: GiftRarityConfig | Omit<GiftRarityConfig, 'id' | 'probability' | 'coinRange'>;
  animatedGiftStyle: AnimatedStyle<ViewStyle>;
}) {
  const { theme } = useTheme();
  const { scale } = useResponsive();
  const styles = createGiftRevealStagesStyles({ theme });

  return (
    <Animated.View style={[styles.openingContainer, animatedGiftStyle]}>
      <LinearGradient
        colors={config.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.giftBox, { width: scale(160), height: scale(160), borderRadius: scale(32) }]}
      >
        <Text style={{ fontSize: scale(emojiSizes.huge) }}>🎁</Text>
      </LinearGradient>
    </Animated.View>
  );
}
