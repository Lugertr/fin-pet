import type { ShopItem } from '@/entities/shop-item';
import { Pressable, Text, View } from 'react-native';

export interface ShopItemCardProps {
  item: ShopItem;
  owned: number;
  onPress: () => void;
}

export function ShopItemCard({ item, owned, onPress }: ShopItemCardProps) {
  return (
    <Pressable onPress={onPress} className="bg-white rounded-2xl p-3 w-[47%] active:opacity-80">
      <Text className="text-5xl text-center mb-2">{item.image}</Text>
      <Text className="text-sm font-semibold text-text text-center" numberOfLines={1}>
        {item.name}
      </Text>
      <Text className="text-xs text-primary font-bold text-center mt-1">{item.price} 🪙</Text>
      {owned > 0 && (
        <View className="absolute top-2 right-2 bg-primary rounded-full w-6 h-6 items-center justify-center">
          <Text className="text-white text-xs font-bold">{owned}</Text>
        </View>
      )}
    </Pressable>
  );
}
