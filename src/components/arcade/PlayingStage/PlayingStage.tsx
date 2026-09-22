// src/components/arcade/PlayingStage/PlayingStage.tsx
// Этап 2 Аркады — сам игровой процесс

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, View } from 'react-native';

import { QuizGame, TinderSwipeGame } from '@/components/games';
import { TrainerSession } from '@/domain/arcade/TrainerSelection';
import { formatCoins } from '@/lib/utils/formatters';
import { useResponsive, useTheme } from '@/theme';
import { spacing } from '@/theme/tokens';
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

  const currentQuestion = session.questions[currentQuestionIndex];
  if (!currentQuestion) return null;

  return (
    <View style={styles.gameContainer}>
      <View style={{ marginBottom: scale(spacing.xxl) }}>
        <View style={styles.progressHeader}>
          <Text style={[styles.progressLabel, { fontSize: scaledFont('md') }]}>
            Вопрос {currentQuestionIndex + 1} из {session.questions.length}
          </Text>
          <View style={styles.progressCoinsRow}>
            <Ionicons name="wallet" size={scale(14)} color={theme.coins} />
            <Text style={[styles.progressCoins, { fontSize: scaledFont('md') }]}>
              {formatCoins(coinsEarned)}
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
              width: `${((currentQuestionIndex + 1) / session.questions.length) * 100}%`,
            }}
          />
        </View>
      </View>

      {session.minigameType === 'tinder_swipe' ? (
        <TinderSwipeGame
          key={currentQuestion.id}
          question={currentQuestion.question_text}
          options={currentQuestion.options}
          correctAnswer={currentQuestion.correct_answer}
          onAnswer={onAnswer}
        />
      ) : (
        <QuizGame
          key={currentQuestion.id}
          question={currentQuestion.question_text}
          options={currentQuestion.options}
          correctAnswer={currentQuestion.correct_answer}
          onAnswer={onAnswer}
        />
      )}
    </View>
  );
}
