// src/components/profile/MedalsPreview/MedalsPreview.tsx
// «🏆 Мои медали (N)» — топ-3 достижения (claimed → completed → по прогрессу)
// + ссылка «Все (claimed/total) →», открывающая AllAchievementsModal.

import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

import { AchievementDefinition, UserAchievementRecord } from '@/domain/achievement/Achievement';
import { useResponsive, useTheme } from '@/theme';
import { AchievementCard } from '../AchievementCard';
import { createMedalsPreviewStyles } from './MedalsPreview.styles';

function statusRank(status: UserAchievementRecord | undefined): number {
  if (status?.isClaimed) return 2;
  if (status?.isCompleted) return 1;
  return 0;
}

export function MedalsPreview({
  definitions,
  userAchievements,
  onClaim,
  onViewAll,
}: {
  definitions: AchievementDefinition[];
  userAchievements: Record<number, UserAchievementRecord>;
  onClaim: (id: number) => { success: boolean; message: string };
  onViewAll: () => void;
}) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const styles = createMedalsPreviewStyles({ theme });

  const claimedCount = definitions.filter((d) => userAchievements[d.id]?.isClaimed).length;

  const topThree = [...definitions]
    .sort((a, b) => {
      const rankDiff = statusRank(userAchievements[b.id]) - statusRank(userAchievements[a.id]);
      if (rankDiff !== 0) return rankDiff;
      const progressDiff =
        (userAchievements[b.id]?.progress ?? 0) - (userAchievements[a.id]?.progress ?? 0);
      if (progressDiff !== 0) return progressDiff;
      return a.id - b.id;
    })
    .slice(0, 3);

  return (
    <View>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { fontSize: scaledFont('xxl') }]}>
          🏆 Мои медали ({claimedCount})
        </Text>
        <TouchableOpacity onPress={onViewAll} activeOpacity={0.7} style={styles.viewAllRow}>
          <Text style={[styles.viewAllText, { fontSize: scaledFont('md') }]}>
            Все ({claimedCount}/{definitions.length})
          </Text>
          <Ionicons name="chevron-forward" size={scale(16)} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.cardsRow}>
        {topThree.map((def) => (
          <AchievementCard
            key={def.id}
            def={def}
            status={userAchievements[def.id]}
            onClaim={onClaim}
          />
        ))}
      </View>
    </View>
  );
}
