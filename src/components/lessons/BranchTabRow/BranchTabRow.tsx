// src/components/lessons/BranchTabRow/BranchTabRow.tsx
// Сегментированная лента вкладок-тем (веток): одна общая полоса-подложка
// (theme.surfaceLight), активный сегмент заливается цветом, без отдельных
// плавающих кнопок с тенью у каждой вкладки. Иконка + название темы +
// «X/Y» пройденных уроков. Тема активного «Приключения» — маленький
// бейдж-звезда (не только цветом, см. §23 «цвет не единственный носитель смысла»).

import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

import { ScrollableRow } from '@/components/ui/ScrollableRow';
import { Branch } from '@/lib/hooks/useLessons';
import { useAdventureStore } from '@/lib/stores/adventureStore';
import { useResponsive, useTheme } from '@/theme';
import { BRANCH_ICONS } from '../branchVisuals';
import { createBranchTabRowStyles } from './BranchTabRow.styles';

export function BranchTabRow({
  branches,
  selectedBranchId,
  onSelect,
  progressByBranch,
}: {
  branches: Branch[];
  selectedBranchId: number;
  onSelect: (branchId: number) => void;
  /** Пройдено/всего уроков по id темы. */
  progressByBranch: Record<number, { completed: number; total: number }>;
}) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  // Подписка на само значение, а не на функцию isActiveBranch (её ссылка
  // стабильна — звезда не обновилась бы при старте/завершении приключения).
  const adventureBranchId = useAdventureStore((s) =>
    s.currentAdventure?.status === 'active' ? s.currentAdventure.branchId : null
  );
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
          const branchProgress = progressByBranch[branch.id];
          return (
            <TouchableOpacity
              key={branch.id}
              onPress={() => onSelect(branch.id)}
              activeOpacity={0.8}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={
                branchProgress
                  ? `${branch.name}: пройдено ${branchProgress.completed} из ${branchProgress.total}`
                  : branch.name
              }
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
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.75}
              >
                {branch.name}
              </Text>
              {branchProgress && (
                <Text
                  style={[
                    isActive ? styles.progressActive : styles.progressInactive,
                    { fontSize: scaledFont('xxs') },
                  ]}
                >
                  {branchProgress.completed}/{branchProgress.total}
                </Text>
              )}
              {branch.id === adventureBranchId && (
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
