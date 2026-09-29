// constants/mainTabs.ts
// Нижние вкладки приложения — одна конфигурация для таб-бара
// ((tabs)/_layout.tsx) и его копии в туре онбординга (OnboardingRoomTour).
// Хаб — самый левый (решение пользователя 29.09.2026), остальные — в прежнем
// порядке.

import type { IconName } from '@/types/icons';

/** Своя иконка вместо Ionicons — SVG из assets/icons (см. MainTabIcon). */
export type CustomTabIcon = 'pig';

export interface MainTabConfig {
  name: 'lessons' | 'savings' | 'index' | 'shop' | 'profile';
  title: string;
  icon: IconName | CustomTabIcon;
}

export const MAIN_TABS: MainTabConfig[] = [
  { name: 'index', title: 'Хаб', icon: 'home' },
  { name: 'lessons', title: 'Уроки', icon: 'school' },
  // Пока на месте ИИ-помощника (решение пользователя 27.09.2026): его экран
  // (tabs)/ai-chat остаётся в коде, но скрыт из панели (см. (tabs)/_layout.tsx).
  // Иконка — свинья-копилка из assets/icons/pig.svg (решение 29.09.2026).
  { name: 'savings', title: 'Копилка', icon: 'pig' },
  { name: 'shop', title: 'Магазин', icon: 'cart' },
  { name: 'profile', title: 'Прогресс', icon: 'stats-chart' },
];
