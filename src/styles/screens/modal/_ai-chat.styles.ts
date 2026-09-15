// src/app/(modal)/ai-chat.styles.ts
// Стили экрана чата с ИИ

import type { Theme } from '@/theme';
import { fontSizes, fontWeights, radius, spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

interface AiChatStylesParams {
  theme: Theme;
}

export function createAiChatStyles({ theme }: AiChatStylesParams) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },

    // Заголовок
    header: {
      paddingTop: 56,
      paddingBottom: spacing.lg,
      paddingHorizontal: spacing.xxl,
    },
    headerTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.md,
    },
    backButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: 'rgba(255,255,255,0.2)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    headerTitle: {
      color: '#FFFFFF',
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.xl,
    },
    onlineDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#4ADE80',
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: spacing.md,
    },
    statBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      backgroundColor: 'rgba(255,255,255,0.2)',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: radius.lg,
    },
    statBadgeWarning: {
      backgroundColor: 'rgba(251, 191, 36, 0.3)',
    },
    statText: {
      color: '#FFFFFF',
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.semibold,
    },
    statTextWarning: {
      color: '#FDE68A',
    },

    // Сообщения
    messagesScroll: {
      flex: 1,
    },
    messagesScrollContent: {
      padding: spacing.lg,
    },
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
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: spacing.xs,
    },
    avatarAssistant: {
      backgroundColor: 'rgba(168, 85, 247, 0.2)',
      marginRight: spacing.sm,
    },
    avatarUser: {
      backgroundColor: 'rgba(99, 102, 241, 0.2)',
      marginLeft: spacing.sm,
    },
    avatarEmoji: {
      fontSize: 18,
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
      color: '#FFFFFF',
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
      color: 'rgba(255,255,255,0.7)',
      textAlign: 'right',
    },
    messageTimeAssistant: {
      color: theme.textMuted,
      textAlign: 'left',
    },

    // Индикатор загрузки
    loadingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.lg,
    },
    loadingBubble: {
      backgroundColor: theme.surface,
      borderRadius: radius.lg,
      borderTopLeftRadius: radius.xs,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },

    // Быстрые вопросы
    quickQuestionsScroll: {
      paddingHorizontal: spacing.sm,
      paddingBottom: spacing.xs,
    },
    quickQuestionsRow: {
      gap: spacing.xs,
    },
    quickQuestionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xxs,
      backgroundColor: theme.surfaceLight,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: radius.md,
    },
    quickQuestionEmoji: {
      fontSize: 12,
    },
    quickQuestionText: {
      color: theme.textSecondary,
      fontSize: fontSizes.xs,
    },

    // Поле ввода
    inputContainer: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xxl,
      paddingTop: spacing.sm,
      backgroundColor: theme.background,
      borderTopWidth: 1,
      borderTopColor: theme.borderLight,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    inputField: {
      flex: 1,
      backgroundColor: theme.surfaceLight,
      borderRadius: radius.xxl,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      color: theme.textPrimary,
      fontSize: fontSizes.md,
      maxHeight: 100,
    },
    sendButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sendButtonActive: {
      backgroundColor: theme.primary,
    },
    sendButtonInactive: {
      backgroundColor: theme.surfaceLight,
    },
  });
}
