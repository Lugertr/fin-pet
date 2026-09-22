// app/(auth)/_layout.tsx
// Layout для онбординга

import { Stack } from 'expo-router';

import { useTheme } from '@/theme';

export default function AuthLayout() {
  const { theme } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.background },
        animation: 'fade',
      }}
    >
      {/* Без свайпа назад — иначе можно смахнуть онбординг к пустому
          состоянию до профиля (см. корневой _layout.tsx). */}
      <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
    </Stack>
  );
}
