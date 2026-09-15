// src/components/games/QuizGame/QuizGame.tsx
// Мини-игра «Викторина» — выбор правильного ответа

import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { useFeedback } from '@/lib/hooks/useFeedback';
import { useResponsive, useTheme } from '@/theme';
import { createQuizGameStyles, getOptionColors, OptionState } from './QuizGame.styles';

interface QuizGameProps {
  question: string;
  options: string[];
  correctAnswer: string;
  onAnswer: (answer: string, isCorrect: boolean) => void;
  disabled?: boolean;
}

export function QuizGame({
  question,
  options,
  correctAnswer,
  onAnswer,
  disabled = false,
}: QuizGameProps) {
  const { theme } = useTheme();
  const { scale } = useResponsive();
  const { trigger } = useFeedback();

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const styles = createQuizGameStyles({ theme });

  const handleSelect = (option: string) => {
    if (disabled || selectedAnswer) return;

    const isCorrect = option === correctAnswer;

    // ЗВУК + HAPTIC вызываются ТОЛЬКО здесь
    trigger(isCorrect ? 'correctAnswer' : 'wrongAnswer');

    setSelectedAnswer(option);
    setShowResult(true);

    // Небольшая задержка перед отправкой для визуального фидбека
    setTimeout(() => {
      onAnswer(option, isCorrect);
    }, 800);
  };

  const getOptionState = (option: string): OptionState => {
    if (!showResult) return 'idle';
    if (option === correctAnswer) return 'correct';
    if (option === selectedAnswer) return 'selectedWrong';
    return 'dimmed';
  };

  const isCorrectSelection = selectedAnswer === correctAnswer;

  return (
    <View style={styles.container}>
      {/* Вопрос */}
      <View style={styles.questionCard}>
        <Text style={styles.questionText}>{question}</Text>
      </View>

      {/* Варианты ответов */}
      <View style={styles.optionsContainer}>
        {options.map((option, index) => {
          const state = getOptionState(option);
          const colors = getOptionColors(theme, state);

          return (
            <TouchableOpacity
              key={index}
              onPress={() => handleSelect(option)}
              disabled={disabled || selectedAnswer !== null}
              activeOpacity={0.7}
              style={[
                styles.optionButton,
                {
                  backgroundColor: colors.bg,
                  borderColor: colors.border,
                  opacity: colors.opacity,
                },
              ]}
            >
              {/* Буква варианта */}
              <View style={styles.optionLetterCircle}>
                <Text style={styles.optionLetterText}>{String.fromCharCode(65 + index)}</Text>
              </View>

              {/* Текст варианта */}
              <Text style={styles.optionText}>{option}</Text>

              {/* Иконка результата */}
              {showResult && state === 'correct' && (
                <View style={[styles.optionIconContainer, { backgroundColor: theme.success }]}>
                  <Ionicons name="checkmark" size={scale(16)} color="#FFFFFF" />
                </View>
              )}
              {showResult && state === 'selectedWrong' && (
                <View style={[styles.optionIconContainer, { backgroundColor: theme.error }]}>
                  <Ionicons name="close" size={scale(16)} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Результат */}
      {showResult && (
        <View
          style={[
            styles.feedbackContainer,
            {
              backgroundColor: isCorrectSelection
                ? 'rgba(16, 185, 129, 0.15)'
                : 'rgba(239, 68, 68, 0.15)',
              borderColor: isCorrectSelection
                ? 'rgba(16, 185, 129, 0.4)'
                : 'rgba(239, 68, 68, 0.4)',
            },
          ]}
        >
          <Text
            style={[
              styles.feedbackText,
              {
                color: isCorrectSelection ? theme.success : theme.error,
              },
            ]}
          >
            {isCorrectSelection ? '🎉 Правильно! +10 коинов' : '😔 Неправильно. Настроение -10'}
          </Text>
        </View>
      )}
    </View>
  );
}
