// src/app/(tabs)/lessons.tsx
// Экран уроков: древо компетенций (стиль Duolingo)
//
// Компоненты дерева живут в src/components/lessons/ — этот файл отвечает
// только за шапку и путь уроков выбранной ветки. Аркада раньше была второй
// вкладкой этого экрана (рельса «Обучение/Аркада» слева) — теперь открывается
// прямо с Хаба (см. HubHeader.tsx → (modal)/arcade-lobby), рельса убрана как
// больше не нужная.

import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';

import {
  BRANCH_GRADIENTS,
  BranchTabRow,
  LessonPath,
  LessonsBackground,
  ModuleHeaderCard,
  ThemeCompleteReward,
} from '@/components/lessons';
import { AppHeaderStats } from '@/components/shared';
import { buildLessonPath } from '@/domain/lesson/buildLessonPath';
import { useFeedback } from '@/lib/hooks/useFeedback';
import { BRANCHES, GIFT_PATH_NODES, LESSONS, useLessonsStore } from '@/lib/hooks/useLessons';
import { usePetStore } from '@/lib/stores/petStore';
import { usePreferencesStore } from '@/lib/stores/preferencesStore';
import { useSavingsStore } from '@/lib/stores/savingsStore';
import { useUserStore } from '@/lib/stores/userStore';
import { useResponsive, useTheme } from '@/theme';
import { colorPalettes, spacing } from '@/theme/tokens';
import { createLessonsStyles } from '../../styles/screens/tabs/_lessons.styles';

export default function LessonsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { scale, width } = useResponsive();
  // Точечные селекторы — экран уроков это вкладка, держится смонтированной, и
  // не должна перерисовываться целиком при изменениях в других сторах.
  const { getBranchProgress, progress, isLessonAvailable } = useLessonsStore(
    useShallow((s) => ({
      getBranchProgress: s.getBranchProgress,
      progress: s.progress,
      isLessonAvailable: s.isLessonAvailable,
    }))
  );
  const isPriorityBranch = usePreferencesStore((s) => s.isPriorityBranch);
  const { triggerHaptic } = useFeedback();
  const currentMood = usePetStore((s) => s.currentMood);
  const user = useUserStore((s) => s.user);
  const savings = useSavingsStore((s) => s.savings);

  const styles = createLessonsStyles({ theme });

  const [selectedBranchId, setSelectedBranchId] = useState<number>(BRANCHES[0].id);

  const handleSelectBranch = (branchId: number) => {
    triggerHaptic('selection');
    setSelectedBranchId(branchId);
  };

  const selectedBranch = BRANCHES.find((b) => b.id === selectedBranchId);
  const selectedBranchNumber = BRANCHES.findIndex((b) => b.id === selectedBranchId) + 1;
  const branchProgress = getBranchProgress(selectedBranchId);

  const pathItems = useMemo(() => {
    const lessonsInBranch = LESSONS.filter((l) => l.branch_id === selectedBranchId).sort(
      (a, b) => a.order_index - b.order_index
    );
    const giftsInBranch = GIFT_PATH_NODES.filter((n) => n.branch_id === selectedBranchId);
    return buildLessonPath(lessonsInBranch, giftsInBranch);
  }, [selectedBranchId]);

  return (
    <View style={styles.container}>
      <LessonsBackground />

      {/* Шапка: лого+статы */}
      <View style={[styles.header, { paddingTop: scale(56), paddingBottom: scale(spacing.md) }]}>
        <AppHeaderStats
          energy={currentMood}
          coins={user?.liquid_balance || 0}
          savings={savings?.currentAmount ?? 0}
        />
      </View>

      <View style={{ flex: 1 }}>
        {/* Лента компетенций (веток) — горизонтальная прокрутка сверху */}
        <BranchTabRow
          branches={BRANCHES}
          selectedBranchId={selectedBranchId}
          onSelect={handleSelectBranch}
        />

        <ModuleHeaderCard
          moduleNumber={selectedBranchNumber}
          branchName={selectedBranch?.name ?? ''}
          completed={branchProgress.completed}
          total={branchProgress.total}
        />

        {/* Дорожка уроков: изогнутая SVG-линия + узлы (уроки/подарки) */}
        <LessonPath
          items={pathItems}
          progress={progress}
          isLessonAvailable={isLessonAvailable}
          branchColor={BRANCH_GRADIENTS[selectedBranchId]?.[0] || colorPalettes.emerald[500]}
          isPriority={isPriorityBranch(selectedBranchId)}
          containerWidth={width}
          onPressLesson={(lesson) => {
            if (isLessonAvailable(lesson.id)) {
              triggerHaptic('medium');
              router.push(`/(modal)/lesson/${lesson.id}` as never);
            }
          }}
          footer={
            branchProgress.completed === branchProgress.total && branchProgress.total > 0 ? (
              <ThemeCompleteReward
                branchId={selectedBranchId}
                branchName={selectedBranch?.name || ''}
              />
            ) : undefined
          }
        />
      </View>
    </View>
  );
}
