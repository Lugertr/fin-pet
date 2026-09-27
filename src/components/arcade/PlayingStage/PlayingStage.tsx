// src/components/arcade/PlayingStage/PlayingStage.tsx
// Этап 2 Аркады — сам игровой процесс: викторина, свайпы или «5 букв».

import { LinearGradient } from 'expo-linear-gradient';
import { View } from 'react-native';
import { Text } from '@/components/ui/Text';

import { FiveLettersGame, QuizGame, TinderSwipeGame } from '@/components/games';
import { TrainerSession, trainerRoundLength } from '@/domain/arcade/TrainerSelection';
import { formatPrice } from '@/lib/utils/formatters';
import { useResponsive, useTheme } from '@/theme';
import { spacing } from '@/theme/tokens';
import { ARCADE_GAME_META } from '../arcadeGames';
import { createPlayingStageStyles } from './PlayingStage.styles';

export function PlayingStage({
  session,
  currentQuestionIndex,
  coinsEarned,
  onAnswer,
}: {
  session: TrainerSession;
  currentQuestionIndex: number;
  coinsEarned: number;
  onAnswer: (answer: string, isCorrect: boolean) => void;
}) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const styles = createPlayingStageStyles({ theme });

  const total = trainerRoundLength(session);
  const currentQuestion = session.questions[currentQuestionIndex];
  const currentWord = session.words[currentQuestionIndex];
  if (session.minigameType === 'five_letters' ? !currentWord : !currentQuestion) return null;

  // key — по номеру вопроса, а не по id: в раунде викторины вопросы из
  // мини-игр и тестов разных уроков, их id могут совпасть, и тогда игра не
  // сбросила бы своё состояние между вопросами.
  const roundKey = `${session.minigameType}-${currentQuestionIndex}`;

  return (
    <View style={styles.gameContainer}>
      <View style={{ marginBottom: scale(spacing.xxl) }}>
        <View style={styles.progressHeader}>
          <Text style={[styles.progressLabel, { fontSize: scaledFont('md') }]}>
            {ARCADE_GAME_META[session.minigameType].unitLabel} {currentQuestionIndex + 1} из {total}
          </Text>
          <View style={styles.progressCoinsRow}>
            <Text style={[styles.progressCoins, { fontSize: scaledFont('md') }]}>
              {formatPrice(coinsEarned)}
            </Text>
          </View>
        </View>

        <View style={styles.progressBar}>
          <LinearGradient
            colors={theme.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              height: '100%',
              width: `${((currentQuestionIndex + 1) / total) * 100}%`,
            }}
          />
        </View>
      </View>

      {session.minigameType === 'five_letters' ? (
        <FiveLettersGame
          key={roundKey}
          word={currentWord.word}
          hint={currentWord.hint}
          onAnswer={onAnswer}
        />
      ) : session.minigameType === 'tinder_swipe' ? (
        <TinderSwipeGame
          key={roundKey}
          question={currentQuestion.question_text}
          options={currentQuestion.options}
          correctAnswer={currentQuestion.correct_answer}
          explanation={currentQuestion.explanation}
          hint={currentQuestion.hint}
          onAnswer={onAnswer}
        />
      ) : (
        <QuizGame
          key={roundKey}
          question={currentQuestion.question_text}
          options={currentQuestion.options}
          correctAnswer={currentQuestion.correct_answer}
          optionDetails={currentQuestion.optionDetails}
          onAnswer={onAnswer}
        />
      )}
    </View>
  );
}
