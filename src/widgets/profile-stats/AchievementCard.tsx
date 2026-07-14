import { Text, View } from 'react-native';

export interface AchievementCardProps {
  achievement: {
    id: string;
    title: string;
    description: string;
    icon: string;
  };
  unlocked: boolean;
}

export function AchievementCard({ achievement, unlocked }: AchievementCardProps) {
  return (
    <View
      className={`w-20 items-center p-2 rounded-xl ${unlocked ? 'bg-yellow-50' : 'bg-gray-100'}`}
    >
      <Text className={`text-3xl ${unlocked ? '' : 'opacity-30'}`}>{achievement.icon}</Text>
      <Text
        className={`text-xs text-center mt-1 ${
          unlocked ? 'text-text font-semibold' : 'text-gray-400'
        }`}
        numberOfLines={2}
      >
        {achievement.title}
      </Text>
    </View>
  );
}
