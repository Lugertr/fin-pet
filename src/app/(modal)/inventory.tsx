// app/(modal)/inventory.tsx
// Инвентарь: склад купленного декора, предметов ухода и вещей

import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { COLORS } from '@/constants/theme';
import { formatCoins } from '@/lib/utils/formatters';
import { IconName } from '@/types/icons';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

// Категории инвентаря
const INVENTORY_CATEGORIES: { id: string; name: string; icon: IconName }[] = [
  { id: 'all', name: 'Все', icon: 'apps' },
  { id: 'decor', name: 'Декор', icon: 'home' },
  { id: 'food', name: 'Еда', icon: 'restaurant' },
  { id: 'buff', name: 'Баффы', icon: 'flash' },
  { id: 'skin', name: 'Скины', icon: 'color-palette' },
] as const;

// Предметы инвентаря (в реальном приложении приходят с бэкенда)
const INVENTORY_ITEMS = [
  {
    id: 1,
    name: 'Кровать',
    category: 'decor',
    icon: '🛏️',
    quantity: 1,
    is_placed: true,
    mood_buff: 2,
    description: '+2 к восстановлению',
  },
  {
    id: 2,
    name: 'Растение',
    category: 'decor',
    icon: '🪴',
    quantity: 2,
    is_placed: true,
    mood_buff: 1,
    description: '+1 к восстановлению',
  },
  {
    id: 3,
    name: 'Лампа',
    category: 'decor',
    icon: '💡',
    quantity: 1,
    is_placed: false,
    mood_buff: 1,
    description: '+1 к восстановлению',
  },
  {
    id: 4,
    name: 'Яблоко',
    category: 'food',
    icon: '🍎',
    quantity: 5,
    is_placed: false,
    mood_buff: 0,
    description: '+5 к настроению',
  },
  {
    id: 5,
    name: 'Пицца',
    category: 'food',
    icon: '🍕',
    quantity: 2,
    is_placed: false,
    mood_buff: 0,
    description: '+15 к настроению',
  },
  {
    id: 6,
    name: 'Ускоритель',
    category: 'buff',
    icon: '⚡',
    quantity: 1,
    is_placed: false,
    mood_buff: 0,
    description: 'x2 опыт на 1 час',
  },
  {
    id: 7,
    name: 'Золотой скин',
    category: 'skin',
    icon: '✨',
    quantity: 1,
    is_placed: false,
    mood_buff: 0,
    description: 'Золотая рамка',
  },
];

export default function InventoryScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<(typeof INVENTORY_ITEMS)[number] | null>(null);

  const filteredItems =
    selectedCategory === 'all'
      ? INVENTORY_ITEMS
      : INVENTORY_ITEMS.filter((item) => item.category === selectedCategory);

  const totalItems = INVENTORY_ITEMS.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = INVENTORY_ITEMS.reduce((sum, item) => sum + item.quantity * 50, 0);

  return (
    <View className="flex-1 bg-slate-900">
      {/* Заголовок */}
      <LinearGradient colors={[COLORS.surface, COLORS.background]} className="px-6 pt-14 pb-4">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white font-semibold text-lg">Инвентарь</Text>
          <View className="w-6" />
        </View>

        {/* Статистика */}
        <View className="flex-row gap-3 mb-4">
          <View className="flex-1 bg-slate-800/50 rounded-xl p-3 items-center">
            <Text className="text-white font-bold text-lg">{totalItems}</Text>
            <Text className="text-slate-400 text-xs">Предметов</Text>
          </View>
          <View className="flex-1 bg-slate-800/50 rounded-xl p-3 items-center">
            <Text className="text-amber-400 font-bold text-lg">{formatCoins(totalValue)}</Text>
            <Text className="text-slate-400 text-xs">Стоимость</Text>
          </View>
          <View className="flex-1 bg-slate-800/50 rounded-xl p-3 items-center">
            <Text className="text-green-400 font-bold text-lg">+4</Text>
            <Text className="text-slate-400 text-xs">Бафф настроения</Text>
          </View>
        </View>

        {/* Категории */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
          {INVENTORY_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              onPress={() => setSelectedCategory(category.id)}
              className={`flex-row items-center px-4 py-2 rounded-full mr-2 ${
                selectedCategory === category.id ? 'bg-indigo-500' : 'bg-slate-800'
              }`}
            >
              <Ionicons
                name={category.icon}
                size={16}
                color={selectedCategory === category.id ? 'white' : COLORS.textSecondary}
              />
              <Text
                className={`ml-1 font-medium ${
                  selectedCategory === category.id ? 'text-white' : 'text-slate-400'
                }`}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </LinearGradient>

      {/* Список предметов */}
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="mt-4 gap-3 pb-8">
          {filteredItems.map((item) => (
            <InventoryItemCard key={item.id} item={item} onPress={() => setSelectedItem(item)} />
          ))}
        </View>
      </ScrollView>

      {/* Модалка предмета */}
      {selectedItem && (
        <ItemDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </View>
  );
}

/**
 * Карточка предмета инвентаря
 */
function InventoryItemCard({
  item,
  onPress,
}: {
  item: (typeof INVENTORY_ITEMS)[number];
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Card variant="default" padding="md" className="border border-slate-700">
        <View className="flex-row items-center">
          {/* Иконка */}
          <View className="w-14 h-14 rounded-xl bg-slate-700/50 items-center justify-center mr-4">
            <Text className="text-2xl">{item.icon}</Text>
            {item.quantity > 1 && (
              <View className="absolute -top-1 -right-1 bg-indigo-500 rounded-full px-1.5 py-0.5">
                <Text className="text-white text-[10px] font-bold">x{item.quantity}</Text>
              </View>
            )}
          </View>

          {/* Информация */}
          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <Text className="text-white font-medium">{item.name}</Text>
              {item.is_placed && <Badge label="В комнате" variant="success" />}
            </View>
            <Text className="text-slate-400 text-sm">{item.description}</Text>
          </View>

          {/* Стрелка */}
          <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
        </View>
      </Card>
    </TouchableOpacity>
  );
}

/**
 * Модалка с деталями предмета
 */
function ItemDetailModal({
  item,
  onClose,
}: {
  item: (typeof INVENTORY_ITEMS)[number];
  onClose: () => void;
}) {
  return (
    <View className="absolute inset-0 bg-black/70 justify-end">
      <TouchableOpacity className="absolute inset-0" onPress={onClose} />
      <View className="bg-slate-800 rounded-t-3xl p-6">
        {/* Заголовок */}
        <View className="items-center mb-6">
          <View className="w-20 h-20 rounded-2xl bg-slate-700 items-center justify-center mb-4">
            <Text className="text-4xl">{item.icon}</Text>
          </View>
          <Text className="text-white text-xl font-bold">{item.name}</Text>
          <Text className="text-slate-400 text-sm">{item.description}</Text>
        </View>

        {/* Характеристики */}
        <View className="bg-slate-700/50 rounded-xl p-4 mb-6">
          <View className="flex-row justify-between mb-3">
            <Text className="text-slate-400">Количество</Text>
            <Text className="text-white font-medium">{item.quantity} шт.</Text>
          </View>
          <View className="flex-row justify-between mb-3">
            <Text className="text-slate-400">Категория</Text>
            <Text className="text-white font-medium">
              {INVENTORY_CATEGORIES.find((c) => c.id === item.category)?.name}
            </Text>
          </View>
          {item.mood_buff > 0 && (
            <View className="flex-row justify-between">
              <Text className="text-slate-400">Бафф настроения</Text>
              <Text className="text-green-400 font-medium">+{item.mood_buff} в час</Text>
            </View>
          )}
        </View>

        {/* Действия */}
        <View className="flex-row gap-3">
          {item.category === 'decor' && !item.is_placed && (
            <TouchableOpacity className="flex-1 bg-indigo-500 rounded-xl py-3 items-center">
              <Text className="text-white font-semibold">Разместить</Text>
            </TouchableOpacity>
          )}
          {item.category === 'decor' && item.is_placed && (
            <TouchableOpacity className="flex-1 bg-slate-600 rounded-xl py-3 items-center">
              <Text className="text-white font-semibold">Убрать</Text>
            </TouchableOpacity>
          )}
          {item.category === 'food' && (
            <TouchableOpacity className="flex-1 bg-green-500 rounded-xl py-3 items-center">
              <Text className="text-white font-semibold">Использовать</Text>
            </TouchableOpacity>
          )}
          {item.category === 'buff' && (
            <TouchableOpacity className="flex-1 bg-amber-500 rounded-xl py-3 items-center">
              <Text className="text-black font-semibold">Активировать</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={onClose}
            className="flex-1 bg-slate-700 rounded-xl py-3 items-center"
          >
            <Text className="text-white font-semibold">Закрыть</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
