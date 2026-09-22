// src/components/lesson/StepRunner/StepRunner.tsx
// Раннер полной композиции шагов (новый формат урока, §9.1)

import { useEffect, useMemo, useRef, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { LessonStep, RewardStep as RewardStepData } from '@/domain/lesson/LessonStep';
import { Lesson, useLessonsStore } from '@/lib/hooks/useLessons';
import { usePetStore } from '@/lib/stores/petStore';
import { usePreferencesStore } from '@/lib/stores/preferencesStore';
import { spacing } from '@/theme/tokens';
import { CompleteStage } from '../CompleteStage';
import { LessonStepHeader } from '../LessonStepHeader';
import { MinigameStep } from '../MinigameStep';
import { ResourcePlanningStep } from '../ResourcePlanningStep';
import { RewardStep } from '../RewardStep';
import { TestStep } from '../TestStep';
import { TheoryStep } from '../TheoryStep';

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
  const [lastRewardCoins, setLastRewardCoins] = useState(0);
  // Только экшен — рендеримся при смене stepIndex, не при чужих изменениях прогресса.
  const markLessonCompleted = useLessonsStore((s) => s.markLessonCompleted);
  const isPriority = usePreferencesStore((s) => s.isPriorityBranch(lesson.branch_id));
  const currentMood = usePetStore((s) => s.currentMood);
  const hasMarkedCompleteRef = useRef(false);

  // Бонус +10% коинов за приоритетную ветку (та же механика, что и раньше
  // применялась в legacy submitAnswer) — коины из buildLessonSteps фиксированы
  // §9.3, приоритетная надбавка применяется здесь, а не в домене.
  const adjustedSteps = useMemo(() => {
    if (!isPriority) return steps;
    return steps.map((s) => (s.type === 'reward' ? { ...s, coins: Math.round(s.coins * 1.1) } : s));
  }, [steps, isPriority]);

  const goNext = () => setStepIndex((i) => i + 1);

  useEffect(() => {
    if (stepIndex >= adjustedSteps.length && !hasMarkedCompleteRef.current) {
      hasMarkedCompleteRef.current = true;
      markLessonCompleted(lesson.id);
      onComplete();
    }
  }, [stepIndex, adjustedSteps.length, lesson.id, markLessonCompleted, onComplete]);

  if (stepIndex >= adjustedSteps.length) {
    const totalCoins = adjustedSteps
      .filter((s): s is RewardStepData => s.type === 'reward')
      .reduce((sum, s) => sum + s.coins, 0);
    return <CompleteStage onExit={onExit} bonusCoins={totalCoins} />;
  }

  const step = adjustedSteps[stepIndex];

  const renderStep = () => {
    switch (step.type) {
      case 'theory':
        return <TheoryStep cards={step.cards} onDone={goNext} />;

      case 'minigame':
        return <MinigameStep step={step} onDone={goNext} />;

      case 'test':
        return <TestStep step={step} onPass={goNext} />;

      case 'reward':
        return (
          <RewardStep
            step={step}
            onCollect={() => {
              setLastRewardCoins(step.coins);
              goNext();
            }}
          />
        );

      case 'resource_planning':
        return <ResourcePlanningStep coins={lastRewardCoins} onDone={goNext} />;

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
      />
      {renderStep()}
    </View>
  );
}
