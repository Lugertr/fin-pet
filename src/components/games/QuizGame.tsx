// components/games/QuizGame.tsx
// Мини-игра «Викторина» с обратной связью

import { useFeedback } from '@/lib/hooks/useFeedback';
import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface QuizGameProps {
  question: string;
  options: string[];
  correctAnswer: string;
  onAnswer: (answer: string, isCorrect: boolean) => void;
  disabled?: boolean;
}

export function QuizGame({
  question,
  options,
  correctAnswer,
  onAnswer,
  disabled = false,
}: QuizGameProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const { trigger } = useFeedback();

  const handleSelect = (option: string) => {
    if (disabled || selectedAnswer) return;

    const isCorrect = option === correctAnswer;

    // Мгновенная обратная связь
    trigger(isCorrect ? 'correctAnswer' : 'wrongAnswer');

    setSelectedAnswer(option);
    setShowResult(true);

    setTimeout(() => {
      onAnswer(option, isCorrect);
    }, 800);
  };

  const getOptionStyle = (option: string) => {
    if (!showResult) return 'bg-slate-800 border-slate-700';
    if (option === correctAnswer) return 'bg-green-500/20 border-green-500';
    if (option === selectedAnswer) return 'bg-red-500/20 border-red-500';
    return 'bg-slate-800/50 border-slate-700 opacity-50';
  };

  return (
    <View className="flex-1">
      <View className="bg-slate-800 rounded-2xl p-6 mb-6">
        <Text className="text-white text-lg font-medium text-center">{question}</Text>
      </View>

      <View className="gap-3">
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleSelect(option)}
            disabled={disabled || selectedAnswer !== null}
            className={`rounded-xl p-4 border ${getOptionStyle(option)}`}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-slate-700 items-center justify-center mr-3">
                <Text className="text-white font-bold">{String.fromCharCode(65 + index)}</Text>
              </View>
              <Text className="text-white flex-1">{option}</Text>
              {showResult && option === correctAnswer && (
                <Text className="text-green-500 text-xl">✓</Text>
              )}
              {showResult && option === selectedAnswer && option !== correctAnswer && (
                <Text className="text-red-500 text-xl">✗</Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {showResult && (
        <View className="mt-6 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30">
          <Text className="text-indigo-400 text-center text-sm">
            {selectedAnswer === correctAnswer
              ? '🎉 Правильно! +10 коинов'
              : '😔 Неправильно. Настроение -10'}
          </Text>
        </View>
      )}
    </View>
  );
}
