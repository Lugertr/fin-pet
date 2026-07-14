import { useGameStore } from '@/app/providers/store';
import {
  TRANSACTION_FILTERS,
  TRANSACTION_TYPE_INFO,
  filterTransactions,
  groupTransactionsByDate,
  calculateTransactionSummary,
  formatDate,
  formatTime,
} from '@/entities/transaction';
import type { Transaction } from '@/shared/types';
import { Card } from '@/shared/ui';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

type FilterType = 'all' | Transaction['type'];

export function DiaryPage() {
  const router = useRouter();
  const { transactions } = useGameStore();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const filteredTransactions = useMemo(() => {
    return filterTransactions(transactions, activeFilter);
  }, [transactions, activeFilter]);

  const groupedByDate = useMemo(() => {
    return groupTransactionsByDate(filteredTransactions);
  }, [filteredTransactions]);

  const summary = useMemo(() => {
    return calculateTransactionSummary(transactions);
  }, [transactions]);

  return (
    <View className="flex-1 bg-background">
      <View className="px-4 pt-12 pb-2">
        <View className="flex-row items-center mb-4">
          <Pressable onPress={() => router.back()} className="p-2 mr-2">
            <Text className="text-2xl">←</Text>
          </Pressable>
          <Text className="text-2xl font-bold text-text">Дневник трат</Text>
        </View>

        <View className="flex-row gap-2 mb-4">
          <Card className="flex-1 bg-green-50">
            <Text className="text-xs text-gray-500">Заработано</Text>
            <Text className="text-lg font-bold text-green-600">+{summary.earned} 🪙</Text>
          </Card>
          <Card className="flex-1 bg-red-50">
            <Text className="text-xs text-gray-500">Потрачено</Text>
            <Text className="text-lg font-bold text-red-600">-{summary.spent} 🪙</Text>
          </Card>
          <Card className="flex-1 bg-blue-50">
            <Text className="text-xs text-gray-500">Отложено</Text>
            <Text className="text-lg font-bold text-blue-600">{summary.saved} 🪙</Text>
          </Card>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-4 px-4 mb-2">
          <View className="flex-row gap-2">
            {TRANSACTION_FILTERS.map((filter) => {
              const isActive = activeFilter === filter.id;
              return (
                <Pressable
                  key={filter.id}
                  onPress={() => setActiveFilter(filter.id)}
                  className={`px-4 py-2 rounded-full ${
                    isActive ? 'bg-primary' : 'bg-white'
                  } active:opacity-80`}
                >
                  <Text
                    className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-text'}`}
                  >
                    {filter.emoji} {filter.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </View>

      <ScrollView className="flex-1 px-4">
        {Object.keys(groupedByDate).length === 0 ? (
          <Card className="mt-4 items-center">
            <Text className="text-5xl mb-2">📭</Text>
            <Text className="text-base text-gray-500 text-center">Пока нет операций</Text>
          </Card>
        ) : (
          Object.entries(groupedByDate).map(([dateKey, txs]) => (
            <View key={dateKey} className="mb-4">
              <Text className="text-sm font-bold text-gray-500 mb-2 uppercase">
                {formatDate(dateKey)}
              </Text>
              <Card>
                {txs.map((tx, idx) => {
                  const info = TRANSACTION_TYPE_INFO[tx.type];
                  return (
                    <View
                      key={tx.id}
                      className={`flex-row items-center py-2 ${
                        idx < txs.length - 1 ? 'border-b border-gray-100' : ''
                      }`}
                    >
                      <Text className="text-2xl mr-3">{info.emoji}</Text>
                      <View className="flex-1">
                        <Text className="text-sm font-semibold text-text">{tx.description}</Text>
                        <Text className="text-xs text-gray-500">{formatTime(tx.date)}</Text>
                      </View>
                      <Text className={`text-base font-bold ${info.color}`}>
                        {info.sign}
                        {tx.amount} 🪙
                      </Text>
                    </View>
                  );
                })}
              </Card>
            </View>
          ))
        )}
        <View className="h-4" />
      </ScrollView>
    </View>
  );
}
