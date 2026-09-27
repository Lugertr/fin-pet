// src/components/adultSection/BranchProgressCard/BranchProgressCard.tsx
// Карточка "Пройденные темы" в разделе для взрослого.

import { View } from 'react-native';
import { Text } from '@/components/ui/Text';

import { BRANCHES, useLessonsStore } from '@/lib/hooks/useLessons';
import { useResponsive, useTheme } from '@/theme';
import { createAdultSectionCardsStyles } from '../adultSectionCards.styles';

export function BranchProgressCard() {
  const { theme } = useTheme();
  const { scaledFont } = useResponsive();
  const getBranchProgress = useLessonsStore((s) => s.getBranchProgress);
  const styles = createAdultSectionCardsStyles({ theme });

  return (
    <>
      <Text style={[styles.sectionTitle, { fontSize: scaledFont('lg') }]}>Пройденные темы</Text>
      <View style={styles.card}>
        {BRANCHES.map((branch) => {
          const { completed, total } = getBranchProgress(branch.id);
          return (
            <View key={branch.id} style={styles.branchRow}>
              <Text style={[styles.branchName, { fontSize: scaledFont('md') }]}>{branch.name}</Text>
              <Text style={[styles.branchProgress, { fontSize: scaledFont('sm') }]}>
                {completed} / {total}
              </Text>
            </View>
          );
        })}
      </View>
    </>
  );
}
