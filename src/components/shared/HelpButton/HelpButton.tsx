// src/components/shared/HelpButton/HelpButton.tsx
// Кнопка «?» с подсказкой по экрану (решение пользователя 27.09.2026: у
// каждого экрана детского приложения — объяснение, что здесь можно делать).
// Тексты — content/screen_help.json (§25: контент отделён от UI), окно —
// HelpModal. Тап-зона ≥48dp (§23) через hitSlop, визуально — 36dp.

import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { TouchableOpacity } from 'react-native';

import type { ScreenHelpId } from '@/domain/content/ReferenceContent';
import { useFeedback } from '@/lib/hooks/useFeedback';
import { useResponsive, useTheme } from '@/theme';
import { HelpModal } from './HelpModal';
import { getScreenHelp } from './screenHelp';

const VISUAL_SIZE = 36;
const HIT_SLOP = { top: 6, bottom: 6, left: 6, right: 6 };

export function HelpButton({
  screen,
  variant = 'default',
}: {
  screen: ScreenHelpId;
  /** onGradient — белая иконка для цветных шапок. */
  variant?: 'default' | 'onGradient';
}) {
  const { theme } = useTheme();
  const { scale } = useResponsive();
  const { triggerHaptic } = useFeedback();
  const [open, setOpen] = useState(false);
  const help = getScreenHelp(screen);

  if (!help) return null;

  return (
    <>
      <TouchableOpacity
        onPress={() => {
          triggerHaptic('light');
          setOpen(true);
        }}
        hitSlop={HIT_SLOP}
        style={{
          width: scale(VISUAL_SIZE),
          height: scale(VISUAL_SIZE),
          alignItems: 'center',
          justifyContent: 'center',
        }}
        accessibilityRole="button"
        accessibilityLabel={`Подсказка: ${help.title}`}
      >
        <Ionicons
          name="help-circle-outline"
          size={scale(28)}
          color={variant === 'onGradient' ? theme.onGradient : theme.textPrimary}
        />
      </TouchableOpacity>
      {open && <HelpModal help={help} onClose={() => setOpen(false)} />}
    </>
  );
}
