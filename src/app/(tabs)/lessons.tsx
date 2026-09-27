// src/app/(tabs)/lessons.tsx
// Экран уроков: матрица компетенций сверху, темы (ветки) — табами, под ними
// карточка модуля выбранной темы и её дорожка уроков (стиль Duolingo).
//
// Весь экран — один общий ScrollView: матрица уезжает вверх при прокрутке, а
// лента тем прилипает к верху (stickyHeaderIndices), так что дорожка уроков
// получает всю высоту экрана. Раньше дорожка жила во вложенном скролле под
// матрицей и лентой и сжималась до узкой полосы — прогресс почти не был виден.
//
// Компоненты дерева живут в src/components/lessons/ — этот файл отвечает
// только за раскладку экрана. Аркада открывается из приключения (кнопка рядом
// с «Выполнить задание» → (modal)/arcade-lobby).

import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useRef, useState } from 'react';
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useShallow } from 'zustand/react/shallow';

import { SpiderChart } from '@/components/charts/SpiderChart';
import {
  BRANCH_GRADIENTS,
  BranchTabRow,
  LessonPath,
  LessonsBackground,
  ModuleHeaderCard,
  ThemeCompleteReward,
} from '@/components/lessons';
import { AppHeaderStats, useAppHeaderPadding } from '@/components/shared';
import { Card, SectionTitle } from '@/components/ui';
import { buildLessonPath } from '@/domain/lesson/buildLessonPath';
import { useFeedback } from '@/lib/hooks/useFeedback';
import { openLessonOrExplain } from '@/lib/lessons/openLesson';
import { BRANCHES, LESSONS, useLessonsStore } from '@/lib/hooks/useLessons';
import { useAdventureStore } from '@/lib/stores/adventureStore';
import { usePetStore } from '@/lib/stores/petStore';
import { useUserStore } from '@/lib/stores/userStore';
import { createLessonsStyles } from '@/styles/screens/tabs/_lessons.styles';
import { useResponsive, useTheme } from '@/theme';

/** Индекс ленты тем среди прямых детей ScrollView — она прилипает к верху. */
const STICKY_TABS_INDEX = 1;

export default function LessonsScreen() {
  const { theme } = useTheme();
  const { width, scaledFont } = useResponsive();
  const headerPadding = useAppHeaderPadding();
  const { triggerHaptic } = useFeedback();
  const progress = useLessonsStore((s) => s.progress);
  // Прогресс тем — массивы чисел, useShallow сравнивает их поэлементно:
  // перерисовка только когда реально пройден урок.
  const completedByBranch = useLessonsStore(
    useShallow((s) => BRANCHES.map((b) => s.getBranchProgress(b.id).completed))
  );
  const totalByBranch = useLessonsStore(
    useShallow((s) => BRANCHES.map((b) => s.getBranchProgress(b.id).total))
  );
  // Ветка активного приключения — подписка на само значение (не на функцию
  // isActiveBranch, чья ссылка стабильна и не вызвала бы перерисовку).
  const adventureBranchId = useAdventureStore((s) =>
    s.currentAdventure?.status === 'active' ? s.currentAdventure.branchId : null
  );
  const currentMood = usePetStore((s) => s.currentMood);
  const user = useUserStore((s) => s.user);

  const styles = createLessonsStyles({ theme });

  // По умолчанию открыта тема текущего приключения (если оно идёт), иначе первая.
  const [selectedBranchId, setSelectedBranchId] = useState<number>(
    () => adventureBranchId ?? BRANCHES[0].id
  );

  // Смена темы, когда экран уже прокручен в глубину дорожки: без подкрутки
  // новая тема открылась бы с середины. Возвращаем к началу дорожки — сразу
  // под прилипшей лентой тем.
  const scrollRef = useRef<ScrollView>(null);
  const scrollYRef = useRef(0);
  const tabsYRef = useRef(0);
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollYRef.current = event.nativeEvent.contentOffset.y;
  };
  const handleTabsLayout = (event: LayoutChangeEvent) => {
    tabsYRef.current = event.nativeEvent.layout.y;
  };

  const handleSelectBranch = (branchId: number) => {
    triggerHaptic('selection');
    setSelectedBranchId(branchId);
    if (scrollYRef.current > tabsYRef.current) {
      scrollRef.current?.scrollTo({ y: tabsYRef.current, animated: false });
    }
  };

  const branchIndex = Math.max(
    0,
    BRANCHES.findIndex((b) => b.id === selectedBranchId)
  );
  const selectedBranch = BRANCHES[branchIndex];
  const selectedCompleted = completedByBranch[branchIndex];
  const selectedTotal = totalByBranch[branchIndex];

  const progressByBranch = Object.fromEntries(
    BRANCHES.map((b, i) => [b.id, { completed: completedByBranch[i], total: totalByBranch[i] }])
  );
  const lessonsCompleted = completedByBranch.reduce((sum, n) => sum + n, 0);
  const lessonsTotal = totalByBranch.reduce((sum, n) => sum + n, 0);
  const branchesDone = BRANCHES.filter(
    (_, i) => totalByBranch[i] > 0 && completedByBranch[i] === totalByBranch[i]
  ).length;
  const overallPercent = lessonsTotal > 0 ? Math.round((lessonsCompleted / lessonsTotal) * 100) : 0;

  // Матрица компетенций — реальный прогресс по веткам в процентах, не заглушка.
  const competenceData = BRANCHES.map((branch, i) => ({
    label: branch.name,
    value: totalByBranch[i] > 0 ? Math.round((completedByBranch[i] / totalByBranch[i]) * 100) : 0,
  }));

  const pathItems = useMemo(() => {
    const lessonsInBranch = LESSONS.filter((l) => l.branch_id === selectedBranch.id).sort(
      (a, b) => a.order_index - b.order_index
    );
    return buildLessonPath(lessonsInBranch);
  }, [selectedBranch.id]);

  return (
    <View style={styles.container}>
      <LessonsBackground />

      <View style={headerPadding}>
        <AppHeaderStats help="lessons" energy={currentMood} coins={user?.liquid_balance || 0} />
      </View>

      <ScrollView
        ref={scrollRef}
        stickyHeaderIndices={[STICKY_TABS_INDEX]}
        onScroll={handleScroll}
        scrollEventThrottle={32}
        showsVerticalScrollIndicator={false}
      >
        {/* 0 — матрица компетенций по всем темам + общая сводка */}
        <View style={styles.competenceSection}>
          <SectionTitle>Компетенции</SectionTitle>
          <Card padding="md" style={styles.spiderCardInner}>
            <SpiderChart data={competenceData} color={theme.primary} />
            <View style={styles.summaryBlock}>
              <Text style={[styles.summaryText, { fontSize: scaledFont('md') }]}>
                Уроков: {lessonsCompleted} из {lessonsTotal} · Тем: {branchesDone} из{' '}
                {BRANCHES.length}
              </Text>
              <View
                style={styles.overallTrack}
                accessibilityRole="progressbar"
                accessibilityLabel={`Общий прогресс: ${overallPercent}%`}
                accessibilityValue={{ min: 0, max: 100, now: overallPercent }}
              >
                <LinearGradient
                  colors={theme.gradients.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.overallFill, { width: `${overallPercent}%` }]}
                />
              </View>
            </View>
          </Card>
        </View>

        {/* 1 — темы табами, прилипают к верху при прокрутке (STICKY_TABS_INDEX) */}
        <View style={styles.stickyTabs} onLayout={handleTabsLayout}>
          <BranchTabRow
            branches={BRANCHES}
            selectedBranchId={selectedBranch.id}
            onSelect={handleSelectBranch}
            progressByBranch={progressByBranch}
          />
        </View>

        {/* 2 — карточка модуля выбранной темы */}
        <ModuleHeaderCard
          moduleNumber={branchIndex + 1}
          branchName={selectedBranch.name}
          completed={selectedCompleted}
          total={selectedTotal}
        />

        {/* 3 — дорожка уроков: изогнутая SVG-линия + узлы уроков */}
        <LessonPath
          items={pathItems}
          progress={progress}
          branchColor={BRANCH_GRADIENTS[selectedBranch.id]?.[0] || theme.primary}
          isPriority={selectedBranch.id === adventureBranchId}
          containerWidth={width}
          // Пройденный — повтор без награды, в демо — любой, иначе объяснение
          // (единое правило с ИИ-помощником, см. lib/lessons/openLesson.ts).
          onPressLesson={(lesson) => {
            if (openLessonOrExplain(lesson.id)) triggerHaptic('medium');
          }}
          footer={
            selectedTotal > 0 && selectedCompleted === selectedTotal ? (
              <ThemeCompleteReward branchName={selectedBranch.name} />
            ) : undefined
          }
        />
      </ScrollView>
    </View>
  );
}
