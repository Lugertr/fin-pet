// app/(modal)/ai-chat.tsx
// Чат с ИИ-Наставником

import { AI_QUESTION_ENERGY_COST, COLORS, DAILY_AI_FREE_QUESTIONS } from '@/constants/theme';
import { useUserStore } from '@/lib/stores/userStore';
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

export default function AiChatScreen() {
  const router = useRouter();
  const { user } = useUserStore(); // Используем для персонализации
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

  // Автопрокрутка к последнему сообщению
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

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

    // Имитация ответа ИИ
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

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="bg-slate-900"
    >
      {/* Заголовок */}
      <LinearGradient colors={[COLORS.surface, COLORS.background]} className="px-6 pt-14 pb-4">
        <View className="flex-row items-center justify-between mb-2">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View className="flex-row items-center gap-2">
            <Text className="text-white font-semibold text-lg">ИИ-Наставник</Text>
            <View className="w-2 h-2 rounded-full bg-green-500" />
          </View>
          <View className="w-6" />
        </View>

        {/* Счётчик вопросов */}
        <View className="flex-row items-center justify-center gap-4">
          <View className="flex-row items-center gap-1 bg-slate-800 px-3 py-1 rounded-full">
            <Ionicons name="chatbubble" size={14} color={COLORS.primary} />
            <Text className="text-slate-300 text-sm">
              {questionsRemaining} / {DAILY_AI_FREE_QUESTIONS}
            </Text>
          </View>
          {questionsRemaining === 0 && (
            <View className="flex-row items-center gap-1 bg-amber-500/20 px-3 py-1 rounded-full">
              <Ionicons name="flash" size={14} color={COLORS.accent} />
              <Text className="text-amber-400 text-sm">Далее: {AI_QUESTION_ENERGY_COST} E</Text>
            </View>
          )}
        </View>
      </LinearGradient>

      {/* Сообщения */}
      <ScrollView
        ref={scrollViewRef}
        className="flex-1 px-4"
        contentContainerClassName="py-4"
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => (
          <ChatBubble key={message.id} message={message} />
        ))}

        {/* Индикатор загрузки */}
        {isLoading && (
          <View className="flex-row items-center gap-2 mb-4">
            <View className="w-8 h-8 rounded-full bg-purple-500/20 items-center justify-center">
              <Text className="text-sm">🤖</Text>
            </View>
            <View className="bg-slate-800 rounded-2xl rounded-tl-sm px-4 py-3">
              <ActivityIndicator size="small" color={COLORS.textSecondary} />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Быстрые вопросы */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 pb-2">
        {['Что такое бюджет?', 'Как копить?', 'Что такое скам?'].map((question) => (
          <TouchableOpacity
            key={question}
            onPress={() => setInputText(question)}
            className="bg-slate-800 px-4 py-2 rounded-full mr-2"
          >
            <Text className="text-slate-300 text-sm">{question}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Поле ввода */}
      <View className="px-4 pb-6 pt-2 bg-slate-900 border-t border-slate-800">
        <View className="flex-row items-center gap-2">
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Задайте вопрос о финансах..."
            placeholderTextColor={COLORS.textMuted}
            className="flex-1 bg-slate-800 rounded-full px-4 py-3 text-white"
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            onPress={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
            className={`w-12 h-12 rounded-full items-center justify-center ${
              inputText.trim() && !isLoading ? 'bg-indigo-500' : 'bg-slate-700'
            }`}
          >
            <Ionicons name="send" size={20} color="white" />
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
  const isUser = message.role === 'user';

  return (
    <View className={`flex-row mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <View className="w-8 h-8 rounded-full bg-purple-500/20 items-center justify-center mr-2 mt-1">
          <Text className="text-sm">🤖</Text>
        </View>
      )}

      <View
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser ? 'bg-indigo-500 rounded-br-sm' : 'bg-slate-800 rounded-tl-sm'
        }`}
      >
        <Text className="text-white leading-relaxed">{message.content}</Text>
        <Text
          className={`text-xs mt-1 ${isUser ? 'text-indigo-200 text-right' : 'text-slate-500'}`}
        >
          {message.timestamp.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>

      {isUser && (
        <View className="w-8 h-8 rounded-full bg-indigo-500/20 items-center justify-center ml-2 mt-1">
          <Text className="text-sm">👤</Text>
        </View>
      )}
    </View>
  );
}
