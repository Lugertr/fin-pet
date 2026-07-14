import { useGameStore } from '@/app/providers/store';
import { mockShopItems } from '@/shared/config/mockData';
import type { ShopCategory, ShopItem } from '@/shared/types';
import { Button, Card } from '@/shared/ui';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

const categories: { id: ShopCategory | 'all'; label: string; emoji: string }[] = [
  { id: 'all', label: 'Всё', emoji: '🛍️' },
  { id: 'food', label: 'Еда', emoji: '🍎' },
  { id: 'toy', label: 'Игрушки', emoji: '🎾' },
  { id: 'accessory', label: 'Аксессуары', emoji: '🎩' },
  { id: 'investment', label: 'Инвестиции', emoji: '📈' },
];

export function ShopPage() {
  const { finances, buyItem, inventory } = useGameStore();
  const [selectedCategory, setSelectedCategory] = useState<ShopCategory | 'all'>('all');
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const filteredItems =
    selectedCategory === 'all'
      ? mockShopItems
      : mockShopItems.filter((item) => item.category === selectedCategory);

  const handleBuy = () => {
    if (!selectedItem) return;

    const success = buyItem(selectedItem.id);
    setFeedback({
      success,
      message: success ? `Куплено: ${selectedItem.name}! 🎉` : 'Недостаточно монет 😢',
    });
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
    setFeedback(null);
  };

  const getOwnedQuantity = (itemId: string) => {
    return inventory.find((i) => i.itemId === itemId)?.quantity || 0;
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1 px-4 pt-12">
        <Text className="text-3xl font-bold text-text mb-2">Магазин 🛍️</Text>
        <Text className="text-base text-gray-500 mb-4">
          Баланс: <Text className="font-bold text-primary">{finances.coins} 🪙</Text>
        </Text>

        {/* Категории */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4 -mx-4 px-4">
          <View className="flex-row gap-2">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <Pressable
                  key={cat.id}
                  onPress={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-full ${
                    isActive ? 'bg-primary' : 'bg-white'
                  } active:opacity-80`}
                >
                  <Text
                    className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-text'}`}
                  >
                    {cat.emoji} {cat.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        {/* Товары */}
        <View className="flex-row flex-wrap gap-3">
          {filteredItems.map((item) => (
            <ShopItemCard
              key={item.id}
              item={item}
              owned={getOwnedQuantity(item.id)}
              onPress={() => setSelectedItem(item)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Модальное окно товара */}
      <Modal
        visible={!!selectedItem}
        animationType="slide"
        transparent
        onRequestClose={handleCloseModal}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 pb-8">
            {selectedItem && (
              <>
                <View className="flex-row justify-between items-start mb-4">
                  <View className="flex-1">
                    <Text className="text-6xl text-center mb-2">{selectedItem.image}</Text>
                    <Text className="text-xl font-bold text-text text-center">
                      {selectedItem.name}
                    </Text>
                    <Text className="text-sm text-gray-500 text-center mt-1">
                      {selectedItem.description}
                    </Text>
                  </View>
                  <Pressable onPress={handleCloseModal} className="absolute top-0 right-0">
                    <Text className="text-2xl text-gray-400">✕</Text>
                  </Pressable>
                </View>

                <Card className="mb-4 bg-gray-50">
                  <Text className="text-sm text-text">
                    {selectedItem.effect.hunger && `🍎 Сытость: +${selectedItem.effect.hunger}`}
                    {selectedItem.effect.happiness &&
                      `😊 Счастье: +${selectedItem.effect.happiness}`}
                    {selectedItem.effect.passiveIncome &&
                      `💰 Доход: +${selectedItem.effect.passiveIncome}/день`}
                    {!selectedItem.effect.hunger &&
                      !selectedItem.effect.happiness &&
                      !selectedItem.effect.passiveIncome &&
                      '✨ Косметический предмет'}
                  </Text>
                </Card>

                {feedback && (
                  <Card className={`mb-4 ${feedback.success ? 'bg-green-50' : 'bg-red-50'}`}>
                    <Text
                      className={`text-base font-semibold text-center ${
                        feedback.success ? 'text-green-700' : 'text-red-700'
                      }`}
                    >
                      {feedback.message}
                    </Text>
                  </Card>
                )}

                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-2xl font-bold text-primary">{selectedItem.price} 🪙</Text>
                  <Text className="text-sm text-gray-500">У тебя: {finances.coins} 🪙</Text>
                </View>

                {!feedback && (
                  <Button
                    title="Купить"
                    onPress={handleBuy}
                    disabled={finances.coins < selectedItem.price}
                    fullWidth
                  />
                )}
                {feedback && (
                  <Button
                    title={feedback.success ? 'Отлично!' : 'Закрыть'}
                    onPress={feedback.success ? handleCloseModal : handleCloseModal}
                    fullWidth
                  />
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

interface ShopItemCardProps {
  item: ShopItem;
  owned: number;
  onPress: () => void;
}

function ShopItemCard({ item, owned, onPress }: ShopItemCardProps) {
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
