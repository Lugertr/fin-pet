// lib/hooks/useNotifications.ts
// React-хук для работы с уведомлениями

import { NotificationData, notifications } from '@/lib/services/notifications';
import { useRouter } from 'expo-router';
import { useCallback, useEffect } from 'react';

export function useNotifications() {
  const router = useRouter();

  // Обработка нажатий на уведомления
  useEffect(() => {
    const subscription = notifications.addResponseListener((data: NotificationData) => {
      // Роутинг в зависимости от типа уведомления
      switch (data?.type) {
        case 'daily_reminder':
        case 'streak_warning':
          router.push('/(tabs)' as never);
          break;
        case 'mood_restored':
          router.push('/(tabs)/lessons' as never);
          break;
        default:
          break;
      }
    });

    return () => subscription.remove();
  }, [router]);

  const scheduleMoodRestored = useCallback((minutesFromNow: number) => {
    notifications.scheduleMoodRestored(minutesFromNow);
  }, []);

  const showInstant = useCallback((title: string, body: string, data?: NotificationData) => {
    notifications.showInstant(title, body, data);
  }, []);

  return {
    scheduleMoodRestored,
    showInstant,
  };
}
