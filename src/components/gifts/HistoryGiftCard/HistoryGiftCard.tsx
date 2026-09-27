// src/components/gifts/HistoryGiftCard/HistoryGiftCard.tsx
// Карточка записи истории открытых подарков.

import { Text, View } from 'react-native';

import { Card } from '@/components/ui';
import { GiftHistoryEntry } from '@/lib/stores/giftsStore';
import { formatPrice } from '@/lib/utils/formatters';
import { getGiftRarityConfig } from '@/types/gifts';
import { useResponsive, useTheme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import { radius, spacing } from '@/theme/tokens';
import { createHistoryGiftCardStyles } from './HistoryGiftCard.styles';

export function HistoryGiftCard({ entry }: { entry: GiftHistoryEntry }) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const styles = createHistoryGiftCardStyles({ theme });
  const config = getGiftRarityConfig(entry.rarity, theme);

  return (
    <Card padding="md" style={styles.historyCardRow}>
      <View
        style={[
          styles.historyIconBox,
          {
            width: scale(44),
            height: scale(44),
            borderRadius: scale(radius.md),
            backgroundColor: withAlpha(config.accentColor, 0.125),
            marginRight: scale(spacing.md),
          },
        ]}
      >
        <Text style={{ fontSize: scale(22) }}>{entry.itemIcon}</Text>
      </View>
      <View style={styles.historyInfoContainer}>
        <Text style={[styles.historyItemName, { fontSize: scaledFont('md') }]}>
          {entry.itemName}
        </Text>
        <Text
          style={[
            styles.historyRarityText,
            { color: config.accentColor, fontSize: scaledFont('sm') },
          ]}
        >
          {config.name} • +{formatPrice(entry.coins)}
        </Text>
      </View>
      <Text style={[styles.historyDate, { fontSize: scaledFont('xs') }]}>
        {new Date(entry.openedAt).toLocaleDateString('ru-RU')}
      </Text>
    </Card>
  );
}
