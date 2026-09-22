// src/app/(tabs)/ai-chat.styles.ts
// Стили самого экрана чата с ИИ — шапка, лента сообщений, быстрые вопросы, поле ввода.
// Стили пузыря сообщения — в src/components/aiChat/ChatBubble/ChatBubble.styles.ts.
// avatarBox/avatarAssistant дублируются там же — используются в индикаторе загрузки здесь.

import type { Theme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import {
  circleRadius,
  colorPalettes,
  fontSizes,
  fontWeights,
  radius,
  spacing,
} from '@/theme/tokens';
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
    headerTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    headerTitle: {
      color: theme.textPrimary,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.xl,
    },
    onlineDot: {
      width: 8,
      height: 8,
      borderRadius: circleRadius(8),
      backgroundColor: theme.success,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      gap: spacing.md,
    },
    costBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      backgroundColor: theme.surfaceLight,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: radius.lg,
    },
    costBadgeWarning: {
      backgroundColor: withAlpha(theme.error, 0.15),
    },
    costText: {
      color: theme.textPrimary,
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.semibold,
    },
    costTextWarning: {
      color: theme.error,
    },

    // Сообщения
    messagesScroll: {
      flex: 1,
    },
    messagesScrollContent: {
      padding: spacing.lg,
    },

    // Индикатор загрузки (аватар — тот же ключ, что у ChatBubble.styles.ts)
    loadingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.lg,
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
      borderRadius: circleRadius(48),
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
