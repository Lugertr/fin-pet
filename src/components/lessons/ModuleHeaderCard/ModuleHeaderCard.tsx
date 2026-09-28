// src/components/lessons/ModuleHeaderCard/ModuleHeaderCard.tsx
// Карточка модуля (выбранной ветки) под вкладками: номер+название, дробь
// прогресса и звёзды темы (уроки без ошибок), белый прогресс-бар на
// акцентном градиенте (theme.gradients.accent).

import { LinearGradient } from 'expo-linear-gradient';
import { View } from 'react-native';
import { Text } from '@/components/ui/Text';

import { useResponsive, useTheme } from '@/theme';
import { createModuleHeaderCardStyles } from './ModuleHeaderCard.styles';

export function ModuleHeaderCard({
  moduleNumber,
  branchName,
  completed,
  total,
  stars,
}: {
  moduleNumber: number;
  branchName: string;
  completed: number;
  total: number;
  /** Уроков темы, пройденных без ошибок. */
  stars: number;
}) {
  const { theme } = useTheme();
  const { scaledFont } = useResponsive();
  const styles = createModuleHeaderCardStyles({ theme });

  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <LinearGradient
      colors={theme.gradients.accent}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.card}
    >
      <View style={styles.topRow}>
        <Text style={[styles.title, { fontSize: scaledFont('lg') }]} numberOfLines={1}>
          Модуль {moduleNumber}: {branchName}
        </Text>
        <View style={styles.progressLabelRow}>
          <Text style={[styles.progressLabel, { fontSize: scaledFont('sm') }]}>Прогресс</Text>
          <Text style={[styles.progressFraction, { fontSize: scaledFont('sm') }]}>
            {completed}/{total}
          </Text>
          <Text
            style={[styles.progressFraction, { fontSize: scaledFont('sm') }]}
            accessibilityLabel={`Звёзд: ${stars} из ${total}`}
          >
            · ★ {stars}
          </Text>
        </View>
      </View>
      <View style={styles.progressBarTrack}>
        <View style={[styles.progressBarFill, { width: `${percent}%` }]} />
      </View>
    </LinearGradient>
  );
}
