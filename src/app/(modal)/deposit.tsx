// app/(modal)/deposit.tsx
// Экран вкладов: создание, просмотр, снятие

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { COLORS } from '@/constants/theme';
import {
    useCreateDeposit,
    useDeposits,
    useWithdrawEarly,
    useWithdrawSuccess,
} from '@/lib/hooks/useDeposits';
import { useUserStore } from '@/lib/stores/userStore';
import { formatCoins, formatDaysCount } from '@/lib/utils/formatters';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function DepositScreen() {
  const router = useRouter();
  const { user } = useUserStore();
  const { data: depositsData, isLoading } = useDeposits();
  const createDepositMutation = useCreateDeposit();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');

  const balance = user?.liquid_balance || 0;

  const handleCreateDeposit = async () => {
    const amount = parseInt(depositAmount, 10);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Ошибка', 'Введите корректную сумму');
      return;
    }
    if (amount > balance) {
      Alert.alert('Ошибка', 'Недостаточно средств');
      return;
    }

    try {
      await createDepositMutation.mutateAsync({ principal: amount });
      setShowCreateForm(false);
      setDepositAmount('');
      Alert.alert('Успех', 'Вклад создан! Проценты начисляются ежедневно.');
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось создать вклад');
    }
  };

  return (
    <View className="flex-1 bg-slate-900">
      {/* Заголовок */}
      <LinearGradient colors={[COLORS.surface, COLORS.background]} className="px-6 pt-14 pb-4">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white font-semibold text-lg">Вклады</Text>
          <View className="w-6" />
        </View>

        {/* Баланс */}
        <View className="bg-slate-800/50 rounded-2xl p-4">
          <Text className="text-slate-400 text-sm mb-1">Доступно для вклада</Text>
          <Text className="text-white text-2xl font-bold">{formatCoins(balance)}</Text>
        </View>
      </LinearGradient>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {/* Форма создания вклада */}
        {showCreateForm ? (
          <Card variant="default" padding="lg" className="mt-4 border border-indigo-500/30">
            <Text className="text-white font-semibold mb-4">Новый вклад</Text>

            <View className="mb-4">
              <Text className="text-slate-400 text-sm mb-2">Сумма вклада</Text>
              <TextInput
                value={depositAmount}
                onChangeText={setDepositAmount}
                placeholder="Введите сумму"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="numeric"
                className="bg-slate-700 rounded-xl px-4 py-3 text-white"
              />
            </View>

            {/* Быстрые суммы */}
            <View className="flex-row gap-2 mb-4">
              {[100, 500, 1000].map((amount) => (
                <TouchableOpacity
                  key={amount}
                  onPress={() => setDepositAmount(amount.toString())}
                  className="flex-1 bg-slate-700 rounded-lg py-2 items-center"
                >
                  <Text className="text-white text-sm">{amount}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Информация о ставке */}
            <View className="bg-green-500/10 rounded-xl p-3 mb-4 border border-green-500/30">
              <Text className="text-green-400 text-sm text-center">
                💰 Ставка: 2% в день{'\n'}Досрочное снятие — проценты сгорают
              </Text>
            </View>

            <View className="flex-row gap-3">
              <Button
                title="Отмена"
                onPress={() => setShowCreateForm(false)}
                variant="secondary"
                className="flex-1"
              />
              <Button
                title="Создать"
                onPress={handleCreateDeposit}
                loading={createDepositMutation.isPending}
                className="flex-1"
              />
            </View>
          </Card>
        ) : (
          <TouchableOpacity
            onPress={() => setShowCreateForm(true)}
            className="mt-4 bg-indigo-500/20 rounded-2xl p-4 border border-indigo-500/30 flex-row items-center justify-center gap-2"
          >
            <Ionicons name="add-circle" size={24} color={COLORS.primary} />
            <Text className="text-indigo-400 font-medium">Создать вклад</Text>
          </TouchableOpacity>
        )}

        {/* Список вкладов */}
        <View className="mt-6 pb-8">
          <Text className="text-white font-semibold mb-4">Активные вклады</Text>

          {isLoading ? (
            <Text className="text-slate-400 text-center">Загрузка...</Text>
          ) : depositsData?.deposits.length === 0 ? (
            <Card variant="outlined" padding="lg" className="items-center">
              <Text className="text-4xl mb-2">🏦</Text>
              <Text className="text-slate-400 text-center">
                У вас пока нет вкладов.{'\n'}Создайте первый, чтобы копить!
              </Text>
            </Card>
          ) : (
            depositsData?.deposits.map((deposit) => (
              <DepositCard key={deposit.id} deposit={deposit} />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

/**
 * Карточка вклада
 */
function DepositCard({ deposit }: { deposit: any }) {
  const withdrawEarlyMutation = useWithdrawEarly();
  const withdrawSuccessMutation = useWithdrawSuccess();

  // В реальном приложении: запросить детали с процентами
  const daysPassed = Math.floor(
    (Date.now() - new Date(deposit.start_date).getTime()) / (1000 * 60 * 60 * 24)
  );
  const accruedInterest = Math.floor(
    (daysPassed * deposit.daily_rate_percent * deposit.principal) / 100
  );
  const total = deposit.principal + accruedInterest;

  const handleWithdrawEarly = () => {
    Alert.alert(
      'Досрочное снятие',
      `Вы потеряете ${formatCoins(accruedInterest)} процентов. Забрать только ${formatCoins(deposit.principal)}?`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Забрать',
          style: 'destructive',
          onPress: () => withdrawEarlyMutation.mutate(deposit.id),
        },
      ]
    );
  };

  const handleWithdrawSuccess = () => {
    Alert.alert(
      'Завершение вклада',
      `Забрать ${formatCoins(total)} (${formatCoins(deposit.principal)} + ${formatCoins(accruedInterest)} процентов)?`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Забрать',
          onPress: () => withdrawSuccessMutation.mutate(deposit.id),
        },
      ]
    );
  };

  return (
    <Card variant="default" padding="lg" className="mb-4 border border-slate-700">
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-3">
          <View className="w-12 h-12 rounded-xl bg-green-500/20 items-center justify-center">
            <Text className="text-2xl">🏦</Text>
          </View>
          <View>
            <Text className="text-white font-semibold">{formatCoins(deposit.principal)}</Text>
            <Text className="text-slate-400 text-sm">
              {formatDaysCount(daysPassed)} • {deposit.daily_rate_percent}% в день
            </Text>
          </View>
        </View>
        <View className="items-end">
          <Text className="text-green-400 font-bold">{formatCoins(total)}</Text>
          <Text className="text-green-400/70 text-xs">+{formatCoins(accruedInterest)}</Text>
        </View>
      </View>

      {/* Прогресс */}
      <View className="h-2 bg-slate-700 rounded-full overflow-hidden mb-4">
        <View
          className="h-full bg-green-500 rounded-full"
          style={{ width: `${Math.min((daysPassed / 7) * 100, 100)}%` }}
        />
      </View>

      <View className="flex-row gap-3">
        <Button
          title="Досрочно"
          onPress={handleWithdrawEarly}
          variant="secondary"
          size="sm"
          className="flex-1"
        />
        <Button
          title="Забрать всё"
          onPress={handleWithdrawSuccess}
          variant="success"
          size="sm"
          className="flex-1"
        />
      </View>
    </Card>
  );
}
