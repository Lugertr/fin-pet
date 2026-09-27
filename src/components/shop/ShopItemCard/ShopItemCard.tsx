// src/components/shop/ShopItemCard/ShopItemCard.tsx
// Карточка товара в магазине

import { Text, TouchableOpacity, View } from 'react-native';

import { CoinAmount, ItemImage } from '@/components/shared';
import { Badge, Card } from '@/components/ui';
import { ShopItem } from '@/lib/hooks/useShop';
import { getEffectDescription } from '@/lib/utils/shopItems';
import { useResponsive, useTheme } from '@/theme';
import { radius, spacing } from '@/theme/tokens';
import { createShopItemCardStyles } from './ShopItemCard.styles';

export function ShopItemCard({
  item,
  balance,
  onPurchase,
}: {
  item: ShopItem;
  balance: number;
  onPurchase: () => void;
}) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();

  const styles = createShopItemCardStyles({ theme });
  const canAfford = balance >= item.price;
  const effect = getEffectDescription(item);

  return (
    <Card padding="md" style={styles.itemCardRow}>
      {/* Настоящий облик товара (арт мебели/фона), для еды — эмодзи */}
      <View
        style={[
          styles.itemIconBox,
          {
            width: scale(64),
            height: scale(64),
            borderRadius: scale(radius.lg),
            marginRight: scale(spacing.lg),
          },
        ]}
      >
        <ItemImage item={item} size={scale(56)} />
      </View>

      {/* Информация */}
      <View style={styles.itemInfoContainer}>
        <Text
          style={[styles.itemName, { fontSize: scaledFont('lg'), marginBottom: scale(spacing.xs) }]}
        >
          {item.name}
        </Text>
        <Text
          style={[
            styles.itemDescription,
            { fontSize: scaledFont('sm'), marginBottom: scale(spacing.xs) },
          ]}
        >
          {item.description}
        </Text>
        {effect && <Badge label={effect} variant="success" size="sm" />}
      </View>

      {/* Цена и кнопка */}
      <View style={styles.itemPriceContainer}>
        <CoinAmount
          amount={item.price}
          fontSize={scaledFont('lg')}
          style={{ marginBottom: scale(spacing.sm) }}
          textStyle={[
            styles.itemPrice,
            canAfford ? styles.itemPriceAffordable : styles.itemPriceNotAffordable,
          ]}
        />
        <TouchableOpacity
          onPress={onPurchase}
          disabled={!canAfford}
          activeOpacity={0.7}
          style={[
            styles.buyButton,
            canAfford ? styles.buyButtonEnabled : styles.buyButtonDisabled,
            {
              paddingHorizontal: scale(spacing.lg),
              paddingVertical: scale(spacing.sm),
            },
          ]}
        >
          <Text style={[styles.buyButtonText, { fontSize: scaledFont('sm') }]}>
            {canAfford ? 'Купить' : 'Нет монет'}
          </Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
}
