// src/components/giftReveal/RevealedStage/RevealedStage.tsx
// Стадия "revealed": показ содержимого подарка (иконка предмета, редкость, монеты).

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { ScreenFooter } from '@/components/ui';
import { GiftRevealResult } from '@/lib/stores/giftsStore';
import { GiftRarityConfig } from '@/types/gifts';
import { useResponsive, useTheme } from '@/theme';
import { emojiSizes, spacing } from '@/theme/tokens';
import { formatPrice } from '@/lib/utils/formatters';
import { createGiftRevealStagesStyles } from '../giftRevealStages.styles';

export function RevealedStage({
  result,
  config,
  onClaim,
}: {
  result: GiftRevealResult;
  config: GiftRarityConfig | Omit<GiftRarityConfig, 'id' | 'probability' | 'coinRange'>;
  onClaim: () => void;
}) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const styles = createGiftRevealStagesStyles({ theme });

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.revealedScrollArea}>
        <ScrollView contentContainerStyle={styles.revealedScrollContent}>
          <Text style={[styles.revealedTitle, { fontSize: scaledFont('title') }]}>
            Поздравляем! 🎉
          </Text>
          <Text style={[styles.revealedSubtitle, { fontSize: scaledFont('md') }]}>
            Твоя награда:
          </Text>

          <LinearGradient
            colors={config.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.itemCard,
              {
                width: scale(140),
                height: scale(140),
                borderRadius: scale(28),
                marginBottom: scale(spacing.xxl),
                shadowColor: config.accentColor,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.5,
                shadowRadius: 16,
                elevation: 12,
              },
            ]}
          >
            <Text style={{ fontSize: scale(emojiSizes.xxxl) }}>{result.itemIcon}</Text>
          </LinearGradient>

          <Text style={[styles.itemName, { fontSize: scaledFont('xxl') }]}>{result.itemName}</Text>

          <View
            style={[
              styles.rarityLabel,
              {
                backgroundColor: `${config.accentColor}30`,
                borderColor: `${config.accentColor}60`,
              },
            ]}
          >
            <Text
              style={[
                styles.rarityLabelText,
                { color: config.accentColor, fontSize: scaledFont('sm') },
              ]}
            >
              {config.name}
            </Text>
          </View>

          {result.coins > 0 && (
            <View style={styles.coinsBox}>
              <Text style={[styles.coinsText, { fontSize: scaledFont('lg') }]}>
                +{formatPrice(result.coins)}
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

      <ScreenFooter>
        <TouchableOpacity onPress={onClaim} activeOpacity={0.8} style={styles.claimButton}>
          <LinearGradient
            colors={theme.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.claimButtonInner, { padding: scale(spacing.lg) }]}
          >
            <Ionicons name="checkmark-circle" size={scale(24)} color={theme.onGradient} />
            <Text style={[styles.claimButtonText, { fontSize: scaledFont('lg') }]}>
              Забрать в инвентарь
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScreenFooter>
    </View>
  );
}
