// src/components/savings/GoalPickerModal/GoalPickerModal.tsx
// Выбор цели накопления в «Копилке» — те же карточки, что и «Выбери первую
// цель» в онбординге (GoalOptionCard). Копить можно только на улучшения
// ноутбука, копилки и кровати (решение пользователя 27.09.2026).

import { FlatList, Modal, Text, TouchableOpacity, View } from 'react-native';

import { ShopItem } from '@/lib/hooks/useShop';
import { getSavingsGoalItems } from '@/lib/savings/goalOptions';
import { useResponsive, useTheme } from '@/theme';
import { GoalOptionCard } from '../GoalOptionCard';
import { createGoalPickerModalStyles } from './GoalPickerModal.styles';

export function GoalPickerModal({
  visible,
  onClose,
  onPick,
  selectedId,
}: {
  visible: boolean;
  onClose: () => void;
  onPick: (item: ShopItem) => void;
  /** Текущая цель — отмечена галочкой. */
  selectedId?: number | null;
}) {
  const { theme } = useTheme();
  const { scaledFont } = useResponsive();
  const styles = createGoalPickerModalStyles({ theme });
  const goals = getSavingsGoalItems();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.backdrop}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Закрыть выбор цели"
        />
        <View style={styles.modalContent}>
          <Text style={[styles.modalTitle, { fontSize: scaledFont('xl') }]}>Выбери цель</Text>
          <Text style={[styles.modalSubtitle, { fontSize: scaledFont('md') }]}>
            Копить можно на улучшения ноутбука, копилки и кровати — у них есть бонусы. Когда
            накопишь, вещь появится в комнате.
          </Text>
          <FlatList
            data={goals}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <GoalOptionCard
                item={item}
                selected={item.id === selectedId}
                onPress={() => onPick(item)}
              />
            )}
          />
        </View>
      </View>
    </Modal>
  );
}
