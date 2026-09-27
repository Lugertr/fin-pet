// src/components/games/QuizGame/QuizGame.tsx
// Мини-игра «Викторина/Тест» — список карточек-вариантов, тап сразу проверяет
// ответ. Единственный квиз-компонент в приложении (см. историю: раньше был
// ещё QuizGridGame — сетка 2×2 с отдельной кнопкой «Проверить» для TestStep,
// удалена как чистое дублирование одного и того же question/onAnswer
// контракта; optionDetails перенесены сюда).

import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/ui/Text';

import { QuestionOptionDetail } from '@/domain/content/LessonContent';
import { useFeedback } from '@/lib/hooks/useFeedback';
import { useResponsive, useTheme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import { createQuizGameStyles, getOptionColors, OptionState } from './QuizGame.styles';

interface QuizGameProps {
  question: string;
  options: string[];
  correctAnswer: string;
  /** Тот же порядок/длина, что options — иконка+подпись под вариантом вместо
   * дефолтной буквы (см. domain/content/LessonContent.ts). */
  optionDetails?: QuestionOptionDetail[];
  onAnswer: (answer: string, isCorrect: boolean) => void;
  disabled?: boolean;
}

export function QuizGame({
  question,
  options,
  correctAnswer,
  optionDetails,
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
      {/* Результат — над вопросом, а не под вариантами (см. референс дизайна) */}
      {showResult && (
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
              {
                color: isCorrectSelection ? theme.success : theme.error,
              },
            ]}
          >
            {isCorrectSelection ? '🎉 Верно!' : `😔 Неверно. Правильный ответ: ${correctAnswer}`}
          </Text>
        </View>
      )}

      {/* Вопрос */}
      <View style={styles.questionCard}>
        <Text style={styles.questionText}>{question}</Text>
      </View>

      {/* Варианты ответов */}
      <View style={styles.optionsContainer}>
        {options.map((option, index) => {
          const state = getOptionState(option);
          const colors = getOptionColors(theme, state);
          const detail = optionDetails?.[index];

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
              {/* Иконка/буква варианта */}
              <View style={styles.optionLetterCircle}>
                <Text style={styles.optionLetterText}>
                  {detail?.icon ?? String.fromCharCode(65 + index)}
                </Text>
              </View>

              {/* Текст варианта (+ доп. подпись, если задана в контенте) */}
              <View style={styles.optionTextColumn}>
                <Text style={styles.optionText}>{option}</Text>
                {detail?.sublabel && <Text style={styles.optionSublabel}>{detail.sublabel}</Text>}
              </View>

              {/* Иконка результата */}
              {showResult && state === 'correct' && (
                <View style={[styles.optionIconContainer, { backgroundColor: theme.success }]}>
                  <Ionicons name="checkmark" size={scale(16)} color={theme.onGradient} />
                </View>
              )}
              {showResult && state === 'selectedWrong' && (
                <View style={[styles.optionIconContainer, { backgroundColor: theme.error }]}>
                  <Ionicons name="close" size={scale(16)} color={theme.onGradient} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
