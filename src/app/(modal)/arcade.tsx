// src/app/(modal)/arcade.tsx
// Аркада (§10 ТЗ): случайный раунд по пройденной ветке, 10⚡ за игру,
// +10⭐ за верный ответ, подарки не выпадают (§10.2).
//
// Этапы (старт/игра/результаты) живут в src/components/arcade/ — этот файл
// отвечает только за сессию, энергозатраты и переключение между этапами.

import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { COINS_PER_CORRECT, PlayingStage, ResultsStage, StartStage } from '@/components/arcade';
import { IconButton } from '@/components/ui';
import { ARCADE_ENERGY_COST } from '@/constants/gameplay';
import { TrainerSession } from '@/domain/arcade/TrainerSelection';
import { rollTrainerSession } from '@/lib/arcade/rollTrainerSession';
import { useFeedback } from '@/lib/hooks/useFeedback';
import { Alert } from '@/lib/utils/alert';
import { BRANCHES } from '@/lib/hooks/useLessons';
import { useAchievementsStore } from '@/lib/stores/achievementsStore';
import { useArcadeSessionStore } from '@/lib/stores/arcadeSessionStore';
import { usePetStore } from '@/lib/stores/petStore';
import { useUserStore } from '@/lib/stores/userStore';
import { formatCoins } from '@/lib/utils/formatters';
import { canAffordEnergy } from '@/lib/utils/moodCalculator';
import { useResponsive, useTheme } from '@/theme';
import { spacing } from '@/theme/tokens';
import { createArcadeStyles } from '../../styles/screens/arcade/_[id].styles';

type GameStage = 'start' | 'playing' | 'results';

export default function ArcadeScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const { triggerHaptic } = useFeedback();
  const { session, startSession } = useArcadeSessionStore();

  const styles = createArcadeStyles({ theme });

  const [stage, setStage] = useState<GameStage>('start');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);

  const branch = session ? BRANCHES.find((b) => b.id === session.branchId) : null;

  useEffect(() => {
    return () => {
      useArcadeSessionStore.getState().clearSession();
    };
  }, []);

  const startRound = (round: TrainerSession) => {
    // Энергия могла восстановиться с последнего рендера — сверяемся со свежим значением
    usePetStore.getState().refreshMood();
    const freshMood = usePetStore.getState().currentMood;
    if (!canAffordEnergy(freshMood, ARCADE_ENERGY_COST)) {
      Alert.alert(
        'Недостаточно энергии',
        `Аркада стоит ${ARCADE_ENERGY_COST}⚡. Подождите, пока энергия восстановится, или покормите питомца.`
      );
      return;
    }

    triggerHaptic('medium');
    usePetStore.getState().spendEnergy(ARCADE_ENERGY_COST);
    startSession(round);
    setCurrentQuestionIndex(0);
    setCorrectAnswers(0);
    setCoinsEarned(0);
    setStage('playing');
  };

  const handleStartGame = () => {
    if (session) startRound(session);
  };

  // ЗВУК ВЫЗЫВАЕТСЯ В ИГРОВЫХ КОМПОНЕНТАХ — здесь только логика. Без
  // искусственной паузы здесь: QuizGame/TinderSwipeGame уже сами держат
  // результат на экране (свои внутренние ~350-800мс) и вызывают onAnswer
  // только когда обратная связь отыграна — повторная задержка тут раньше
  // просто удваивала общее время на вопрос без всякой пользы (тот же баг,
  // что был в MinigameStep/TestStep — см. их комментарии).
  const handleAnswer = (_answer: string, isCorrect: boolean) => {
    if (isCorrect) {
      setCorrectAnswers((prev) => prev + 1);
      setCoinsEarned((prev) => prev + COINS_PER_CORRECT);
      useAchievementsStore.getState().recordCorrectAnswer(); // §15.2 «Эрудит»
    }

    if (session && currentQuestionIndex < session.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setStage('results');
    }
  };

  const handleClaimReward = () => {
    triggerHaptic('success');

    if (coinsEarned > 0) {
      useUserStore
        .getState()
        .recordTransaction(coinsEarned, 'minigame_reward', `Аркада: ${branch?.name ?? ''}`);
    }

    Alert.alert(
      '🎉 Раунд завершён!',
      `Правильных ответов: ${correctAnswers} из ${session?.questions.length || 0}\nПолучено: +${formatCoins(coinsEarned)}`
    );
    router.back();
  };

  // §10.1: не ограничено по числу прохождений — каждый раз новый случайный раунд
  const handlePlayAgain = () => {
    const nextRound = rollTrainerSession();
    if (!nextRound) {
      Alert.alert('Недоступно', 'Нет пройденных тем для тренировки');
      router.back();
      return;
    }
    startRound(nextRound);
  };

  if (!session || !branch) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Загрузка...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Заголовок с градиентом */}
      <LinearGradient
        colors={theme.gradients.accent}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.header, { paddingTop: scale(56), paddingBottom: scale(spacing.lg) }]}
      >
        <IconButton icon="arrow-back" onPress={() => router.back()} variant="onGradient" />

        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { fontSize: scaledFont('lg') }]} numberOfLines={1}>
            {branch.name}
          </Text>
          <Text style={[styles.headerSubtitle, { fontSize: scaledFont('sm') }]}>Аркада</Text>
        </View>

        <View style={{ width: scale(36) }} />
      </LinearGradient>

      {stage === 'start' && (
        <StartStage session={session} branchName={branch.name} onStart={handleStartGame} />
      )}

      {stage === 'playing' && (
        <PlayingStage
          session={session}
          currentQuestionIndex={currentQuestionIndex}
          coinsEarned={coinsEarned}
          onAnswer={handleAnswer}
        />
      )}

      {stage === 'results' && (
        <ResultsStage
          correctAnswers={correctAnswers}
          totalQuestions={session.questions.length}
          coinsEarned={coinsEarned}
          onClaimReward={handleClaimReward}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </View>
  );
}
