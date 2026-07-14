import { useGameStore } from '@/app/providers/store';
import {
  registerForPushNotificationsAsync,
  scheduleDailyQuestReminder,
  scheduleMotivationReminder,
} from '@/shared/lib/notifications';
import { RewardAnimation } from '@/widgets/reward-animation';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import './styles/global.css';

export default function RootLayout() {
  const { pet, settings, lastRewardAnimation, clearRewardAnimation } = useGameStore();

  useEffect(() => {
    if (!pet) return;

    (async () => {
      const granted = await registerForPushNotificationsAsync();
      if (!granted) return;

      if (settings.notifications.quests) {
        await scheduleDailyQuestReminder(settings.reminderTime);
      }

      if (settings.notifications.motivation) {
        await scheduleMotivationReminder();
      }
    })();
  }, [
    pet,
    settings.notifications.quests,
    settings.notifications.motivation,
    settings.reminderTime,
  ]);

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="auth" />
        <Stack.Screen name="tabs" />
        <Stack.Screen name="index" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="diary" />
        <Stack.Screen name="adventures" />
        <Stack.Screen name="dev" />
      </Stack>
      <RewardAnimation animation={lastRewardAnimation} onClear={clearRewardAnimation} />
    </>
  );
}
