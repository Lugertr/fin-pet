// src/components/lesson/LessonPlayer/LessonPlayer.tsx
// Плеер урока из узлов (решение пользователя 28.09.2026). Урок идёт
// сегментами: блок чтения узла (ситуация + карточки) → действия узла по
// порядку (тест, мини-игра, событие) → следующий узел → заключение → награда.
// После каждого сегмента прогресс сохраняется (useLessonsStore → SQLite), и
// урок продолжается с того же места — в том числе в следующую смену.
//
// Урок, пройденный раньше, открывается обзором: ситуацию и теорию можно
// перечитать, тест и мини-игру — перепройти (лучшая попытка). Награда —
// вариант B (lessonRewards.ts, начисляет useLessonsStore.finishLesson):
// первое прохождение — опыт и монеты; впервые без ошибок во всём уроке —
// звезда и бонус (в том числе при перепрохождении); остальные повторы — без
// награды (§9.7). Тап по пройденному этапу на треке смены открывает обзор
// одного этапа (focusNode) — так же.
// Урок смены: +10% монет, события платит бюджет смены, ошибка стоит энергии,
// проходится по этапам — одно «Начать задание» на экране работы — один этап
// (после него — «Этап пройден» и назад к работе), урок пройден — смена
// завершается (итоги на хабе). Вне смены урок идёт целиком.

import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import type { ScreenHelpId } from '@/domain/content/ReferenceContent';
import { FiveLettersWordContent, LessonEventContent } from '@/domain/content/LessonContent';
import {
  LessonPlan,
  PlanActivity,
  PlanNode,
  TEST_PASS_THRESHOLD,
  fiveLettersWordFor,
  planForLesson,
} from '@/domain/lesson/LessonPlan';
import {
  LessonPosition,
  LessonProgressState,
  completedNodeCount,
  createLessonProgress,
  currentPosition,
  hasStar,
  markReadingDone,
  pickEvent,
  recordActivityResult,
  totalNodeCount,
} from '@/domain/lesson/lessonProgress';
import {
  FIVE_LETTERS_WORDS,
  Lesson,
  LessonRewardResult,
  useLessonsStore,
} from '@/lib/hooks/useLessons';
import { useAdventureStore } from '@/lib/stores/adventureStore';
import { usePetStore } from '@/lib/stores/petStore';
import { useUserStore } from '@/lib/stores/userStore';
import { Alert } from '@/lib/utils/alert';
import { formatPrice } from '@/lib/utils/formatters';
import { CompleteStage } from '../CompleteStage';
import { StageDoneStep } from '../StageDoneStep';
import { LessonEventStep } from '../LessonEventStep';
import { LessonOverview } from '../LessonOverview';
import { LessonStepHeader } from '../LessonStepHeader';
import { MinigameStep } from '../MinigameStep';
import { RewardStep } from '../RewardStep';
import { TestStep } from '../TestStep';
import { TheoryStep } from '../TheoryStep';

/** Подсказка «?» на мини-игре — как играть именно в неё. */
const MINIGAME_HELP: Record<string, ScreenHelpId> = {
  quiz: 'game_quiz',
  tinder_swipe: 'game_swipes',
  five_letters: 'game_five_letters',
};

/** Что дальше после этапа урока смены — по типу следующего этапа на треке. */
const NEXT_STAGE_LABELS: Record<PlanNode['kind'], string> = {
  test: 'тест',
  minigame: 'мини-игра',
  event: 'событие',
};

type Segment =
  | { kind: 'overview' }
  | { kind: 'reading'; node: PlanNode }
  | {
      kind: 'activity';
      activity: PlanActivity;
      /** Событие, выпавшее из пула (для действия-события). */
      event: LessonEventContent | null;
      /** Слово для «5 букв». */
      words: FiveLettersWordContent[];
    }
  | { kind: 'conclusion' }
  /** isShift — урок смены на момент завершения: смена тут же закрывается,
   * и живой признак (isShiftLesson) к показу награды уже false. */
  | {
      kind: 'reward';
      reward: LessonRewardResult;
      isReplay: boolean;
      hasStar: boolean;
      isShift: boolean;
    }
  | { kind: 'complete'; coins: number; isReplay: boolean; isShift: boolean }
  /** Урок смены: этап трека пройден — назад к работе, следующий этап — оттуда. */
  | { kind: 'stageDone'; nodesDone: number; nodesTotal: number; nextLabel: string };

/** Сегмент действия: событие выпадает из пула один раз и запоминается в прогрессе. */
function activitySegment(
  plan: LessonPlan,
  activity: PlanActivity,
  state: LessonProgressState
): { segment: Segment; state: LessonProgressState } {
  const picked = pickEvent(state, activity);
  const { content } = activity;
  const word =
    content.type === 'minigame' && content.minigame_type === 'five_letters'
      ? fiveLettersWordFor(content, plan.branchId, FIVE_LETTERS_WORDS)
      : null;
  return {
    segment: { kind: 'activity', activity, event: picked.event, words: word ? [word] : [] },
    state: picked.state,
  };
}

function segmentAt(
  plan: LessonPlan,
  position: LessonPosition,
  state: LessonProgressState
): { segment: Segment; state: LessonProgressState } {
  if (position.kind === 'reading')
    return { segment: { kind: 'reading', node: position.node }, state };
  if (position.kind === 'activity') return activitySegment(plan, position.activity, state);
  return { segment: { kind: 'conclusion' }, state };
}

function readingCards(node: PlanNode) {
  return [
    ...(node.situation ? [{ ...node.situation, kind: 'situation' as const }] : []),
    ...node.cards,
  ];
}

export function LessonPlayer({
  lesson,
  focusNode,
  onExit,
  onBackToWork,
  onRequestExit,
  onExitGuardChange,
}: {
  lesson: Lesson;
  /** Открыт с трека смены пройденный этап — только он: перечитать и перепройти. */
  focusNode?: number;
  onExit: () => void;
  /** Этап урока смены пройден — на экран работы. */
  onBackToWork: () => void;
  /** Выход посреди урока — через подтверждение (модалка паузы экрана). */
  onRequestExit: () => void;
  /** Нужно ли подтверждение выхода сейчас (для аппаратной кнопки «назад»). */
  onExitGuardChange: (needsConfirm: boolean) => void;
}) {
  const isDemo = useUserStore((s) => s.user?.is_demo ?? false);
  const plan = useMemo(() => planForLesson(lesson, isDemo), [lesson, isDemo]);
  const saveLessonState = useLessonsStore((s) => s.saveLessonState);
  const finishLesson = useLessonsStore((s) => s.finishLesson);
  // Урок смены: +10% монет, события платит бюджет смены, ошибка стоит
  // энергии, урок пройден — смена завершается. Повтор пройденного урока
  // уроком смены не считается (§9.7).
  const isShiftLesson = useAdventureStore((s) => s.isShiftLesson(lesson.id, lesson.branch_id));
  const adventureBudget = useAdventureStore((s) =>
    s.currentAdventure?.status === 'active' ? s.currentAdventure.budget : null
  );
  const applyLessonEventChoice = useAdventureStore((s) => s.applyLessonEventChoice);
  const completeAdventure = useAdventureStore((s) => s.completeAdventure);
  const currentMood = usePetStore((s) => s.currentMood);

  const [start] = useState(() => {
    const stored =
      useLessonsStore.getState().lessonStates[lesson.id] ?? createLessonProgress(lesson.id);
    if (stored.completedAt || focusNode !== undefined) {
      return {
        isReplay: Boolean(stored.completedAt),
        state: stored,
        segment: { kind: 'overview' } as Segment,
        dirty: false,
      };
    }
    const entry = segmentAt(plan, currentPosition(plan, stored), stored);
    return { isReplay: false, ...entry, dirty: entry.state !== stored };
  });
  const { isReplay } = start;
  // Перечитать/перепройти (обзор) — сегменты возвращают к обзору, без наград.
  const isRevisit = isReplay || focusNode !== undefined;
  const isAdventureQuest = !isReplay && isShiftLesson;

  const [progress, setProgress] = useState(start.state);
  const progressRef = useRef(start.state);
  const [segment, setSegment] = useState<Segment>(start.segment);
  // Новый ключ — шаг перемонтируется (свежее состояние теста/игры).
  const [segmentKey, setSegmentKey] = useState(0);
  // Ошибки в текущем тесте/игре: 0 к концу — попытка без ошибок.
  const [wrongAnswers, setWrongAnswers] = useState(0);

  useEffect(() => {
    // Выпавшее при открытии событие запоминаем сразу — после перезапуска то же.
    if (start.dirty) saveLessonState(start.state);
  }, [start, saveLessonState]);

  const guarded =
    segment.kind === 'reading' || segment.kind === 'activity' || segment.kind === 'conclusion';
  const needsExitConfirm = guarded && !isRevisit;
  useEffect(() => {
    onExitGuardChange(needsExitConfirm);
  }, [needsExitConfirm, onExitGuardChange]);

  const commit = (next: LessonProgressState) => {
    progressRef.current = next;
    setProgress(next);
    saveLessonState(next);
  };

  const show = (next: Segment) => {
    setSegment(next);
    setSegmentKey((key) => key + 1);
    setWrongAnswers(0);
  };

  const pickedEvent = (activity: PlanActivity): LessonEventContent | null => {
    if (activity.content.type !== 'event') return null;
    const id = progress.eventPicks[activity.id];
    return activity.content.pool.find((event) => event.id === id) ?? null;
  };

  /**
   * Сегмент пройден: дальше по уроку или — при повторе — назад к обзору.
   * Перепрохождение завершённого урока может дать звезду и бонус (один раз);
   * у незавершённого урока (этап с трека смены) завершение — только через
   * заключение, с экраном награды.
   */
  const afterSegment = (next: LessonProgressState, finishedNodeIndex: number) => {
    if (isRevisit) {
      if (next.completedAt) {
        const result = finishLesson(plan, next);
        progressRef.current = result.state;
        setProgress(result.state);
        if (result.firstPerfect) {
          Alert.alert(
            '★ Идеально!',
            `Все тесты и игры урока пройдены без ошибок — у урока появилась звезда и бонус +${formatPrice(result.reward.perfectCoins)} на твой счёт.`
          );
        }
      }
      show({ kind: 'overview' });
      return;
    }
    const position = currentPosition(plan, next);
    // Урок смены — по этапам: этап закончен — назад к работе (решение 28.09).
    const stageFinished =
      position.kind === 'final' ||
      ((position.kind === 'reading' || position.kind === 'activity') &&
        position.node.index !== finishedNodeIndex);
    if (isAdventureQuest && stageFinished) {
      show({
        kind: 'stageDone',
        nodesDone: completedNodeCount(plan, next),
        nodesTotal: totalNodeCount(plan),
        nextLabel:
          position.kind === 'reading' || position.kind === 'activity'
            ? NEXT_STAGE_LABELS[position.node.kind]
            : 'завершение урока',
      });
      return;
    }
    const entry = segmentAt(plan, position, next);
    if (entry.state !== next) commit(entry.state);
    show(entry.segment);
  };

  const handleReadingDone = (node: PlanNode) => {
    const next = markReadingDone(progressRef.current, node.index);
    if (next !== progressRef.current) commit(next);
    afterSegment(next, node.index);
  };

  const handleActivityDone = (activity: PlanActivity) => {
    const next = recordActivityResult(progressRef.current, activity, {
      perfect: wrongAnswers === 0,
    });
    commit(next);
    afterSegment(next, activity.nodeIndex);
  };

  const handleEventChoice = async (
    activity: PlanActivity,
    event: LessonEventContent,
    optionId: string
  ) => {
    const option = event.options.find((o) => o.id === optionId);
    if (!option) return;
    if (isAdventureQuest) await applyLessonEventChoice(event.id, option);
    const next = recordActivityResult(progressRef.current, activity, { perfect: true, optionId });
    commit(next);
    afterSegment(next, activity.nodeIndex);
  };

  const handleConclusionDone = () => {
    if (isRevisit) {
      show({ kind: 'overview' });
      return;
    }
    // Награда (монеты, опыт, звезда и бонус) начисляется здесь же, в сторе.
    const result = finishLesson(plan, progressRef.current, { shiftLesson: isAdventureQuest });
    progressRef.current = result.state;
    setProgress(result.state);
    // Урок смены пройден — смена завершается (полная доля), итоги — на хабе.
    if (result.firstCompletion && isAdventureQuest) void completeAdventure();
    show({
      kind: 'reward',
      reward: result.reward,
      isReplay: !result.firstCompletion,
      hasStar: hasStar(result.state),
      isShift: isAdventureQuest,
    });
  };

  const renderActivity = (
    activity: PlanActivity,
    event: LessonEventContent | null,
    words: FiveLettersWordContent[]
  ) => {
    const { content } = activity;
    if (content.type === 'test') {
      return (
        <TestStep
          key={segmentKey}
          step={{ type: 'test', questions: content.questions, passThreshold: TEST_PASS_THRESHOLD }}
          onPass={() => handleActivityDone(activity)}
          isAdventureQuest={isAdventureQuest}
          onWrongAnswer={() => setWrongAnswers((n) => n + 1)}
        />
      );
    }
    if (content.type === 'minigame') {
      return (
        <MinigameStep
          key={segmentKey}
          step={{
            type: 'minigame',
            minigameType: content.minigame_type,
            questions: content.questions ?? [],
            words,
          }}
          onDone={() => handleActivityDone(activity)}
          isAdventureQuest={isAdventureQuest}
          onWrongAnswer={() => setWrongAnswers((n) => n + 1)}
        />
      );
    }
    if (!event) return null;
    return (
      <LessonEventStep
        key={segmentKey}
        event={event}
        budget={isAdventureQuest ? adventureBudget : null}
        onChoose={(optionId) => void handleEventChoice(activity, event, optionId)}
      />
    );
  };

  const renderSegment = () => {
    switch (segment.kind) {
      case 'overview':
        return (
          <LessonOverview
            plan={plan}
            nodeIndex={focusNode}
            progress={progress}
            eventFor={pickedEvent}
            onOpenReading={(node) => show({ kind: 'reading', node })}
            onOpenActivity={(activity) =>
              show(activitySegment(plan, activity, progressRef.current).segment)
            }
            onOpenConclusion={() => show({ kind: 'conclusion' })}
            onClose={onExit}
          />
        );
      case 'reading':
        return (
          <TheoryStep
            key={segmentKey}
            cards={readingCards(segment.node)}
            onDone={() => handleReadingDone(segment.node)}
          />
        );
      case 'activity':
        return renderActivity(segment.activity, segment.event, segment.words);
      case 'conclusion':
        return (
          <TheoryStep
            key={segmentKey}
            cards={[{ ...plan.conclusion, kind: 'conclusion' }]}
            onDone={handleConclusionDone}
          />
        );
      case 'reward':
        return (
          <RewardStep
            reward={segment.reward}
            isAdventureQuest={segment.isShift}
            isReplay={segment.isReplay}
            hasStar={segment.hasStar}
            onCollect={() =>
              show({
                kind: 'complete',
                coins: segment.reward.coins,
                isReplay: segment.isReplay,
                isShift: segment.isShift,
              })
            }
          />
        );
      case 'stageDone':
        return (
          <StageDoneStep
            nodesDone={segment.nodesDone}
            nodesTotal={segment.nodesTotal}
            nextLabel={segment.nextLabel}
            onBackToWork={onBackToWork}
          />
        );
      case 'complete':
        return (
          <CompleteStage
            onExit={onExit}
            bonusCoins={segment.coins}
            isAdventureQuest={segment.isShift}
            isReplay={segment.isReplay}
          />
        );
    }
  };

  const help =
    segment.kind === 'activity' && segment.activity.content.type === 'minigame'
      ? (MINIGAME_HELP[segment.activity.content.minigame_type] ?? 'lesson')
      : 'lesson';

  return (
    <View style={styles.container}>
      <LessonStepHeader
        progress={completedNodeCount(plan, progress) / totalNodeCount(plan)}
        onClose={needsExitConfirm ? onRequestExit : onExit}
        petMood={currentMood}
        help={help}
      />
      {renderSegment()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
