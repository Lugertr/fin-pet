// src/components/ui/CategoryTabs/CategoryTabs.tsx
// Горизонтальная строка вкладок-категорий — раньше shop.tsx и inventory.tsx
// держали почти идентичный блок (categoriesRow/categoryButton/...), отличаясь
// только цветовой схемой активной/неактивной вкладки без явной причины;
// здесь — единая схема на theme.primary/theme.surfaceLight.

import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity } from 'react-native';

import { ScrollableRow } from '@/components/ui/ScrollableRow';
import { useResponsive, useTheme } from '@/theme';
import { spacing } from '@/theme/tokens';
import type { IconName } from '@/types/icons';
import { createCategoryTabsStyles } from './CategoryTabs.styles';

export interface CategoryTabItem {
  id: string;
  name: string;
  icon: IconName;
}

interface CategoryTabsProps {
  categories: CategoryTabItem[];
  selected: string;
  onSelect: (id: string) => void;
}

export function CategoryTabs({ categories, selected, onSelect }: CategoryTabsProps) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const styles = createCategoryTabsStyles({ theme });

  return (
    <ScrollableRow contentContainerStyle={styles.row}>
      {categories.map((category) => {
        const isActive = category.id === selected;
        return (
          <TouchableOpacity
            key={category.id}
            onPress={() => onSelect(category.id)}
            activeOpacity={0.7}
            style={[
              styles.tab,
              isActive ? styles.tabActive : styles.tabInactive,
              {
                paddingHorizontal: scale(spacing.lg),
                paddingVertical: scale(spacing.sm),
                gap: scale(spacing.xs),
              },
            ]}
          >
            <Ionicons
              name={category.icon}
              size={scale(16)}
              color={isActive ? theme.onGradient : theme.textSecondary}
            />
            <Text
              style={[
                styles.text,
                isActive ? styles.textActive : styles.textInactive,
                { fontSize: scaledFont('md') },
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollableRow>
  );
}
