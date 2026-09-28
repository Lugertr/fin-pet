// app/index.tsx
// Точка входа «/»: онбординг или сразу хаб. Профиль к этому моменту уже
// загружен из SQLite — запуск приложения (useAppBootstrap) живёт в корневом
// layout (app/_layout.tsx), чтобы его не пропускали и прямые ссылки.

import { Redirect } from 'expo-router';

import { useUserStore } from '@/lib/stores/userStore';

export default function Index() {
  const isOnboarded = useUserStore((state) => state.isOnboarded);
  return <Redirect href={isOnboarded ? '/(tabs)' : '/(auth)/onboarding'} />;
}
