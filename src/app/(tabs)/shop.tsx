// app/(tabs)/shop.tsx
// Магазин с улучшенным визуалом

import { Badge } from '@/components/ui/Badge';
import { COLORS } from '@/constants/theme';
import { useFeedback } from '@/lib/hooks/useFeedback';
import { SHOP_CATALOG, ShopItem, useShop } from '@/lib/hooks/useShop';
import { useUserStore } from '@/lib/stores/userStore';
import { formatCoins } from '@/lib/utils/formatters';
import type { IconName } from '@/types/icons';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const SHOP_CATEGORIES: { id: string; name: string; icon: IconName }[] = [
  { id: 'all', name: 'Все', icon: 'apps' },
  { id: 'decor', name: 'Декор', icon: 'home' },
  { id: 'food', name: 'Еда', icon: 'restaurant' },
  { id: 'buff', name: 'Баффы', icon: 'flash' },
  { id: 'skin', name: 'Скины', icon: 'color-palette' },
];

export default function ShopScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { user } = useUserStore();
  const { purchaseItem } = useShop();
  const { trigger, triggerHaptic } = useFeedback();

  const balance = user?.liquid_balance || 0;

  const filteredItems =
    selectedCategory === 'all'
      ? SHOP_CATALOG
      : SHOP_CATALOG.filter((item) => item.category === selectedCategory);

  const handleSelectCategory = (categoryId: string) => {
    triggerHaptic('selection');
    setSelectedCategory(categoryId);
  };

  const handlePurchase = (item: ShopItem) => {
    if (balance < item.price) {
      trigger('error');
      Alert.alert(
        'Недостаточно монет',
        `Для покупки ${item.name} нужно ${formatCoins(item.price)}`,
        [{ text: 'ОК' }]
      );
      return;
    }

    Alert.alert('Подтверждение покупки', `Купить ${item.name} за ${formatCoins(item.price)}?`, [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Купить',
        onPress: () => {
          const result = purchaseItem(item.id);
          if (result.success) {
            trigger('purchase');
            Alert.alert('🎉 Успех!', result.message);
          } else {
            trigger('error');
            Alert.alert('Ошибка', result.message);
          }
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Заголовок */}
      <LinearGradient
        colors={['#1E293B', '#0F172A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ paddingTop: 56, paddingBottom: 20, paddingHorizontal: 24 }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}
        >
          <View>
            <Text style={{ color: 'white', fontSize: 28, fontWeight: 'bold', marginBottom: 4 }}>
              Магазин 🛒
            </Text>
            <Text style={{ color: COLORS.textSecondary, fontSize: 14 }}>
              Покупайте улучшения для питомца
            </Text>
          </View>
          {/* Баланс */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              backgroundColor: 'rgba(251, 191, 36, 0.15)',
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 24,
              borderWidth: 1,
              borderColor: 'rgba(251, 191, 36, 0.3)',
            }}
          >
            <Ionicons name="wallet" size={20} color={COLORS.coins} />
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
              {formatCoins(balance)}
            </Text>
          </View>
        </View>

        {/* Категории */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {SHOP_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => handleSelectCategory(category.id)}
                activeOpacity={0.7}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 20,
                  backgroundColor:
                    selectedCategory === category.id ? COLORS.primary : COLORS.surfaceLight,
                }}
              >
                <Ionicons
                  name={category.icon}
                  size={16}
                  color={selectedCategory === category.id ? 'white' : COLORS.textSecondary}
                />
                <Text
                  style={{
                    color: selectedCategory === category.id ? 'white' : COLORS.textSecondary,
                    fontWeight: '500',
                    fontSize: 14,
                  }}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </LinearGradient>

      {/* Товары */}
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ padding: 16, gap: 12 }}>
          {filteredItems.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 48 }}>
              <Text style={{ fontSize: 64, marginBottom: 16 }}>🛒</Text>
              <Text style={{ color: COLORS.textSecondary, textAlign: 'center' }}>
                В этой категории пока нет товаров
              </Text>
            </View>
          ) : (
            filteredItems.map((item) => (
              <ShopItemCard
                key={item.id}
                item={item}
                balance={balance}
                onPurchase={() => handlePurchase(item)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

/**
 * Карточка товара
 */
function ShopItemCard({
  item,
  balance,
  onPurchase,
}: {
  item: ShopItem;
  balance: number;
  onPurchase: () => void;
}) {
  const canAfford = balance >= item.price;

  return (
    <View
      style={{
        backgroundColor: COLORS.surface,
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.surfaceLight,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {/* Иконка товара */}
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            backgroundColor: COLORS.surfaceLight,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 14,
          }}
        >
          <Text style={{ fontSize: 32 }}>{item.icon}</Text>
        </View>

        {/* Информация */}
        <View style={{ flex: 1 }}>
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16, marginBottom: 4 }}>
            {item.name}
          </Text>
          <Text style={{ color: COLORS.textSecondary, fontSize: 13, marginBottom: 6 }}>
            {item.description}
          </Text>
          {item.mood_buff > 0 && (
            <Badge label={`+${item.mood_buff} к настроению`} variant="success" />
          )}
        </View>

        {/* Цена и кнопка */}
        <View style={{ alignItems: 'flex-end' }}>
          <Text
            style={{
              color: canAfford ? COLORS.coins : COLORS.error,
              fontWeight: 'bold',
              fontSize: 16,
              marginBottom: 8,
            }}
          >
            {formatCoins(item.price)}
          </Text>
          <TouchableOpacity
            onPress={onPurchase}
            disabled={!canAfford}
            activeOpacity={0.7}
            style={{
              backgroundColor: canAfford ? COLORS.primary : COLORS.surfaceLight,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 12,
              opacity: canAfford ? 1 : 0.5,
            }}
          >
            <Text style={{ color: 'white', fontWeight: '600', fontSize: 13 }}>
              {canAfford ? 'Купить' : 'Нет монет'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
