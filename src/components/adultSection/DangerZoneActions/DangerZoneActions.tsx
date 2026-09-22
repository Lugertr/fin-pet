// src/components/adultSection/DangerZoneActions/DangerZoneActions.tsx
// Опасная зона (§17.3): сброс и удаление профиля — только с подтверждением.

import { Text, TouchableOpacity } from 'react-native';

import { useResponsive, useTheme } from '@/theme';
import { spacing } from '@/theme/tokens';
import { createAdultSectionCardsStyles } from '../adultSectionCards.styles';

export function DangerZoneActions({
  isBusy,
  onResetProfile,
  onDeleteProfile,
}: {
  isBusy: boolean;
  onResetProfile: () => void;
  onDeleteProfile: () => void;
}) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const styles = createAdultSectionCardsStyles({ theme });

  return (
    <>
      <Text style={[styles.sectionTitle, { fontSize: scaledFont('lg') }]}>Профиль</Text>
      <TouchableOpacity
        onPress={onResetProfile}
        disabled={isBusy}
        activeOpacity={0.8}
        style={[styles.neutralButton, { opacity: isBusy ? 0.6 : 1 }]}
      >
        <Text style={styles.neutralButtonText}>Сбросить профиль</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onDeleteProfile}
        disabled={isBusy}
        activeOpacity={0.8}
        style={[
          styles.dangerButton,
          { opacity: isBusy ? 0.6 : 1, marginBottom: scale(spacing.xxxl) },
        ]}
      >
        <Text style={styles.dangerButtonText}>Удалить профиль</Text>
      </TouchableOpacity>
    </>
  );
}
