// src/app/(tabs)/shop.tsx
// Магазин с кнопкой инвентаря и секцией подарков
// Вещь одна на игрока (решение пользователя 29.09.2026): купленное пропадает
// из магазина (isOwnedSinglePurchase) и возвращается, только если его продали.
// Купили вещь, на которую копили в банке, — цель снимается, накопленное
// остаётся, а хаб попросит выбрать новую (иначе банк выдал бы её второй раз).
// Купленная вещь сама в комнату не встаёт — магазин спрашивает: поставить
// или оставить в хранилище (решение пользователя 29.09.2026).
//
// Карточка товара живёт в src/components/shop/ — этот файл отвечает только
// за шапку, баланс, категории и покупку.

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/ui/Text';

import { AppHeaderStats, useAppHeaderPadding } from '@/components/shared';
import { ShopItemCard } from '@/components/shop';
import { CategoryTabs } from '@/components/ui';
import { useFeedback } from '@/lib/hooks/useFeedback';
import { Alert } from '@/lib/utils/alert';
import {
  FOOD_ONLY_WHEN_HUNGRY_MESSAGE,
  FURNITURE_CATEGORIES,
  FurnitureCategory,
  isOwnedSinglePurchase,
  isPetHungryNow,
  SHOP_CATALOG,
  ShopItem,
  useShopStore,
} from '@/lib/hooks/useShop';
import { useGiftsStore } from '@/lib/stores/giftsStore';
import { usePetStore } from '@/lib/stores/petStore';
import { usePreferencesStore } from '@/lib/stores/preferencesStore';
import { useSavingsStore } from '@/lib/stores/savingsStore';
import { useUserStore } from '@/lib/stores/userStore';
import { formatPrice } from '@/lib/utils/formatters';
import {
  CATEGORY_DISPLAY_NAMES,
  SHOP_ITEM_CATEGORIES,
  itemMatchesCategoryFilter,
  isShopItem,
} from '@/lib/utils/itemCategories';
import { getEffectDescription, placementPromptText, shopPrice } from '@/lib/utils/shopItems';
import { useResponsive, useTheme } from '@/theme';
import { circleRadius, spacing } from '@/theme/tokens';
import { createShopStyles } from '../../styles/screens/tabs/_shop.styles';

export default function ShopScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive(); // ✅ Используем scale и scaledFont
  const headerPadding = useAppHeaderPadding();
  const { trigger, triggerHaptic } = useFeedback();

  const styles = createShopStyles({ theme });

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const user = useUserStore((s) => s.user);
  const currentMood = usePetStore((s) => s.currentMood);
  const purchaseItem = useShopStore((s) => s.purchaseItem);
  // Инвентарь — чтобы купленное сразу пропадало из магазина.
  const ownedItems = useShopStore((s) => s.ownedItems);
  const pendingGifts = useGiftsStore((s) => s.pendingGifts);
  const petType = usePreferencesStore((s) => s.petType);

  const balance = user?.liquid_balance || 0;
  // В демо-режиме магазин бесплатный (shopPrice).
  const isDemo = user?.is_demo ?? false;
  const giftsCount = pendingGifts.length;

  // Скрытые предметы (§12.4/§14) не продаются в магазине — только через подарки.
  // Стартовые предметы комнаты (is_starter) не продаются — они и так у всех
  // с онбординга, в магазине есть только их платные апгрейды. Скинов в
  // магазине нет вовсе — новый облик питомец получает на новом уровне.
  const shopCatalog = SHOP_CATALOG.filter(
    (item) =>
      isShopItem(item, petType) && itemMatchesCategoryFilter(item.category, selectedCategory)
  );
  // Купленное — уже в хранилище, в магазине его больше нет.
  const filteredItems = shopCatalog.filter((item) => !isOwnedSinglePurchase(item, ownedItems));
  const allBought = shopCatalog.length > 0 && filteredItems.length === 0;

  const handleSelectCategory = (categoryId: string) => {
    triggerHaptic('selection');
    setSelectedCategory(categoryId);
  };

  // Куплено — вещь в хранилище; мебель можно сразу поставить в комнату.
  const offerPlacement = (item: ShopItem, goalReleased: boolean) => {
    const goalNote = goalReleased
      ? '\n\nЭто была твоя цель в банке — накопленное осталось, выбери на хабе новую цель.'
      : '';
    if (!FURNITURE_CATEGORIES.includes(item.category as FurnitureCategory)) {
      Alert.alert('🎉 Куплено!', `«${item.name}» теперь в хранилище.${goalNote}`);
      return;
    }
    Alert.alert('🎉 Куплено!', `${placementPromptText(item)}${goalNote}`, [
      { text: 'Оставить в хранилище', style: 'cancel' },
      {
        text: 'Поставить в комнату',
        onPress: () => {
          const placed = useShopStore.getState().equipFurniture(item.id);
          if (placed.success) triggerHaptic('success');
          else Alert.alert('Пока нельзя', placed.message);
        },
      },
    ]);
  };

  const handlePurchase = (item: ShopItem) => {
    // Еда — только когда питомец голоден (объясняем до вопроса о покупке).
    if (item.category === 'food' && !isPetHungryNow()) {
      trigger('error');
      Alert.alert('Питомец сыт', FOOD_ONLY_WHEN_HUNGRY_MESSAGE);
      return;
    }
    const price = shopPrice(item, isDemo);
    if (balance < price) {
      trigger('error');
      const missing = price - balance;
      Alert.alert(
        'Недостаточно монет',
        `Для покупки «${item.name}» не хватает ${formatPrice(missing)}. Начни смену или заходи каждый день за ежедневной наградой, чтобы заработать монеты.`,
        [
          { text: 'Понятно', style: 'cancel' },
          // Монеты зарабатываются в приключении — вкладка хаба (во время
          // приключения на ней сам экран приключения).
          { text: 'К смене', onPress: () => router.push('/(tabs)' as never) },
        ]
      );
      return;
    }

    const effect = getEffectDescription(item);
    const details = [
      `Категория: ${CATEGORY_DISPLAY_NAMES[item.category] ?? item.category}`,
      effect ? `Эффект: ${effect}` : null,
      `Цена: ${formatPrice(price)}`,
    ]
      .filter(Boolean)
      .join('\n');

    Alert.alert(`Купить «${item.name}»?`, details, [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Купить',
        onPress: () => {
          const result = purchaseItem(item.id);
          if (result.success) {
            trigger('purchase');
            void useSavingsStore
              .getState()
              .releaseOwnedTarget()
              .then((released) => offerPlacement(item, released));
          } else {
            trigger('error');
            Alert.alert('Ошибка', result.message);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Общая шапка приложения */}
      <View style={headerPadding}>
        <AppHeaderStats help="shop" energy={currentMood} coins={balance} />
      </View>

      <View style={[styles.header, { paddingTop: 0, paddingBottom: scale(spacing.lg) }]}>
        <View style={styles.headerTopRow}>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { fontSize: scaledFont('xl') }]}>Магазин 🛒</Text>
          </View>

          {/* Кнопка инвентаря */}
          <TouchableOpacity
            onPress={() => {
              triggerHaptic('light');
              router.push('/(modal)/inventory' as never);
            }}
            activeOpacity={0.8}
            style={[styles.inventoryButton, { width: scale(44), height: scale(44) }]}
          >
            <Ionicons name="cube" size={scale(20)} color={theme.textPrimary} />
            {giftsCount > 0 && (
              <View
                style={[
                  styles.inventoryBadge,
                  { width: scale(18), height: scale(18), borderRadius: circleRadius(scale(18)) },
                ]}
              >
                <Text style={styles.inventoryBadgeText}>{giftsCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Баннер подарков, если есть неоткрытые */}
        {giftsCount > 0 && (
          <TouchableOpacity
            onPress={() => {
              triggerHaptic('medium');
              router.push('/(modal)/gifts-list' as never);
            }}
            activeOpacity={0.8}
            style={[styles.giftsBanner, { marginBottom: scale(spacing.lg) }]}
          >
            <LinearGradient
              colors={theme.gradients.reward}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.giftsBannerInner,
                { padding: scale(spacing.lg), gap: scale(spacing.md) },
              ]}
            >
              <View
                style={[
                  styles.giftsIconBox,
                  { width: scale(44), height: scale(44), borderRadius: circleRadius(scale(44)) },
                ]}
              >
                <Text style={{ fontSize: scaledFont('xxxl') }}>🎁</Text>
              </View>
              <View style={styles.giftsTextContainer}>
                <Text style={[styles.giftsTitle, { fontSize: scaledFont('md') }]}>
                  У тебя {giftsCount} неоткрытых{' '}
                  {giftsCount === 1 ? 'подарок' : giftsCount < 5 ? 'подарка' : 'подарков'}!
                </Text>
                <Text style={[styles.giftsSubtitle, { fontSize: scaledFont('sm') }]}>
                  Нажми, чтобы открыть
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={scale(20)} color={theme.onGradient} />
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Категории */}
        <CategoryTabs
          categories={SHOP_ITEM_CATEGORIES}
          selected={selectedCategory}
          onSelect={handleSelectCategory}
        />
      </View>

      {/* Товары */}
      <ScrollView
        style={styles.itemsScroll}
        contentContainerStyle={styles.itemsScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🛒</Text>
            <Text style={styles.emptyText}>
              {allBought
                ? 'Всё отсюда уже твоё — оно в хранилище'
                : 'В этой категории пока нет товаров'}
            </Text>
          </View>
        ) : (
          filteredItems.map((item) => (
            <ShopItemCard
              key={item.id}
              item={item}
              price={shopPrice(item, isDemo)}
              balance={balance}
              onPurchase={() => handlePurchase(item)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}
