// src/components/lessons/BranchTabRow/BranchTabRow.tsx
// Сегментированная лента вкладок-веток: одна общая полоса-подложка
// (theme.surfaceLight), активный сегмент заливается цветом, без отдельных
// плавающих кнопок с тенью у каждой вкладки. Иконка + название ветки в две
// строки. Приоритетная ветка — маленький бейдж-звезда (не только цветом,
// см. §23 «цвет не единственный носитель смысла»).

import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

import { ScrollableRow } from '@/components/ui/ScrollableRow';
import { Branch } from '@/lib/hooks/useLessons';
import { usePreferencesStore } from '@/lib/stores/preferencesStore';
import { useResponsive, useTheme } from '@/theme';
import { BRANCH_ICONS } from '../branchVisuals';
import { createBranchTabRowStyles } from './BranchTabRow.styles';

export function BranchTabRow({
  branches,
  selectedBranchId,
  onSelect,
}: {
  branches: Branch[];
  selectedBranchId: number;
  onSelect: (branchId: number) => void;
}) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const isPriorityBranch = usePreferencesStore((s) => s.isPriorityBranch);
  const styles = createBranchTabRowStyles({ theme });

  return (
    <View style={styles.container}>
      {/* bar — как contentContainerStyle, не как стиль вложенного View: только
          так minWidth:'100%' в нём резолвится от реальной ширины вьюпорта
          скролла, а не от неопределённого (сайз-по-контенту) родителя —
          см. комментарий у bar в BranchTabRow.styles.ts. */}
      <ScrollableRow contentContainerStyle={styles.bar}>
        {branches.map((branch) => {
          const isActive = branch.id === selectedBranchId;
          return (
            <TouchableOpacity
              key={branch.id}
              onPress={() => onSelect(branch.id)}
              activeOpacity={0.8}
              style={[styles.segment, isActive ? styles.segmentActive : styles.segmentInactive]}
            >
              <Ionicons
                name={BRANCH_ICONS[branch.id] ?? 'book'}
                size={scale(22)}
                color={isActive ? theme.onGradient : theme.textSecondary}
              />
              <Text
                style={[
                  isActive ? styles.labelActive : styles.labelInactive,
                  { fontSize: scaledFont('xxs') },
                ]}
                numberOfLines={2}
              >
                {branch.name}
              </Text>
              {isPriorityBranch(branch.id) && (
                <View style={styles.priorityBadge}>
                  <Ionicons name="star" size={scale(11)} color={theme.onGradient} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollableRow>
    </View>
  );
}
