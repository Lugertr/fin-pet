// app/(tabs)/_layout.tsx
// Tab Navigator для основных экранов (4 таба)

import type { IconName } from '@/types/icons';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import { useTheme } from '@/theme';
import { fontWeights } from '@/theme/tokens';

type TabConfig = {
  name: string;
  title: string;
  icon: IconName;
};

const TABS: TabConfig[] = [
  { name: 'lessons', title: 'Уроки', icon: 'school' },
  { name: 'ai-chat', title: 'ИИ-помощник', icon: 'chatbubbles' },
  { name: 'index', title: 'Хаб', icon: 'home' },
  { name: 'shop', title: 'Магазин', icon: 'cart' },
  { name: 'profile', title: 'Настройки', icon: 'settings-outline' },
];

export default function TabsLayout() {
  const { theme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.surfaceLight,
          borderTopWidth: 1,
          height: 64,
          paddingTop: 8,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: fontWeights.semibold,
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color, size }) => <Ionicons name={tab.icon} size={size} color={color} />,
          }}
        />
      ))}
    </Tabs>
  );
}
