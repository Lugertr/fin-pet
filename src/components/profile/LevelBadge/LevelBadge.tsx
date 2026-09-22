// src/components/profile/LevelBadge/LevelBadge.tsx
// «Уровень N • Название» + полоса XP-прогресса — данные считаются в profile.tsx
// через domain/player/PlayerLevel.computeLevel(totalXp).

import { LinearGradient } from 'expo-linear-gradient';
import { Text, View } from 'react-native';

import { useResponsive, useTheme } from '@/theme';
import { createLevelBadgeStyles } from './LevelBadge.styles';

export function LevelBadge({
  level,
  title,
  xpIntoLevel,
  xpForNext,
}: {
  level: number;
  title: string;
  xpIntoLevel: number;
  xpForNext: number;
}) {
  const { theme } = useTheme();
  const { scaledFont } = useResponsive();
  const styles = createLevelBadgeStyles({ theme });

  const percent = xpForNext > 0 ? Math.min(100, Math.round((xpIntoLevel / xpForNext) * 100)) : 100;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={[styles.levelText, { fontSize: scaledFont('lg') }]}>
          Уровень {level} • {title}
        </Text>
      </View>

      <View style={styles.progressBar}>
        <LinearGradient
          colors={theme.gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ height: '100%', width: `${percent}%` }}
        />
      </View>

      <Text style={[styles.caption, { fontSize: scaledFont('sm') }]}>
        {xpIntoLevel}/{xpForNext} XP • до {level + 1} уровня
      </Text>
    </View>
  );
}
