import { useGameStore } from '@/app/providers/store';
import { Badge, Card } from '@/shared/ui';
import { PetDisplay } from '@/widgets/pet-display';
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
    ? (() => {
        const { mockAdventures } = require('@/shared/config/mockData');
        const adv = mockAdventures.find((a: any) => a.id === activeAdventure.adventureId);
        return adv?.name || 'Приключение';
      })()
    : '';

  const handleTapPet = () => {
    // Анимация радости при тапе
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="px-4 pt-12 pb-4">
        {/* Шапка */}
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

        {/* Питомец */}
        <Card className="mb-4 items-center">
          <PetDisplay pet={pet} size="lg" onTap={handleTapPet} />
        </Card>

        {/* Баланс */}
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

        {/* Быстрые действия */}
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

function getStageName(stage: number): string {
  const names = ['Яйцо', 'Малыш', 'Подросток', 'Взрослый', 'Мастер'];
  return names[stage - 1] || 'Яйцо';
}

interface QuickActionProps {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  disabled?: boolean;
}

function QuickAction({ icon, title, subtitle, onPress, disabled }: QuickActionProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`flex-row items-center bg-gray-50 p-3 rounded-xl active:opacity-80 ${
        disabled ? 'opacity-50' : ''
      }`}
    >
      <Text className="text-2xl mr-3">{icon}</Text>
      <View className="flex-1">
        <Text className="text-base font-semibold text-text">{title}</Text>
        <Text className="text-sm text-gray-500">{subtitle}</Text>
      </View>
      <Text className="text-gray-400">→</Text>
    </Pressable>
  );
}
