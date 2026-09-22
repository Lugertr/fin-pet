// src/components/profile/CompetencesModal/CompetencesModal.tsx
// Модалка компетенций с деталями по каждой ветке обучения

import { LinearGradient } from 'expo-linear-gradient';
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { Button } from '@/components/ui';
import { useResponsive, useTheme } from '@/theme';
import { spacing } from '@/theme/tokens';
import { createCompetencesModalStyles } from './CompetencesModal.styles';

export function CompetencesModal({
  visible,
  onClose,
  data,
}: {
  visible: boolean;
  onClose: () => void;
  data: { label: string; value: number }[];
}) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();

  const styles = createCompetencesModalStyles({ theme });

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
          <Text
            style={[
              styles.modalTitle,
              { fontSize: scaledFont('xxl'), marginBottom: scale(spacing.lg) },
            ]}
          >
            Ваши компетенции
          </Text>

          <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
            {data.map((item) => (
              <View key={item.label} style={styles.competenceRow}>
                <Text style={[styles.competenceName, { fontSize: scaledFont('md') }]}>
                  {item.label}
                </Text>
                <View style={styles.competenceRightRow}>
                  <View style={styles.competenceProgressBar}>
                    <LinearGradient
                      colors={theme.gradients.primary}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{ height: '100%', width: `${item.value}%` }}
                    />
                  </View>
                  <Text style={[styles.competencePercent, { fontSize: scaledFont('sm') }]}>
                    {item.value}%
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={{ marginTop: scale(spacing.xl) }}>
            <Button title="Закрыть" onPress={onClose} variant="primary" size="lg" />
          </View>
        </View>
      </View>
    </Modal>
  );
}
