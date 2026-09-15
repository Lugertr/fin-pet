// src/app/(modal)/ai-chat.tsx
// Чат с ИИ-Наставником

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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

import { AI_QUESTION_ENERGY_COST, DAILY_AI_FREE_QUESTIONS } from '@/constants/theme';
import { useFeedback } from '@/lib/hooks/useFeedback';
import { useUserStore } from '@/lib/stores/userStore';
import { useResponsive, useTheme } from '@/theme';
import { spacing } from '@/theme/tokens';
import { createAiChatStyles } from '../../styles/screens/modal/_ai-chat.styles';

// Тип сообщения
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Заглушки ответов ИИ
const AI_RESPONSES = [
  'Отличный вопрос! Бюджет — это план ваших доходов и расходов. Начните с записи всех трат за неделю.',
  'Помните правило 50/30/20: 50% на нужды, 30% на желания, 20% на сбережения.',
  'Никогда не сообщайте пароли и коды из СМС никому, даже сотрудникам банка!',
  'Инвестиции — это долгосрочная стратегия. Не вкладывайте деньги, которые могут понадобиться в ближайшее время.',
  'Если предложение звучит слишком хорошо, чтобы быть правдой — скорее всего, это мошенничество.',
  'Ваш текущий баланс можно увидеть в профиле. Помните: финансовая подушка должна покрывать 3-6 месяцев расходов!',
  'Кредит — это инструмент, а не решение всех проблем. Всегда читайте условия мелким шрифтом.',
];

// Быстрые вопросы
const QUICK_QUESTIONS = [
  { icon: '💰', text: 'Что такое бюджет?' },
  { icon: '🏦', text: 'Как копить?' },
  { icon: '🛡️', text: 'Что такое скам?' },
  { icon: '📈', text: 'Как инвестировать?' },
];

export default function AiChatScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive(); // ✅ Используем scale и scaledFont
  const { triggerHaptic } = useFeedback();
  const { user } = useUserStore();

  const styles = createAiChatStyles({ theme });
  const scrollViewRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: user?.username
        ? `Привет, ${user.username}! Я ваш ИИ-Наставник. Задайте мне вопрос о финансах, и я помогу разобраться! 🤖`
        : 'Привет! Я ваш ИИ-Наставник. Задайте мне вопрос о финансах, и я помогу разобраться! 🤖',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [questionsUsed, setQuestionsUsed] = useState(0);

  const questionsRemaining = DAILY_AI_FREE_QUESTIONS - questionsUsed;

  const headerGradient: [string, string] = ['#7C3AED', '#A855F7'];

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    triggerHaptic('light');

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setQuestionsUsed((prev) => prev + 1);

    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)],
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const handleQuickQuestion = (question: string) => {
    triggerHaptic('selection');
    setInputText(question);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Заголовок */}
      <LinearGradient
        colors={headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.header, { paddingTop: scale(56), paddingBottom: scale(spacing.lg) }]}
      >
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backButton, { width: scale(36), height: scale(36) }]}
          >
            <Ionicons name="arrow-back" size={scale(20)} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.headerTitleRow}>
            <Text style={[styles.headerTitle, { fontSize: scaledFont('xl') }]}>ИИ-Наставник</Text>
            <View style={styles.onlineDot} />
          </View>

          <View style={{ width: scale(36) }} />
        </View>

        {/* Счётчик вопросов */}
        <View style={styles.statsRow}>
          <View
            style={[
              styles.statBadge,
              { paddingHorizontal: scale(spacing.md), paddingVertical: scale(spacing.xs) },
            ]}
          >
            <Ionicons name="chatbubble-ellipses" size={scale(14)} color="#FFFFFF" />
            <Text style={[styles.statText, { fontSize: scaledFont('sm') }]}>
              {questionsRemaining} / {DAILY_AI_FREE_QUESTIONS}
            </Text>
          </View>
          {questionsRemaining === 0 && (
            <View
              style={[
                styles.statBadge,
                styles.statBadgeWarning,
                { paddingHorizontal: scale(spacing.md), paddingVertical: scale(spacing.xs) },
              ]}
            >
              <Ionicons name="flash" size={scale(14)} color="#FDE68A" />
              <Text
                style={[styles.statText, styles.statTextWarning, { fontSize: scaledFont('sm') }]}
              >
                Далее: {AI_QUESTION_ENERGY_COST} E
              </Text>
            </View>
          )}
        </View>
      </LinearGradient>

      {/* Сообщения */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesScroll}
        contentContainerStyle={styles.messagesScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => (
          <ChatBubble key={message.id} message={message} />
        ))}

        {/* Индикатор загрузки */}
        {isLoading && (
          <View style={styles.loadingRow}>
            <View
              style={[
                styles.avatarBox,
                styles.avatarAssistant,
                { width: scale(36), height: scale(36) },
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
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
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
                borderRadius: scale(spacing.md),
              },
            ]}
          >
            <Text style={{ fontSize: scale(12) }}>{question.icon}</Text>
            <Text style={[styles.quickQuestionText, { fontSize: scaledFont('xs') }]}>
              {question.text}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

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
            disabled={!inputText.trim() || isLoading}
            activeOpacity={0.8}
            style={[
              styles.sendButton,
              inputText.trim() && !isLoading ? styles.sendButtonActive : styles.sendButtonInactive,
              { width: scale(48), height: scale(48), borderRadius: scale(24) },
            ]}
          >
            <Ionicons name="send" size={scale(20)} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

/**
 * Пузырь сообщения
 */
function ChatBubble({ message }: { message: ChatMessage }) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();

  const styles = createAiChatStyles({ theme });

  const isUser = message.role === 'user';

  return (
    <View
      style={[
        styles.messageRow,
        isUser ? styles.messageRowUser : styles.messageRowAssistant,
        { marginBottom: scale(spacing.lg) },
      ]}
    >
      {!isUser && (
        <View
          style={[
            styles.avatarBox,
            styles.avatarAssistant,
            { width: scale(36), height: scale(36), marginTop: scale(spacing.xs) },
          ]}
        >
          <Text style={{ fontSize: scale(18) }}>🤖</Text>
        </View>
      )}

      <View
        style={[
          styles.messageBubble,
          isUser ? styles.messageBubbleUser : styles.messageBubbleAssistant,
          {
            paddingHorizontal: scale(spacing.lg),
            paddingVertical: scale(spacing.md),
          },
        ]}
      >
        <Text
          style={[
            styles.messageText,
            !isUser && styles.messageTextAssistant,
            { fontSize: scaledFont('md') },
          ]}
        >
          {message.content}
        </Text>
        <Text
          style={[
            styles.messageTime,
            isUser ? styles.messageTimeUser : styles.messageTimeAssistant,
            { fontSize: scaledFont('xs') },
          ]}
        >
          {message.timestamp.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>

      {isUser && (
        <View
          style={[
            styles.avatarBox,
            styles.avatarUser,
            { width: scale(36), height: scale(36), marginTop: scale(spacing.xs) },
          ]}
        >
          <Text style={{ fontSize: scale(18) }}>👤</Text>
        </View>
      )}
    </View>
  );
}
