// src/components/savings/SavingsHistory/SavingsHistory.tsx
// «История копилки» — последние операции банка из savings_transactions
// (§11.6): пополнения, бонус копилки, снятия и покупка цели. Видно, откуда
// выросли накопления и сколько добавил бонус. Только чтение.
// Приход/расход передаётся знаком «+/−» и подписью, цвет — только подсказка (§23).

import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import { Text } from '@/components/ui/Text';

import type { SavingsOperationType, SavingsTransactionRecord } from '@/domain/savings/Savings';
import { formatCoins, formatPrice } from '@/lib/utils/formatters';
import { useResponsive, useTheme } from '@/theme';
import type { IconName } from '@/types/icons';
import { createSavingsHistoryStyles } from './SavingsHistory.styles';

interface OperationView {
  label: string;
  icon: IconName;
  /** true — монеты пришли в банк, false — ушли из него. */
  income: boolean;
}

const OPERATIONS: Record<SavingsOperationType, OperationView> = {
  deposit: { label: 'Пополнение', icon: 'add-circle-outline', income: true },
  bonus: { label: 'Бонус копилки', icon: 'sparkles-outline', income: true },
  withdraw: { label: 'Снято в «Хочу»', icon: 'arrow-undo-outline', income: false },
  reward: { label: 'Цель куплена', icon: 'trophy-outline', income: false },
};

export function SavingsHistory({ items }: { items: SavingsTransactionRecord[] }) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const styles = createSavingsHistoryStyles({ theme });

  return (
    <View>
      <Text style={[styles.title, { fontSize: scaledFont('xl') }]} accessibilityRole="header">
        История копилки
      </Text>
      <View style={styles.card}>
        {items.length === 0 ? (
          <Text style={[styles.emptyText, { fontSize: scaledFont('md') }]}>
            Пока пусто. Заверши смену — отложенное в «Коплю» придёт сюда.
          </Text>
        ) : (
          items.map((item, index) => {
            const operation = OPERATIONS[item.operationType] ?? OPERATIONS.deposit;
            // withdraw хранится положительным, reward — отрицательным: знак берём из типа.
            const amount = Math.abs(item.amount);
            return (
              <View
                key={item.id}
                style={[styles.row, index > 0 && styles.rowDivider]}
                accessible
                accessibilityLabel={`${operation.label}. ${operation.income ? 'Пришло' : 'Ушло'} ${formatCoins(amount)}`}
              >
                <Ionicons name={operation.icon} size={scale(22)} color={theme.textSecondary} />
                <View style={styles.info}>
                  <Text style={[styles.label, { fontSize: scaledFont('lg') }]}>
                    {operation.label}
                  </Text>
                  <Text style={[styles.date, { fontSize: scaledFont('md') }]}>
                    {format(new Date(item.createdAt), 'dd.MM, HH:mm')}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.amount,
                    { color: operation.income ? theme.success : theme.textPrimary },
                    { fontSize: scaledFont('lg') },
                  ]}
                >
                  {operation.income ? '+' : '−'}
                  {formatPrice(amount)}
                </Text>
              </View>
            );
          })
        )}
      </View>
    </View>
  );
}
