// src/components/gifts/PendingGiftCard/PendingGiftCard.tsx
// Карточка неоткрытого подарка в списке подарков.

import { LinearGradient } from 'expo-linear-gradient';
import { Text, TouchableOpacity, View } from 'react-native';

import { Gift, getGiftRarityConfig } from '@/types/gifts';
import { useResponsive, useTheme } from '@/theme';
import { radius, spacing } from '@/theme/tokens';
import { createPendingGiftCardStyles } from './PendingGiftCard.styles';

export function PendingGiftCard({ gift, onOpen }: { gift: Gift; onOpen: () => void }) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const styles = createPendingGiftCardStyles({ theme });
  const config = getGiftRarityConfig(gift.rarity, theme);

  return (
    <TouchableOpacity onPress={onOpen} activeOpacity={0.85} style={styles.pendingCard}>
      <LinearGradient
        colors={config.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.pendingCardInner, { padding: scale(spacing.lg) }]}
      >
        <View
          style={[
            styles.pendingIconBox,
            {
              width: scale(56),
              height: scale(56),
              borderRadius: scale(radius.lg),
              marginRight: scale(spacing.lg),
            },
          ]}
        >
          <Text style={{ fontSize: scaledFont('hero') }}>🎁</Text>
        </View>
        <View style={styles.pendingInfoContainer}>
          <Text style={[styles.pendingTitle, { fontSize: scaledFont('md') }]}>
            {gift.mode === 'guaranteed_choice' ? 'Подарок на выбор' : `${config.name} подарок`}
          </Text>
          <Text style={[styles.pendingSubtitle, { fontSize: scaledFont('sm') }]}>
            {gift.themeName ? `За «${gift.themeName}»` : 'Специальный подарок'}
          </Text>
        </View>
        <View
          style={[
            styles.pendingOpenButton,
            { paddingHorizontal: scale(spacing.md), paddingVertical: scale(spacing.sm) },
          ]}
        >
          <Text style={[styles.pendingOpenText, { fontSize: scaledFont('sm') }]}>Открыть</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}
