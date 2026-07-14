import { useGameStore } from '@/app/providers/store';
import type { Quest } from '@/shared/types';
import { Button, Card } from '@/shared/ui';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

export function QuestsPage() {
  const { dailyQuests, completeQuest, finances } = useGameStore();
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null);

  const handleSubmit = () => {
    if (!selectedQuest || !answer.trim()) return;

    const isCorrect = completeQuest(selectedQuest.id, answer.trim());
    setFeedback({
      correct: isCorrect,
      message: isCorrect
        ? `Правильно! +${selectedQuest.reward} монет 🎉`
        : `Не совсем... Правильный ответ: ${selectedQuest.correctAnswer || 'посмотри подсказку'}`,
    });
  };

  const handleCloseModal = () => {
    setSelectedQuest(null);
    setAnswer('');
    setFeedback(null);
  };

  const completedCount = dailyQuests.filter((q) => q.completed).length;
  const allCompleted = completedCount === dailyQuests.length;

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1 px-4 pt-12">
        <Text className="text-3xl font-bold text-text mb-2">Задания на сегодня 📚</Text>
        <Text className="text-base text-gray-500 mb-6">
          Выполнено: {completedCount} из {dailyQuests.length}
        </Text>

        {allCompleted && (
          <Card className="mb-4 bg-green-50 border-2 border-green-200">
            <Text className="text-lg font-bold text-green-700 text-center">
              🎉 Все задания выполнены!
            </Text>
            <Text className="text-sm text-green-600 text-center mt-1">
              Возвращайся завтра за новыми
            </Text>
          </Card>
        )}

        <View className="gap-3">
          {dailyQuests.map((quest) => (
            <QuestCard
              key={quest.id}
              quest={quest}
              onPress={() => !quest.completed && setSelectedQuest(quest)}
            />
          ))}
        </View>

        <Card className="mt-6">
          <Text className="text-sm text-gray-500">
            💡 Баланс: <Text className="font-bold text-primary">{finances.coins} 🪙</Text>
          </Text>
        </Card>
      </ScrollView>

      {/* Модальное окно с заданием */}
      <Modal
        visible={!!selectedQuest}
        animationType="slide"
        transparent
        onRequestClose={handleCloseModal}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 pb-8">
            {selectedQuest && (
              <>
                <View className="flex-row justify-between items-start mb-4">
                  <View className="flex-1 mr-4">
                    <Text className="text-xl font-bold text-text">{selectedQuest.title}</Text>
                    <Text className="text-sm text-gray-500 mt-1">{selectedQuest.description}</Text>
                  </View>
                  <Pressable onPress={handleCloseModal}>
                    <Text className="text-2xl text-gray-400">✕</Text>
                  </Pressable>
                </View>

                <Card className="mb-4 bg-gray-50">
                  <Text className="text-base text-text">{selectedQuest.content}</Text>
                </Card>

                <View className="mb-4">
                  <Text className="text-sm font-semibold text-text mb-2">Твой ответ:</Text>
                  <TextInput
                    value={answer}
                    onChangeText={setAnswer}
                    placeholder={
                      selectedQuest.answerType === 'number' ? 'Введи число' : 'Напиши ответ'
                    }
                    keyboardType={selectedQuest.answerType === 'number' ? 'numeric' : 'default'}
                    multiline
                    numberOfLines={3}
                    className="bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-base text-text min-h-[80px]"
                    placeholderTextColor="#999"
                  />
                </View>

                {feedback && (
                  <Card className={`mb-4 ${feedback.correct ? 'bg-green-50' : 'bg-red-50'}`}>
                    <Text
                      className={`text-base font-semibold ${
                        feedback.correct ? 'text-green-700' : 'text-red-700'
                      }`}
                    >
                      {feedback.message}
                    </Text>
                  </Card>
                )}

                <View className="flex-row gap-3">
                  {!feedback && (
                    <Button
                      title="Ответить"
                      onPress={handleSubmit}
                      disabled={!answer.trim()}
                      fullWidth
                    />
                  )}
                  {feedback && (
                    <Button
                      title={feedback.correct ? 'Забрать награду' : 'Закрыть'}
                      onPress={handleCloseModal}
                      fullWidth
                    />
                  )}
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

interface QuestCardProps {
  quest: Quest;
  onPress: () => void;
}

function QuestCard({ quest, onPress }: QuestCardProps) {
  const difficultyStars = '⭐'.repeat(quest.difficulty);
  const categoryEmoji = {
    basics: '📘',
    saving: '💰',
    budgeting: '📊',
    investing: '📈',
  }[quest.category];

  return (
    <Pressable
      onPress={onPress}
      className={`bg-white rounded-2xl p-4 active:opacity-80 ${
        quest.completed ? 'opacity-60' : ''
      }`}
    >
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1 mr-2">
          <Text className="text-base font-bold text-text">
            {categoryEmoji} {quest.title}
          </Text>
          <Text className="text-sm text-gray-500 mt-1" numberOfLines={2}>
            {quest.description}
          </Text>
        </View>
        {quest.completed && <Text className="text-2xl text-green-500">✓</Text>}
      </View>

      <View className="flex-row justify-between items-center">
        <Text className="text-xs text-gray-400">Сложность: {difficultyStars}</Text>
        <Text className="text-sm font-bold text-primary">+{quest.reward} 🪙</Text>
      </View>
    </Pressable>
  );
}
