import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

/**
 * Все доступные имена иконок Ionicons
 * Извлекаем тип из пропсов компонента, чтобы избежать проблем с `keyof`
 */
export type IconName = ComponentProps<typeof Ionicons>['name'];
