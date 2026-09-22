// lib/utils/alert.ts
// Замена react-native's Alert — та молча ничего не делает на react-native-web
// (Alert.alert там — буквально пустая функция), из-за чего любое действие,
// завязанное на подтверждение через Alert.alert (покупка, продажа, забрать
// подарок и т.п.), на вебе просто не срабатывало. Тот же вызов
// Alert.alert(title, message?, buttons?) — просто другой импорт, меняются
// только импорты в местах использования, не сами вызовы.

import { AlertButton, useAlertStore } from '@/lib/stores/alertStore';

export const Alert = {
  alert(title: string, message?: string, buttons?: AlertButton[]) {
    useAlertStore.getState().show(title, message, buttons);
  },
};
