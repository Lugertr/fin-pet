// src/app/(modal)/lesson/[id].tsx
// Экран урока: Комикс → Мини-игра → Тест (с темизацией)

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { QuizGame, TinderSwipeGame } from '@/components/games';
import { useFeedback } from '@/lib/hooks/useFeedback';
import { LESSONS, Question, useLessonsStore } from '@/lib/hooks/useLessons';
import { useResponsive, useTheme } from '@/theme';
import { spacing } from '@/theme/tokens';
import { createLessonStyles } from '../../../styles/screens/lesson/_[id].styles';

// Этапы урока
type LessonStage = 'comic' | 'minigame' | 'test' | 'complete';

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lessonId = parseInt(id, 10);
  const router = useRouter();

  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive(); // ✅ Используем scale и scaledFont
  const { trigger, triggerHaptic } = useFeedback();
  const { startLesson, submitAnswer, completeLesson } = useLessonsStore();

  const styles = createLessonStyles({ theme });

  const [stage, setStage] = useState<LessonStage>('comic');
  const [lesson, setLesson] = useState<(typeof LESSONS)[0] | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const slideX = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slideX.value }],
    opacity: 1 - Math.abs(slideX.value) / 300,
  }));

  useEffect(() => {
    try {
      const loadedLesson = startLesson(lessonId);
      setLesson(loadedLesson);
    } catch (error) {
      console.error('[Lesson] Урок не найден:', error);
      trigger('error');
      Alert.alert('Ошибка', 'Урок не найден');
      router.back();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  const handleStartLesson = () => {
    triggerHaptic('medium');
    slideX.value = withTiming(-300, { duration: 300 }, (finished) => {
      if (finished) {
        setStage('minigame');
        slideX.value = 300;
        slideX.value = withTiming(0, { duration: 300 });
      }
    });
  };

  // ЗВУК ВЫЗЫВАЕТСЯ В ИГРОВЫХ КОМПОНЕНТАХ — здесь только логика
  const handleAnswer = (answer: string, isCorrect: boolean) => {
    setIsAnimating(true);

    try {
      const response = submitAnswer(lessonId, answer);

      if (response.is_correct) {
        setCorrectAnswers((prev) => prev + 1);
      }

      if (lesson && currentQuestionIndex < lesson.questions.length - 1) {
        setTimeout(() => {
          setCurrentQuestionIndex((prev) => prev + 1);
          setIsAnimating(false);
        }, 800);
      } else {
        setTimeout(() => {
          setStage('test');
          setIsAnimating(false);
        }, 800);
      }
    } catch (error) {
      console.error('[Lesson] Ошибка отправки ответа:', error);
      setIsAnimating(false);
    }
  };

  const handleCompleteLesson = () => {
    try {
      const response = completeLesson(lessonId);
      trigger('lessonComplete');

      slideX.value = withTiming(-300, { duration: 300 }, (finished) => {
        if (finished) {
          setStage('complete');
          slideX.value = 300;
          slideX.value = withTiming(0, { duration: 300 });
        }
      });

      Alert.alert('🎉 Урок пройден!', `Вы получили +${response.bonus_coins} монет!`);
    } catch (error) {
      console.error('[Lesson] Ошибка завершения урока:', error);
    }
  };

  const renderStage = () => {
    switch (stage) {
      case 'comic':
        return <ComicStage onStart={handleStartLesson} />;

      case 'minigame':
        if (!lesson) return null;
        const currentQuestion = lesson.questions[currentQuestionIndex];
        if (!currentQuestion) return null;

        return (
          <MinigameStage
            lesson={lesson}
            question={currentQuestion}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={lesson.questions.length}
            onAnswer={handleAnswer}
            isAnimating={isAnimating}
          />
        );

      case 'test':
        if (!lesson) return null;
        return (
          <TestStage
            correctAnswers={correctAnswers}
            totalQuestions={lesson.questions.length}
            onComplete={handleCompleteLesson}
          />
        );

      case 'complete':
        return <CompleteStage onExit={() => router.back()} bonusCoins={50} />;

      default:
        return null;
    }
  };

  // Экран загрузки
  if (!lesson) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Загрузка урока...</Text>
      </View>
    );
  }

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
        <Text style={[styles.headerTitle, { fontSize: scaledFont('lg') }]} numberOfLines={1}>
          {lesson.title}
        </Text>
        <View style={{ width: scale(36) }} />
      </LinearGradient>

      {/* Контент */}
      <Animated.View style={[{ flex: 1 }, animatedStyle]}>{renderStage()}</Animated.View>
    </View>
  );
}

/**
 * Этап 1: Комикс (теория)
 */
function ComicStage({ onStart }: { onStart: () => void }) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();

  const styles = createLessonStyles({ theme });

  return (
    <ScrollView style={styles.comicScroll} contentContainerStyle={styles.comicScrollContent}>
      {/* Заголовок теории */}
      <View style={styles.comicHeader}>
        <View
          style={[
            styles.comicIconBox,
            {
              width: scale(100),
              height: scale(100),
              borderRadius: scale(50),
              marginBottom: scale(spacing.lg),
            },
          ]}
        >
          <Text style={{ fontSize: scale(48) }}>📖</Text>
        </View>
        <Text style={[styles.comicTitle, { fontSize: scaledFont('title') }]}>Теория урока</Text>
        <Text style={[styles.comicSubtitle, { fontSize: scaledFont('md') }]}>
          Изучите материал, затем пройдите мини-игру
        </Text>
      </View>

      {/* Карточка 1 */}
      <View style={styles.comicCard}>
        <View style={styles.comicCardHeader}>
          <View style={[styles.comicCardIconBox, { backgroundColor: 'rgba(99, 102, 241, 0.2)' }]}>
            <Ionicons name="bulb" size={scale(18)} color={theme.primary} />
          </View>
          <Text style={[styles.comicCardTitle, { fontSize: scaledFont('xl') }]}>
            Что такое бюджет?
          </Text>
        </View>
        <Text style={[styles.comicCardText, { fontSize: scaledFont('md') }]}>
          Бюджет — это план ваших доходов и расходов на определённый период. Он помогает
          контролировать деньги и достигать финансовых целей.
        </Text>
      </View>

      {/* Карточка 2 */}
      <View style={styles.comicCard}>
        <View style={styles.comicCardHeader}>
          <View style={[styles.comicCardIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
            <Ionicons name="checkmark-circle" size={scale(18)} color={theme.success} />
          </View>
          <Text style={[styles.comicCardTitle, { fontSize: scaledFont('xl') }]}>
            Зачем нужен бюджет?
          </Text>
        </View>
        <View style={styles.comicListContainer}>
          {[
            'Контроль расходов',
            'Достижение целей',
            'Избежание долгов',
            'Финансовая безопасность',
          ].map((item, i) => (
            <View key={i} style={styles.comicListItem}>
              <View style={styles.comicListBullet} />
              <Text style={[styles.comicListItemText, { fontSize: scaledFont('md') }]}>{item}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Кнопка начала */}
      <TouchableOpacity onPress={onStart} activeOpacity={0.8} style={styles.gradientButton}>
        <LinearGradient
          colors={theme.gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.gradientButtonInner, { padding: scale(spacing.lg) }]}
        >
          <Ionicons name="game-controller" size={scale(24)} color="#FFFFFF" />
          <Text style={[styles.gradientButtonText, { fontSize: scaledFont('lg') }]}>
            Начать мини-игру
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
}

/**
 * Этап 2: Мини-игра
 */
function MinigameStage({
  lesson,
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  isAnimating,
}: {
  lesson: (typeof LESSONS)[0];
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (answer: string, isCorrect: boolean) => void;
  isAnimating: boolean;
}) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();

  const styles = createLessonStyles({ theme });

  const progress = (questionNumber / totalQuestions) * 100;

  return (
    <View style={styles.minigameContainer}>
      {/* Прогресс */}
      <View style={{ marginBottom: scale(spacing.xxl) }}>
        <View style={styles.progressHeader}>
          <Text style={[styles.progressLabel, { fontSize: scaledFont('md') }]}>
            Вопрос {questionNumber} из {totalQuestions}
          </Text>
          <Text style={[styles.progressPercent, { fontSize: scaledFont('md') }]}>
            {Math.round(progress)}%
          </Text>
        </View>
        <View style={styles.progressBar}>
          <LinearGradient
            colors={theme.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ height: '100%', width: `${progress}%` }}
          />
        </View>
      </View>

      {/* Рендер игры в зависимости от типа */}
      {lesson.minigame_type === 'tinder_swipe' ? (
        <TinderSwipeGame
          key={question.id}
          question={question.question_text}
          options={question.options}
          correctAnswer={question.correct_answer}
          onAnswer={onAnswer}
          disabled={isAnimating}
        />
      ) : (
        <QuizGame
          key={question.id}
          question={question.question_text}
          options={question.options}
          correctAnswer={question.correct_answer}
          onAnswer={onAnswer}
          disabled={isAnimating}
        />
      )}
    </View>
  );
}

/**
 * Этап 3: Итоговый тест
 */
function TestStage({
  correctAnswers,
  totalQuestions,
  onComplete,
}: {
  correctAnswers: number;
  totalQuestions: number;
  onComplete: () => void;
}) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();

  const styles = createLessonStyles({ theme });

  const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  const isPassed = accuracy >= 70;

  return (
    <ScrollView style={styles.testScroll} contentContainerStyle={styles.testScrollContent}>
      {/* Результат */}
      <View style={styles.testResultContainer}>
        <View
          style={[
            styles.testResultIconBox,
            {
              backgroundColor: isPassed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
            },
          ]}
        >
          <Text style={{ fontSize: scale(56) }}>{isPassed ? '🎉' : '📚'}</Text>
        </View>
        <Text style={[styles.testResultTitle, { fontSize: scaledFont('title') }]}>
          {isPassed ? 'Отличная работа!' : 'Продолжайте практиковаться'}
        </Text>
        <Text style={[styles.testResultSubtitle, { fontSize: scaledFont('md') }]}>
          Правильных ответов: {correctAnswers} из {totalQuestions}
        </Text>
      </View>

      {/* Статистика */}
      <View style={styles.testStatsCard}>
        <View style={styles.testStatsRow}>
          <Text style={[styles.testStatsLabel, { fontSize: scaledFont('lg') }]}>Точность</Text>
          <Text style={[styles.testStatsValue, { fontSize: scaledFont('hero') }]}>{accuracy}%</Text>
        </View>
        <View style={styles.testStatsProgressBar}>
          <LinearGradient
            colors={isPassed ? ['#10B981', '#06B6D4'] : ['#F59E0B', '#FBBF24']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ height: '100%', width: `${accuracy}%` }}
          />
        </View>
      </View>

      {/* Кнопка завершения */}
      <TouchableOpacity onPress={onComplete} activeOpacity={0.8} style={styles.gradientButton}>
        <LinearGradient
          colors={isPassed ? ['#10B981', '#06B6D4'] : ['#F59E0B', '#FBBF24']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.gradientButtonInner, { padding: scale(spacing.lg) }]}
        >
          <Ionicons name="checkmark-circle" size={scale(24)} color="#FFFFFF" />
          <Text style={[styles.gradientButtonText, { fontSize: scaledFont('lg') }]}>
            Завершить урок
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
}

/**
 * Этап 4: Завершение
 */
function CompleteStage({ onExit, bonusCoins }: { onExit: () => void; bonusCoins: number }) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();

  const styles = createLessonStyles({ theme });

  return (
    <View style={styles.completeContainer}>
      {/* Трофей с градиентом */}
      <TouchableOpacity activeOpacity={0.8} style={{ marginBottom: scale(spacing.xxl) }}>
        <LinearGradient
          colors={['#10B981', '#06B6D4']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.completeTrophyBox,
            {
              width: scale(140),
              height: scale(140),
              borderRadius: scale(70),
            },
          ]}
        >
          <Text style={{ fontSize: scale(72) }}>🏆</Text>
        </LinearGradient>
      </TouchableOpacity>

      <Text style={[styles.completeTitle, { fontSize: scaledFont('hero') }]}>Урок пройден!</Text>
      <Text style={[styles.completeSubtitle, { fontSize: scaledFont('lg') }]}>
        Вы получили +{bonusCoins} монет за прохождение
      </Text>

      {/* Кнопка возврата */}
      <TouchableOpacity
        onPress={onExit}
        activeOpacity={0.8}
        style={[styles.gradientButton, { width: '100%' }]}
      >
        <LinearGradient
          colors={theme.gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.gradientButtonInner, { padding: scale(spacing.lg) }]}
        >
          <Ionicons name="home" size={scale(24)} color="#FFFFFF" />
          <Text style={[styles.gradientButtonText, { fontSize: scaledFont('lg') }]}>
            Вернуться в Хаб
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}
