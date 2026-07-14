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
  const pet = useGameStore((s) => s.pet);
  const questNotifications = useGameStore((s) => s.settings.notifications.quests);
  const motivationNotifications = useGameStore((s) => s.settings.notifications.motivation);
  const reminderTime = useGameStore((s) => s.settings.reminderTime);
  const lastRewardAnimation = useGameStore((s) => s.lastRewardAnimation);
  const clearRewardAnimation = useGameStore((s) => s.clearRewardAnimation);

  useEffect(() => {
    if (!pet) return;

    (async () => {
      const granted = await registerForPushNotificationsAsync();
      if (!granted) return;

      if (questNotifications) {
        await scheduleDailyQuestReminder(reminderTime);
      }

      if (motivationNotifications) {
        await scheduleMotivationReminder();
      }
    })();
  }, [pet, questNotifications, motivationNotifications, reminderTime]);

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
        <Stack.Screen name="+not-found" />
      </Stack>
      {lastRewardAnimation && (
        <RewardAnimation animation={lastRewardAnimation} onClear={clearRewardAnimation} />
      )}
    </>
  );
}
