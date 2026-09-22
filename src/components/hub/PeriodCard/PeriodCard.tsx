// src/components/hub/PeriodCard/PeriodCard.tsx
// Карточка активного игрового периода (§7 ТЗ)

import { Text, TouchableOpacity, View } from 'react-native';

import { Card, SectionTitle } from '@/components/ui';
import { GamePeriodRecord } from '@/domain/period/GamePeriod';
import { useTheme } from '@/theme';
import { createPeriodCardStyles } from './PeriodCard.styles';

export function PeriodCard({
  period,
  onFinish,
}: {
  period: GamePeriodRecord;
  onFinish: () => void;
}) {
  const { theme } = useTheme();
  const styles = createPeriodCardStyles({ theme });

  return (
    <View style={styles.periodSection}>
      <Card padding="md">
        <View style={styles.periodHeaderRow}>
          <SectionTitle size="lg" marginBottom={0}>
            Период №{period.periodNumber}
          </SectionTitle>
          <View style={styles.periodBadge}>
            <Text style={styles.periodBadgeText}>+{period.incomeAwarded}⭐ в начале</Text>
          </View>
        </View>

        <View style={styles.periodCategoriesRow}>
          <View style={styles.periodCategoryItem}>
            <Text style={styles.periodCategoryLabel}>Обязательное</Text>
            <Text style={styles.periodCategoryValue}>
              {period.fact.mandatory} / {period.plan.mandatory}
            </Text>
          </View>
          <View style={styles.periodCategoryItem}>
            <Text style={styles.periodCategoryLabel}>Желаемое</Text>
            <Text style={styles.periodCategoryValue}>
              {period.fact.optional} / {period.plan.optional}
            </Text>
          </View>
          <View style={styles.periodCategoryItem}>
            <Text style={styles.periodCategoryLabel}>Накопления</Text>
            <Text style={styles.periodCategoryValue}>
              {period.fact.savings} / {period.plan.savings}
            </Text>
          </View>
        </View>

        <TouchableOpacity onPress={onFinish} activeOpacity={0.8} style={styles.periodFinishButton}>
          <Text style={styles.periodFinishButtonText}>Завершить период</Text>
        </TouchableOpacity>
      </Card>
    </View>
  );
}
