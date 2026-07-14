import { useGameStore } from '@/app/providers/store';
import { getStageName } from '@/entities/pet';
import { mockAdventures, mockShopItems } from '@/shared/config/mockData';
import { Badge, Card } from '@/shared/ui';
import { PetDisplay } from '@/widgets/pet-display';
import { QuickAction } from '@/widgets/quick-action';
import { useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

export function HomePage() {
  const router = useRouter();
  const pet = useGameStore((s) => s.pet);
  const coins = useGameStore((s) => s.finances.coins);
  const savings = useGameStore((s) => s.finances.savings);
  const currentStreak = useGameStore((s) => s.stats.currentStreak);
  const inventory = useGameStore((s) => s.inventory);
  const activeAdventure = useGameStore((s) => s.activeAdventure);
  const useItem = useGameStore((s) => s.useItem);
  const restoreEnergy = useGameStore((s) => s.restoreEnergy);

  useEffect(() => {
    restoreEnergy();
  }, []);

  const foodItem = useMemo(
    () =>
      inventory.find((i) => {
        const shopItem = mockShopItems.find((s) => s.id === i.itemId);
        return shopItem?.category === 'food' && i.quantity > 0;
      }),
    [inventory]
  );

  const toyItem = useMemo(
    () =>
      inventory.find((i) => {
        const shopItem = mockShopItems.find((s) => s.id === i.itemId);
        return shopItem?.category === 'toy' && i.quantity > 0;
      }),
    [inventory]
  );

  const isAdventureReady = useMemo(
    () => activeAdventure && new Date() >= new Date(activeAdventure.endsAt),
    [activeAdventure]
  );

  const currentAdventureName = useMemo(
    () =>
      activeAdventure
        ? mockAdventures.find((a) => a.id === activeAdventure.adventureId)?.name || 'Приключение'
        : '',
    [activeAdventure]
  );

  if (!pet) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Text className="text-text">Питомец не найден</Text>
      </View>
    );
  }

  const handleTapPet = () => {};

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="px-4 pt-12 pb-4">
        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-text">{pet.name}</Text>
            <Text className="text-sm text-gray-500">
              Уровень {pet.level} • {getStageName(pet.stage)}
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Badge icon="🔥" value={currentStreak} variant="streak" />
            <Pressable
              onPress={() => router.push('/profile')}
              className="w-10 h-10 bg-white rounded-full items-center justify-center active:opacity-80"
            >
              <Text className="text-xl">👤</Text>
            </Pressable>
          </View>
        </View>

        <Card className="mb-4 items-center">
          <PetDisplay pet={pet} size="lg" onTap={handleTapPet} />
        </Card>

        <View className="flex-row gap-3 mb-4">
          <Card className="flex-1">
            <Text className="text-sm text-gray-500">Монеты</Text>
            <Text className="text-2xl font-bold text-primary">{coins} 🪙</Text>
          </Card>
          <Card className="flex-1">
            <Text className="text-sm text-gray-500">Копилка</Text>
            <Text className="text-2xl font-bold text-secondary">{savings} 💰</Text>
          </Card>
        </View>

        <Card>
          <Text className="text-lg font-bold text-text mb-3">Что хочешь сделать?</Text>
          <View className="gap-2">
            <QuickAction
              icon="🍎"
              title="Покормить"
              subtitle={foodItem ? `Есть в инвентаре (${foodItem.quantity})` : 'Купи в магазине'}
              onPress={() => foodItem && useItem(foodItem.itemId)}
              disabled={!foodItem}
            />
            <QuickAction
              icon="🎾"
              title="Поиграть"
              subtitle={toyItem ? `Есть в инвентаре (${toyItem.quantity})` : 'Купи в магазине'}
              onPress={() => toyItem && useItem(toyItem.itemId)}
              disabled={!toyItem}
            />
            <QuickAction
              icon="📚"
              title="Выполнить задание"
              subtitle="+5-15 монет"
              onPress={() => router.push('/tabs/quests')}
            />
            <QuickAction
              icon="🗺️"
              title="Приключение"
              subtitle={
                activeAdventure
                  ? isAdventureReady
                    ? 'Питомец вернулся!'
                    : `${currentAdventureName} — в пути`
                  : 'Отправь питомца'
              }
              onPress={() => router.push('/adventures')}
            />
            <QuickAction
              icon="💬"
              title="Спросить помощника"
              subtitle="Узнай что-то новое"
              onPress={() => router.push('/tabs/chat')}
            />
          </View>
        </Card>
      </View>
    </ScrollView>
  );
}
