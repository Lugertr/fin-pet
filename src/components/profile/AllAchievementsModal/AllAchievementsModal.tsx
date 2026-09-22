// src/components/profile/AllAchievementsModal/AllAchievementsModal.tsx
// Полный список всех 12 достижений — сеткой, открывается по ссылке
// «Все (X/Y)» из MedalsPreview. Структура модалки — по образцу CompetencesModal.

import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { Button } from '@/components/ui';
import { AchievementDefinition, UserAchievementRecord } from '@/domain/achievement/Achievement';
import { useResponsive, useTheme } from '@/theme';
import { spacing } from '@/theme/tokens';
import { AchievementCard } from '../AchievementCard';
import { createAllAchievementsModalStyles } from './AllAchievementsModal.styles';

export function AllAchievementsModal({
  visible,
  onClose,
  definitions,
  userAchievements,
  onClaim,
}: {
  visible: boolean;
  onClose: () => void;
  definitions: AchievementDefinition[];
  userAchievements: Record<number, UserAchievementRecord>;
  onClaim: (id: number) => { success: boolean; message: string };
}) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const styles = createAllAchievementsModalStyles({ theme });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          onPress={onClose}
        />

        <View
          style={[
            styles.modalContent,
            { padding: scale(spacing.xxl), paddingTop: scale(spacing.xxxl), maxHeight: '80%' },
          ]}
        >
          <Text style={[styles.modalTitle, { fontSize: scaledFont('xxl') }]}>Все достижения</Text>

          <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
            <View style={styles.grid}>
              {definitions.map((def) => (
                <AchievementCard
                  key={def.id}
                  def={def}
                  status={userAchievements[def.id]}
                  onClaim={onClaim}
                />
              ))}
            </View>
          </ScrollView>

          <View style={{ marginTop: scale(spacing.xl) }}>
            <Button title="Закрыть" onPress={onClose} variant="primary" size="lg" />
          </View>
        </View>
      </View>
    </Modal>
  );
}
