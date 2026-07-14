import type { ShopCategoryConfig } from '@/entities/shop-item';
import { Pressable, ScrollView, Text, View } from 'react-native';

export interface ShopCategoryFilterProps {
  categories: ShopCategoryConfig[];
  selected: ShopCategoryConfig['id'];
  onSelect: (id: ShopCategoryConfig['id']) => void;
}

export function ShopCategoryFilter({ categories, selected, onSelect }: ShopCategoryFilterProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4 -mx-4 px-4">
      <View className="flex-row gap-2">
        {categories.map((cat) => {
          const isActive = selected === cat.id;
          return (
            <Pressable
              key={cat.id}
              onPress={() => onSelect(cat.id)}
              className={`px-4 py-2 rounded-full ${
                isActive ? 'bg-primary' : 'bg-white'
              } active:opacity-80`}
            >
              <Text className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-text'}`}>
                {cat.emoji} {cat.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}
