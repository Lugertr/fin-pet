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
    // Измеряющая/центрирующая обёртка — занимает всё доступное место
    // (как раньше), но сама по себе больше не рисует ни фона, ни рамки:
    // это делает roomBox ниже, вписанный в неё с фиксированным aspect
    // ratio (см. PetRoom.tsx, ROOM_ASPECT_RATIO).
    container: {
      flex: 1,
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    // Сама сцена комнаты — фиксированные width/height (4:3, задаются
    // инлайн в PetRoom.tsx по факту измерения container), поэтому все
    // %-координаты предметов (roomBoxToStyle) всегда относятся к одному и
    // тому же прямоугольнику независимо от размера экрана.
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
    // Хитбокс кликабельных мест (ноутбук/копилка) — заполняет ровно тот
    // прямоугольник, что задан RoomBox этого места в раскладке, без зазора
    // между видимой картинкой и тем, где реально регистрируется тап.
    fillTouchable: {
      width: '100%',
      height: '100%',
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
    moodIndicatorContainer: {
      position: 'absolute',
      left: spacing.lg,
      right: spacing.lg,
      bottom: spacing.md,
    },
    // Заполняет весь свой контейнер (100%/100% места из раскладки) — размер
    // задаётся снаружи через RoomBox, не здесь.
    furnitureChip: {
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.lg,
      borderWidth: 1,
    },
    furnitureIconImage: {
      width: '55%',
      height: '55%',
    },
    furnitureLabel: {
      color: theme.textPrimary,
      fontWeight: fontWeights.semibold,
      textAlign: 'center',
      marginTop: spacing.xxs,
      maxWidth: '90%',
    },
  });
}
