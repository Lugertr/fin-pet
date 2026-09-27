// src/components/inventory/InventoryItemCard/InventoryItemCard.tsx
// Карточка предмета инвентаря

import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import { Text } from '@/components/ui/Text';

import { ItemImage } from '@/components/shared';

import { Badge, Card } from '@/components/ui';
import { ShopItem } from '@/lib/hooks/useShop';
import { getEffectDescription } from '@/lib/utils/shopItems';
import { useResponsive, useTheme } from '@/theme';
import { radius, spacing } from '@/theme/tokens';
import { createInventoryItemCardStyles } from './InventoryItemCard.styles';

export type OwnedItem = ShopItem & { quantity: number };

export function InventoryItemCard({
  item,
  isPlaced,
  onPress,
}: {
  item: OwnedItem;
  isPlaced: boolean;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();

  const styles = createInventoryItemCardStyles({ theme });
  const effect = getEffectDescription(item);

  return (
    <Card onPress={onPress} padding="md" style={styles.itemCardRow}>
      {/* Иконка */}
      <View
        style={[
          styles.itemIconBox,
          {
            width: scale(56),
            height: scale(56),
            borderRadius: scale(radius.lg),
            marginRight: scale(spacing.lg),
          },
        ]}
      >
        <ItemImage item={item} size={scale(48)} />
        {item.quantity > 1 && (
          <View
            style={[
              styles.itemQuantityBadge,
              {
                top: scale(-6),
                right: scale(-6),
                minWidth: scale(20),
              },
            ]}
          >
            <Text style={styles.itemQuantityText}>x{item.quantity}</Text>
          </View>
        )}
      </View>

      {/* Информация */}
      <View style={styles.itemInfoContainer}>
        <View style={styles.itemNameRow}>
          <Text style={[styles.itemName, { fontSize: scaledFont('lg') }]}>{item.name}</Text>
          {isPlaced && <Badge label="В комнате" variant="success" size="sm" />}
        </View>
        <Text style={[styles.itemDescription, { fontSize: scaledFont('sm') }]}>
          {effect ?? item.description}
        </Text>
      </View>

      {/* Стрелка */}
      <Ionicons name="chevron-forward" size={scale(20)} color={theme.textMuted} />
    </Card>
  );
}
