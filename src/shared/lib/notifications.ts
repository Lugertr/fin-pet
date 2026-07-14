import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotificationsAsync(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  return true;
}

export async function scheduleDailyQuestReminder(time: string = '18:00'): Promise<string | null> {
  try {
    const [hours, minutes] = time.split(':').map(Number);

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: '📚 Новые задания ждут!',
        body: 'Выполни задания сегодня и заработай монеты для питомца',
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: hours,
        minute: minutes,
      },
    });

    return id;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return null;
  }
}

export async function scheduleMotivationReminder(): Promise<string | null> {
  try {
    const messages = [
      {
        title: '😢 Питомец скучает!',
        body: 'Ты не заходил уже несколько дней. Загляни в приложение!',
      },
      {
        title: '💰 Новые задания!',
        body: 'Сегодня можно заработать монеты. Не упусти шанс!',
      },
      {
        title: '🎮 Приключение ждёт!',
        body: 'Отправь питомца в путешествие и получи награду',
      },
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: randomMessage.title,
        body: randomMessage.body,
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 60 * 60 * 24 * 2,
      },
    });

    return id;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return null;
  }
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function showImmediateNotification(title: string, body: string): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: 'default' },
    trigger: null,
  });
}
