// app/(modal)/arcade/[id].tsx
// Экран аркадной игры

import { QuizGame } from '@/components/games/QuizGame';
import { Button } from '@/components/ui/Button';
import { COLORS } from '@/constants/theme';
import { useUserStore } from '@/lib/stores/userStore';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';

// Каталог аркадных игр (вынесено в начало, чтобы избежать ReferenceError)
const ARCADE_GAMES = [
  {
    id: 'scam_swiper',
    title: 'Скам-Свайпер',
    description: 'Определяйте мошенников свайпами',
    icon: '🃏',
    color: '#EF4444',
    minigame_type: 'tinder_swipe',
    coinsPerGame: 15,
  },
  {
    id: 'smart_card',
    title: 'Умный Карт',
    description: 'Отвечайте на вопросы о финансах',
    icon: '💳',
    color: '#6366F1',
    minigame_type: 'quiz',
    coinsPerGame: 10,
  },
  {
    id: 'stall_simulator',
    title: 'Симулятор Ларька',
    description: 'Управляйте мини-бизнесом',
    icon: '🏪',
    color: '#22C55E',
    minigame_type: 'quiz',
    coinsPerGame: 12,
  },
  {
    id: 'chat_detective',
    title: 'Чат-Детектив',
    description: 'Находите обман в переписках',
    icon: '🔍',
    color: '#F59E0B',
    minigame_type: 'quiz',
    coinsPerGame: 10,
  },
];

// Вопросы для аркадных игр (в реальном приложении приходят с бэкенда)
const SAMPLE_QUESTIONS = [
  {
    question:
      'Вам пришло сообщение: «Вы выиграли миллион! Переведите 500₽ для получения». Что делать?',
    options: [
      'Игнорировать и удалить',
      'Перевести деньги',
      'Ответить и узнать детали',
      'Поделиться с друзьями',
    ],
    correctIndex: 0,
  },
  {
    question: 'Что такое фишинг?',
    options: [
      'Кража данных через поддельные сайты',
      'Вид инвестиций',
      'Тип кредита',
      'Способ оплаты',
    ],
    correctIndex: 0,
  },
  {
    question: 'Какое из действий безопасно?',
    options: [
      'Проверять URL сайта перед вводом пароля',
      'Переходить по ссылкам из писем',
      'Использовать один пароль везде',
      'Хранить ПИН на карте',
    ],
    correctIndex: 0,
  },
];

export default function ArcadeGameScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  const game = ARCADE_GAMES.find((g) => g.id === id);

  if (!game) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-900 px-6">
        <Text className="text-5xl mb-4">🎮</Text>
        <Text className="text-white text-xl font-bold text-center mb-4">Игра не найдена</Text>
        <Button title="Назад" onPress={() => router.back()} variant="secondary" />
      </View>
    );
  }

  const startGame = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setIsGameActive(true);
    setIsGameOver(false);
  };

  // Используем _answer для подчёркивания того, что параметр не используется
  // (аркада не тратит настроение, только начисляет монеты)
  const handleAnswer = (_answer: string, isCorrect: boolean) => {
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    if (currentQuestionIndex < SAMPLE_QUESTIONS.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setIsGameActive(false);
      setIsGameOver(true);
    }
  };

  // Начисляем монеты после завершения игры (аркада не тратит настроение)
  const handleFinishGame = () => {
    const coinsEarned = score * (game?.coinsPerGame || 10);
    const { user } = useUserStore.getState();

    if (user && coinsEarned > 0) {
      useUserStore.getState().updateBalance(user.liquid_balance + coinsEarned);
    }

    Alert.alert(
      '🎉 Игра завершена!',
      `Правильных ответов: ${score} из ${SAMPLE_QUESTIONS.length}\nПолучено: +${coinsEarned} C`
    );
  };

  // Стартовый экран
  if (!isGameActive && !isGameOver) {
    return (
      <View className="flex-1 bg-slate-900">
        <LinearGradient
          colors={[COLORS.surface, COLORS.background]}
          className="px-6 pt-14 pb-4 flex-row items-center justify-between"
        >
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white font-semibold">{game.title}</Text>
          <View className="w-6" />
        </LinearGradient>

        <View className="flex-1 px-6 justify-center items-center">
          <Text className="text-6xl mb-6">{game.icon}</Text>
          <Text className="text-white text-2xl font-bold text-center mb-2">{game.title}</Text>
          <Text className="text-slate-400 text-center mb-4">{game.description}</Text>
          <View className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl px-4 py-3 mb-8">
            <Text className="text-indigo-400 text-sm text-center">
              🎮 Аркада не тратит настроение{'\n'}
              Награда: +{game.coinsPerGame} C за правильный ответ
            </Text>
          </View>
          <Button title="Начать игру" onPress={startGame} size="lg" icon="play" />
        </View>
      </View>
    );
  }

  // Экран результатов
  if (isGameOver) {
    const coinsEarned = score * (game?.coinsPerGame || 10);

    return (
      <View className="flex-1 bg-slate-900">
        <LinearGradient
          colors={[COLORS.surface, COLORS.background]}
          className="px-6 pt-14 pb-4 flex-row items-center justify-between"
        >
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white font-semibold">Результаты</Text>
          <View className="w-6" />
        </LinearGradient>

        <View className="flex-1 px-6 justify-center items-center">
          <Text className="text-6xl mb-6">{score >= 2 ? '🏆' : '💪'}</Text>
          <Text className="text-white text-2xl font-bold text-center mb-2">Игра завершена!</Text>
          <Text className="text-slate-400 text-center mb-4">
            Правильных ответов: {score} из {SAMPLE_QUESTIONS.length}
          </Text>
          <View className="bg-amber-500/20 px-6 py-3 rounded-full mb-8">
            <Text className="text-amber-400 font-bold text-lg">+{coinsEarned} C</Text>
          </View>
          <View className="flex-row gap-3">
            <Button
              title="Забрать монеты"
              onPress={() => {
                handleFinishGame();
                router.back();
              }}
              variant="primary"
            />
            <Button title="Ещё раз" onPress={startGame} variant="secondary" />
          </View>
        </View>
      </View>
    );
  }

  // Активная игра
  const currentQuestion = SAMPLE_QUESTIONS[currentQuestionIndex];
  const correctAnswer = currentQuestion.options[currentQuestion.correctIndex];

  return (
    <View className="flex-1 bg-slate-900">
      <LinearGradient
        colors={[COLORS.surface, COLORS.background]}
        className="px-6 pt-14 pb-4 flex-row items-center justify-between"
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View className="flex-row items-center gap-2">
          <Text className="text-white font-semibold">Счёт: {score}</Text>
          <Text className="text-slate-400">|</Text>
          <Text className="text-slate-400">
            {currentQuestionIndex + 1}/{SAMPLE_QUESTIONS.length}
          </Text>
        </View>
        <View className="w-6" />
      </LinearGradient>

      <View className="flex-1 px-6 py-4">
        <QuizGame
          question={currentQuestion.question}
          options={currentQuestion.options}
          correctAnswer={correctAnswer}
          onAnswer={handleAnswer}
        />
      </View>
    </View>
  );
}
