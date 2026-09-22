// src/components/games/QuizGridGame/QuizGridGame.tsx
// Мини-игра «Викторина» — сетка 2×2, тап только выбирает карточку, оценка
// происходит по отдельной кнопке «Проверить» (в отличие от QuizGame, где тап
// сразу проверяет ответ). Используется TestStep — MinigameStep и Аркада
// продолжают использовать QuizGame (мгновенный фидбек важнее для их темпа).

import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { QuestionOptionDetail } from '@/domain/content/LessonContent';
import { useFeedback } from '@/lib/hooks/useFeedback';
import { useResponsive, useTheme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import { getOptionColors, OptionState } from '../QuizGame/QuizGame.styles';
import { createQuizGridGameStyles } from './QuizGridGame.styles';

interface QuizGridGameProps {
  question: string;
  options: string[];
  correctAnswer: string;
  optionDetails?: QuestionOptionDetail[];
  onAnswer: (answer: string, isCorrect: boolean) => void;
  disabled?: boolean;
}

export function QuizGridGame({
  question,
  options,
  correctAnswer,
  optionDetails,
  onAnswer,
  disabled = false,
}: QuizGridGameProps) {
  const { theme } = useTheme();
  const { scale } = useResponsive();
  const { trigger } = useFeedback();

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const styles = createQuizGridGameStyles({ theme });

  const handleSelect = (option: string) => {
    if (disabled || showResult) return;
    setSelectedAnswer(option);
  };

  const handleSubmit = () => {
    if (disabled || showResult || !selectedAnswer) return;

    const isCorrect = selectedAnswer === correctAnswer;
    trigger(isCorrect ? 'correctAnswer' : 'wrongAnswer');
    setShowResult(true);

    setTimeout(() => {
      onAnswer(selectedAnswer, isCorrect);
    }, 800);
  };

  const getOptionState = (option: string): OptionState => {
    if (showResult) {
      if (option === correctAnswer) return 'correct';
      if (option === selectedAnswer) return 'selectedWrong';
      return 'dimmed';
    }
    return option === selectedAnswer ? 'selected' : 'idle';
  };

  const isCorrectSelection = selectedAnswer === correctAnswer;

  return (
    <View style={styles.container}>
      <View style={styles.questionCard}>
        <Text style={styles.questionText}>{question}</Text>
        <Text style={styles.hintText}>🎯 Выбери 1 правильный ответ</Text>
      </View>

      <View style={styles.optionsGrid}>
        {options.map((option, index) => {
          const state = getOptionState(option);
          const colors = getOptionColors(theme, state);
          const detail = optionDetails?.[index];

          return (
            <TouchableOpacity
              key={index}
              onPress={() => handleSelect(option)}
              disabled={disabled || showResult}
              activeOpacity={0.7}
              style={[
                styles.optionCard,
                { backgroundColor: colors.bg, borderColor: colors.border, opacity: colors.opacity },
              ]}
            >
              <View style={styles.optionIconCircle}>
                <Text style={{ fontSize: scale(20) }}>
                  {detail?.icon ?? String.fromCharCode(65 + index)}
                </Text>
              </View>
              <Text style={styles.optionLabel}>{option}</Text>
              {detail?.sublabel && <Text style={styles.optionSublabel}>{detail.sublabel}</Text>}

              {(state === 'selected' || state === 'correct') && (
                <View style={styles.optionCheckBadge}>
                  <Ionicons name="checkmark" size={scale(13)} color={theme.onGradient} />
                </View>
              )}
              {state === 'selectedWrong' && (
                <View style={[styles.optionCheckBadge, { backgroundColor: theme.error }]}>
                  <Ionicons name="close" size={scale(13)} color={theme.onGradient} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {showResult ? (
        <View
          style={[
            styles.feedbackContainer,
            {
              backgroundColor: isCorrectSelection
                ? withAlpha(theme.success, 0.15)
                : withAlpha(theme.error, 0.15),
              borderColor: isCorrectSelection
                ? withAlpha(theme.success, 0.4)
                : withAlpha(theme.error, 0.4),
            },
          ]}
        >
          <Text
            style={[
              styles.feedbackText,
              { color: isCorrectSelection ? theme.success : theme.error },
            ]}
          >
            {isCorrectSelection ? '🎉 Правильно!' : '😔 Неправильно. Идём дальше!'}
          </Text>
        </View>
      ) : (
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={disabled || !selectedAnswer}
          activeOpacity={0.8}
          style={[
            styles.submitButton,
            (disabled || !selectedAnswer) && styles.submitButtonDisabled,
            { paddingVertical: scale(16) },
          ]}
        >
          <Text style={styles.submitButtonText}>Проверить →</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
