// lib/services/notifications.ts
// Сервис для управления локальными push-уведомлениями
// Совместим с expo-notifications SDK 57+

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Типы данных, передаваемых через уведомления
export interface NotificationData {
  type: string;
  depositId?: number;
  [key: string]: string | number | boolean | undefined;
}

// ID для разных типов уведомлений
export const NOTIFICATION_IDS = {
  DAILY_REMINDER: 'daily-reminder',
  STREAK_WARNING: 'streak-warning',
  MOOD_RESTORED: 'mood-restored',
  DEPOSIT_MATURE: 'deposit-mature',
} as const;

// Настройка обработки уведомлений в foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

class NotificationService {
  private isEnabled: boolean = true;

  /**
   * Запросить разрешения на уведомления
   */
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') return false;

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();

      if (existingStatus === 'granted') {
        return true;
      }

      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
          allowDisplayInCarPlay: false,
          allowCriticalAlerts: false,
          provideAppNotificationSettings: false,
        },
      });

      return status === 'granted';
    } catch (error) {
      console.error('[Notifications] Ошибка запроса разрешений:', error);
      return false;
    }
  }

  /**
   * Инициализация и планирование всех стандартных уведомлений
   */
  async initialize(): Promise<void> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      console.warn('[Notifications] Разрешения не получены');
      return;
    }

    await this.scheduleDailyReminder();
    await this.scheduleStreakWarning();
  }

  /**
   * Ежедневное напоминание (каждый день в 10:00)
   */
  async scheduleDailyReminder(): Promise<void> {
    if (!this.isEnabled) return;

    try {
      await this.cancelNotification(NOTIFICATION_IDS.DAILY_REMINDER);

      await Notifications.scheduleNotificationAsync({
        identifier: NOTIFICATION_IDS.DAILY_REMINDER,
        content: {
          title: '🎁 Ежедневная награда ждёт!',
          body: 'Зайди в Финни и забери монеты. Не прерывай стрик!',
          data: { type: 'daily_reminder' },
          sound: 'default',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: 10,
          minute: 0,
          // Убрали repeats: true — DailyTriggerInput по умолчанию повторяется
        },
      });
    } catch (error) {
      console.error('[Notifications] Ошибка планирования daily:', error);
    }
  }

  /**
   * Предупреждение о стрике (каждый день в 20:00)
   */
  async scheduleStreakWarning(): Promise<void> {
    if (!this.isEnabled) return;

    try {
      await this.cancelNotification(NOTIFICATION_IDS.STREAK_WARNING);

      await Notifications.scheduleNotificationAsync({
        identifier: NOTIFICATION_IDS.STREAK_WARNING,
        content: {
          title: '🔥 Не потеряй стрик!',
          body: 'Зайди сегодня, чтобы сохранить серию и получить награду.',
          data: { type: 'streak_warning' },
          sound: 'default',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: 20,
          minute: 0,
          // Убрали repeats: true — DailyTriggerInput по умолчанию повторяется
        },
      });
    } catch (error) {
      console.error('[Notifications] Ошибка планирования streak:', error);
    }
  }

  /**
   * Уведомление о восстановлении настроения
   * (вызывается после штрафа, с задержкой на время восстановления)
   */
  async scheduleMoodRestored(minutesFromNow: number): Promise<void> {
    if (!this.isEnabled) return;

    try {
      await this.cancelNotification(NOTIFICATION_IDS.MOOD_RESTORED);

      await Notifications.scheduleNotificationAsync({
        identifier: NOTIFICATION_IDS.MOOD_RESTORED,
        content: {
          title: '😊 Питомец снова в форме!',
          body: 'Энергия восстановилась. Можно продолжать приключение!',
          data: { type: 'mood_restored' },
          sound: 'default',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: Math.max(1, minutesFromNow * 60),
          repeats: false,
        },
      });
    } catch (error) {
      console.error('[Notifications] Ошибка планирования mood:', error);
    }
  }

  /**
   * Уведомление о завершении вклада
   */
  async scheduleDepositMature(depositId: number, daysUntilMature: number): Promise<void> {
    if (!this.isEnabled) return;

    try {
      const identifier = `${NOTIFICATION_IDS.DEPOSIT_MATURE}-${depositId}`;

      await this.cancelNotification(identifier);

      await Notifications.scheduleNotificationAsync({
        identifier,
        content: {
          title: '💰 Вклад созрел!',
          body: 'Можно забрать тело вклада + проценты.',
          data: { type: 'deposit_mature', depositId },
          sound: 'default',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: Math.max(1, daysUntilMature * 24 * 60 * 60),
          repeats: false,
        },
      });
    } catch (error) {
      console.error('[Notifications] Ошибка планирования deposit:', error);
    }
  }

  /**
   * Отменить уведомление по ID
   */
  async cancelNotification(identifier: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
    } catch {
      // Игнорируем ошибки отмены
    }
  }

  /**
   * Отменить все уведомления
   */
  async cancelAll(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('[Notifications] Ошибка отмены всех:', error);
    }
  }

  /**
   * Показать мгновенное уведомление (без планирования)
   * В новых версиях expo-notifications используется scheduleNotificationAsync с trigger: null
   */
  async showInstant(title: string, body: string, data?: NotificationData): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: 'default',
        },
        trigger: null, // null = мгновенный показ
      });
    } catch (error) {
      console.error('[Notifications] Ошибка показа:', error);
    }
  }

  /**
   * Подписаться на получение уведомлений
   */
  addNotificationListener(callback: (data: NotificationData) => void): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener((notification) => {
      const data = notification.request.content.data as NotificationData;
      callback(data);
    });
  }

  /**
   * Подписаться на нажатия по уведомлениям
   */
  addResponseListener(callback: (data: NotificationData) => void): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as NotificationData;
      callback(data);
    });
  }

  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (!enabled) {
      this.cancelAll();
    }
  }
}

export const notifications = new NotificationService();
