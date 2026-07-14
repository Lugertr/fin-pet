import { useGameStore } from '@/app/providers/store';
import { formatAdventureTime, isAdventureReady } from '@/entities/adventure';
import { mockAdventures } from '@/shared/config/mockData';
import type { Adventure } from '@/shared/types';
import { Button, Card } from '@/shared/ui';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

export function AdventuresPage() {
  const router = useRouter();
  const pet = useGameStore((s) => s.pet);
  const activeAdventure = useGameStore((s) => s.activeAdventure);
  const startAdventure = useGameStore((s) => s.startAdventure);
  const completeAdventure = useGameStore((s) => s.completeAdventure);

  const [selectedAdventure, setSelectedAdventure] = useState<Adventure | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [completedReward, setCompletedReward] = useState<number | null>(null);

  const adventureReady = useMemo(
    () => (activeAdventure ? isAdventureReady(activeAdventure.endsAt) : false),
    [activeAdventure]
  );

  const currentAdventure = useMemo(
    () =>
      activeAdventure
        ? mockAdventures.find((a) => a.id === activeAdventure.adventureId) || null
        : null,
    [activeAdventure]
  );

  useEffect(() => {
    if (!activeAdventure) {
      setTimeLeft('');
      return;
    }

    const updateTimer = () => {
      setTimeLeft(formatAdventureTime(activeAdventure.endsAt));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeAdventure]);

  const handleStart = useCallback(() => {
    if (!selectedAdventure || !pet) return;
    const success = startAdventure(selectedAdventure.id);
    if (success) setSelectedAdventure(null);
  }, [selectedAdventure, pet, startAdventure]);

  const handleComplete = useCallback(() => {
    const reward = completeAdventure();
    if (reward !== null) setCompletedReward(reward);
  }, [completeAdventure]);

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1 px-4 pt-12">
        <View className="flex-row items-center mb-6">
          <Pressable onPress={() => router.back()} className="p-2 mr-2">
            <Text className="text-2xl">←</Text>
          </Pressable>
          <Text className="text-2xl font-bold text-text">Приключения 🗺️</Text>
        </View>

        <Text className="text-base text-gray-500 mb-6">
          Отправь питомца в путешествие — он принесёт монеты!
        </Text>

        {activeAdventure && currentAdventure && (
          <Card className="mb-4 bg-purple-50 border-2 border-purple-200">
            <View className="flex-row items-center mb-3">
              <Text className="text-5xl mr-3">{currentAdventure.emoji}</Text>
              <View className="flex-1">
                <Text className="text-lg font-bold text-text">{currentAdventure.name}</Text>
                <Text className="text-sm text-gray-500">
                  {adventureReady ? 'Питомец вернулся!' : 'В пути...'}
                </Text>
              </View>
            </View>

            {!adventureReady ? (
              <View className="bg-white/70 rounded-xl p-3">
                <Text className="text-sm text-gray-500 mb-1">Осталось:</Text>
                <Text className="text-2xl font-bold text-purple-600">{timeLeft}</Text>
              </View>
            ) : (
              <Button
                title={`Забрать ${currentAdventure.minReward}-${currentAdventure.maxReward} 🪙`}
                onPress={handleComplete}
                fullWidth
              />
            )}
          </Card>
        )}

        <Text className="text-lg font-bold text-text mb-3">Доступные приключения</Text>

        <View className="gap-3">
          {mockAdventures.map((adventure) => {
            const isLocked = pet ? pet.level < adventure.levelRequirement : true;
            const isBusy = !!activeAdventure;
            const noEnergy = pet ? pet.energy < adventure.energyCost : true;

            return (
              <Pressable
                key={adventure.id}
                onPress={() => !isLocked && !isBusy && setSelectedAdventure(adventure)}
                disabled={isLocked || isBusy}
                className={`bg-white rounded-2xl p-4 ${
                  isLocked || isBusy ? 'opacity-50' : 'active:opacity-80'
                }`}
              >
                <View className="flex-row items-center">
                  <Text className="text-5xl mr-4">{adventure.emoji}</Text>
                  <View className="flex-1">
                    <View className="flex-row items-center mb-1">
                      <Text className="text-lg font-bold text-text mr-2">{adventure.name}</Text>
                      {isLocked && <Text className="text-sm">🔒</Text>}
                    </View>
                    <Text className="text-sm text-gray-500 mb-2">{adventure.description}</Text>
                    <View className="flex-row gap-3">
                      <Text className="text-xs text-gray-500">⏱️ {adventure.duration}ч</Text>
                      <Text className="text-xs text-gray-500">⚡ {adventure.energyCost}</Text>
                      <Text className="text-xs text-primary font-bold">
                        💰 {adventure.minReward}-{adventure.maxReward}
                      </Text>
                    </View>
                    {isLocked && (
                      <Text className="text-xs text-red-500 mt-1">
                        Требуется уровень {adventure.levelRequirement}
                      </Text>
                    )}
                    {!isLocked && noEnergy && (
                      <Text className="text-xs text-orange-500 mt-1">Недостаточно энергии</Text>
                    )}
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <Modal
        visible={!!selectedAdventure}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedAdventure(null)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 pb-8">
            {selectedAdventure && (
              <>
                <View className="flex-row items-start mb-4">
                  <Text className="text-6xl mr-4">{selectedAdventure.emoji}</Text>
                  <View className="flex-1">
                    <Text className="text-xl font-bold text-text">{selectedAdventure.name}</Text>
                    <Text className="text-sm text-gray-500 mt-1">
                      {selectedAdventure.description}
                    </Text>
                  </View>
                  <Pressable onPress={() => setSelectedAdventure(null)}>
                    <Text className="text-2xl text-gray-400">✕</Text>
                  </Pressable>
                </View>

                <Card className="mb-4 bg-gray-50">
                  <View className="flex-row justify-around">
                    <View className="items-center">
                      <Text className="text-2xl">⏱️</Text>
                      <Text className="text-xs text-gray-500 mt-1">Длительность</Text>
                      <Text className="text-sm font-bold text-text">
                        {selectedAdventure.duration}ч
                      </Text>
                    </View>
                    <View className="items-center">
                      <Text className="text-2xl">⚡</Text>
                      <Text className="text-xs text-gray-500 mt-1">Энергии</Text>
                      <Text className="text-sm font-bold text-text">
                        {selectedAdventure.energyCost}
                      </Text>
                    </View>
                    <View className="items-center">
                      <Text className="text-2xl">💰</Text>
                      <Text className="text-xs text-gray-500 mt-1">Награда</Text>
                      <Text className="text-sm font-bold text-primary">
                        {selectedAdventure.minReward}-{selectedAdventure.maxReward}
                      </Text>
                    </View>
                  </View>
                </Card>

                <Button title="Отправить питомца" onPress={handleStart} fullWidth />
              </>
            )}
          </View>
        </View>
      </Modal>

      <Modal
        visible={completedReward !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setCompletedReward(null)}
      >
        <View className="flex-1 bg-black/70 justify-center items-center px-6">
          <View className="bg-white rounded-3xl p-8 items-center w-full">
            <Text className="text-7xl mb-4">🎉</Text>
            <Text className="text-2xl font-bold text-text mb-2 text-center">Питомец вернулся!</Text>
            <Text className="text-base text-gray-500 text-center mb-4">Он принёс тебе:</Text>
            <Text className="text-5xl font-bold text-primary mb-6">{completedReward} 🪙</Text>
            <Button title="Забрать!" onPress={() => setCompletedReward(null)} fullWidth />
          </View>
        </View>
      </Modal>
    </View>
  );
}
