// src/components/aiChat/ChatBubble/ChatBubble.styles.ts
// Стили пузыря сообщения в чате с ИИ.
//
// avatarBox/avatarAssistant дублируются из стилей экрана (src/styles/screens/tabs/_ai-chat.styles.ts),
// где они же используются в индикаторе загрузки — общих ключей всего два, отдельный
// файл под них не оправдан.

import type { Theme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import { circleRadius, colorPalettes, fontSizes, radius, spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

interface ChatBubbleStylesParams {
  theme: Theme;
}

export function createChatBubbleStyles({ theme }: ChatBubbleStylesParams) {
  return StyleSheet.create({
    messageRow: {
      flexDirection: 'row',
      marginBottom: spacing.lg,
    },
    messageRowUser: {
      justifyContent: 'flex-end',
    },
    messageRowAssistant: {
      justifyContent: 'flex-start',
    },
    avatarBox: {
      width: 36,
      height: 36,
      borderRadius: circleRadius(36),
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: spacing.xs,
    },
    avatarAssistant: {
      backgroundColor: withAlpha(colorPalettes.violet[500], 0.2),
      marginRight: spacing.sm,
    },
    avatarUser: {
      backgroundColor: withAlpha(theme.primary, 0.2),
      marginLeft: spacing.sm,
    },
    messageBubble: {
      maxWidth: '80%',
      borderRadius: radius.xl,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    messageBubbleUser: {
      backgroundColor: theme.primary,
      borderTopRightRadius: radius.xs,
    },
    messageBubbleAssistant: {
      backgroundColor: theme.surface,
      borderTopLeftRadius: radius.xs,
    },
    messageText: {
      color: theme.onGradient,
      fontSize: fontSizes.md,
      lineHeight: 22,
    },
    messageTextAssistant: {
      color: theme.textPrimary,
    },
    messageTime: {
      fontSize: fontSizes.xs,
      marginTop: spacing.xs,
    },
    messageTimeUser: {
      color: withAlpha(theme.onGradient, 0.7),
      textAlign: 'right',
    },
    messageTimeAssistant: {
      color: theme.textMuted,
      textAlign: 'left',
    },
  });
}
