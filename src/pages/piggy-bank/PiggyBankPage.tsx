import { useGameStore } from '@/app/providers/store';
import { Card } from '@/shared/ui';
import { Pressable, ScrollView, Text, View } from 'react-native';

export function PiggyBankPage() {
  const { finances, piggyBank, saveCoins, withdrawSavings } = useGameStore();

  const progress = piggyBank.goal
    ? Math.min(100, (piggyBank.balance / piggyBank.goal.targetAmount) * 100)
    : 0;

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="px-4 pt-12 pb-4">
        <Text className="text-3xl font-bold text-text mb-6">Копилка 💰</Text>

        {/* Основная копилка */}
        <Card className="mb-4 items-center">
          <Text className="text-7xl mb-4">🐷</Text>
          <Text className="text-sm text-gray-500 mb-1">Накоплено</Text>
          <Text className="text-4xl font-bold text-secondary mb-2">{piggyBank.balance}</Text>
          <Text className="text-xs text-gray-400 mb-4">
            +{(piggyBank.interestRate * 100).toFixed(0)}% в неделю 📈
          </Text>

          <View className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <View
              className="h-full bg-secondary rounded-full"
              style={{ width: `${Math.min(100, (piggyBank.balance / 1000) * 100)}%` }}
            />
          </View>
          <Text className="text-xs text-gray-500 mt-2">Цель: 1000 монет</Text>
        </Card>

        {/* Доступно */}
        <Card className="mb-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-base font-semibold text-text">Доступно для вклада</Text>
            <Text className="text-lg font-bold text-primary">{finances.coins} 🪙</Text>
          </View>

          <Text className="text-sm font-semibold text-text mb-2">Отложить:</Text>
          <View className="flex-row gap-2 mb-4">
            {[10, 25, 50, 100].map((amount) => (
              <Pressable
                key={amount}
                onPress={() => saveCoins(amount)}
                disabled={finances.coins < amount}
                className={`flex-1 py-3 rounded-xl ${
                  finances.coins >= amount ? 'bg-secondary' : 'bg-gray-200'
                } active:opacity-80`}
              >
                <Text
                  className={`text-center font-semibold ${
                    finances.coins >= amount ? 'text-white' : 'text-gray-400'
                  }`}
                >
                  {amount}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text className="text-sm font-semibold text-text mb-2">Забрать:</Text>
          <View className="flex-row gap-2">
            {[20, 50, 100].map((amount) => (
              <Pressable
                key={amount}
                onPress={() => withdrawSavings(amount)}
                disabled={piggyBank.balance < amount}
                className={`flex-1 py-3 rounded-xl ${
                  piggyBank.balance >= amount ? 'bg-primary' : 'bg-gray-200'
                } active:opacity-80`}
              >
                <Text
                  className={`text-center font-semibold ${
                    piggyBank.balance >= amount ? 'text-white' : 'text-gray-400'
                  }`}
                >
                  {amount}
                </Text>
              </Pressable>
            ))}
          </View>
        </Card>

        {/* Совет */}
        <Card className="bg-yellow-50 border-2 border-yellow-200">
          <Text className="text-sm text-yellow-800">
            💡 <Text className="font-bold">Совет:</Text> Если откладывать по 10 монет каждый день,
            через месяц у тебя будет 300 монет + проценты!
          </Text>
        </Card>
      </View>
    </ScrollView>
  );
}
