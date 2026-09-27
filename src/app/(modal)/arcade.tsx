// src/app/(modal)/arcade.tsx
// Аркада (§10 ТЗ): раунд выбранной мини-игры по теме приключения (см.
// (modal)/arcade-lobby.tsx), 10⚡ за игру, +10 монет за верный ответ,
// подарки не выпадают (§10.2). Заданием приключения раунд считается, только
// если его запустила кнопка задания (session.countsAsQuest).
//
// Этапы (старт/игра/результаты) живут в src/components/arcade/ — этот файл
// отвечает только за сессию, энергозатраты и переключение между этапами.

import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import {
  ARCADE_GAME_META,
  COINS_PER_CORRECT,
  PlayingStage,
  ResultsStage,
  StartStage,
} from '@/components/arcade';
import { HelpButton } from '@/components/shared';
import { IconButton } from '@/components/ui';
import { ARCADE_ENERGY_COST } from '@/constants/gameplay';
import {
  arcadeTimeBonusMinutes,
  buildBranchGameSession,
  TrainerSession,
  trainerRoundLength,
} from '@/domain/arcade/TrainerSelection';
import { ARCADE_SOURCES } from '@/lib/arcade/arcadeSources';
import { useFeedback } from '@/lib/hooks/useFeedback';
import { Alert } from '@/lib/utils/alert';
import { BRANCHES } from '@/lib/hooks/useLessons';
import { useAchievementsStore } from '@/lib/stores/achievementsStore';
import { useAdventureStore } from '@/lib/stores/adventureStore';
import { useArcadeSessionStore } from '@/lib/stores/arcadeSessionStore';
import { usePetStore } from '@/lib/stores/petStore';
import { useUserStore } from '@/lib/stores/userStore';
import { formatPrice } from '@/lib/utils/formatters';
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
  // Награда забирается один раз — обработчик асинхронный (ускорение приключения
  // пишется в БД), без защиты второй тап начислил бы монеты дважды.
  const [isClaiming, setIsClaiming] = useState(false);

  const branch = session ? BRANCHES.find((b) => b.id === session.branchId) : null;
  const roundLength = session ? trainerRoundLength(session) : 0;

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
        `Аркада стоит ${ARCADE_ENERGY_COST}⚡. Подожди, пока энергия восстановится, или покорми питомца.`
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

    if (session && currentQuestionIndex < roundLength - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setStage('results');
    }
  };

  const handleClaimReward = async () => {
    if (isClaiming) return;
    setIsClaiming(true);
    triggerHaptic('success');

    if (coinsEarned > 0) {
      useUserStore
        .getState()
        .recordTransaction(coinsEarned, 'minigame_reward', `Аркада: ${branch?.name ?? ''}`);
    }

    // Раунд, запущенный кнопкой задания (тема уже пройдена на 100%, тренажёр
    // вместо урока — см. AdventureActiveView.tsx), засчитывается как задание
    // (−45 мин). Игра, выбранная в Аркаде, — тренировка: ускоряет приключение
    // слабее урока, до 15 минут по доле верных ответов.
    const adventureStore = useAdventureStore.getState();
    let savedMinutes = 0;
    if (session && adventureStore.isActiveBranch(session.branchId)) {
      if (session.countsAsQuest) {
        await adventureStore.registerQuestCompletion();
      } else {
        savedMinutes = await adventureStore.registerArcadeRound(
          arcadeTimeBonusMinutes(correctAnswers, roundLength)
        );
      }
    }

    Alert.alert(
      '🎉 Раунд завершён!',
      `Правильных ответов: ${correctAnswers} из ${roundLength}\nПолучено: +${formatPrice(coinsEarned)}` +
        (savedMinutes > 0 ? `\nПриключение ближе на ${savedMinutes} мин` : '')
    );
    router.back();
  };

  // §10.1: не ограничено по числу прохождений — та же игра той же темы,
  // новый перемешанный раунд.
  const handlePlayAgain = () => {
    const nextRound = session
      ? buildBranchGameSession(
          session.minigameType,
          session.branchId,
          ARCADE_SOURCES,
          session.countsAsQuest
        )
      : null;
    if (!nextRound) {
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
          <Text style={[styles.headerSubtitle, { fontSize: scaledFont('sm') }]}>
            Аркада · {ARCADE_GAME_META[session.minigameType].title}
          </Text>
        </View>

        <HelpButton screen={ARCADE_GAME_META[session.minigameType].help} variant="onGradient" />
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
          totalQuestions={roundLength}
          coinsEarned={coinsEarned}
          onClaimReward={handleClaimReward}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </View>
  );
}
