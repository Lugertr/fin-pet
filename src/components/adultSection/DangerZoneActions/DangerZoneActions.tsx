// src/components/adultSection/DangerZoneActions/DangerZoneActions.tsx
// Опасная зона (§17.3): сброс и удаление профиля — только с подтверждением.

import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/ui/Text';

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
        style={[styles.dangerButton, { opacity: isBusy ? 0.6 : 1 }]}
      >
        <Text style={styles.dangerButtonText}>Удалить профиль</Text>
      </TouchableOpacity>

      <View style={[styles.lockCaption, { marginBottom: scale(spacing.xxxl) }]}>
        <Ionicons name="lock-closed" size={scale(12)} color={theme.textMuted} />
        <Text style={styles.lockCaptionText}>Раздел доступен только по PIN-коду родителя</Text>
      </View>
    </>
  );
}
