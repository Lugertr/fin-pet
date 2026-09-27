// src/app/(modal)/transactions.tsx
// «История операций» (ссылка из статистики на вкладке «Прогресс»): леджер
// монет кошелька из SQLite (TransactionRepository) — откуда монеты пришли и
// куда ушли. Только чтение.

import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

import { SubpageHeader } from '@/components/shared';
import { getTransactionRepository } from '@/data/local/repositories';
import type { TransactionRecord } from '@/domain/repositories/TransactionRepository';
import { useUserStore } from '@/lib/stores/userStore';
import { formatCoins, formatPrice } from '@/lib/utils/formatters';
import { createProgressSubpageStyles } from '@/styles/screens/modal/_progress-subpage.styles';
import { useResponsive, useTheme } from '@/theme';

const HISTORY_LIMIT = 200;

/** Подпись, если у операции нет описания (старые записи). */
const TYPE_LABELS: Record<string, string> = {
  lesson_reward: 'Награда за урок',
  daily_bonus: 'Ежедневная награда',
  purchase: 'Покупка в магазине',
  item_sale: 'Продажа вещи',
  savings_deposit: 'Перевод в банк',
  savings_withdraw: 'Снятие из банка',
  savings_goal_reward: 'Цель в банке достигнута',
  achievement_reward: 'Награда за достижение',
  gift_reward: 'Монеты из подарка',
  level_up: 'Новый уровень',
  minigame_reward: 'Аркада',
  adventure_payout: 'Итоги приключения',
};

export default function TransactionsScreen() {
  const { theme } = useTheme();
  const { scaledFont } = useResponsive();
  const styles = createProgressSubpageStyles({ theme });
  const userId = useUserStore((s) => s.user?.id);
  const [items, setItems] = useState<TransactionRecord[] | null>(null);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    getTransactionRepository()
      .list(userId, HISTORY_LIMIT)
      .then((rows) => {
        if (!cancelled) setItems(rows);
      })
      .catch((error) => {
        console.warn('[Transactions] Не удалось загрузить историю:', error);
        if (!cancelled) setItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return (
    <View style={styles.container}>
      <SubpageHeader
        title="История операций"
        subtitle="откуда пришли и куда ушли монеты"
        help="transactions"
      />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {items === null ? (
          <ActivityIndicator color={theme.primary} />
        ) : items.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={[styles.emptyTitle, { fontSize: scaledFont('lg') }]}>
              Операций пока нет
            </Text>
            <Text style={[styles.emptyText, { fontSize: scaledFont('md') }]}>
              Пройди урок или начни приключение — здесь появятся первые монеты
            </Text>
          </View>
        ) : (
          items.map((item) => {
            const isIncome = item.amount > 0;
            const title = item.description || TYPE_LABELS[item.transactionType] || 'Операция';
            const amount = Math.abs(item.amount);
            return (
              <View
                key={item.id}
                style={[styles.itemCard, styles.operationRow]}
                accessible
                accessibilityLabel={`${title}. ${isIncome ? 'Получено' : 'Потрачено'} ${formatCoins(amount)}`}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.itemTitle, { fontSize: scaledFont('lg') }]}>{title}</Text>
                  <Text style={[styles.itemText, { fontSize: scaledFont('sm') }]}>
                    {format(new Date(item.createdAt), 'dd.MM, HH:mm')}
                  </Text>
                </View>
                {/* Знак «+/−» несёт смысл, цвет — только подсказка (§23). */}
                <Text
                  style={[
                    styles.operationAmount,
                    { color: isIncome ? theme.success : theme.textPrimary },
                    { fontSize: scaledFont('lg') },
                  ]}
                >
                  {isIncome ? '+' : '−'}
                  {formatPrice(amount)}
                </Text>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
