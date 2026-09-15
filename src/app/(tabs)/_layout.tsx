// app/(tabs)/_layout.tsx
// Tab Navigator для основных экранов (4 таба)

import { COLORS } from '@/constants/theme';
import type { IconName } from '@/types/icons';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

type TabConfig = {
  name: string;
  title: string;
  icon: IconName;
};

const TABS: TabConfig[] = [
  { name: 'index', title: 'Хаб', icon: 'home' },
  { name: 'lessons', title: 'Уроки', icon: 'school' },
  { name: 'shop', title: 'Магазин', icon: 'cart' },
  { name: 'profile', title: 'Профиль', icon: 'person' },
];

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.surfaceLight,
          borderTopWidth: 1,
          height: 64,
          paddingTop: 8,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
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
