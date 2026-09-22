// src/components/aiChat/ChatBubble/ChatBubble.tsx
// Пузырь сообщения в чате с ИИ. У ответов ассистента со ссылкой на урок — кнопка перехода.

import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

import { AiChatMessage } from '@/lib/stores/aiChatStore';
import { useResponsive, useTheme } from '@/theme';
import { circleRadius, fontWeights, radius, spacing } from '@/theme/tokens';
import { createChatBubbleStyles } from './ChatBubble.styles';

export function ChatBubble({
  message,
  onOpenLesson,
}: {
  message: AiChatMessage;
  onOpenLesson: (lessonId: number) => void;
}) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();

  const styles = createChatBubbleStyles({ theme });

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
            {
              width: scale(36),
              height: scale(36),
              borderRadius: circleRadius(scale(36)),
              marginTop: scale(spacing.xs),
            },
          ]}
        >
          <Text style={{ fontSize: scale(18) }}>🤖</Text>
        </View>
      )}

      <View style={{ maxWidth: '78%' }}>
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
            {new Date(message.createdAt).toLocaleTimeString('ru-RU', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>

        {!isUser && message.relatedLessonId !== null && (
          <TouchableOpacity
            onPress={() => onOpenLesson(message.relatedLessonId as number)}
            activeOpacity={0.7}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              alignSelf: 'flex-start',
              marginTop: scale(spacing.xs),
              paddingHorizontal: scale(spacing.md),
              paddingVertical: scale(spacing.xs),
              borderRadius: scale(radius.lg),
              backgroundColor: theme.primary,
              gap: scale(spacing.xxs),
            }}
          >
            <Ionicons name="book" size={scale(14)} color={theme.onGradient} />
            <Text
              style={{
                color: theme.onGradient,
                fontSize: scaledFont('xs'),
                fontWeight: fontWeights.semibold,
              }}
            >
              Перейти к уроку
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {isUser && (
        <View
          style={[
            styles.avatarBox,
            styles.avatarUser,
            {
              width: scale(36),
              height: scale(36),
              borderRadius: circleRadius(scale(36)),
              marginTop: scale(spacing.xs),
            },
          ]}
        >
          <Text style={{ fontSize: scale(18) }}>👤</Text>
        </View>
      )}
    </View>
  );
}
