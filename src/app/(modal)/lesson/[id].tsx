// app/(modal)/lesson/[id].tsx
// Экран урока: Комикс → Мини-игра → Тест

import { QuizGame } from '@/components/games/QuizGame';
import { Button } from '@/components/ui/Button';
import { COLORS } from '@/constants/theme';
import { LESSONS, Question, useLessonsStore } from '@/lib/hooks/useLessons';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

// Этапы урока
type LessonStage = 'comic' | 'minigame' | 'test' | 'complete';

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lessonId = parseInt(id, 10);
  const router = useRouter();

  const { startLesson, submitAnswer, completeLesson } = useLessonsStore();
  // Убрали usePetStore — штраф к настроению применяется внутри submitAnswer стора

  const [stage, setStage] = useState<LessonStage>('comic');
  const [lesson, setLesson] = useState<(typeof LESSONS)[0] | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Анимация перехода между этапами
  const slideX = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slideX.value }],
    opacity: 1 - Math.abs(slideX.value) / 300,
  }));

  // Загружаем урок при монтировании
  useEffect(() => {
    try {
      const loadedLesson = startLesson(lessonId);
      setLesson(loadedLesson);
    } catch (error) {
      console.error('[Lesson] Урок не найден:', error);
      Alert.alert('Ошибка', 'Урок не найден');
      router.back();
    }
  }, [lessonId, startLesson, router]);

  // Начало урока
  const handleStartLesson = () => {
    slideX.value = withTiming(-300, { duration: 300 }, (finished) => {
      if (finished) {
        setStage('minigame');
        slideX.value = 300;
        slideX.value = withTiming(0, { duration: 300 });
      }
    });
  };

  // Обработка ответа в мини-игре
  const handleAnswer = (answer: string, isCorrect: boolean) => {
    setIsAnimating(true);

    try {
      const response = submitAnswer(lessonId, answer);

      if (response.is_correct) {
        setCorrectAnswers((prev) => prev + 1);
      }

      // Переход к следующему вопросу или завершение
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

  // Завершение урока
  const handleCompleteLesson = () => {
    try {
      const response = completeLesson(lessonId);

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

  // Рендер текущего этапа
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
        return <CompleteStage onExit={() => router.back()} />;

      default:
        return null;
    }
  };

  if (!lesson) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-900">
        <Text className="text-slate-400">Загрузка урока...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-900">
      {/* Заголовок */}
      <LinearGradient
        colors={[COLORS.surface, COLORS.background]}
        className="px-6 pt-14 pb-4 flex-row items-center justify-between"
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white font-semibold" numberOfLines={1}>
          {lesson.title}
        </Text>
        <View className="w-6" />
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
  return (
    <ScrollView className="flex-1 px-6" contentContainerClassName="py-8">
      <View className="items-center mb-8">
        <View className="w-40 h-40 rounded-3xl bg-indigo-500/10 items-center justify-center mb-4">
          <Text className="text-6xl">📖</Text>
        </View>
        <Text className="text-white text-2xl font-bold text-center mb-2">Теория урока</Text>
        <Text className="text-slate-400 text-center">
          Изучите материал, затем пройдите мини-игру
        </Text>
      </View>

      {/* Слайды комикса */}
      <View className="bg-slate-800 rounded-2xl p-6 mb-6">
        <Text className="text-white text-lg font-medium mb-4">Что такое бюджет?</Text>
        <Text className="text-slate-300 leading-relaxed">
          Бюджет — это план ваших доходов и расходов на определённый период. Он помогает
          контролировать деньги и достигать финансовых целей.
        </Text>
      </View>

      <View className="bg-slate-800 rounded-2xl p-6 mb-8">
        <Text className="text-white text-lg font-medium mb-4">Зачем нужен бюджет?</Text>
        <Text className="text-slate-300 leading-relaxed">
          • Контроль расходов{'\n'}• Достижение целей{'\n'}• Избежание долгов{'\n'}• Финансовая
          безопасность
        </Text>
      </View>

      <Button title="Начать мини-игру" onPress={onStart} size="lg" icon="game-controller" />
    </ScrollView>
  );
}

/**
 * Этап 2: Мини-игра
 */
function MinigameStage({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  isAnimating,
}: {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (answer: string, isCorrect: boolean) => void;
  isAnimating: boolean;
}) {
  return (
    <View className="flex-1 px-6 py-4">
      {/* Прогресс */}
      <View className="mb-6">
        <View className="flex-row justify-between mb-2">
          <Text className="text-slate-400 text-sm">
            Вопрос {questionNumber} из {totalQuestions}
          </Text>
          <Text className="text-slate-400 text-sm">
            {Math.round((questionNumber / totalQuestions) * 100)}%
          </Text>
        </View>
        <View className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <View
            className="h-full bg-indigo-500 rounded-full"
            style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
          />
        </View>
      </View>

      {/* Рендер игры */}
      <QuizGame
        question={question.question_text}
        options={question.options}
        correctAnswer={question.correct_answer}
        onAnswer={onAnswer}
        disabled={isAnimating}
      />
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
  const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  const isPassed = accuracy >= 70;

  return (
    <ScrollView className="flex-1 px-6" contentContainerClassName="py-8 justify-center">
      <View className="items-center mb-8">
        <Text className="text-6xl mb-4">{isPassed ? '🎉' : '📚'}</Text>
        <Text className="text-white text-2xl font-bold text-center mb-2">
          {isPassed ? 'Отличная работа!' : 'Продолжайте практиковаться'}
        </Text>
        <Text className="text-slate-400 text-center">
          Правильных ответов: {correctAnswers} из {totalQuestions}
        </Text>
      </View>

      {/* Статистика */}
      <View className="bg-slate-800 rounded-2xl p-6 mb-8">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-slate-300">Точность</Text>
          <Text className="text-white font-bold text-xl">{accuracy}%</Text>
        </View>
        <View className="h-3 bg-slate-700 rounded-full overflow-hidden">
          <View
            className={`h-full rounded-full ${isPassed ? 'bg-green-500' : 'bg-amber-500'}`}
            style={{ width: `${accuracy}%` }}
          />
        </View>
      </View>

      <Button title="Завершить урок" onPress={onComplete} size="lg" icon="checkmark" />
    </ScrollView>
  );
}

/**
 * Этап 4: Завершение
 */
function CompleteStage({ onExit }: { onExit: () => void }) {
  return (
    <View className="flex-1 px-6 justify-center items-center">
      <View className="w-32 h-32 rounded-full bg-green-500/20 items-center justify-center mb-6">
        <Text className="text-6xl">🏆</Text>
      </View>
      <Text className="text-white text-2xl font-bold text-center mb-2">Урок пройден!</Text>
      <Text className="text-slate-400 text-center mb-8">Вы получили +50 коинов за прохождение</Text>
      <Button title="Вернуться в Хаб" onPress={onExit} size="lg" icon="home" />
    </View>
  );
}
