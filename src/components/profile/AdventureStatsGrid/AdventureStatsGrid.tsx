// src/components/profile/AdventureStatsGrid/AdventureStatsGrid.tsx
// «📈 Статистика приключений» — сетка 2×2: заработано монет за всё время,
// пройдено уроков, накоплено в копилке, энергия питомца.

import { Text, View } from 'react-native';

import { useResponsive, useTheme } from '@/theme';
import { createAdventureStatsGridStyles } from './AdventureStatsGrid.styles';

export function AdventureStatsGrid({
  coinsEarned,
  lessonsCompleted,
  savingsAmount,
  energyPercent,
}: {
  coinsEarned: number;
  lessonsCompleted: number;
  savingsAmount: number;
  energyPercent: number;
}) {
  const { theme } = useTheme();
  const { scaledFont } = useResponsive();
  const styles = createAdventureStatsGridStyles({ theme });

  const tiles = [
    { icon: '💰', value: `${coinsEarned}`, label: 'монет заработано' },
    { icon: '📚', value: `${lessonsCompleted}`, label: 'уроков пройдено' },
    { icon: '🏦', value: `${savingsAmount}₽`, label: 'в копилке' },
    { icon: '⚡', value: `${energyPercent}%`, label: 'энергия' },
  ];

  return (
    <View>
      <Text style={[styles.title, { fontSize: scaledFont('xxl') }]}>📈 Статистика приключений</Text>
      <View style={styles.grid}>
        {tiles.map((tile) => (
          <View key={tile.label} style={styles.tile}>
            <Text style={{ fontSize: scaledFont('title') }}>{tile.icon}</Text>
            <Text style={[styles.value, { fontSize: scaledFont('xl') }]} numberOfLines={1}>
              {tile.value}
            </Text>
            <Text style={[styles.label, { fontSize: scaledFont('sm') }]} numberOfLines={1}>
              {tile.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
