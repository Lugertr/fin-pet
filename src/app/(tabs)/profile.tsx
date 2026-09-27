// src/app/(tabs)/profile.tsx
// Вкладка «Прогресс» (макет S31, решение пользователя 27.09.2026): уровень,
// превью достижений, статистика и меню — Настройки, Родителям, Словарь,
// Документы. Подробности — на отдельных экранах (modal-маршруты).
// Ежедневной награды здесь больше нет — это модалка на хабе при первом за
// день заходе (см. lib/daily/useDailyRewardOffer.ts).

import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';

import {
  AchievementPreviewItem,
  AchievementsPreviewCard,
  getAchievementAccent,
  ProfileMenuCard,
  ProfileMenuItem,
  ProgressLevelCard,
  ProgressStatsCard,
} from '@/components/profile';
import { AppHeaderStats, useAppHeaderPadding } from '@/components/shared';
import { isFeatureEnabled } from '@/config/featureFlags';
import { getAdventureRepository } from '@/data/local/repositories';
import { daysWithFinni } from '@/domain/daily/DailyReward';
import { computeLevel, getLevelTitle, LOOK_REWARD_LEVELS } from '@/domain/player/PlayerLevel';
import { useDailyStore } from '@/lib/hooks/useDaily';
import { useFeedback } from '@/lib/hooks/useFeedback';
import { useLessonsStore } from '@/lib/hooks/useLessons';
import { useShopStore } from '@/lib/hooks/useShop';
import { ACHIEVEMENTS, useAchievementsStore } from '@/lib/stores/achievementsStore';
import { usePetStore } from '@/lib/stores/petStore';
import { useUserStore } from '@/lib/stores/userStore';
import { useResponsive, useTheme } from '@/theme';
import { colorPalettes, spacing } from '@/theme/tokens';
import { createProfileStyles } from '../../styles/screens/tabs/_profile.styles';

/** Обликов питомца всего: выбранный при создании + по одному на уровнях 2 и 3. */
const LOOK_STAGES_TOTAL = 1 + LOOK_REWARD_LEVELS.length;

export default function ProfileScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { scale } = useResponsive();
  const headerPadding = useAppHeaderPadding();
  const { triggerHaptic } = useFeedback();
  const styles = createProfileStyles({ theme });

  // Точечные селекторы — вкладка держится смонтированной и не должна
  // перерисовываться целиком при действии в любом другом сторе.
  const user = useUserStore((s) => s.user);
  const userId = user?.id;
  const currentMood = usePetStore((s) => s.currentMood);
  const { progress, totalXp, getBranchProgress } = useLessonsStore(
    useShallow((s) => ({
      progress: s.progress,
      totalXp: s.totalXp,
      getBranchProgress: s.getBranchProgress,
    }))
  );
  const ownedItemsMap = useShopStore((s) => s.ownedItems);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const ownedItemsList = useMemo(() => useShopStore.getState().getOwnedItems(), [ownedItemsMap]);
  const currentStreak = useDailyStore((s) => s.currentStreak);
  const {
    userAchievements,
    recordBranchProgress,
    recordHiddenItemsOwned,
    recordStreakDays,
    recordShopItemsOwned,
  } = useAchievementsStore(
    useShallow((s) => ({
      userAchievements: s.userAchievements,
      recordBranchProgress: s.recordBranchProgress,
      recordHiddenItemsOwned: s.recordHiddenItemsOwned,
      recordStreakDays: s.recordStreakDays,
      recordShopItemsOwned: s.recordShopItemsOwned,
    }))
  );

  const [decisionsMade, setDecisionsMade] = useState(0);

  const levelInfo = computeLevel(totalXp);
  const lookStage = 1 + LOOK_REWARD_LEVELS.filter((lvl) => lvl <= levelInfo.level).length;
  const completedLessons = Object.values(progress).filter((p) => p.status === 'completed').length;

  // §15.2: подтягиваем актуальный прогресс из других сторов при каждом
  // заходе — достижения сами не подписаны на useLessonsStore/useShop,
  // чтобы не тащить циклический импорт (см. комментарий в achievementsStore.ts).
  useEffect(() => {
    const branchIds = new Set(
      ACHIEVEMENTS.filter((a) => a.target_branch_id !== undefined).map(
        (a) => a.target_branch_id as number
      )
    );
    branchIds.forEach((branchId) => {
      const { completed, total } = getBranchProgress(branchId);
      recordBranchProgress(branchId, completed, total);
    });

    recordHiddenItemsOwned(ownedItemsList.filter((i) => i.is_hidden).length);
    recordStreakDays(currentStreak);
    recordShopItemsOwned(ownedItemsList.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress, currentStreak]);

  // «Решений принято» — решённые события приключений (SQLite), обновляется
  // при каждом заходе на вкладку.
  useFocusEffect(
    useCallback(() => {
      if (!userId) return;
      let cancelled = false;
      getAdventureRepository()
        .countResolvedEvents(userId)
        .then((count) => {
          if (!cancelled) setDecisionsMade(count);
        })
        .catch((error) => console.warn('[Progress] Не удалось посчитать решения:', error));
      return () => {
        cancelled = true;
      };
    }, [userId])
  );

  // До трёх последних открытых достижений (без даты — после датированных).
  const previewItems: AchievementPreviewItem[] = ACHIEVEMENTS.map((def, index) => ({
    def,
    index,
    record: userAchievements[def.id],
  }))
    .filter(({ record }) => record?.isCompleted)
    .sort((a, b) => (b.record?.completedAt ?? '').localeCompare(a.record?.completedAt ?? ''))
    .slice(0, 3)
    .map(({ def, index }) => ({
      id: def.id,
      name: def.name,
      icon: def.icon,
      color: getAchievementAccent(index),
    }));
  const hasUnclaimed = Object.values(userAchievements).some((a) => a.isCompleted && !a.isClaimed);

  const open = (path: string) => {
    triggerHaptic('light');
    router.push(path as never);
  };

  const menuItems: ProfileMenuItem[] = [
    {
      key: 'settings',
      icon: 'settings-outline',
      color: colorPalettes.indigo[500],
      label: 'Настройки',
      onPress: () => open('/(modal)/settings'),
    },
    ...(isFeatureEnabled('adult_section')
      ? [
          {
            key: 'parents',
            icon: 'lock-closed-outline' as const,
            color: colorPalettes.amber[500],
            label: 'Родителям',
            onPress: () => open('/(modal)/adult-section'),
          },
        ]
      : []),
    {
      key: 'glossary',
      icon: 'book-outline',
      color: colorPalettes.indigo[500],
      label: 'Словарь',
      onPress: () => open('/(modal)/glossary'),
    },
    {
      key: 'documents',
      icon: 'document-text-outline',
      color: colorPalettes.emerald[500],
      label: 'Документы',
      onPress: () => open('/(modal)/documents'),
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={headerPadding}>
          <AppHeaderStats help="progress" energy={currentMood} coins={user?.liquid_balance ?? 0} />
        </View>

        <View
          style={[
            styles.content,
            { paddingHorizontal: scale(spacing.lg), paddingBottom: scale(spacing.massive) },
          ]}
        >
          <ProgressLevelCard
            level={levelInfo.level}
            title={getLevelTitle(levelInfo.level)}
            xpIntoLevel={levelInfo.xpIntoLevel}
            xpForNext={levelInfo.xpForNext}
            lookStage={lookStage}
            lookStagesTotal={LOOK_STAGES_TOTAL}
          />

          <AchievementsPreviewCard
            items={previewItems}
            hasUnclaimed={hasUnclaimed}
            onViewAll={() => open('/(modal)/achievements')}
          />

          <ProgressStatsCard
            lessonsCompleted={completedLessons}
            decisionsMade={decisionsMade}
            daysWithFinni={daysWithFinni(user?.created_at, new Date())}
            onOpenHistory={() => open('/(modal)/transactions')}
          />

          <ProfileMenuCard items={menuItems} />
        </View>
      </ScrollView>
    </View>
  );
}
