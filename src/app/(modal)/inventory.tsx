// src/app/(modal)/inventory.tsx
// Инвентарь: реальный склад купленного (§12.1 «Хранилище»), не заглушка
//
// Карточка предмета и модалка деталей живут в src/components/inventory/ —
// этот файл отвечает только за шапку, статистику, фильтр категорий и список.
// Шапка — общая SubpageHeader на фоне темы (решение пользователя 29.09.2026:
// оранжевый градиент выбивался из стиля, а сумма на нём не читалась).

import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Text } from '@/components/ui/Text';

import {
  INVENTORY_CATEGORIES,
  InventoryItemCard,
  ItemDetailModal,
  OwnedItem,
} from '@/components/inventory';
import { CoinAmount, SubpageHeader } from '@/components/shared';
import { CategoryTabs } from '@/components/ui';
import { useFeedback } from '@/lib/hooks/useFeedback';
import { useShopStore } from '@/lib/hooks/useShop';
import { itemMatchesCategoryFilter } from '@/lib/utils/itemCategories';
import { useResponsive, useTheme } from '@/theme';
import { emojiSizes, spacing } from '@/theme/tokens';
import { createInventoryStyles } from '../../styles/screens/modal/_inventory.styles';

export default function InventoryScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const { triggerHaptic, trigger } = useFeedback();

  const styles = createInventoryStyles({ theme });

  // Подписка на конкретные поля стора (а не на весь useShopStore()) — экран
  // перерисовывается только когда реально меняются инвентарь/размещение, а не
  // при любом изменении магазина (например equippedFurniture).
  const ownedItemsMap = useShopStore((s) => s.ownedItems);
  const placedDecorMap = useShopStore((s) => s.placedDecor);
  // Геттеры читают состояние через get() и не меняют ссылку между рендерами —
  // зависимость намеренно указана на срез стора (ownedItemsMap/placedDecorMap), не на сам геттер.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const ownedItems = useMemo(() => useShopStore.getState().getOwnedItems(), [ownedItemsMap]);
  const placedIds = useMemo(
    () =>
      useShopStore
        .getState()
        .getPlacedDecor()
        .map((item) => item.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [placedDecorMap]
  );

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<OwnedItem | null>(null);

  const filteredItems = ownedItems.filter((item) =>
    itemMatchesCategoryFilter(item.category, selectedCategory)
  );

  const totalItems = ownedItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = ownedItems.reduce((sum, item) => sum + item.quantity * item.price, 0);

  return (
    <View style={styles.container}>
      <SubpageHeader
        title="Инвентарь"
        help="inventory"
        onBack={() =>
          router.canGoBack() ? router.back() : router.replace('/(tabs)/shop' as never)
        }
      />

      <View style={styles.header}>
        {/* Статистика */}
        <View style={[styles.statsRow, { marginBottom: scale(spacing.lg) }]}>
          <View style={[styles.statTile, { padding: scale(spacing.md) }]}>
            <Text style={[styles.statValue, { fontSize: scaledFont('xl') }]}>{totalItems}</Text>
            <Text style={[styles.statLabel, { fontSize: scaledFont('xs') }]}>Предметов</Text>
          </View>
          <View style={[styles.statTile, { padding: scale(spacing.md) }]}>
            <CoinAmount
              amount={totalValue}
              fontSize={scaledFont('lg')}
              textStyle={styles.statValue}
            />
            <Text style={[styles.statLabel, { fontSize: scaledFont('xs') }]}>Стоимость</Text>
          </View>
          <View style={[styles.statTile, { padding: scale(spacing.md) }]}>
            <Text style={[styles.statValue, { fontSize: scaledFont('xl') }]}>
              {placedIds.length}
            </Text>
            <Text style={[styles.statLabel, { fontSize: scaledFont('xs') }]}>В комнате</Text>
          </View>
        </View>

        {/* Категории */}
        <CategoryTabs
          categories={INVENTORY_CATEGORIES}
          selected={selectedCategory}
          onSelect={(categoryId) => {
            triggerHaptic('selection');
            setSelectedCategory(categoryId);
          }}
        />
      </View>

      {/* Список предметов */}
      <ScrollView
        style={styles.itemsScroll}
        contentContainerStyle={styles.itemsScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={{ fontSize: scale(emojiSizes.xxl), marginBottom: scale(spacing.lg) }}>
              📦
            </Text>
            <Text style={[styles.emptyText, { fontSize: scaledFont('md') }]}>
              {ownedItems.length === 0
                ? 'Пока пусто — загляните в магазин'
                : 'В этой категории пока нет предметов'}
            </Text>
          </View>
        ) : (
          filteredItems.map((item) => (
            <InventoryItemCard
              key={item.id}
              item={item}
              isPlaced={placedIds.includes(item.id)}
              onPress={() => setSelectedItem(item)}
            />
          ))
        )}
      </ScrollView>

      {/* Модалка предмета */}
      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          isPlaced={placedIds.includes(selectedItem.id)}
          onClose={() => setSelectedItem(null)}
          onFeedback={trigger}
        />
      )}
    </View>
  );
}
