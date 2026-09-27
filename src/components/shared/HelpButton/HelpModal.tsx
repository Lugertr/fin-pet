// src/components/shared/HelpButton/HelpModal.tsx
// Окно подсказки по экрану: заголовок, короткие пункты с эмодзи, «Понятно».
// Карточка по центру фиксированной ширины (не растягивается на планшете).

import { Ionicons } from '@expo/vector-icons';
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import type { ScreenHelpContent } from '@/domain/content/ReferenceContent';
import { useResponsive, useTheme } from '@/theme';
import { createHelpModalStyles } from './HelpModal.styles';

export function HelpModal({ help, onClose }: { help: ScreenHelpContent; onClose: () => void }) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const styles = createHelpModalStyles({ theme });

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Закрыть подсказку"
        />
        <View style={styles.card}>
          <View style={styles.titleRow}>
            <Ionicons name="help-circle" size={scale(28)} color={theme.primary} />
            <Text style={[styles.title, { fontSize: scaledFont('xl') }]}>{help.title}</Text>
          </View>

          <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
            {help.items.map((item, index) => (
              <View key={index} style={styles.item}>
                <Text style={[styles.emoji, { fontSize: scaledFont('xl') }]} aria-hidden>
                  {item.emoji}
                </Text>
                <Text style={[styles.itemText, { fontSize: scaledFont('lg') }]}>{item.text}</Text>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.85}
            style={styles.okButton}
            accessibilityRole="button"
            accessibilityLabel="Понятно"
          >
            <Text style={[styles.okText, { fontSize: scaledFont('lg') }]}>Понятно</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
