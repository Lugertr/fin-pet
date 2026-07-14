import type { Quest } from '@/entities/quest';
import { QUEST_CATEGORY_EMOJIS } from '@/entities/quest';
import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';

export interface QuestCardProps {
  quest: Quest;
  onPress: () => void;
}

export const QuestCard = memo(function QuestCard({ quest, onPress }: QuestCardProps) {
  const difficultyStars = '⭐'.repeat(quest.difficulty);
  const categoryEmoji = QUEST_CATEGORY_EMOJIS[quest.category];

  return (
    <Pressable
      onPress={onPress}
      className={`bg-white rounded-2xl p-4 active:opacity-80 ${
        quest.completed ? 'opacity-60' : ''
      }`}
    >
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1 mr-2">
          <Text className="text-base font-bold text-text">
            {categoryEmoji} {quest.title}
          </Text>
          <Text className="text-sm text-gray-500 mt-1" numberOfLines={2}>
            {quest.description}
          </Text>
        </View>
        {quest.completed && <Text className="text-2xl text-green-500">✓</Text>}
      </View>

      <View className="flex-row justify-between items-center">
        <Text className="text-xs text-gray-400">Сложность: {difficultyStars}</Text>
        <Text className="text-sm font-bold text-primary">+{quest.reward} 🪙</Text>
      </View>
    </Pressable>
  );
});
