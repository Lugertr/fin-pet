// src/components/lesson/MinigameStep/MinigameStep.tsx
// Шаг «Мини-игра» (новая композиция урока) — без штрафа за ошибку (§9.4): та
// же ошибка не наказывается (не двигает питомца/прогресс назад), но и не
// пропускается молча. Неверный ответ — тот же вопрос ещё раз (переигрываем
// игру заново через смену key), без продвижения к следующему вопросу. Дальше
// проходим, только ответив верно — значит на выходе из шага все вопросы
// отвечены правильно, и общая награда урока (см. buildLessonSteps.ts)
// заслужена, а не выдана за угадывание.
//
// Исключение из «без штрафа» — только когда урок засчитывается как задание
// активного приключения (isAdventureQuest, см. StepRunner.tsx): неверный
// ответ дополнительно тратит немного энергии, согласованное с пользователем
// отступление от общего правила (см. ADVENTURE_WRONG_ANSWER_ENERGY_COST).

import { useState } from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/Text';

import { FiveLettersGame, QuizGame, TinderSwipeGame } from '@/components/games';
import { MinigameStep as MinigameStepData } from '@/domain/lesson/LessonStep';
import { Question } from '@/lib/hooks/useLessons';
import { ADVENTURE_WRONG_ANSWER_ENERGY_COST } from '@/lib/stores/adventureStore';
import { usePetStore } from '@/lib/stores/petStore';
import { useResponsive, useTheme } from '@/theme';
import { spacing } from '@/theme/tokens';
import { createLessonStepsStyles } from '../lessonSteps.styles';

export function MinigameStep({
  step,
  onDone,
  isAdventureQuest = false,
  onWrongAnswer,
}: {
  step: MinigameStepData;
  onDone: () => void;
  isAdventureQuest?: boolean;
  /** Копится в StepRunner на весь урок — «идеальный урок» для RewardStep
   * значит ровно 0 вызовов, включая переигранные раунды. */
  onWrongAnswer?: () => void;
}) {
  const { theme } = useTheme();
  const { scaledFont } = useResponsive();
  const styles = createLessonStepsStyles({ theme });

  const isFiveLetters = step.minigameType === 'five_letters';
  const totalRounds = isFiveLetters ? (step.words?.length ?? 0) : step.questions.length;

  const [index, setIndex] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const question: Question | undefined = step.questions[index];
  const wordRound = step.words?.[index];

  // Без искусственной паузы здесь: QuizGame/TinderSwipeGame/FiveLettersGame
  // уже сами держат результат на экране (свои внутренние задержки) и
  // вызывают onAnswer только когда обратная связь отыграна — повторная
  // задержка тут раньше просто удваивала общее время без всякой пользы.
  const handleAnswer = (_answer: string, isCorrect: boolean) => {
    if (!isCorrect) {
      onWrongAnswer?.();
      if (isAdventureQuest) {
        usePetStore.getState().spendEnergy(ADVENTURE_WRONG_ANSWER_ENERGY_COST);
      }
      // Тот же вопрос/слово заново — смена key ниже перемонтирует игру и
      // сбросит её внутреннее состояние (выбранный ответ/подсветку/буквы).
      setAttempt((a) => a + 1);
      return;
    }
    if (index < totalRounds - 1) {
      setIndex((i) => i + 1);
      setAttempt(0);
    } else {
      onDone();
    }
  };

  // tinder_swipe сам показывает свой прогресс внизу карточки («N / M
  // утверждений», см. TinderSwipeGame) — верхняя подпись здесь была бы
  // дублем, поэтому для него не рендерим.
  const showTopProgressLabel = step.minigameType !== 'tinder_swipe';

  return (
    <View style={styles.minigameContainer}>
      {showTopProgressLabel && (
        <Text
          style={[styles.progressLabel, { fontSize: scaledFont('md'), marginBottom: spacing.lg }]}
        >
          Вопрос {index + 1} из {totalRounds}
        </Text>
      )}

      {isFiveLetters && wordRound ? (
        <FiveLettersGame
          key={`${wordRound.word}-${attempt}`}
          word={wordRound.word}
          hint={wordRound.hint}
          onAnswer={handleAnswer}
        />
      ) : step.minigameType === 'tinder_swipe' && question ? (
        <TinderSwipeGame
          key={`${question.id}-${attempt}`}
          question={question.question_text}
          options={question.options}
          correctAnswer={question.correct_answer}
          explanation={question.explanation}
          hint={question.hint}
          progressCurrent={index + 1}
          progressTotal={totalRounds}
          onAnswer={handleAnswer}
        />
      ) : question ? (
        <QuizGame
          key={`${question.id}-${attempt}`}
          question={question.question_text}
          options={question.options}
          correctAnswer={question.correct_answer}
          optionDetails={question.optionDetails}
          onAnswer={handleAnswer}
        />
      ) : null}
    </View>
  );
}
