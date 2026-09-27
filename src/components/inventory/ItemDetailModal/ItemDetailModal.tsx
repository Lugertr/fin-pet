// src/components/inventory/ItemDetailModal/ItemDetailModal.tsx
// Модалка с деталями предмета — реальные действия (§12.1, §12.4)

import { Modal, Text, TouchableOpacity, View } from 'react-native';

import { ItemImage } from '@/components/shared';
import { useShallow } from 'zustand/react/shallow';

import { useFeedback } from '@/lib/hooks/useFeedback';
import { Alert } from '@/lib/utils/alert';
import { FURNITURE_CATEGORIES, FurnitureCategory, useShopStore } from '@/lib/hooks/useShop';
import { formatPrice } from '@/lib/utils/formatters';
import { getEffectDescription } from '@/lib/utils/shopItems';
import { equipSkin, unequipSkinIfSold } from '@/lib/pet/petSkin';
import { usePetStore } from '@/lib/stores/petStore';
import { useResponsive, useTheme } from '@/theme';
import { radius, spacing } from '@/theme/tokens';
import { OwnedItem } from '../InventoryItemCard';
import { CATEGORY_DISPLAY_NAMES } from '@/lib/utils/itemCategories';
import { createItemDetailModalStyles } from './ItemDetailModal.styles';

export function ItemDetailModal({
  item,
  isPlaced,
  onClose,
  onFeedback,
}: {
  item: OwnedItem;
  isPlaced: boolean;
  onClose: () => void;
  onFeedback: (preset: 'purchase' | 'error') => void;
}) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const { triggerHaptic } = useFeedback();
  // Точечный селектор с useShallow — модалка перерисовывается только когда
  // реально меняется equippedFurniture, экшены стабильны между рендерами.
  const { placeDecor, removeDecor, consumeItem, sellItem, equipFurniture, equippedFurniture } =
    useShopStore(
      useShallow((s) => ({
        placeDecor: s.placeDecor,
        removeDecor: s.removeDecor,
        consumeItem: s.consumeItem,
        sellItem: s.sellItem,
        equipFurniture: s.equipFurniture,
        equippedFurniture: s.equippedFurniture,
      }))
    );
  const equippedSkinVariant = usePetStore((s) => s.equippedSkinVariant);

  const styles = createItemDetailModalStyles({ theme });
  const effect = getEffectDescription(item);
  const sellPrice = Math.floor(item.price / 2);
  const isEquippedSkin = item.category === 'skin' && item.skin_variant === equippedSkinVariant;
  const isFurniture = FURNITURE_CATEGORIES.includes(item.category as FurnitureCategory);
  const isEquippedFurniture = isFurniture && equippedFurniture[item.category] === item.id;

  const handlePrimaryAction = async () => {
    triggerHaptic('medium');

    if (item.category === 'decor') {
      if (isPlaced) {
        removeDecor(item.id);
      } else {
        placeDecor(item.id);
      }
      onClose();
      return;
    }

    if (item.category === 'food') {
      const result = consumeItem(item.id);
      if (result.success) {
        onFeedback('purchase');
      } else {
        onFeedback('error');
        Alert.alert('Пока нельзя', result.message);
      }
      onClose();
      return;
    }

    if (item.category === 'skin') {
      if (isEquippedSkin) {
        onClose();
        return;
      }
      const result = await equipSkin(item);
      onFeedback(result.success ? 'purchase' : 'error');
      onClose();
      return;
    }

    if (isFurniture) {
      if (isEquippedFurniture) {
        onClose();
        return;
      }
      const result = equipFurniture(item.id);
      onFeedback(result.success ? 'purchase' : 'error');
      onClose();
    }
  };

  const handleSell = () => {
    if (item.is_hidden) {
      Alert.alert('Нельзя продать', 'Этот предмет получен как редкий подарок и не продаётся.');
      return;
    }

    Alert.alert(
      'Продать предмет?',
      `${item.name}: ты получишь ${formatPrice(sellPrice)} (50% цены).`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Продать',
          onPress: () => {
            const result = sellItem(item.id, 1);
            if (result.success) {
              void unequipSkinIfSold(item);
              triggerHaptic('success');
              onFeedback('purchase');
            } else {
              onFeedback('error');
              Alert.alert('Не получилось', result.message);
            }
            onClose();
          },
        },
      ]
    );
  };

  const primaryAction =
    item.category === 'decor'
      ? { label: isPlaced ? 'Убрать из комнаты' : 'Разместить', color: theme.primary }
      : item.category === 'food'
        ? { label: 'Использовать', color: theme.success }
        : item.category === 'skin'
          ? { label: isEquippedSkin ? 'Уже надето' : 'Надеть', color: theme.accent }
          : isFurniture
            ? {
                label: isEquippedFurniture ? 'Уже в комнате' : 'Поставить в комнату',
                color: theme.accent,
              }
            : null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          onPress={onClose}
        />

        <View
          style={[
            styles.modalContent,
            { padding: scale(spacing.xxl), paddingTop: scale(spacing.xxxl) },
          ]}
        >
          {/* Заголовок */}
          <View style={styles.modalHeader}>
            <View
              style={[
                styles.modalItemIcon,
                {
                  width: scale(80),
                  height: scale(80),
                  borderRadius: scale(radius.xxl),
                  marginBottom: scale(spacing.lg),
                },
              ]}
            >
              <ItemImage item={item} size={scale(68)} />
            </View>
            <Text style={[styles.modalItemName, { fontSize: scaledFont('xxl') }]}>{item.name}</Text>
            <Text style={[styles.modalItemDescription, { fontSize: scaledFont('md') }]}>
              {item.description}
            </Text>
          </View>

          {/* Характеристики */}
          <View style={[styles.modalStatsCard, { padding: scale(spacing.lg) }]}>
            <View style={[styles.modalStatRow, { marginBottom: scale(spacing.md) }]}>
              <Text style={[styles.modalStatLabel, { fontSize: scaledFont('md') }]}>
                Количество
              </Text>
              <Text style={[styles.modalStatValue, { fontSize: scaledFont('md') }]}>
                {item.quantity} шт.
              </Text>
            </View>
            <View style={[styles.modalStatRow, { marginBottom: scale(spacing.md) }]}>
              <Text style={[styles.modalStatLabel, { fontSize: scaledFont('md') }]}>Категория</Text>
              <Text style={[styles.modalStatValue, { fontSize: scaledFont('md') }]}>
                {CATEGORY_DISPLAY_NAMES[item.category] ?? item.category}
              </Text>
            </View>
            {effect && (
              <View style={styles.modalStatRow}>
                <Text style={[styles.modalStatLabel, { fontSize: scaledFont('md') }]}>Эффект</Text>
                <Text
                  style={[
                    styles.modalStatValue,
                    styles.modalStatValueSuccess,
                    { fontSize: scaledFont('md') },
                  ]}
                >
                  {effect}
                </Text>
              </View>
            )}
          </View>

          {/* Кнопки действий */}
          <View style={styles.modalButtonsRow}>
            {primaryAction && (
              <TouchableOpacity
                onPress={handlePrimaryAction}
                activeOpacity={0.8}
                style={[
                  styles.modalActionButton,
                  { backgroundColor: primaryAction.color, padding: scale(spacing.lg) },
                ]}
              >
                <Text style={[styles.modalActionText, { fontSize: scaledFont('md') }]}>
                  {primaryAction.label}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.8}
              style={[styles.modalCloseButton, { padding: scale(spacing.lg) }]}
            >
              <Text style={[styles.modalCloseText, { fontSize: scaledFont('md') }]}>Закрыть</Text>
            </TouchableOpacity>
          </View>

          {!item.is_hidden && !item.is_starter && item.category !== 'skin' && (
            <TouchableOpacity
              onPress={handleSell}
              activeOpacity={0.8}
              style={[
                styles.modalActionButton,
                {
                  backgroundColor: theme.error,
                  padding: scale(spacing.lg),
                  marginTop: scale(spacing.sm),
                },
              ]}
            >
              <Text style={[styles.modalActionText, { fontSize: scaledFont('md') }]}>
                Продать за {formatPrice(sellPrice)}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}
