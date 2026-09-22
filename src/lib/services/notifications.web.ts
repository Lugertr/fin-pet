// lib/services/notifications.web.ts
// Веб-версия: expo-notifications на web не поддерживает push-токены и сам
// сервис уведомлений реально не используется (см. requestPermissions() в
// notifications.ts — на web всегда false, все методы уже были no-op).
// Проблема в другом: сам факт импорта expo-notifications на web запускает
// её внутренний DevicePushTokenAutoRegistration.fx (глобальный побочный
// эффект при загрузке модуля) и логирует предупреждение "Listening to push
// token changes is not yet fully supported on web" ещё до вызова любого
// нашего кода. Metro сам подхватывает .web.ts вместо .ts при сборке под web
// (см. LessonsBackground.web.tsx), поэтому здесь просто не импортируем
// expo-notifications вообще — теми же именами, что в notifications.ts.

export interface NotificationData {
  type: string;
  [key: string]: string | number | boolean | undefined;
}

export const NOTIFICATION_IDS = {
  DAILY_REMINDER: 'daily-reminder',
  STREAK_WARNING: 'streak-warning',
  MOOD_RESTORED: 'mood-restored',
} as const;

interface NotificationSubscription {
  remove: () => void;
}

class NotificationService {
  async requestPermissions(): Promise<boolean> {
    return false;
  }

  async initialize(): Promise<void> {}

  async scheduleDailyReminder(): Promise<void> {}

  async scheduleStreakWarning(): Promise<void> {}

  async scheduleMoodRestored(_minutesFromNow: number): Promise<void> {}

  async cancelNotification(_identifier: string): Promise<void> {}

  async cancelAll(): Promise<void> {}

  async showInstant(_title: string, _body: string, _data?: NotificationData): Promise<void> {}

  addNotificationListener(_callback: (data: NotificationData) => void): NotificationSubscription {
    return { remove: () => {} };
  }

  addResponseListener(_callback: (data: NotificationData) => void): NotificationSubscription {
    return { remove: () => {} };
  }

  setEnabled(_enabled: boolean): void {}
}

export const notifications = new NotificationService();
