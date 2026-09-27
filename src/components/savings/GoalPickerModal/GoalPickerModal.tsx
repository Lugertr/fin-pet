// src/components/savings/GoalPickerModal/GoalPickerModal.tsx
// Выбор цели накопления в «Копилке» — те же карточки, что и «Выбери первую
// цель» в онбординге (GoalOptionCard). Копить можно только на улучшения
// ноутбука, копилки и кровати (решение пользователя 27.09.2026), которых ещё
// нет в инвентаре (список передаёт вызывающий — useSavingsGoalGate).
// required — обязательный выбор (RequiredGoalPicker, решение пользователя
// 28.09.2026): закрыть окно нельзя ни фоном, ни кнопкой «назад» — только
// выбрать цель. Если цель только что достигнута — окно сначала поздравляет.

import { FlatList, Modal, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/ui/Text';

import { goalCompletionBonus } from '@/domain/savings/Savings';
import { ShopItem } from '@/lib/hooks/useShop';
import { formatPrice } from '@/lib/utils/formatters';
import { useResponsive, useTheme } from '@/theme';
import { GoalOptionCard } from '../GoalOptionCard';
import { createGoalPickerModalStyles } from './GoalPickerModal.styles';

const NO_OP = () => {};

export function GoalPickerModal({
  visible,
  goals,
  onClose,
  onPick,
  selectedId,
  required = false,
  completedItem = null,
  saved = 0,
}: {
  visible: boolean;
  /** Цели, которые ещё можно купить. */
  goals: ShopItem[];
  /** Не нужен при required — такое окно не закрывается без выбора. */
  onClose?: () => void;
  onPick: (item: ShopItem) => void;
  /** Текущая цель — отмечена галочкой. */
  selectedId?: number | null;
  required?: boolean;
  /** Только что достигнутая цель — заголовок-поздравление. */
  completedItem?: ShopItem | null;
  /** Сколько уже в банке — подсказка, что эти монеты пойдут на новую цель. */
  saved?: number;
}) {
  const { theme } = useTheme();
  const { scaledFont } = useResponsive();
  const styles = createGoalPickerModalStyles({ theme });
  const close = required ? NO_OP : (onClose ?? NO_OP);

  const title = completedItem
    ? 'Цель достигнута! 🎉'
    : required
      ? 'Выбери, на что копить'
      : 'Выбери цель';
  const subtitle = completedItem
    ? `«${completedItem.name}» теперь в инвентаре, а в «Хочу» пришло ещё +${formatPrice(goalCompletionBonus(completedItem.price))}. Выбери следующую цель.`
    : required
      ? 'Без цели копить не на что. Выбери улучшение ноутбука, копилки или кровати — у них есть бонусы. Когда накопишь, вещь станет твоей.'
      : 'Копить можно на улучшения ноутбука, копилки и кровати — у них есть бонусы. Когда накопишь, вещь появится в инвентаре.';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
      <View style={styles.modalOverlay}>
        {required ? (
          <View style={styles.backdrop} />
        ) : (
          <TouchableOpacity
            style={styles.backdrop}
            onPress={close}
            accessibilityRole="button"
            accessibilityLabel="Закрыть выбор цели"
          />
        )}
        <View style={styles.modalContent}>
          <Text
            style={[styles.modalTitle, { fontSize: scaledFont('xl') }]}
            accessibilityRole="header"
          >
            {title}
          </Text>
          <Text style={[styles.modalSubtitle, { fontSize: scaledFont('md') }]}>{subtitle}</Text>
          {required && saved > 0 && (
            <Text style={[styles.savedNote, { fontSize: scaledFont('md') }]}>
              В «Коплю» уже {formatPrice(saved)} — они пойдут на новую цель.
            </Text>
          )}
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
