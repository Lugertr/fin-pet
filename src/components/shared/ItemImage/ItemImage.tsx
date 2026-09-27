// src/components/shared/ItemImage/ItemImage.tsx
// Картинка вещи в списках (магазин, инвентарь, цель банка): настоящий арт
// предмета нужного варианта (constants/itemAssets.getItemImage), а если арта
// нет (еда, трофеи) — эмодзи. Декоративная: название вещи всегда рядом.

import { Image } from 'expo-image';
import { View } from 'react-native';
import { Text } from '@/components/ui/Text';

import { getItemImage } from '@/constants/itemAssets';
import type { ItemContent } from '@/domain/content/ItemContent';

export function ItemImage({
  item,
  size,
}: {
  item: Pick<ItemContent, 'category' | 'skin_variant' | 'pet_type' | 'icon'>;
  /** Сторона квадрата, уже масштабированная (scale(...)). */
  size: number;
}) {
  const source = getItemImage(item);

  return (
    <View
      aria-hidden
      style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}
    >
      {source ? (
        <Image source={source} style={{ width: size, height: size }} contentFit="contain" />
      ) : (
        <Text style={{ fontSize: Math.round(size * 0.62) }}>{item.icon}</Text>
      )}
    </View>
  );
}
