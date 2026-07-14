import { useGameStore } from '@/app/providers/store';
import { Link } from 'expo-router';
import { Text, View } from 'react-native';

export default function NotFound() {
  const isOnboarded = useGameStore((s) => s.isOnboarded);
  const href = isOnboarded ? '/tabs' : '/auth/welcome';

  return (
    <View className="flex-1 bg-background items-center justify-center px-6">
      <Text className="text-7xl mb-4">🔍</Text>
      <Text className="text-2xl font-bold text-text mb-2">Страница не найдена</Text>
      <Text className="text-base text-gray-500 text-center mb-8">
        Похоже, такой страницы не существует
      </Text>
      <Link href={href} asChild>
        <Text className="bg-primary text-white px-6 py-3 rounded-xl font-semibold active:opacity-80">
          На главную
        </Text>
      </Link>
    </View>
  );
}
