// src/components/adultSection/StatsCard/StatsCard.tsx
// Карточка "Общий прогресс" в разделе для взрослого.

import { Text, View } from 'react-native';

import { getStageName } from '@/domain/pet/PetProgress';
import { ACHIEVEMENTS, useAchievementsStore } from '@/lib/stores/achievementsStore';
import { usePetProgressStore } from '@/lib/stores/petProgressStore';
import { useResponsive, useTheme } from '@/theme';
import { createAdultSectionCardsStyles } from '../adultSectionCards.styles';

export function StatsCard() {
  const { theme } = useTheme();
  const { scaledFont } = useResponsive();
  const petProgress = usePetProgressStore((s) => s.progress);
  const userAchievements = useAchievementsStore((s) => s.userAchievements);
  const styles = createAdultSectionCardsStyles({ theme });

  const claimedAchievements = Object.values(userAchievements).filter((a) => a.isClaimed).length;

  return (
    <>
      <Text style={[styles.sectionTitle, { fontSize: scaledFont('lg') }]}>Общий прогресс</Text>
      <View style={styles.card}>
        <View style={styles.statsRow}>
          <Text style={[styles.statLabel, { fontSize: scaledFont('sm') }]}>Стадия питомца</Text>
          <Text style={[styles.statValue, { fontSize: scaledFont('sm') }]}>
            {getStageName(petProgress?.currentStage ?? 1)}
          </Text>
        </View>
        <View style={styles.statsRow}>
          <Text style={[styles.statLabel, { fontSize: scaledFont('sm') }]}>Успешных периодов</Text>
          <Text style={[styles.statValue, { fontSize: scaledFont('sm') }]}>
            {petProgress?.successfulPeriodsCount ?? 0}
          </Text>
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
