// constants/mainTabs.ts
// Нижние вкладки приложения — одна конфигурация для таб-бара
// ((tabs)/_layout.tsx) и его копии в туре онбординга (OnboardingRoomTour).

import type { IconName } from '@/types/icons';

export interface MainTabConfig {
  name: 'lessons' | 'savings' | 'index' | 'shop' | 'profile';
  title: string;
  icon: IconName;
}

export const MAIN_TABS: MainTabConfig[] = [
  { name: 'lessons', title: 'Уроки', icon: 'school' },
  // Пока на месте ИИ-помощника (решение пользователя 27.09.2026): его экран
  // (tabs)/ai-chat остаётся в коде, но скрыт из панели (см. (tabs)/_layout.tsx).
  { name: 'savings', title: 'Копилка', icon: 'wallet' },
  { name: 'index', title: 'Хаб', icon: 'home' },
  { name: 'shop', title: 'Магазин', icon: 'cart' },
  { name: 'profile', title: 'Прогресс', icon: 'stats-chart' },
];
