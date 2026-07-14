import { useGameStore } from '@/app/providers/store';
import { Badge, Card, ProgressBar } from '@/shared/ui';
import { PetDisplay } from '@/widgets/pet-display';
import { AchievementCard, StatRow } from '@/widgets/profile-stats';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

export function ProfilePage() {
  const router = useRouter();
  const pet = useGameStore((s) => s.pet);
  const stats = useGameStore((s) => s.stats);
  const achievements = useGameStore((s) => s.achievements);
  const totalEarned = useGameStore((s) => s.finances.totalEarned);

  const unlockedAchievements = useMemo(
    () => achievements.filter((a) => a.unlocked),
    [achievements]
  );
  const lockedAchievements = useMemo(() => achievements.filter((a) => !a.unlocked), [achievements]);
  const experienceProgress = useMemo(() => (pet ? (pet.experience / 100) * 100 : 0), [pet]);

  if (!pet) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Text className="text-text">Питомец не найден</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="px-4 pt-12 pb-8">
        <View className="flex-row justify-between items-center mb-6">
          <Pressable onPress={() => router.back()} className="p-2">
            <Text className="text-2xl">←</Text>
          </Pressable>
          <Text className="text-2xl font-bold text-text">Профиль</Text>
          <Pressable onPress={() => router.push('/settings')} className="p-2">
            <Text className="text-2xl">⚙️</Text>
          </Pressable>
        </View>

        <Card className="mb-4 items-center">
          <PetDisplay pet={pet} size="md" />
          <View className="w-full mt-4">
            <View className="flex-row justify-between mb-1">
              <Text className="text-sm font-semibold text-text">Уровень {pet.level}</Text>
              <Text className="text-sm text-gray-500">{pet.experience}/100 XP</Text>
            </View>
            <ProgressBar value={experienceProgress} color="#FFE66D" size="sm" />
          </View>
        </Card>

        <View className="flex-row flex-wrap gap-2 mb-4">
          <Badge icon="🔥" value={stats.currentStreak} variant="streak" />
          <Badge icon="💰" value={totalEarned} variant="coins" />
          <Badge icon="📚" value={stats.totalQuestsCompleted} variant="level" />
          <Badge icon="🛍️" value={stats.totalItemsBought} variant="savings" />
        </View>

        <Card className="mb-4">
          <Text className="text-lg font-bold text-text mb-3">📊 Статистика</Text>
          <View className="gap-3">
            <StatRow icon="📚" label="Выполнено заданий" value={stats.totalQuestsCompleted} />
            <StatRow icon="💰" label="Всего заработано" value={`${stats.totalCoinsEarned} 🪙`} />
            <StatRow icon="💸" label="Всего потрачено" value={`${stats.totalCoinsSpent} 🪙`} />
            <StatRow icon="🛍️" label="Куплено предметов" value={stats.totalItemsBought} />
            <StatRow icon="🔥" label="Текущая серия" value={`${stats.currentStreak} дн.`} />
            <StatRow icon="🏆" label="Лучшая серия" value={`${stats.longestStreak} дн.`} />
          </View>
        </Card>

        <Card className="mb-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-bold text-text">🏆 Достижения</Text>
            <Text className="text-sm text-gray-500">
              {unlockedAchievements.length}/{achievements.length}
            </Text>
          </View>

          {unlockedAchievements.length > 0 && (
            <View className="mb-4">
              <Text className="text-xs font-semibold text-gray-500 mb-2 uppercase">Получены</Text>
              <View className="flex-row flex-wrap gap-2">
                {unlockedAchievements.map((achievement) => (
                  <AchievementCard key={achievement.id} achievement={achievement} unlocked />
                ))}
              </View>
            </View>
          )}

          {lockedAchievements.length > 0 && (
            <View>
              <Text className="text-xs font-semibold text-gray-500 mb-2 uppercase">В процессе</Text>
              <View className="flex-row flex-wrap gap-2">
                {lockedAchievements.map((achievement) => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                    unlocked={false}
                  />
                ))}
              </View>
            </View>
          )}
        </Card>

        <View className="gap-2">
          <Pressable
            onPress={() => router.push('/diary')}
            className="bg-white rounded-2xl p-4 flex-row items-center active:opacity-80"
          >
            <Text className="text-2xl mr-3">📒</Text>
            <View className="flex-1">
              <Text className="text-base font-semibold text-text">Дневник трат</Text>
              <Text className="text-sm text-gray-500">История всех операций</Text>
            </View>
            <Text className="text-gray-400">→</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
