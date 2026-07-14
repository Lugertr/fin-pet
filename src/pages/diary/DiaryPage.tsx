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
import { useCallback, useMemo, useState } from 'react';
import { Pressable, SectionList, Text, View } from 'react-native';

type FilterType = 'all' | Transaction['type'];

export function DiaryPage() {
  const router = useRouter();
  const transactions = useGameStore((s) => s.transactions);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const filteredTransactions = useMemo(
    () => filterTransactions(transactions, activeFilter),
    [transactions, activeFilter]
  );

  const summary = useMemo(() => calculateTransactionSummary(transactions), [transactions]);

  const sections = useMemo(() => {
    const grouped = groupTransactionsByDate(filteredTransactions);
    return Object.entries(grouped).map(([dateKey, txs]) => ({
      title: dateKey,
      data: txs,
    }));
  }, [filteredTransactions]);

  const handleFilterChange = useCallback((id: FilterType) => setActiveFilter(id), []);

  const renderSectionHeader = useCallback(
    ({ section }: { section: { title: string; data: Transaction[] } }) => (
      <Text className="text-sm font-bold text-gray-500 mb-2 uppercase">
        {formatDate(section.title)}
      </Text>
    ),
    []
  );

  const renderItem = useCallback(
    ({
      item,
      index,
      section,
    }: {
      item: Transaction;
      index: number;
      section: { data: Transaction[] };
    }) => {
      const info = TRANSACTION_TYPE_INFO[item.type];
      return (
        <View
          className={`flex-row items-center py-2 ${
            index < section.data.length - 1 ? 'border-b border-gray-100' : ''
          }`}
        >
          <Text className="text-2xl mr-3">{info.emoji}</Text>
          <View className="flex-1">
            <Text className="text-sm font-semibold text-text">{item.description}</Text>
            <Text className="text-xs text-gray-500">{formatTime(item.date)}</Text>
          </View>
          <Text className={`text-base font-bold ${info.color}`}>
            {info.sign}
            {item.amount} 🪙
          </Text>
        </View>
      );
    },
    []
  );

  const keyExtractor = useCallback((item: Transaction) => item.id, []);

  const ListHeader = useMemo(
    () => (
      <>
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

        <View className="flex-row gap-2 mb-4">
          {TRANSACTION_FILTERS.map((filter) => {
            const isActive = activeFilter === filter.id;
            return (
              <Pressable
                key={filter.id}
                onPress={() => handleFilterChange(filter.id)}
                className={`px-4 py-2 rounded-full ${
                  isActive ? 'bg-primary' : 'bg-white'
                } active:opacity-80`}
              >
                <Text className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-text'}`}>
                  {filter.emoji} {filter.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </>
    ),
    [summary, activeFilter, handleFilterChange]
  );

  return (
    <View className="flex-1 bg-background">
      <View className="px-4 pt-12 pb-2">
        <View className="flex-row items-center mb-4">
          <Pressable onPress={() => router.back()} className="p-2 mr-2">
            <Text className="text-2xl">←</Text>
          </Pressable>
          <Text className="text-2xl font-bold text-text">Дневник трат</Text>
        </View>
      </View>

      <SectionList
        sections={sections}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          <Card className="mt-4 items-center">
            <Text className="text-5xl mb-2">📭</Text>
            <Text className="text-base text-gray-500 text-center">Пока нет операций</Text>
          </Card>
        }
        className="flex-1 px-4"
        contentContainerClassName="pb-4"
        stickySectionHeadersEnabled={false}
      />
    </View>
  );
}
