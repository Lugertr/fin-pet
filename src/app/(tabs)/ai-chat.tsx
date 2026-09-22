// src/app/(tabs)/ai-chat.tsx
// Чат с ИИ-помощником (§16 ТЗ). Реализация — StubAiAssistant (см. src/lib/ai):
// фиксированный нейтральный ответ со ссылкой на урок, без генерации и сети.
// Реальное списание энергии (5⚡, 2⚡ с «Облаком»), вся история хранится
// локально и может быть очищена пользователем (§16.2/§16.5).

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useShallow } from 'zustand/react/shallow';

import { ChatBubble } from '@/components/aiChat';
import { AppHeaderStats } from '@/components/shared';
import { IconButton, ScrollableRow } from '@/components/ui';
import { useFeedback } from '@/lib/hooks/useFeedback';
import { useAiChatStore } from '@/lib/stores/aiChatStore';
import { usePetStore } from '@/lib/stores/petStore';
import { useSavingsStore } from '@/lib/stores/savingsStore';
import { useUserStore } from '@/lib/stores/userStore';
import { Alert } from '@/lib/utils/alert';
import { canAffordEnergy } from '@/lib/utils/moodCalculator';
import { useResponsive, useTheme } from '@/theme';
import { circleRadius, radius, spacing } from '@/theme/tokens';
import { createAiChatStyles } from '../../styles/screens/tabs/_ai-chat.styles';

// Быстрые вопросы — просто подставляют текст в поле ввода, не тема-специфичны
const QUICK_QUESTIONS = [
  { icon: '💰', text: 'Что такое бюджет?' },
  { icon: '🏦', text: 'Как копить?' },
  { icon: '🛡️', text: 'Что такое скам?' },
  { icon: '📈', text: 'Как инвестировать?' },
];

export default function AiChatScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const { triggerHaptic } = useFeedback();
  // Точечные селекторы — вкладка чата держится смонтированной в таб-баре и не
  // должна перерисовываться при изменениях в других сторах, которые ей не нужны.
  const user = useUserStore((s) => s.user);
  const currentMood = usePetStore((s) => s.currentMood);
  const savings = useSavingsStore((s) => s.savings);
  const { messages, isAsking, ask, clearHistory, getEnergyCost } = useAiChatStore(
    useShallow((s) => ({
      messages: s.messages,
      isAsking: s.isAsking,
      ask: s.ask,
      clearHistory: s.clearHistory,
      getEnergyCost: s.getEnergyCost,
    }))
  );

  const styles = createAiChatStyles({ theme });
  const scrollViewRef = useRef<ScrollView>(null);

  const [inputText, setInputText] = useState('');

  const energyCost = getEnergyCost();
  const canAfford = canAffordEnergy(currentMood, energyCost);

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages, isAsking]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isAsking) return;

    if (!canAfford) {
      triggerHaptic('error');
      Alert.alert(
        'Недостаточно энергии',
        `Вопрос стоит ${energyCost}⚡. Покормите питомца или подождите восстановления.`
      );
      return;
    }

    triggerHaptic('light');
    const question = inputText.trim();
    setInputText('');

    const result = await ask(question);
    if (!result.success && result.message) {
      triggerHaptic('error');
      Alert.alert('Не получилось', result.message);
    }
  };

  const handleQuickQuestion = (question: string) => {
    triggerHaptic('selection');
    setInputText(question);
  };

  const handleClearHistory = () => {
    if (messages.length === 0) return;
    triggerHaptic('medium');
    Alert.alert('Очистить историю?', 'Все сообщения чата будут удалены без возможности отмены.', [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Очистить', style: 'destructive', onPress: () => clearHistory() },
    ]);
  };

  const handleOpenLesson = (lessonId: number) => {
    triggerHaptic('selection');
    router.push({ pathname: '/(modal)/lesson/[id]', params: { id: String(lessonId) } } as never);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Общая шапка приложения */}
      <View
        style={{
          paddingTop: scale(56),
          paddingBottom: scale(spacing.md),
          paddingHorizontal: scale(spacing.xxl),
        }}
      >
        <AppHeaderStats
          energy={currentMood}
          coins={user?.liquid_balance ?? 0}
          savings={savings?.currentAmount ?? 0}
        />
      </View>

      <View style={[styles.header, { paddingTop: 0, paddingBottom: scale(spacing.md) }]}>
        <View style={styles.headerTopRow}>
          <View style={styles.headerTitleRow}>
            <Text style={[styles.headerTitle, { fontSize: scaledFont('xl') }]}>ИИ-помощник</Text>
            <View style={styles.onlineDot} />
          </View>

          <IconButton icon="trash-outline" onPress={handleClearHistory} variant="surface" />
        </View>

        {/* Стоимость вопроса */}
        <View style={styles.statsRow}>
          <View
            style={[
              styles.costBadge,
              !canAfford && styles.costBadgeWarning,
              { paddingHorizontal: scale(spacing.md), paddingVertical: scale(spacing.xs) },
            ]}
          >
            <Ionicons
              name="flash"
              size={scale(14)}
              color={canAfford ? theme.warning : theme.error}
            />
            <Text
              style={[
                styles.costText,
                !canAfford && styles.costTextWarning,
                { fontSize: scaledFont('sm') },
              ]}
            >
              Вопрос стоит {energyCost}⚡
            </Text>
          </View>
        </View>
      </View>

      {/* Сообщения */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesScroll}
        contentContainerStyle={styles.messagesScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 && (
          <ChatBubble
            message={{
              id: 'welcome',
              role: 'assistant',
              relatedLessonId: null,
              createdAt: new Date().toISOString(),
              content: user?.username
                ? `Привет, ${user.username}! Задай мне вопрос о финансах, и я подскажу, какой урок поможет разобраться. 🤖`
                : 'Привет! Задай мне вопрос о финансах, и я подскажу, какой урок поможет разобраться. 🤖',
            }}
            onOpenLesson={handleOpenLesson}
          />
        )}

        {messages.map((message) => (
          <ChatBubble key={message.id} message={message} onOpenLesson={handleOpenLesson} />
        ))}

        {isAsking && (
          <View style={styles.loadingRow}>
            <View
              style={[
                styles.avatarBox,
                styles.avatarAssistant,
                { width: scale(36), height: scale(36), borderRadius: circleRadius(scale(36)) },
              ]}
            >
              <Text style={{ fontSize: scale(18) }}>🤖</Text>
            </View>
            <View style={styles.loadingBubble}>
              <ActivityIndicator size="small" color={theme.textSecondary} />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Быстрые вопросы */}
      <ScrollableRow
        style={[
          styles.quickQuestionsScroll,
          { paddingHorizontal: scale(spacing.sm), paddingBottom: scale(spacing.xs) },
        ]}
        contentContainerStyle={[styles.quickQuestionsRow, { gap: scale(spacing.xs) }]}
      >
        {QUICK_QUESTIONS.map((question) => (
          <TouchableOpacity
            key={question.text}
            onPress={() => handleQuickQuestion(question.text)}
            activeOpacity={0.7}
            style={[
              styles.quickQuestionButton,
              {
                paddingHorizontal: scale(spacing.sm),
                paddingVertical: scale(spacing.xs),
                gap: scale(spacing.xxs),
                borderRadius: scale(radius.md),
              },
            ]}
          >
            <Text style={{ fontSize: scale(12) }}>{question.icon}</Text>
            <Text style={[styles.quickQuestionText, { fontSize: scaledFont('xs') }]}>
              {question.text}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollableRow>

      {/* Поле ввода */}
      <View
        style={[
          styles.inputContainer,
          {
            paddingHorizontal: scale(spacing.lg),
            paddingBottom: scale(spacing.xxl),
            paddingTop: scale(spacing.sm),
          },
        ]}
      >
        <View style={[styles.inputRow, { gap: scale(spacing.sm) }]}>
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Задайте вопрос о финансах..."
            placeholderTextColor={theme.textMuted}
            style={[styles.inputField, { fontSize: scaledFont('md') }]}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            onPress={handleSendMessage}
            disabled={!inputText.trim() || isAsking}
            activeOpacity={0.8}
            style={[
              styles.sendButton,
              inputText.trim() && !isAsking ? styles.sendButtonActive : styles.sendButtonInactive,
              { width: scale(48), height: scale(48), borderRadius: circleRadius(scale(48)) },
            ]}
          >
            <Ionicons name="send" size={scale(20)} color={theme.onGradient} />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
