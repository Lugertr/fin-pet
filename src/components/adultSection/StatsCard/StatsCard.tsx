// src/components/adultSection/StatsCard/StatsCard.tsx
// Карточка "Общий прогресс" в разделе для взрослого. Стадия питомца/успешные
// периоды (§8 ТЗ) убраны отсюда — эта шкала поглощена уровнем игрока (см.
// PlayerLevel.ts), который теперь начисляется и за уроки, и за приключения.

import { Text, View } from 'react-native';

import { computeLevel, getLevelTitle } from '@/domain/player/PlayerLevel';
import { ACHIEVEMENTS, useAchievementsStore } from '@/lib/stores/achievementsStore';
import { useLessonsStore } from '@/lib/hooks/useLessons';
import { useResponsive, useTheme } from '@/theme';
import { createAdultSectionCardsStyles } from '../adultSectionCards.styles';

export function StatsCard() {
  const { theme } = useTheme();
  const { scaledFont } = useResponsive();
  const totalXp = useLessonsStore((s) => s.totalXp);
  const userAchievements = useAchievementsStore((s) => s.userAchievements);
  const styles = createAdultSectionCardsStyles({ theme });

  const claimedAchievements = Object.values(userAchievements).filter((a) => a.isClaimed).length;
  const levelInfo = computeLevel(totalXp);

  return (
    <>
      <Text style={[styles.sectionTitle, { fontSize: scaledFont('lg') }]}>Общий прогресс</Text>
      <View style={styles.card}>
        <View style={styles.statsRow}>
          <Text style={[styles.statLabel, { fontSize: scaledFont('sm') }]}>Уровень</Text>
          <Text style={[styles.statValue, { fontSize: scaledFont('sm') }]}>
            {levelInfo.level} · {getLevelTitle(levelInfo.level)}
          </Text>
        </View>
        <View style={styles.statsRow}>
          <Text style={[styles.statLabel, { fontSize: scaledFont('sm') }]}>Опыт</Text>
          <Text style={[styles.statValue, { fontSize: scaledFont('sm') }]}>{totalXp}</Text>
        </View>
        <View style={styles.statsRow}>
          <Text style={[styles.statLabel, { fontSize: scaledFont('sm') }]}>Достижения</Text>
          <Text style={[styles.statValue, { fontSize: scaledFont('sm') }]}>
            {claimedAchievements} / {ACHIEVEMENTS.length}
          </Text>
        </View>
      </View>
    </>
  );
}
