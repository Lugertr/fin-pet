// src/app/(modal)/achievements.tsx
// «Достижения» (макет S32): «N из M открыто», сетка 2 колонки — сначала
// открытые (с кнопкой «Забрать», пока награда не получена, §15.1), затем
// закрытые с условием и прогрессом.

import { ScrollView, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';

import { AchievementTile, getAchievementAccent } from '@/components/profile';
import { SubpageHeader } from '@/components/shared';
import { achievementUnlockedCaption } from '@/domain/achievement/Achievement';
import { useFeedback } from '@/lib/hooks/useFeedback';
import { ACHIEVEMENTS, useAchievementsStore } from '@/lib/stores/achievementsStore';
import { Alert } from '@/lib/utils/alert';
import { formatPrice } from '@/lib/utils/formatters';
import { createProgressSubpageStyles } from '@/styles/screens/modal/_progress-subpage.styles';
import { useTheme } from '@/theme';

export default function AchievementsScreen() {
  const { theme } = useTheme();
  const { trigger, triggerHaptic } = useFeedback();
  const styles = createProgressSubpageStyles({ theme });
  const { userAchievements, claimAchievement } = useAchievementsStore(
    useShallow((s) => ({
      userAchievements: s.userAchievements,
      claimAchievement: s.claimAchievement,
    }))
  );

  const now = new Date();
  const entries = ACHIEVEMENTS.map((def, index) => ({
    def,
    color: getAchievementAccent(index),
    record: userAchievements[def.id],
  }));
  const unlocked = entries.filter((e) => e.record?.isCompleted);
  // Открытые — первыми (незабранные награды в самом начале), затем закрытые
  // по убыванию прогресса.
  const sorted = [
    ...unlocked.filter((e) => !e.record?.isClaimed),
    ...unlocked.filter((e) => e.record?.isClaimed),
    ...entries
      .filter((e) => !e.record?.isCompleted)
      .sort((a, b) => (b.record?.progress ?? 0) - (a.record?.progress ?? 0)),
  ];
  const rows: (typeof sorted)[] = [];
  for (let i = 0; i < sorted.length; i += 2) rows.push(sorted.slice(i, i + 2));

  const handleClaim = (id: number) => {
    triggerHaptic('medium');
    const result = claimAchievement(id);
    if (result.success) trigger('earnCoins');
    Alert.alert(result.success ? '🎉 Награда получена!' : 'Не получилось', result.message);
  };

  return (
    <View style={styles.container}>
      <SubpageHeader
        title="Достижения"
        subtitle={`${unlocked.length} из ${ACHIEVEMENTS.length} открыто`}
        help="achievements"
      />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {rows.map((row) => (
          <View key={row.map((e) => e.def.id).join('-')} style={styles.gridRow}>
            {row.map(({ def, color, record }) => (
              <AchievementTile
                key={def.id}
                name={def.name}
                icon={def.icon}
                description={def.description}
                color={color}
                isCompleted={record?.isCompleted ?? false}
                isClaimed={record?.isClaimed ?? false}
                progress={Math.round(record?.progress ?? 0)}
                unlockedCaption={achievementUnlockedCaption(record?.completedAt, now)}
                rewardLabel={`+${formatPrice(def.reward_amount)}`}
                onClaim={() => handleClaim(def.id)}
              />
            ))}
            {row.length === 1 && <View style={styles.gridSpacer} />}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
