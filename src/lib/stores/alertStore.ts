// lib/stores/alertStore.ts
// Состояние текущего alert-диалога — см. lib/utils/alert.ts и
// components/shared/AlertHost для того, почему это вообще нужно
// (react-native-web's Alert.alert — no-op, ни один Alert.alert(...) во всём
// приложении реально не показывался на вебе: диалог не появлялся, а значит
// и onPress его кнопок ("Купить", "Продать", "Забрать" и т.п.) никогда не
// срабатывал — по факту действие просто не происходило).

import { create } from 'zustand';

export interface AlertButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}

interface AlertState {
  visible: boolean;
  title: string;
  message?: string;
  buttons: AlertButton[];
  show: (title: string, message?: string, buttons?: AlertButton[]) => void;
  hide: () => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  visible: false,
  title: '',
  message: undefined,
  buttons: [],
  show: (title, message, buttons) =>
    set({
      visible: true,
      title,
      message,
      buttons: buttons && buttons.length > 0 ? buttons : [{ text: 'ОК' }],
    }),
  hide: () => set({ visible: false }),
}));
