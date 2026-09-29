// app/(tabs)/_layout.tsx
// Tab Navigator для основных экранов (5 табов, порядок — constants/mainTabs:
// Хаб слева). Хаб — всегда комната; экран смены — отдельный
// ((modal)/adventure), туда ведёт кнопка на хабе.

import { Tabs } from 'expo-router';

import { MainTabIcon } from '@/components/shared';
import { MAIN_TABS } from '@/constants/mainTabs';
import { useEnergyTicker } from '@/lib/pet/useEnergyTicker';
import { useTheme } from '@/theme';
import { fontFamilies } from '@/theme/fonts';

export default function TabsLayout() {
  const { theme } = useTheme();
  // ⚡ в общей шапке растёт сама, пока открыта любая вкладка (§6.3).
  useEnergyTicker();
  const tabs = MAIN_TABS;

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
          // Подписи вкладок рисует React Navigation, не наш Text — шрифт явно.
          fontFamily: fontFamilies.semibold,
          fontWeight: 'normal',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
      }}
    >
      {/* ИИ-помощник пока скрыт из панели — на его месте «Копилка». Экран
          остаётся (href: null — без вкладки), чтобы вернуть его одной строкой. */}
      <Tabs.Screen name="ai-chat" options={{ href: null }} />
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color, size }) => (
              <MainTabIcon icon={tab.icon} size={size} color={color} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
