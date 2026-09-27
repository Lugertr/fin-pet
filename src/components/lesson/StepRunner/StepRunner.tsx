// src/components/lesson/StepRunner/StepRunner.tsx
// Раннер полной композиции шагов (новый формат урока, §9.1)

import { useEffect, useMemo, useRef, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { LessonStep } from '@/domain/lesson/LessonStep';
import { useShopStore } from '@/lib/hooks/useShop';
import { Lesson, useLessonsStore } from '@/lib/hooks/useLessons';
import { useAdventureStore } from '@/lib/stores/adventureStore';
import { usePetStore } from '@/lib/stores/petStore';
import { spacing } from '@/theme/tokens';
import { CompleteStage } from '../CompleteStage';
import type { ScreenHelpId } from '@/domain/content/ReferenceContent';
import { LessonStepHeader } from '../LessonStepHeader';
import { MinigameStep } from '../MinigameStep';
import { RewardStep } from '../RewardStep';
import { TestStep } from '../TestStep';
import { TheoryStep } from '../TheoryStep';

/** Подсказка «?» на шаге мини-игры — как играть именно в неё. */
const MINIGAME_HELP: Record<string, ScreenHelpId> = {
  quiz: 'game_quiz',
  tinder_swipe: 'game_swipes',
  five_letters: 'game_five_letters',
};

export function StepRunner({
  lesson,
  steps,
  onExit,
  onRequestExit,
  onComplete,
}: {
  lesson: Lesson;
  steps: LessonStep[];
  onExit: () => void;
  onRequestExit: () => void;
  onComplete: () => void;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [awardedCoins, setAwardedCoins] = useState(0);
  // Только экшен — рендеримся при смене stepIndex, не при чужих изменениях прогресса.
  const markLessonCompleted = useLessonsStore((s) => s.markLessonCompleted);
  // Ветка этого урока совпадает с веткой активного приключения — урок
  // засчитывается как «задание»: даёт +10% к наградам (как раньше давал
  // разовый выбор на онбординге), ускоряет таймер приключения по завершении
  // и — только в этом контексте — неверный ответ тратит энергию (см. TestStep/MinigameStep).
  // §9: пройденный урок доступен для повтора без награды — фиксируем при
  // открытии (к концу урока он уже будет отмечен пройденным). Повтор не
  // засчитывается и как задание приключения, иначе один и тот же урок можно
  // было бы перепроходить ради монет/опыта/ускорения таймера.
  const [isReplay] = useState(
    () => useLessonsStore.getState().progress[lesson.id]?.status === 'completed'
  );
  const isActiveBranch = useAdventureStore((s) => s.isActiveBranch(lesson.branch_id));
  const isAdventureQuest = !isReplay && isActiveBranch;
  const registerQuestCompletion = useAdventureStore((s) => s.registerQuestCompletion);
  const currentMood = usePetStore((s) => s.currentMood);
  // Единственная реальная функциональная надбавка ноутбука (§ «бонусы только
  // у ноутбука/кровати/копилки») — раньше coin_bonus_percent был мёртвым
  // кодом (getTotalCoinBonusPercent нигде не вызывался).
  const laptopCoinBonusPercent = useShopStore((s) => s.getTotalCoinBonusPercent());
  const hasMarkedCompleteRef = useRef(false);
  // Счётчик ошибок за весь урок (Test/Minigame шаги) — «идеальный урок» для
  // RewardStep (см. ниже) значит ровно 0 к моменту показа награды (она всегда
  // последний интерактивный шаг после всех тестов/мини-игр). State, а не ref —
  // значение читается прямо при рендере (isPerfect ниже), а рефы для этого не
  // предназначены (react-hooks/refs).
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const handleWrongAnswer = () => {
    setWrongAnswers((n) => n + 1);
  };

  const adjustedSteps = useMemo(() => {
    const multiplier = 1 + (isAdventureQuest ? 0.1 : 0) + laptopCoinBonusPercent / 100;
    if (multiplier === 1) return steps;
    return steps.map((s) =>
      s.type === 'reward' ? { ...s, coins: Math.round(s.coins * multiplier) } : s
    );
  }, [steps, isAdventureQuest, laptopCoinBonusPercent]);

  const goNext = () => setStepIndex((i) => i + 1);

  useEffect(() => {
    if (stepIndex >= adjustedSteps.length && !hasMarkedCompleteRef.current) {
      hasMarkedCompleteRef.current = true;
      markLessonCompleted(lesson.id);
      if (isAdventureQuest) registerQuestCompletion();
      onComplete();
    }
  }, [
    stepIndex,
    adjustedSteps.length,
    lesson.id,
    markLessonCompleted,
    isAdventureQuest,
    registerQuestCompletion,
    onComplete,
  ]);

  if (stepIndex >= adjustedSteps.length) {
    return (
      <CompleteStage
        onExit={onExit}
        bonusCoins={awardedCoins}
        isAdventureQuest={isAdventureQuest}
        isReplay={isReplay}
      />
    );
  }

  const step = adjustedSteps[stepIndex];

  const renderStep = () => {
    switch (step.type) {
      case 'theory':
        return <TheoryStep cards={step.cards} onDone={goNext} />;

      case 'minigame':
        return (
          <MinigameStep
            step={step}
            onDone={goNext}
            isAdventureQuest={isAdventureQuest}
            onWrongAnswer={handleWrongAnswer}
          />
        );

      case 'test':
        return (
          <TestStep
            step={step}
            onPass={goNext}
            isAdventureQuest={isAdventureQuest}
            onWrongAnswer={handleWrongAnswer}
          />
        );

      case 'reward':
        return (
          <RewardStep
            step={step}
            isAdventureQuest={isAdventureQuest}
            isReplay={isReplay}
            isPerfect={wrongAnswers === 0}
            onCollect={(coins) => {
              setAwardedCoins(coins);
              goNext();
            }}
          />
        );

      case 'modal':
        return (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              padding: spacing.xxl,
            }}
          >
            <Text>{step.message}</Text>
            <TouchableOpacity onPress={goNext}>
              <Text>{step.ctaLabel}</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <LessonStepHeader
        progress={stepIndex / adjustedSteps.length}
        onClose={onRequestExit}
        petMood={currentMood}
        help={step.type === 'minigame' ? (MINIGAME_HELP[step.minigameType] ?? 'lesson') : 'lesson'}
      />
      {renderStep()}
    </View>
  );
}
