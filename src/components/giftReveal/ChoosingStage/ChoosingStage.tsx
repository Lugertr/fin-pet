// src/components/giftReveal/ChoosingStage/ChoosingStage.tsx
// Стадия "choosing": выбор 1 из предложенных предметов (guaranteed_choice, §14.1).

import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/ui/Text';

import { SHOP_CATALOG } from '@/lib/hooks/useShop';
import { Gift } from '@/types/gifts';
import { useResponsive, useTheme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import { emojiSizes, fontWeights, radius, spacing } from '@/theme/tokens';
import { createGiftRevealStagesStyles } from '../giftRevealStages.styles';

export function ChoosingStage({
  gift,
  onChoose,
}: {
  gift: Gift;
  onChoose: (itemId: number) => void;
}) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const styles = createGiftRevealStagesStyles({ theme });

  if (!gift.choiceOptions) return null;

  return (
    <View style={styles.unopenedContainer}>
      <Text style={[styles.title, { fontSize: scaledFont('title') }]}>Выбери подарок!</Text>
      <Text
        style={[styles.subtitle, { fontSize: scaledFont('md'), marginBottom: scale(spacing.xxl) }]}
      >
        {gift.themeName ? `За «${gift.themeName}»` : 'Выбери один из предметов'}
      </Text>

      <View style={{ width: '100%', gap: scale(spacing.md) }}>
        {gift.choiceOptions.map((itemId) => {
          const item = SHOP_CATALOG.find((i) => i.id === itemId);
          if (!item) return null;
          return (
            <TouchableOpacity
              key={itemId}
              onPress={() => onChoose(itemId)}
              activeOpacity={0.85}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: scale(spacing.md),
                backgroundColor: withAlpha(theme.onGradient, 0.1),
                borderRadius: scale(radius.lg),
                borderWidth: 1,
                borderColor: withAlpha(theme.onGradient, 0.25),
                padding: scale(spacing.lg),
              }}
            >
              <Text style={{ fontSize: scale(emojiSizes.md) }}>{item.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: theme.onGradient,
                    fontWeight: fontWeights.bold,
                    fontSize: scaledFont('md'),
                  }}
                >
                  {item.name}
                </Text>
                <Text
                  style={{ color: withAlpha(theme.onGradient, 0.7), fontSize: scaledFont('sm') }}
                >
                  {item.description}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={scale(20)} color={theme.onGradient} />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
