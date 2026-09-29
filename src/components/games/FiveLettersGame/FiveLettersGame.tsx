// src/components/games/FiveLettersGame/FiveLettersGame.tsx
// Мини-игра «5 букв» — wordle-клон на финансовую лексику (§9.4, без штрафа
// за ошибку: серые/жёлтые буквы — не наказание, а подсказка для следующей
// попытки). До 6 попыток; исход раунда (angle onAnswer) — только один раз, в
// конце: true, если слово отгадано в пределах попыток, иначе false — тогда
// MinigameStep переигрывает то же слово заново (см. MinigameStep.tsx), и
// игрок уже видел разгадку в feedback-баннере ниже.
// Подсказки (решение пользователя 29.09.2026): описание слова — бесплатно и
// сразу над полем; «Открыть букву» — один раз на слово (первая ещё не
// отгаданная буква — текстом над полем и бледной буквой в её клетке текущей
// строки), в уроке стоит hintPrice (content/lessons), в Аркаде — бесплатно.

import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/ui/Text';

import { useFeedback } from '@/lib/hooks/useFeedback';
import { formatCoins, formatPrice } from '@/lib/utils/formatters';
import { useResponsive, useTheme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import { evaluateGuess, LetterResult, letterToReveal } from './evaluateGuess';
import {
  CELL_SIZE,
  CellState,
  createFiveLettersGameStyles,
  getCellColors,
  MAX_ATTEMPTS,
  WORD_LENGTH,
} from './FiveLettersGame.styles';

const KEYBOARD_ROWS = [
  ['Й', 'Ц', 'У', 'К', 'Е', 'Н', 'Г', 'Ш', 'Щ', 'З', 'Х', 'Ъ'],
  ['Ф', 'Ы', 'В', 'А', 'П', 'Р', 'О', 'Л', 'Д', 'Ж', 'Э'],
  ['ENTER', 'Я', 'Ч', 'С', 'М', 'И', 'Т', 'Ь', 'Б', 'Ю', 'BACKSPACE'],
];

const STATE_RANK: Record<CellState, number> = {
  idle: 0,
  filled: 0,
  absent: 1,
  present: 2,
  correct: 3,
};

interface FiveLettersGameProps {
  word: string;
  hint?: string;
  /** Цена «Открыть букву» (урок: hintPrice в content/lessons); 0/нет — бесплатно. */
  hintPrice?: number;
  /** Открытая буква (позиция в слове). Передаёт урок: куплена — видна и при
   * повторе раунда. Без onRevealLetter (Аркада) игра хранит её сама. */
  revealedLetterIndex?: number;
  /** Купить «Открыть букву» (цена — hintPrice, платит вызывающий код). */
  onRevealLetter?: (index: number) => void;
  onAnswer: (answer: string, isCorrect: boolean) => void;
  disabled?: boolean;
}

export function FiveLettersGame({
  word,
  hint,
  hintPrice = 0,
  revealedLetterIndex,
  onRevealLetter,
  onAnswer,
  disabled = false,
}: FiveLettersGameProps) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const { trigger, triggerHaptic } = useFeedback();
  const styles = createFiveLettersGameStyles({ theme });

  const target = word.toUpperCase();

  const [guesses, setGuesses] = useState<string[]>([]);
  const [results, setResults] = useState<LetterResult[][]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');
  const [keyStates, setKeyStates] = useState<Record<string, CellState>>({});
  // См. аналогичный isProcessingRef в TinderSwipeGame.tsx: state одного ENTER
  // в теории не гонка (onPress синхронный, не через UI-поток жеста), но
  // держим ту же защиту от повторного сабмита ради единообразия и на случай
  // сдвоенного тапа — иначе одна попытка могла бы засчитаться дважды.
  const isSubmittingRef = useRef(false);

  const isDone = gameState !== 'playing';

  // «Открыть букву» — один раз на слово.
  const [localRevealed, setLocalRevealed] = useState<number | undefined>(undefined);
  const revealedIndex = onRevealLetter ? revealedLetterIndex : localRevealed;
  const handleRevealLetter = () => {
    if (disabled || isDone || revealedIndex !== undefined) return;
    const index = letterToReveal(results, WORD_LENGTH);
    if (onRevealLetter) onRevealLetter(index);
    else setLocalRevealed(index);
  };
  const priceSuffix = hintPrice > 0 ? ` · ${formatPrice(hintPrice)}` : '';

  const handleKeyPress = (letter: string) => {
    if (disabled || isDone || currentGuess.length >= WORD_LENGTH) return;
    triggerHaptic('selection');
    setCurrentGuess((g) => g + letter);
  };

  const handleBackspace = () => {
    if (disabled || isDone) return;
    setCurrentGuess((g) => g.slice(0, -1));
  };

  const handleSubmit = () => {
    if (disabled || isDone || isSubmittingRef.current || currentGuess.length !== WORD_LENGTH) {
      return;
    }
    isSubmittingRef.current = true;

    const guessResult = evaluateGuess(currentGuess, target);
    const submittedGuess = currentGuess;
    const attemptsUsed = guesses.length + 1;

    setGuesses((prev) => [...prev, submittedGuess]);
    setResults((prev) => [...prev, guessResult]);
    setKeyStates((prev) => {
      const next = { ...prev };
      submittedGuess.split('').forEach((letter, i) => {
        const state = guessResult[i] as CellState;
        if (!next[letter] || STATE_RANK[state] > STATE_RANK[next[letter]]) {
          next[letter] = state;
        }
      });
      return next;
    });
    setCurrentGuess('');
    triggerHaptic('light');
    // Строка обработана — дальше либо следующая попытка (снимаем защиту,
    // чтобы можно было отправить её), либо раунд завершён (клавиатура
    // скрывается через isDone, повторный сабмит и так больше недостижим).
    isSubmittingRef.current = false;

    const isWin = submittedGuess === target;
    if (isWin) {
      trigger('correctAnswer');
      setGameState('won');
      setTimeout(() => onAnswer(target, true), 1200);
    } else if (attemptsUsed >= MAX_ATTEMPTS) {
      trigger('wrongAnswer');
      setGameState('lost');
      setTimeout(() => onAnswer(submittedGuess, false), 1500);
    }
  };

  return (
    <View style={styles.container}>
      {/* Описание слова — бесплатно и сразу (решение 29.09.2026). */}
      {hint && (
        <View style={styles.hintCard}>
          <Text style={[styles.hintText, { fontSize: scaledFont('sm') }]}>💡 {hint}</Text>
        </View>
      )}
      {revealedIndex !== undefined && (
        <View style={styles.hintCard}>
          <Text style={[styles.hintText, { fontSize: scaledFont('sm') }]}>
            🔤 {revealedIndex + 1}-я буква — {target[revealedIndex]}
          </Text>
        </View>
      )}
      {!isDone && revealedIndex === undefined && (
        <View style={styles.hintButtons}>
          <TouchableOpacity
            onPress={handleRevealLetter}
            disabled={disabled}
            activeOpacity={0.7}
            style={styles.hintButton}
            accessibilityRole="button"
            accessibilityLabel={
              hintPrice > 0
                ? `Открыть одну букву за ${formatCoins(hintPrice)}`
                : 'Открыть одну букву'
            }
          >
            <Text style={[styles.hintButtonText, { fontSize: scaledFont('sm') }]}>
              🔤 Открыть букву{priceSuffix}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.grid}>
        {Array.from({ length: MAX_ATTEMPTS }).map((_, rowIndex) => {
          const isSubmittedRow = rowIndex < guesses.length;
          const isCurrentRow = rowIndex === guesses.length;
          const rowLetters = isSubmittedRow
            ? guesses[rowIndex].split('')
            : isCurrentRow
              ? currentGuess.split('')
              : [];

          return (
            <View key={rowIndex} style={styles.row}>
              {Array.from({ length: WORD_LENGTH }).map((_, colIndex) => {
                const letter = rowLetters[colIndex] ?? '';
                // Открытая буква — бледно в пустой клетке текущей строки.
                const ghost =
                  isCurrentRow && !isDone && !letter && colIndex === revealedIndex
                    ? target[colIndex]
                    : '';
                const state: CellState = isSubmittedRow
                  ? results[rowIndex][colIndex]
                  : letter
                    ? 'filled'
                    : 'idle';
                const colors = getCellColors(theme, state);

                return (
                  <View
                    key={colIndex}
                    style={[
                      styles.cell,
                      {
                        width: scale(CELL_SIZE),
                        height: scale(CELL_SIZE),
                        backgroundColor: colors.bg,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.cellText,
                        {
                          color: ghost ? theme.textMuted : colors.text,
                          fontSize: scaledFont('xl'),
                        },
                        ghost ? styles.cellGhost : null,
                      ]}
                    >
                      {letter || ghost}
                    </Text>
                  </View>
                );
              })}
            </View>
          );
        })}
      </View>

      {isDone && (
        <View
          style={[
            styles.feedbackContainer,
            {
              backgroundColor:
                gameState === 'won' ? withAlpha(theme.success, 0.15) : withAlpha(theme.error, 0.15),
              borderColor:
                gameState === 'won' ? withAlpha(theme.success, 0.4) : withAlpha(theme.error, 0.4),
            },
          ]}
        >
          <Text
            style={[
              styles.feedbackText,
              { color: gameState === 'won' ? theme.success : theme.error },
            ]}
          >
            {gameState === 'won' ? '🎉 Отгадано!' : `😔 Слово было: ${target}`}
          </Text>
        </View>
      )}

      {!isDone && (
        <View style={styles.keyboard}>
          {KEYBOARD_ROWS.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.keyboardRow}>
              {row.map((key) => {
                if (key === 'ENTER') {
                  const canSubmit = !disabled && currentGuess.length === WORD_LENGTH;
                  return (
                    <TouchableOpacity
                      key={key}
                      onPress={handleSubmit}
                      disabled={!canSubmit}
                      activeOpacity={0.7}
                      style={[
                        styles.key,
                        styles.keyWide,
                        { backgroundColor: theme.accent, opacity: canSubmit ? 1 : 0.4 },
                      ]}
                    >
                      <Ionicons name="checkmark" size={scale(18)} color={theme.onGradient} />
                    </TouchableOpacity>
                  );
                }
                if (key === 'BACKSPACE') {
                  return (
                    <TouchableOpacity
                      key={key}
                      onPress={handleBackspace}
                      disabled={disabled}
                      activeOpacity={0.7}
                      style={[styles.key, styles.keyWide, { backgroundColor: theme.surfaceLight }]}
                    >
                      <Ionicons
                        name="backspace-outline"
                        size={scale(18)}
                        color={theme.textPrimary}
                      />
                    </TouchableOpacity>
                  );
                }

                const rawState = keyStates[key];
                const colors = getCellColors(theme, rawState ?? 'idle');
                return (
                  <TouchableOpacity
                    key={key}
                    onPress={() => handleKeyPress(key)}
                    disabled={disabled}
                    activeOpacity={0.7}
                    style={[
                      styles.key,
                      { backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border },
                    ]}
                  >
                    <Text style={[styles.keyText, { color: colors.text }]}>{key}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
