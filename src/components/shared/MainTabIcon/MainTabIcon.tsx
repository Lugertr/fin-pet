// src/components/shared/MainTabIcon/MainTabIcon.tsx
// Иконка нижней вкладки: Ionicons или своя SVG («Копилка» — свинья,
// PigIcon). Общая для таб-бара и его копии в туре онбординга.

import { Ionicons } from '@expo/vector-icons';
import type { ColorValue } from 'react-native';

import type { MainTabConfig } from '@/constants/mainTabs';
import { PigIcon } from '../PigIcon';

export function MainTabIcon({
  icon,
  size,
  color,
}: {
  icon: MainTabConfig['icon'];
  size: number;
  color: ColorValue;
}) {
  if (icon === 'pig') return <PigIcon size={size} color={color} />;
  return <Ionicons name={icon} size={size} color={color} />;
}
