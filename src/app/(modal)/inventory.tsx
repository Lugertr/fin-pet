// src/app/(modal)/inventory.tsx
// Инвентарь: склад купленного декора, предметов ухода и вещей

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { useFeedback } from '@/lib/hooks/useFeedback';
import { formatCoins } from '@/lib/utils/formatters';
import { useResponsive, useTheme } from '@/theme';
import { spacing } from '@/theme/tokens';
import type { IconName } from '@/types/icons';
import { createInventoryStyles } from '../../styles/screens/modal/_inventory.styles';

// Категории инвентаря
const INVENTORY_CATEGORIES: { id: string; name: string; icon: IconName }[] = [
  { id: 'all', name: 'Все', icon: 'apps' },
  { id: 'decor', name: 'Декор', icon: 'home' },
  { id: 'food', name: 'Еда', icon: 'restaurant' },
  { id: 'buff', name: 'Баффы', icon: 'flash' },
  { id: 'skin', name: 'Скины', icon: 'color-palette' },
];

// Предметы инвентаря (в реальном приложении приходят с бэкенда)
const INVENTORY_ITEMS = [
  {
    id: 1,
    name: 'Кровать',
    category: 'decor',
    icon: '🛏️',
    quantity: 1,
    is_placed: true,
    mood_buff: 2,
    description: '+2 к восстановлению',
  },
  {
    id: 2,
    name: 'Растение',
    category: 'decor',
    icon: '🪴',
    quantity: 2,
    is_placed: true,
    mood_buff: 1,
    description: '+1 к восстановлению',
  },
  {
    id: 3,
    name: 'Лампа',
    category: 'decor',
    icon: '💡',
    quantity: 1,
    is_placed: false,
    mood_buff: 1,
    description: '+1 к восстановлению',
  },
  {
    id: 4,
    name: 'Яблоко',
    category: 'food',
    icon: '🍎',
    quantity: 5,
    is_placed: false,
    mood_buff: 0,
    description: '+5 к настроению',
  },
  {
    id: 5,
    name: 'Пицца',
    category: 'food',
    icon: '🍕',
    quantity: 2,
    is_placed: false,
    mood_buff: 0,
    description: '+15 к настроению',
  },
  {
    id: 6,
    name: 'Ускоритель',
    category: 'buff',
    icon: '⚡',
    quantity: 1,
    is_placed: false,
    mood_buff: 0,
    description: 'x2 опыт на 1 час',
  },
  {
    id: 7,
    name: 'Золотой скин',
    category: 'skin',
    icon: '✨',
    quantity: 1,
    is_placed: false,
    mood_buff: 0,
    description: 'Золотая рамка',
  },
];

type InventoryItem = (typeof INVENTORY_ITEMS)[number];

export default function InventoryScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive(); // ✅ Используем scale и scaledFont
  const { triggerHaptic } = useFeedback();

  const styles = createInventoryStyles({ theme });

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const headerGradient: [string, string] = ['#F59E0B', '#F97316'];

  const filteredItems =
    selectedCategory === 'all'
      ? INVENTORY_ITEMS
      : INVENTORY_ITEMS.filter((item) => item.category === selectedCategory);

  const totalItems = INVENTORY_ITEMS.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = INVENTORY_ITEMS.reduce((sum, item) => sum + item.quantity * 50, 0);
  const totalMoodBuff = INVENTORY_ITEMS.filter((item) => item.is_placed).reduce(
    (sum, item) => sum + item.mood_buff,
    0
  );

  return (
    <View style={styles.container}>
      {/* Заголовок */}
      <LinearGradient
        colors={headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.header, { paddingTop: scale(56), paddingBottom: scale(spacing.xl) }]}
      >
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backButton, { width: scale(36), height: scale(36) }]}
          >
            <Ionicons name="arrow-back" size={scale(20)} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { fontSize: scaledFont('xl') }]}>Инвентарь</Text>
          <View style={{ width: scale(36) }} />
        </View>

        {/* Статистика */}
        <View style={[styles.statsRow, { marginBottom: scale(spacing.lg) }]}>
          <View style={[styles.statTile, { padding: scale(spacing.md) }]}>
            <Text style={[styles.statValue, { fontSize: scaledFont('xl') }]}>{totalItems}</Text>
            <Text style={[styles.statLabel, { fontSize: scaledFont('xs') }]}>Предметов</Text>
          </View>
          <View style={[styles.statTile, { padding: scale(spacing.md) }]}>
            <Text style={[styles.statValue, styles.statValueCoins, { fontSize: scaledFont('lg') }]}>
              {formatCoins(totalValue)}
            </Text>
            <Text style={[styles.statLabel, { fontSize: scaledFont('xs') }]}>Стоимость</Text>
          </View>
          <View style={[styles.statTile, { padding: scale(spacing.md) }]}>
            <Text
              style={[styles.statValue, styles.statValueSuccess, { fontSize: scaledFont('xl') }]}
            >
              +{totalMoodBuff}
            </Text>
            <Text style={[styles.statLabel, { fontSize: scaledFont('xs') }]}>Бафф</Text>
          </View>
        </View>

        {/* Категории */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesRow}
        >
          {INVENTORY_CATEGORIES.map((category) => {
            const isActive = selectedCategory === category.id;
            return (
              <TouchableOpacity
                key={category.id}
                onPress={() => {
                  triggerHaptic('selection');
                  setSelectedCategory(category.id);
                }}
                activeOpacity={0.7}
                style={[
                  styles.categoryButton,
                  isActive ? styles.categoryButtonActive : styles.categoryButtonInactive,
                  {
                    paddingHorizontal: scale(spacing.lg),
                    paddingVertical: scale(spacing.sm),
                    gap: scale(spacing.xs),
                  },
                ]}
              >
                <Ionicons
                  name={category.icon}
                  size={scale(16)}
                  color={isActive ? '#F59E0B' : '#FFFFFF'}
                />
                <Text
                  style={[
                    styles.categoryText,
                    isActive ? styles.categoryTextActive : styles.categoryTextInactive,
                    { fontSize: scaledFont('md') },
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </LinearGradient>

      {/* Список предметов */}
      <ScrollView
        style={styles.itemsScroll}
        contentContainerStyle={styles.itemsScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={{ fontSize: scale(64), marginBottom: scale(spacing.lg) }}>📦</Text>
            <Text style={[styles.emptyText, { fontSize: scaledFont('md') }]}>
              В этой категории пока нет предметов
            </Text>
          </View>
        ) : (
          filteredItems.map((item) => (
            <InventoryItemCard key={item.id} item={item} onPress={() => setSelectedItem(item)} />
          ))
        )}
      </ScrollView>

      {/* Модалка предмета */}
      {selectedItem && (
        <ItemDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </View>
  );
}

/**
 * Карточка предмета инвентаря
 */
function InventoryItemCard({ item, onPress }: { item: InventoryItem; onPress: () => void }) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();

  const styles = createInventoryStyles({ theme });

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.itemCard, { padding: scale(spacing.lg) }]}
    >
      {/* Иконка */}
      <View
        style={[
          styles.itemIconBox,
          {
            width: scale(56),
            height: scale(56),
            borderRadius: scale(spacing.lg),
            marginRight: scale(spacing.lg),
          },
        ]}
      >
        <Text style={{ fontSize: scale(28) }}>{item.icon}</Text>
        {item.quantity > 1 && (
          <View
            style={[
              styles.itemQuantityBadge,
              {
                top: scale(-6),
                right: scale(-6),
                minWidth: scale(20),
              },
            ]}
          >
            <Text style={styles.itemQuantityText}>x{item.quantity}</Text>
          </View>
        )}
      </View>

      {/* Информация */}
      <View style={styles.itemInfoContainer}>
        <View style={styles.itemNameRow}>
          <Text style={[styles.itemName, { fontSize: scaledFont('lg') }]}>{item.name}</Text>
          {item.is_placed && (
            <View style={styles.placedBadge}>
              <Text style={styles.placedBadgeText}>В комнате</Text>
            </View>
          )}
        </View>
        <Text style={[styles.itemDescription, { fontSize: scaledFont('sm') }]}>
          {item.description}
        </Text>
      </View>

      {/* Стрелка */}
      <Ionicons name="chevron-forward" size={scale(20)} color={theme.textMuted} />
    </TouchableOpacity>
  );
}

/**
 * Модалка с деталями предмета
 */
function ItemDetailModal({ item, onClose }: { item: InventoryItem; onClose: () => void }) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const { triggerHaptic } = useFeedback();

  const styles = createInventoryStyles({ theme });

  const getActionButton = () => {
    if (item.category === 'decor' && !item.is_placed) {
      return { label: 'Разместить', color: theme.primary, icon: 'home' as IconName };
    }
    if (item.category === 'decor' && item.is_placed) {
      return { label: 'Убрать', color: theme.textMuted, icon: 'close-circle' as IconName };
    }
    if (item.category === 'food') {
      return { label: 'Использовать', color: theme.success, icon: 'restaurant' as IconName };
    }
    if (item.category === 'buff') {
      return { label: 'Активировать', color: theme.warning, icon: 'flash' as IconName };
    }
    return null;
  };

  const actionButton = getActionButton();

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
                  borderRadius: scale(spacing.xxl),
                  marginBottom: scale(spacing.lg),
                },
              ]}
            >
              <Text style={{ fontSize: scale(48) }}>{item.icon}</Text>
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
                {INVENTORY_CATEGORIES.find((c) => c.id === item.category)?.name}
              </Text>
            </View>
            {item.mood_buff > 0 && (
              <View style={styles.modalStatRow}>
                <Text style={[styles.modalStatLabel, { fontSize: scaledFont('md') }]}>
                  Бафф настроения
                </Text>
                <Text
                  style={[
                    styles.modalStatValue,
                    styles.modalStatValueSuccess,
                    { fontSize: scaledFont('md') },
                  ]}
                >
                  +{item.mood_buff} в час
                </Text>
              </View>
            )}
          </View>

          {/* Кнопки действий */}
          <View style={styles.modalButtonsRow}>
            {actionButton && (
              <TouchableOpacity
                onPress={() => triggerHaptic('medium')}
                activeOpacity={0.8}
                style={[
                  styles.modalActionButton,
                  { backgroundColor: actionButton.color, padding: scale(spacing.lg) },
                ]}
              >
                <Text style={[styles.modalActionText, { fontSize: scaledFont('md') }]}>
                  {actionButton.label}
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
        </View>
      </View>
    </Modal>
  );
}
