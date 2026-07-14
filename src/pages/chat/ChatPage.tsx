import { useGameStore } from '@/app/providers/store';
import { getMockResponse } from '@/features/chat-with-llm';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

const QUICK_QUESTIONS = [
  'Что такое инфляция?',
  'Зачем копить?',
  'Что такое бюджет?',
  'Что такое инвестиции?',
];

export function ChatPage() {
  const chatMessages = useGameStore((s) => s.chatMessages);
  const addChatMessage = useGameStore((s) => s.addChatMessage);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [chatMessages, isTyping]);

  const sendMessage = useCallback(() => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    addChatMessage('user', userMessage);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const response = getMockResponse(userMessage);
      addChatMessage('assistant', response);
      setIsTyping(false);
    }, 1000);
  }, [input, addChatMessage]);

  const renderItem = useCallback(
    ({ item }: { item: (typeof chatMessages)[number] }) => (
      <View className={`mb-3 ${item.role === 'user' ? 'items-end' : 'items-start'}`}>
        <View
          className={`max-w-[80%] px-4 py-3 rounded-2xl ${
            item.role === 'user'
              ? 'bg-primary'
              : item.role === 'system'
                ? 'bg-yellow-100'
                : 'bg-white'
          }`}
        >
          <Text className={item.role === 'user' ? 'text-white' : 'text-text'}>{item.content}</Text>
        </View>
      </View>
    ),
    []
  );

  const keyExtractor = useCallback((item: (typeof chatMessages)[number]) => item.id, []);

  const ListHeader = useMemo(
    () => () => {
      if (chatMessages.length > 1) return null;
      return (
        <View className="flex-row flex-wrap gap-2 mb-4">
          {QUICK_QUESTIONS.map((question) => (
            <Pressable
              key={question}
              onPress={() => setInput(question)}
              className="bg-white px-3 py-2 rounded-full active:opacity-80"
            >
              <Text className="text-sm text-primary">{question}</Text>
            </Pressable>
          ))}
        </View>
      );
    },
    [chatMessages.length]
  );

  const ListFooter = useMemo(
    () => () => {
      if (!isTyping) return null;
      return (
        <View className="mb-3 items-start">
          <View className="bg-white px-4 py-3 rounded-2xl">
            <Text className="text-text">Печатает...</Text>
          </View>
        </View>
      );
    },
    [isTyping]
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
    >
      <View className="px-4 pt-12 pb-2">
        <Text className="text-3xl font-bold text-text mb-1">Помощник 💬</Text>
        <Text className="text-sm text-gray-500">Спроси меня о финансах!</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={chatMessages}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        className="flex-1 px-4"
        contentContainerClassName="pb-4"
      />

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
