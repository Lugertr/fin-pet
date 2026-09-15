// Аркада: повторение пройденных уроков без траты настроения
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { QuizGame, TinderSwipeGame } from '@/components/games';
import { useFeedback } from '@/lib/hooks/useFeedback';
import { BRANCHES, LESSONS, useLessonsStore } from '@/lib/hooks/useLessons';
import { useUserStore } from '@/lib/stores/userStore';
import { formatCoins } from '@/lib/utils/formatters';
import { useResponsive, useTheme } from '@/theme';
import { spacing } from '@/theme/tokens';
import { createArcadeStyles } from '../../../styles/screens/arcade/_[id].styles';

// Награда за правильный ответ в аркаде
const COINS_PER_CORRECT = 10;

// Этапы игры
type GameStage = 'start' | 'playing' | 'results';

export default function ArcadeGameScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const lessonId = parseInt(id, 10);

  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive(); // ✅ Используем scale и scaledFont
  const { triggerHaptic } = useFeedback();
  const { progress } = useLessonsStore();

  const styles = createArcadeStyles({ theme });

  // Ищем урок
  const lesson = LESSONS.find((l) => l.id === lessonId);
  const branch = lesson ? BRANCHES.find((b) => b.id === lesson.branch_id) : null;

  const [stage, setStage] = useState<GameStage>('start');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [coinsEarned, setCoinsEarned] = useState(0);

  // Проверка: урок должен быть пройден
  const isLessonCompleted = progress[lessonId]?.status === 'completed';

  useEffect(() => {
    if (!lesson) {
      Alert.alert('Ошибка', 'Игра не найдена');
      router.back();
      return;
    }
    if (!isLessonCompleted) {
      Alert.alert('Недоступно', 'Сначала пройдите этот урок в обучении');
      router.back();
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStartGame = () => {
    triggerHaptic('medium');
    setCurrentQuestionIndex(0);
    setCorrectAnswers(0);
    setCoinsEarned(0);
    setStage('playing');
  };

  // ЗВУК ВЫЗЫВАЕТСЯ В ИГРОВЫХ КОМПОНЕНТАХ — здесь только логика
  const handleAnswer = (answer: string, isCorrect: boolean) => {
    setIsAnimating(true);

    if (isCorrect) {
      setCorrectAnswers((prev) => prev + 1);
      setCoinsEarned((prev) => prev + COINS_PER_CORRECT);
    }

    if (lesson && currentQuestionIndex < lesson.questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex((prev) => prev + 1);
        setIsAnimating(false);
      }, 800);
    } else {
      setTimeout(() => {
        setStage('results');
        setIsAnimating(false);
      }, 800);
    }
  };

  const handleClaimReward = () => {
    triggerHaptic('success');

    // Начисляем монеты
    if (coinsEarned > 0) {
      const { user } = useUserStore.getState();
      if (user) {
        useUserStore.getState().updateBalance(user.liquid_balance + coinsEarned);
      }
    }

    Alert.alert(
      '🎉 Игра завершена!',
      `Правильных ответов: ${correctAnswers} из ${lesson?.questions.length || 0}\nПолучено: +${formatCoins(coinsEarned)}`
    );
    router.back();
  };

  const handlePlayAgain = () => {
    triggerHaptic('medium');
    setCurrentQuestionIndex(0);
    setCorrectAnswers(0);
    setCoinsEarned(0);
    setStage('playing');
  };

  // Экран загрузки / ошибки
  if (!lesson || !branch) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Загрузка...</Text>
      </View>
    );
  }

  const currentQuestion = lesson.questions[currentQuestionIndex];
  const accuracy =
    lesson.questions.length > 0 ? Math.round((correctAnswers / lesson.questions.length) * 100) : 0;

  return (
    <View style={styles.container}>
      {/* Заголовок с градиентом */}
      <LinearGradient
        colors={['#4F46E5', '#7C3AED']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.header, { paddingTop: scale(56), paddingBottom: scale(spacing.lg) }]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backButton, { width: scale(36), height: scale(36) }]}
        >
          <Ionicons name="arrow-back" size={scale(20)} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { fontSize: scaledFont('lg') }]} numberOfLines={1}>
            {lesson.title}
          </Text>
          <Text style={[styles.headerSubtitle, { fontSize: scaledFont('sm') }]}>
            Аркада • {branch.name}
          </Text>
        </View>

        <View style={{ width: scale(36) }} />
      </LinearGradient>

      {/* ЭТАП 1: Стартовый экран */}
      {stage === 'start' && (
        <Animated.View entering={FadeIn.duration(300)} style={styles.startContainer}>
          {/* Иконка игры */}
          <View style={styles.startHeader}>
            <View
              style={[
                styles.startIconBox,
                {
                  width: scale(120),
                  height: scale(120),
                  borderRadius: scale(32),
                  marginBottom: scale(spacing.xl),
                },
              ]}
            >
              <Ionicons
                name={lesson.minigame_type === 'quiz' ? 'help-circle' : 'swap-horizontal'}
                size={scale(56)}
                color={theme.primary}
              />
            </View>

            <Text style={[styles.startTitle, { fontSize: scaledFont('title') }]}>
              {lesson.title}
            </Text>

            <View style={styles.startBadge}>
              <Text style={[styles.startBadgeText, { fontSize: scaledFont('sm') }]}>
                ✓ Урок пройден • Аркада не тратит настроение
              </Text>
            </View>

            <Text style={[styles.startDescription, { fontSize: scaledFont('md') }]}>
              {lesson.minigame_type === 'quiz'
                ? 'Отвечайте на вопросы и получайте монеты!'
                : 'Свайпайте карточки и получайте монеты!'}
            </Text>
          </View>

          {/* Статистика */}
          <View style={styles.statsCard}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { fontSize: scaledFont('sm') }]}>Вопросов</Text>
                <Text style={[styles.statValue, { fontSize: scaledFont('xxl') }]}>
                  {lesson.questions.length}
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { fontSize: scaledFont('sm') }]}>За ответ</Text>
                <Text
                  style={[styles.statValue, styles.statValueCoins, { fontSize: scaledFont('xxl') }]}
                >
                  +{COINS_PER_CORRECT}
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { fontSize: scaledFont('sm') }]}>Максимум</Text>
                <Text
                  style={[
                    styles.statValue,
                    styles.statValueSuccess,
                    { fontSize: scaledFont('xxl') },
                  ]}
                >
                  {formatCoins(lesson.questions.length * COINS_PER_CORRECT)}
                </Text>
              </View>
            </View>
          </View>

          {/* Кнопка старта */}
          <TouchableOpacity
            onPress={handleStartGame}
            activeOpacity={0.8}
            style={styles.gradientButton}
          >
            <LinearGradient
              colors={theme.gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.gradientButtonInner, { padding: scale(spacing.lg) }]}
            >
              <Ionicons name="play" size={scale(24)} color="#FFFFFF" />
              <Text style={[styles.gradientButtonText, { fontSize: scaledFont('lg') }]}>
                Начать игру
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* ЭТАП 2: Игровой процесс */}
      {stage === 'playing' && currentQuestion && (
        <View style={styles.gameContainer}>
          {/* Прогресс и счёт */}
          <View style={{ marginBottom: scale(spacing.xxl) }}>
            <View style={styles.progressHeader}>
              <Text style={[styles.progressLabel, { fontSize: scaledFont('md') }]}>
                Вопрос {currentQuestionIndex + 1} из {lesson.questions.length}
              </Text>
              <View style={styles.progressCoinsRow}>
                <Ionicons name="wallet" size={scale(14)} color={theme.coins} />
                <Text style={[styles.progressCoins, { fontSize: scaledFont('md') }]}>
                  {formatCoins(coinsEarned)}
                </Text>
              </View>
            </View>

            {/* Прогресс-бар */}
            <View style={styles.progressBar}>
              <LinearGradient
                colors={theme.gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  height: '100%',
                  width: `${((currentQuestionIndex + 1) / lesson.questions.length) * 100}%`,
                }}
              />
            </View>
          </View>

          {/* Рендер игры в зависимости от типа */}
          {lesson.minigame_type === 'tinder_swipe' ? (
            <TinderSwipeGame
              key={currentQuestion.id}
              question={currentQuestion.question_text}
              options={currentQuestion.options}
              correctAnswer={currentQuestion.correct_answer}
              onAnswer={handleAnswer}
              disabled={isAnimating}
            />
          ) : (
            <QuizGame
              key={currentQuestion.id}
              question={currentQuestion.question_text}
              options={currentQuestion.options}
              correctAnswer={currentQuestion.correct_answer}
              onAnswer={handleAnswer}
              disabled={isAnimating}
            />
          )}
        </View>
      )}

      {/* ЭТАП 3: Результаты */}
      {stage === 'results' && (
        <Animated.View entering={FadeInDown.duration(400)} style={styles.resultsContainer}>
          {/* Трофей или утешение */}
          <View style={styles.resultsHeader}>
            <View
              style={[
                styles.resultsIconBox,
                {
                  backgroundColor:
                    accuracy >= 70 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                },
              ]}
            >
              <Text style={{ fontSize: scale(72) }}>
                {accuracy >= 70 ? '🏆' : accuracy >= 50 ? '🎯' : '💪'}
              </Text>
            </View>

            <Text style={[styles.resultsTitle, { fontSize: scaledFont('title') }]}>
              {accuracy >= 70
                ? 'Отличная игра!'
                : accuracy >= 50
                  ? 'Хороший результат!'
                  : 'Продолжайте практиковаться!'}
            </Text>

            <Text style={[styles.resultsSubtitle, { fontSize: scaledFont('md') }]}>
              Правильных ответов: {correctAnswers} из {lesson.questions.length}
            </Text>
          </View>

          {/* Статистика */}
          <View style={styles.resultsStatsCard}>
            {/* Точность */}
            <View style={{ marginBottom: scale(spacing.xl) }}>
              <View style={styles.accuracyRow}>
                <Text style={[styles.accuracyLabel, { fontSize: scaledFont('md') }]}>Точность</Text>
                <Text style={[styles.accuracyValue, { fontSize: scaledFont('xl') }]}>
                  {accuracy}%
                </Text>
              </View>
              <View style={styles.accuracyProgressBar}>
                <LinearGradient
                  colors={accuracy >= 70 ? ['#10B981', '#06B6D4'] : ['#F59E0B', '#FBBF24']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ height: '100%', width: `${accuracy}%` }}
                />
              </View>
            </View>

            {/* Заработанные монеты */}
            <View style={styles.coinsEarnedBox}>
              <View style={styles.coinsEarnedLeft}>
                <Ionicons name="wallet" size={scale(24)} color={theme.coins} />
                <Text style={[styles.coinsEarnedLabel, { fontSize: scaledFont('lg') }]}>
                  Заработано
                </Text>
              </View>
              <Text style={[styles.coinsEarnedValue, { fontSize: scaledFont('xxl') }]}>
                +{formatCoins(coinsEarned)}
              </Text>
            </View>
          </View>

          {/* Кнопки */}
          <View style={styles.buttonsContainer}>
            {/* Забрать награду */}
            <TouchableOpacity
              onPress={handleClaimReward}
              activeOpacity={0.8}
              style={styles.gradientButton}
            >
              <LinearGradient
                colors={['#10B981', '#06B6D4']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.gradientButtonInner, { padding: scale(spacing.lg) }]}
              >
                <Ionicons name="checkmark-circle" size={scale(24)} color="#FFFFFF" />
                <Text style={[styles.gradientButtonText, { fontSize: scaledFont('lg') }]}>
                  Забрать награду
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Играть снова */}
            <TouchableOpacity
              onPress={handlePlayAgain}
              activeOpacity={0.8}
              style={styles.secondaryButton}
            >
              <Ionicons name="refresh" size={scale(22)} color={theme.textPrimary} />
              <Text style={[styles.secondaryButtonText, { fontSize: scaledFont('lg') }]}>
                Играть снова
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </View>
  );
}
