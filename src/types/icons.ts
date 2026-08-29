// types/icons.ts
// Типизация иконок Ionicons

import { Ionicons } from '@expo/vector-icons';

/**
 * Все доступные имена иконок Ionicons
 */
export type IconName = keyof typeof Ionicons.glyphMap;
