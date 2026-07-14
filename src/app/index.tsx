import { useGameStore } from '@/app/providers/store';
import { Redirect } from 'expo-router';

export default function Index() {
  const isOnboarded = useGameStore((state) => state.isOnboarded);

  if (!isOnboarded) {
    return <Redirect href="/auth/welcome" />;
  }

  return <Redirect href="/tabs" />;
}
