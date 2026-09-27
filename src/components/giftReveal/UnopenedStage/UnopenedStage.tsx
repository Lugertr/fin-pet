// src/components/giftReveal/UnopenedStage/UnopenedStage.tsx
// Стадия "unopened": закрытый подарок (random), тап открывает его.

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import Animated, { AnimatedStyle } from 'react-native-reanimated';

import { ScreenFooter } from '@/components/ui';
import { Gift, GiftRarityConfig } from '@/types/gifts';
import { useResponsive, useTheme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import { colorPalettes, emojiSizes, spacing } from '@/theme/tokens';
import { createGiftRevealStagesStyles } from '../giftRevealStages.styles';

export function UnopenedStage({
  gift,
  config,
  animatedGiftStyle,
  onOpen,
}: {
  gift: Gift;
  config: GiftRarityConfig | Omit<GiftRarityConfig, 'id' | 'probability' | 'coinRange'>;
  animatedGiftStyle: AnimatedStyle<ViewStyle>;
  onOpen: () => void;
}) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const styles = createGiftRevealStagesStyles({ theme });

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.unopenedScrollArea}>
        <ScrollView contentContainerStyle={styles.unopenedScrollContent}>
          <Text style={[styles.title, { fontSize: scaledFont('title') }]}>Твой подарок!</Text>
          <Text style={[styles.subtitle, { fontSize: scaledFont('md') }]}>
            {gift.themeName ? `За «${gift.themeName}»` : 'Специальный подарок'}
          </Text>

          <Animated.View style={animatedGiftStyle}>
            <TouchableOpacity
              onPress={onOpen}
              activeOpacity={0.8}
              style={{ marginBottom: scale(spacing.xxxl) }}
            >
              <LinearGradient
                colors={config.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  styles.giftBox,
                  {
                    width: scale(160),
                    height: scale(160),
                    borderRadius: scale(32),
                    shadowColor: config.accentColor,
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.5,
                    shadowRadius: 16,
                    elevation: 12,
                  },
                ]}
              >
                <Text style={{ fontSize: scale(emojiSizes.huge) }}>🎁</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          <View
            style={[
              styles.rarityBadge,
              {
                backgroundColor: withAlpha(config.accentColor, 0.188),
                borderColor: withAlpha(config.accentColor, 0.376),
              },
            ]}
          >
            <Text
              style={[styles.rarityText, { color: config.accentColor, fontSize: scaledFont('lg') }]}
            >
              {config.name} подарок
            </Text>
          </View>
        </ScrollView>
      </View>

      <ScreenFooter>
        <TouchableOpacity
          onPress={onOpen}
          activeOpacity={0.8}
          style={[
            styles.openButton,
            {
              alignSelf: 'center',
              paddingHorizontal: scale(spacing.xxxl),
              paddingVertical: scale(spacing.lg),
            },
          ]}
        >
          <Ionicons name="sparkles" size={scale(20)} color={colorPalettes.indigo[600]} />
          <Text style={[styles.openButtonText, { fontSize: scaledFont('lg') }]}>
            Открыть подарок
          </Text>
        </TouchableOpacity>
      </ScreenFooter>
    </View>
  );
}
