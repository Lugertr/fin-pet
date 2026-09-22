// src/components/savings/GoalPickerModal/GoalPickerModal.tsx
// Модалка выбора цели накопления — список товаров из каталога магазина.

import { Ionicons } from '@expo/vector-icons';
import { FlatList, Modal, Text, TouchableOpacity, View } from 'react-native';

import { SHOP_CATALOG, ShopItem } from '@/lib/hooks/useShop';
import { formatCoins } from '@/lib/utils/formatters';
import { useResponsive, useTheme } from '@/theme';
import { createGoalPickerModalStyles } from './GoalPickerModal.styles';

export function GoalPickerModal({
  visible,
  onClose,
  onPick,
}: {
  visible: boolean;
  onClose: () => void;
  onPick: (item: ShopItem) => void;
}) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const styles = createGoalPickerModalStyles({ theme });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          onPress={onClose}
        />
        <View style={styles.modalContent}>
          <Text style={[styles.modalTitle, { fontSize: scaledFont('xl') }]}>Выберите цель</Text>
          <FlatList
            data={SHOP_CATALOG}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => onPick(item)} style={styles.goalItemRow}>
                <Text style={styles.goalItemIcon}>{item.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.goalItemName, { fontSize: scaledFont('md') }]}>
                    {item.name}
                  </Text>
                  <Text style={[styles.goalItemPrice, { fontSize: scaledFont('sm') }]}>
                    {formatCoins(item.price)}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={scale(18)} color={theme.textMuted} />
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );
}
