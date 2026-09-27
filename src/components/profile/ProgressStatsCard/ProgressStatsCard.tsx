// src/components/profile/ProgressStatsCard/ProgressStatsCard.tsx
// Статистика на экране «Прогресс» (макет S31): уроков пройдено, решений
// принято (решённые события приключений), дней с Финни — и ссылка
// «история операций» на леджер монет.

import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/ui/Text';

import type { IconName } from '@/types/icons';
import { useResponsive, useTheme } from '@/theme';
import { colorPalettes } from '@/theme/tokens';
import { createProfileCardStyles } from '../profileCards.styles';

export function ProgressStatsCard({
  lessonsCompleted,
  decisionsMade,
  daysWithFinni,
  onOpenHistory,
}: {
  lessonsCompleted: number;
  decisionsMade: number;
  daysWithFinni: number;
  onOpenHistory: () => void;
}) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const styles = createProfileCardStyles({ theme });

  const rows: { icon: IconName; color: string; label: string; value: number }[] = [
    {
      icon: 'book-outline',
      color: colorPalettes.indigo[500],
      label: 'Уроков пройдено',
      value: lessonsCompleted,
    },
    {
      icon: 'git-branch-outline',
      color: colorPalettes.amber[500],
      label: 'Решений принято',
      value: decisionsMade,
    },
    {
      icon: 'heart-outline',
      color: colorPalettes.red[400],
      label: 'Дней с Финни',
      value: daysWithFinni,
    },
  ];

  return (
    <View style={styles.card}>
      {rows.map((row, index) => (
        <View
          key={row.label}
          style={[styles.row, index < rows.length - 1 && styles.rowDivider]}
          accessible
          accessibilityLabel={`${row.label}: ${row.value}`}
        >
          <Ionicons name={row.icon} size={scale(22)} color={row.color} />
          <Text style={[styles.rowLabel, { fontSize: scaledFont('lg') }]}>{row.label}</Text>
          <Text style={[styles.rowValue, { fontSize: scaledFont('lg') }]}>{row.value}</Text>
        </View>
      ))}

      <TouchableOpacity
        onPress={onOpenHistory}
        style={styles.linkButton}
        accessibilityRole="button"
        accessibilityLabel="История операций"
      >
        <Text style={[styles.linkText, { fontSize: scaledFont('lg') }]}>история операций</Text>
      </TouchableOpacity>
    </View>
  );
}
