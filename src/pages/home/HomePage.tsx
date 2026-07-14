import { useGameStore } from '@/app/providers/store';
import { getStageName } from '@/entities/pet';
import { mockAdventures } from '@/shared/config/mockData';
import { Badge, Card } from '@/shared/ui';
import { PetDisplay } from '@/widgets/pet-display';
import { QuickAction } from '@/widgets/quick-action';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

export function HomePage() {
  const router = useRouter();
  const { pet, finances, stats, useItem, inventory, activeAdventure, restoreEnergy } =
    useGameStore();

  useEffect(() => {
    restoreEnergy();
  }, []);

  if (!pet) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Text className="text-text">Питомец не найден</Text>
      </View>
    );
  }

  const foodItem = inventory.find((i) => i.itemId === 'apple');
  const toyItem = inventory.find((i) => i.itemId === 'ball');

  const isAdventureReady = activeAdventure && new Date() >= new Date(activeAdventure.endsAt);

  const currentAdventureName = activeAdventure
    ? mockAdventures.find((a) => a.id === activeAdventure.adventureId)?.name || 'Приключение'
    : '';

  const handleTapPet = () => {
    // Анимация радости при тапе
  };

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
            <Badge icon="🔥" value={stats.currentStreak} variant="streak" />
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
            <Text className="text-2xl font-bold text-primary">{finances.coins} 🪙</Text>
          </Card>
          <Card className="flex-1">
            <Text className="text-sm text-gray-500">Копилка</Text>
            <Text className="text-2xl font-bold text-secondary">{finances.savings} 💰</Text>
          </Card>
        </View>

        <Card>
          <Text className="text-lg font-bold text-text mb-3">Что хочешь сделать?</Text>
          <View className="gap-2">
            <QuickAction
              icon="🍎"
              title="Покормить"
              subtitle={foodItem ? `Есть в инвентаре (${foodItem.quantity})` : 'Купи в магазине'}
              onPress={() => foodItem && useItem('apple')}
              disabled={!foodItem}
            />
            <QuickAction
              icon="🎾"
              title="Поиграть"
              subtitle={toyItem ? `Есть в инвентаре (${toyItem.quantity})` : 'Купи в магазине'}
              onPress={() => toyItem && useItem('ball')}
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
