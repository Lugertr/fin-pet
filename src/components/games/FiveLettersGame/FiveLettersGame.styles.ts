// src/components/games/FiveLettersGame/FiveLettersGame.styles.ts
// Стили мини-игры «5 букв» (wordle-клон)

import type { Theme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import { colorPalettes, fontSizes, fontWeights, radius, spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

export const CELL_SIZE = 48;
export const CELL_GAP = 6;
export const WORD_LENGTH = 5;
export const MAX_ATTEMPTS = 6;

interface FiveLettersGameStylesParams {
  theme: Theme;
}

export function createFiveLettersGameStyles({ theme }: FiveLettersGameStylesParams) {
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
    },
    hintCard: {
      backgroundColor: theme.surface,
      borderRadius: radius.lg,
      padding: spacing.md,
      marginBottom: spacing.lg,
      borderWidth: 1,
      borderColor: theme.borderLight,
      width: '100%',
    },
    hintText: {
      color: theme.textSecondary,
      fontSize: fontSizes.sm,
      textAlign: 'center',
    },
    // Подсказки — две кнопки в ряд (≥48 dp, §23).
    hintButtons: {
      flexDirection: 'row',
      gap: spacing.sm,
      width: '100%',
      marginBottom: spacing.lg,
    },
    hintButton: {
      flex: 1,
      minHeight: 48,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.sm,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surface,
    },
    hintButtonText: {
      color: theme.textPrimary,
      fontWeight: fontWeights.semibold,
      fontSize: fontSizes.sm,
      textAlign: 'center',
    },
    // Открытая буква в пустой клетке — бледно, пока её не ввели.
    cellGhost: {
      opacity: 0.5,
    },
    grid: {
      gap: CELL_GAP,
      marginBottom: spacing.xl,
    },
    row: {
      flexDirection: 'row',
      gap: CELL_GAP,
    },
    cell: {
      width: CELL_SIZE,
      height: CELL_SIZE,
      borderRadius: radius.md,
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cellText: {
      fontSize: fontSizes.xl,
      fontWeight: fontWeights.bold,
    },
    feedbackContainer: {
      borderRadius: radius.lg,
      padding: spacing.lg,
      borderWidth: 1,
      marginBottom: spacing.lg,
      width: '100%',
    },
    feedbackText: {
      textAlign: 'center',
      fontSize: fontSizes.md,
      fontWeight: fontWeights.medium,
    },
    keyboard: {
      gap: spacing.xs,
      width: '100%',
    },
    keyboardRow: {
      flexDirection: 'row',
      gap: spacing.xxs,
    },
    // flex:1 вместо фикс. ширины: 12/11/11 клавиш в трёх рядах ЙЦУКЕН не
    // умещаются в 48dp на клавишу (реальные тач-клавиатуры идут на тот же
    // компромисс — высота ≥44dp, ширина уплотняется под ряд, соседний
    // промах некритичен благодаря отдельной Backspace). ENTER/Backspace —
    // flex:1.5, шире буквенной клавиши, но тоже тянутся вместе с рядом.
    key: {
      flex: 1,
      height: 44,
      borderRadius: radius.sm,
      alignItems: 'center',
      justifyContent: 'center',
    },
    keyWide: {
      flex: 1.5,
    },
    keyText: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.bold,
    },
  });
}

/** Состояние буквы: 'idle' — ещё не введена, 'filled' — введена в текущей,
 * ещё не отправленной строке, 'correct'/'present'/'absent' — результат
 * оценки (см. evaluateGuess.ts). Используется и для ячеек грида, и для
 * клавиш клавиатуры (там 'filled' не встречается). */
export type CellState = 'idle' | 'filled' | 'correct' | 'present' | 'absent';

export function getCellColors(
  theme: Theme,
  state: CellState
): { bg: string; border: string; text: string } {
  switch (state) {
    case 'idle':
      return { bg: theme.surface, border: theme.borderLight, text: theme.textPrimary };
    case 'filled':
      return { bg: theme.surfaceLight, border: theme.accent, text: theme.textPrimary };
    case 'correct':
      return { bg: theme.success, border: theme.success, text: theme.onGradient };
    case 'present':
      return {
        bg: colorPalettes.amber[500],
        border: colorPalettes.amber[500],
        text: theme.onGradient,
      };
    case 'absent':
      return {
        bg: withAlpha(theme.textMuted, 0.25),
        border: withAlpha(theme.textMuted, 0.25),
        text: theme.textMuted,
      };
  }
}
