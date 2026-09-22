// app/index.tsx
// Точка входа: гидратирует профиль из SQLite и решает, показывать онбординг
// или сразу хаб. До этого момента онбординг/хаб не выбирались явно нигде —
// раньше это было неопределённым поведением роутера.

import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { useAppBootstrap } from '@/lib/hooks/useAppBootstrap';
import { useUserStore } from '@/lib/stores/userStore';
import { useTheme } from '@/theme';

export default function Index() {
  const isReady = useAppBootstrap();
  const isOnboarded = useUserStore((state) => state.isOnboarded);
  const { theme } = useTheme();

  if (!isReady) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.background,
        }}
      >
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return <Redirect href={isOnboarded ? '/(tabs)' : '/(auth)/onboarding'} />;
}
