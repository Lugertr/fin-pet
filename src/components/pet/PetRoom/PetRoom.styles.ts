// src/components/pet/PetRoom/PetRoom.styles.ts
// Стили комнаты питомца. Позиции/размеры мест (окно/копилка/ноутбук/кровать/
// ковёр) больше не здесь — они приходят из выбранной RoomLayout (см.
// domain/room/RoomLayout.ts, roomBoxToStyle) как проценты от реальных
// размеров комнаты, поэтому предметы пропорциональны экрану, а не
// фиксированным px. Здесь — только то, что от раскладки не зависит.

import type { Theme } from '@/theme';
import { withAlpha } from '@/theme/colorUtils';
import { colorPalettes, fontSizes, fontWeights, radius, spacing } from '@/theme/tokens';
import { StyleSheet } from 'react-native';

/** Собственная отрисованная сцена (room-background.svg) — не theme-реактивная,
 * тот же подход, что уже принят для питомцев/мебели (фиксированная
 * иллюстрация, а не токены темы). container вокруг неё (рамка) остаётся
 * theme-реактивным. */

interface PetRoomStylesParams {
  theme: Theme;
}

export function createPetRoomStyles({ theme }: PetRoomStylesParams) {
  return StyleSheet.create({
    // Измеряющая/прокручиваемая обёртка (ScrollView, см. PetRoom.tsx) — сама
    // по себе не рисует ни фона, ни рамки, только даёт ширину для измерения
    // и вертикальный скролл на случай, если сцена (всегда полной ширины)
    // окажется выше видимой области на широком/невысоком экране.
    container: {
      flex: 1,
      width: '100%',
    },
    containerContent: {
      flexGrow: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    // Сама сцена комнаты — фиксированные width/height (реальное соотношение
    // сторон фона, см. PetRoom.tsx ROOM_ASPECT_RATIO, ширина всегда на весь
    // экран), поэтому все координаты предметов (roomBoxToStyle) всегда
    // относятся к одному и тому же прямоугольнику независимо от экрана.
    roomBox: {
      borderRadius: radius.xxl,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.borderLight,
    },
    background: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    petContainer: {
      position: 'absolute',
      left: 0,
      right: 0,
      alignItems: 'center',
    },
    petNameBadge: {
      marginTop: spacing.md,
      backgroundColor: withAlpha(colorPalettes.slate[950], 0.4),
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.xs,
      borderRadius: radius.lg,
    },
    petNameText: {
      color: theme.onGradient,
      fontWeight: fontWeights.bold,
      fontSize: fontSizes.md,
    },
    // Без фона/рамки/тени — сам предмет на реальном фоне комнаты, без
    // декоративной плашки вокруг. Размер задаётся снаружи через RoomBox
    // (см. roomBoxToStyle) — картинка заполняет его целиком, 1:1 с реальными
    // пропорциями SVG, поэтому не обрезается и не растягивается.
    furnitureChip: {
      width: '100%',
      height: '100%',
      alignItems: 'center',
    },
    furnitureIconImage: {
      width: '100%',
      height: '100%',
    },
    // Пилюля-подсказка над ноутбуком/кроватью/копилкой (см. PetRoom.tsx
    // RoomLabelPill) — что это за место и (если есть) какой реальный бонус
    // даёт сейчас надетый предмет. Не привязана к roomBoxToStyle (не
    // картинка с реальными пропорциями) — самостоятельный UI-элемент.
    labelPill: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: withAlpha(theme.accent, 0.4),
      backgroundColor: withAlpha(theme.surface, 0.9),
      borderRadius: radius.full,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xxs,
    },
    labelPillText: {
      color: theme.accent,
      fontWeight: fontWeights.semibold,
    },
    labelPillBadge: {
      position: 'absolute',
      top: -10,
      right: -8,
      backgroundColor: colorPalettes.slate[900],
      borderRadius: radius.full,
      paddingHorizontal: spacing.xs,
      paddingVertical: 1,
    },
    labelPillBadgeText: {
      color: theme.onGradient,
      fontWeight: fontWeights.bold,
    },
  });
}
