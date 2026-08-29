// app/(tabs)/arcade.tsx
// Аркада: повтор пройденных мини-игр без затрат ресурсов

import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { COLORS } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

// Типы доступных аркадных игр
const ARCADE_GAMES = [
  {
    id: 'scam_swiper',
    title: 'Скам-Свайпер',
    description: 'Определяйте мошенников свайпами',
    icon: '🃏',
    color: '#EF4444',
    minigame_type: 'tinder_swipe',
    coinsPerGame: 15,
  },
  {
    id: 'smart_card',
    title: 'Умный Карт',
    description: 'Отвечайте на вопросы о финансах',
    icon: '💳',
    color: '#6366F1',
    minigame_type: 'quiz',
    coinsPerGame: 10,
  },
  {
    id: 'stall_simulator',
    title: 'Симулятор Ларька',
    description: 'Управляйте мини-бизнесом',
    icon: '🏪',
    color: '#22C55E',
    minigame_type: 'quiz',
    coinsPerGame: 12,
  },
  {
    id: 'chat_detective',
    title: 'Чат-Детектив',
    description: 'Находите обман в переписках',
    icon: '🔍',
    color: '#F59E0B',
    minigame_type: 'quiz',
    coinsPerGame: 10,
  },
];

export default function ArcadeScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-slate-900">
      {/* Заголовок */}
      <LinearGradient colors={[COLORS.surface, COLORS.background]} className="px-6 pt-14 pb-4">
        <Text className="text-white text-2xl font-bold mb-1">Аркада</Text>
        <Text className="text-slate-400 text-sm">Повторяйте игры без затрат настроения</Text>
      </LinearGradient>

      {/* Список игр */}
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="mt-4 gap-4 pb-8">
          {ARCADE_GAMES.map((game) => (
            <ArcadeGameCard
              key={game.id}
              game={game}
              onPress={() => router.push(`/(modal)/arcade/${game.id}` as any)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

/**
 * Карточка аркадной игры
 */
function ArcadeGameCard({
  game,
  onPress,
}: {
  game: (typeof ARCADE_GAMES)[number];
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Card variant="default" padding="lg" className="border border-slate-700">
        <View className="flex-row items-center">
          {/* Иконка игры */}
          <View
            className="w-16 h-16 rounded-2xl items-center justify-center mr-4"
            style={{ backgroundColor: `${game.color}20` }}
          >
            <Text className="text-3xl">{game.icon}</Text>
          </View>

          {/* Информация */}
          <View className="flex-1">
            <Text className="text-white font-semibold text-lg mb-1">{game.title}</Text>
            <Text className="text-slate-400 text-sm mb-2" numberOfLines={2}>
              {game.description}
            </Text>
            <Badge label={`+${game.coinsPerGame} C за игру`} variant="info" />
          </View>

          {/* Стрелка */}
          <Ionicons name="chevron-forward" size={24} color={COLORS.textSecondary} />
        </View>
      </Card>
    </TouchableOpacity>
  );
}
