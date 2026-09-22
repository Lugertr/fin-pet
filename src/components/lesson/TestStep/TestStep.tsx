// src/components/lesson/TestStep/TestStep.tsx
// Шаг «Тест» (новая композиция урока) — 5 вопросов, порог 70% (§9.5), провал
// — свободный повтор

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { QuizGridGame } from '@/components/games';
import { ScreenFooter } from '@/components/ui';
import { TestStep as TestStepData } from '@/domain/lesson/LessonStep';
import { useAchievementsStore } from '@/lib/stores/achievementsStore';
import { useResponsive, useTheme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import { colorPalettes, emojiSizes, spacing } from '@/theme/tokens';
import { createLessonStepsStyles } from '../lessonSteps.styles';

export function TestStep({ step, onPass }: { step: TestStepData; onPass: () => void }) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const styles = createLessonStepsStyles({ theme });

  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const question = step.questions[index];

  // Без искусственной паузы здесь: QuizGridGame уже сама держит результат на
  // экране (кнопка «Проверить» → свои внутренние 800мс) и вызывает onAnswer
  // только когда обратная связь отыграна — повторная задержка тут раньше
  // просто удваивала общее время (~1.6с на вопрос) без всякой пользы.
  const handleAnswer = (_answer: string, isCorrect: boolean) => {
    const nextCorrect = correctCount + (isCorrect ? 1 : 0);
    if (isCorrect) {
      useAchievementsStore.getState().recordCorrectAnswer(); // §15.2 «Эрудит»
    }

    setCorrectCount(nextCorrect);
    if (index < step.questions.length - 1) {
      setIndex((i) => i + 1);
    } else {
      setShowResult(true);
    }
  };

  const handleRetry = () => {
    setIndex(0);
    setCorrectCount(0);
    setShowResult(false);
  };

  if (showResult) {
    const accuracy = step.questions.length > 0 ? correctCount / step.questions.length : 0;
    const isPassed = accuracy >= step.passThreshold;

    return (
      <View style={styles.stepContainer}>
        <View style={styles.testScroll}>
          <ScrollView contentContainerStyle={styles.testScrollContent}>
            <View style={styles.testResultContainer}>
              <View
                style={[
                  styles.testResultIconBox,
                  {
                    backgroundColor: isPassed
                      ? withAlpha(theme.success, 0.15)
                      : withAlpha(theme.warning, 0.15),
                  },
                ]}
              >
                <Text style={{ fontSize: scale(emojiSizes.lg) }}>{isPassed ? '🎉' : '📚'}</Text>
              </View>
              <Text style={[styles.testResultTitle, { fontSize: scaledFont('title') }]}>
                {isPassed ? 'Тест сдан!' : 'Почти получилось'}
              </Text>
              <Text style={[styles.testResultSubtitle, { fontSize: scaledFont('md') }]}>
                Правильных ответов: {correctCount} из {step.questions.length}
              </Text>
            </View>

            <View style={styles.testStatsCard}>
              <View style={styles.testStatsRow}>
                <Text style={[styles.testStatsLabel, { fontSize: scaledFont('lg') }]}>
                  Точность
                </Text>
                <Text style={[styles.testStatsValue, { fontSize: scaledFont('hero') }]}>
                  {Math.round(accuracy * 100)}%
                </Text>
              </View>
              <View style={styles.testStatsProgressBar}>
                <LinearGradient
                  colors={
                    isPassed
                      ? theme.gradients.primary
                      : [colorPalettes.amber[500], colorPalettes.amber[400]]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ height: '100%', width: `${Math.round(accuracy * 100)}%` }}
                />
              </View>
            </View>
          </ScrollView>
        </View>

        <ScreenFooter>
          <TouchableOpacity
            onPress={isPassed ? onPass : handleRetry}
            activeOpacity={0.8}
            style={styles.gradientButton}
          >
            <LinearGradient
              colors={theme.gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.gradientButtonInner, { padding: scale(spacing.lg) }]}
            >
              <Ionicons
                name={isPassed ? 'checkmark-circle' : 'refresh'}
                size={scale(24)}
                color={theme.onGradient}
              />
              <Text style={[styles.gradientButtonText, { fontSize: scaledFont('lg') }]}>
                {isPassed ? 'Забрать награду' : 'Пройти тест снова'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScreenFooter>
      </View>
    );
  }

  return (
    <View style={styles.minigameContainer}>
      <Text
        style={[styles.progressLabel, { fontSize: scaledFont('md'), marginBottom: spacing.lg }]}
      >
        Тест • Вопрос {index + 1} из {step.questions.length}
      </Text>

      <QuizGridGame
        key={question.id}
        question={question.question_text}
        options={question.options}
        correctAnswer={question.correct_answer}
        optionDetails={question.optionDetails}
        onAnswer={handleAnswer}
      />
    </View>
  );
}
