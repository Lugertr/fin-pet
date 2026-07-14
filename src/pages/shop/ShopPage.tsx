import { useGameStore } from '@/app/providers/store';
import { SHOP_CATEGORIES } from '@/entities/shop-item';
import { mockShopItems } from '@/shared/config/mockData';
import type { ShopCategory, ShopItem } from '@/shared/types';
import { Button, Card } from '@/shared/ui';
import { ShopCategoryFilter, ShopItemCard } from '@/widgets/shop-grid';
import { useCallback, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

export function ShopPage() {
  const coins = useGameStore((s) => s.finances.coins);
  const buyItem = useGameStore((s) => s.buyItem);
  const inventory = useGameStore((s) => s.inventory);

  const [selectedCategory, setSelectedCategory] = useState<ShopCategory | 'all'>('all');
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const filteredItems = useMemo(
    () =>
      selectedCategory === 'all'
        ? mockShopItems
        : mockShopItems.filter((item) => item.category === selectedCategory),
    [selectedCategory]
  );

  const ownedMap = useMemo(() => {
    const map: Record<string, number> = {};
    inventory.forEach((i) => {
      map[i.itemId] = i.quantity;
    });
    return map;
  }, [inventory]);

  const handleBuy = useCallback(() => {
    if (!selectedItem) return;
    const success = buyItem(selectedItem.id);
    setFeedback({
      success,
      message: success ? `Куплено: ${selectedItem.name}! 🎉` : 'Недостаточно монет 😢',
    });
  }, [selectedItem, buyItem]);

  const handleCloseModal = useCallback(() => {
    setSelectedItem(null);
    setFeedback(null);
  }, []);

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1 px-4 pt-12">
        <Text className="text-3xl font-bold text-text mb-2">Магазин 🛍️</Text>
        <Text className="text-base text-gray-500 mb-4">
          Баланс: <Text className="font-bold text-primary">{coins} 🪙</Text>
        </Text>

        <ShopCategoryFilter
          categories={SHOP_CATEGORIES}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />

        <View className="flex-row flex-wrap gap-3">
          {filteredItems.map((item) => (
            <ShopItemCard
              key={item.id}
              item={item}
              owned={ownedMap[item.id] || 0}
              onPress={() => setSelectedItem(item)}
            />
          ))}
        </View>
      </ScrollView>

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
                  <Text className="text-sm text-gray-500">У тебя: {coins} 🪙</Text>
                </View>

                {!feedback && (
                  <Button
                    title="Купить"
                    onPress={handleBuy}
                    disabled={coins < selectedItem.price}
                    fullWidth
                  />
                )}
                {feedback && (
                  <Button
                    title={feedback.success ? 'Отлично!' : 'Закрыть'}
                    onPress={handleCloseModal}
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
