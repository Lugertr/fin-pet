import { useGameStore } from '@/app/providers/store';
import { useEffect, useRef, useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from 'react-native';

// Мок-ответы LLM (позже заменим на реальный API)
const mockResponses: Record<string, string> = {
  инфляция:
    'Инфляция — это когда деньги со временем покупают меньше вещей. Представь: шоколадка стоила 50₽, а теперь стоит 60₽. Вот это и есть инфляция! 🍫',
  копить:
    'Копить — это откладывать часть денег на будущее. Как белка запасает орешки на зиму 🐿️. Чем больше отложишь сейчас, тем больше будет потом!',
  бюджет:
    'Бюджет — это план, как тратить деньги. Раздели свои монеты на 3 части: нужное (еда), желаемое (игрушки) и сбережения (копилка) 💰',
  инвестиции:
    'Инвестиции — это когда ты даёшь свои деньги в дело, чтобы они приносили ещё больше денег. Как посадить семечко 🌱 — оно вырастает и даёт плоды!',
  default:
    'Интересный вопрос! Давай разберёмся вместе. Расскажи подробнее, что именно тебя интересует? 💭',
};

function getMockResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  for (const [keyword, response] of Object.entries(mockResponses)) {
    if (keyword !== 'default' && lowerMessage.includes(keyword)) {
      return response;
    }
  }
  return mockResponses.default;
}

export function ChatPage() {
  const { chatMessages, addChatMessage, pet, finances } = useGameStore();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [chatMessages, isTyping]);

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    addChatMessage('user', userMessage);
    setInput('');
    setIsTyping(true);

    // Имитация задержки ответа
    setTimeout(() => {
      const response = getMockResponse(userMessage);
      addChatMessage('assistant', response);
      setIsTyping(false);
    }, 1000);
  };

  const quickQuestions = [
    'Что такое инфляция?',
    'Зачем копить?',
    'Что такое бюджет?',
    'Что такое инвестиции?',
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
    >
      <View className="px-4 pt-12 pb-2">
        <Text className="text-3xl font-bold text-text mb-1">Помощник 💬</Text>
        <Text className="text-sm text-gray-500">Спроси меня о финансах!</Text>
      </View>

      <ScrollView ref={scrollViewRef} className="flex-1 px-4" contentContainerClassName="pb-4">
        {chatMessages.length === 1 && (
          <View className="flex-row flex-wrap gap-2 mb-4">
            {quickQuestions.map((question) => (
              <Pressable
                key={question}
                onPress={() => {
                  setInput(question);
                }}
                className="bg-white px-3 py-2 rounded-full active:opacity-80"
              >
                <Text className="text-sm text-primary">{question}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {chatMessages.map((message) => (
          <View key={message.id} className={`mb-3 ${message.isUser ? 'items-end' : 'items-start'}`}>
            <View
              className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                message.role === 'user'
                  ? 'bg-primary'
                  : message.role === 'system'
                    ? 'bg-yellow-100'
                    : 'bg-white'
              }`}
            >
              <Text className={message.role === 'user' ? 'text-white' : 'text-text'}>
                {message.content}
              </Text>
            </View>
          </View>
        ))}

        {isTyping && (
          <View className="mb-3 items-start">
            <View className="bg-white px-4 py-3 rounded-2xl">
              <Text className="text-text">Печатает...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View className="px-4 pb-4">
        <View className="flex-row gap-2">
          <TextInput
            className="flex-1 bg-white px-4 py-3 rounded-xl text-base text-text"
            placeholder="Спроси что-нибудь..."
            value={input}
            onChangeText={setInput}
            onSubmitEditing={sendMessage}
            placeholderTextColor="#999"
            multiline
          />
          <Pressable
            onPress={sendMessage}
            disabled={!input.trim() || isTyping}
            className={`px-5 py-3 rounded-xl justify-center ${
              input.trim() && !isTyping ? 'bg-primary' : 'bg-gray-300'
            } active:opacity-80`}
          >
            <Text className="text-white font-semibold text-lg">→</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
