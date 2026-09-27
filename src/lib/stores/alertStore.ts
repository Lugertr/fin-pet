// lib/stores/alertStore.ts
// Состояние текущего alert-диалога — см. lib/utils/alert.ts и
// components/shared/AlertHost для того, почему это вообще нужно
// (react-native-web's Alert.alert — no-op, ни один Alert.alert(...) во всём
// приложении реально не показывался на вебе: диалог не появлялся, а значит
// и onPress его кнопок ("Купить", "Продать", "Забрать" и т.п.) никогда не
// срабатывал — по факту действие просто не происходило).

import { create } from 'zustand';

import type { IconName } from '@/types/icons';

export interface AlertButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}

/** Необязательные детали оформления для диалогов-подтверждений (2+ кнопки) —
 * см. AlertHost.tsx. Без них диалог всё равно получает разумные значения по
 * умолчанию (иконку/цвет по наличию destructive-кнопки), просто без
 * собственной цветной плашки-лейбла. */
export interface AlertOptions {
  icon?: IconName;
  badgeLabel?: string;
  badgeVariant?: 'error' | 'warning' | 'info';
}

interface AlertState extends AlertOptions {
  visible: boolean;
  title: string;
  message?: string;
  buttons: AlertButton[];
  show: (title: string, message?: string, buttons?: AlertButton[], options?: AlertOptions) => void;
  hide: () => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  visible: false,
  title: '',
  message: undefined,
  buttons: [],
  icon: undefined,
  badgeLabel: undefined,
  badgeVariant: undefined,
  show: (title, message, buttons, options) =>
    set({
      visible: true,
      title,
      message,
      buttons: buttons && buttons.length > 0 ? buttons : [{ text: 'ОК' }],
      icon: options?.icon,
      badgeLabel: options?.badgeLabel,
      badgeVariant: options?.badgeVariant,
    }),
  hide: () => set({ visible: false }),
}));
