// src/app/(tabs)/shop.tsx
// Магазин с кнопкой инвентаря и секцией подарков
//
// Карточка товара живёт в src/components/shop/ — этот файл отвечает только
// за шапку, баланс, категории и покупку.

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { AppHeaderStats } from '@/components/shared';
import { ShopItemCard } from '@/components/shop';
import { CategoryTabs } from '@/components/ui';
import { useFeedback } from '@/lib/hooks/useFeedback';
import { Alert } from '@/lib/utils/alert';
import { SHOP_CATALOG, ShopItem, useShopStore } from '@/lib/hooks/useShop';
import { useGiftsStore } from '@/lib/stores/giftsStore';
import { usePetStore } from '@/lib/stores/petStore';
import { usePreferencesStore } from '@/lib/stores/preferencesStore';
import { useSavingsStore } from '@/lib/stores/savingsStore';
import { useUserStore } from '@/lib/stores/userStore';
import { formatCoins } from '@/lib/utils/formatters';
import {
  CATEGORY_DISPLAY_NAMES,
  ITEM_CATEGORIES,
  itemMatchesCategoryFilter,
  itemMatchesPetType,
} from '@/lib/utils/itemCategories';
import { getEffectDescription } from '@/lib/utils/shopItems';
import { useResponsive, useTheme } from '@/theme';
import { circleRadius, spacing } from '@/theme/tokens';
import { createShopStyles } from '../../styles/screens/tabs/_shop.styles';

export default function ShopScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive(); // ✅ Используем scale и scaledFont
  const { trigger, triggerHaptic } = useFeedback();

  const styles = createShopStyles({ theme });

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const user = useUserStore((s) => s.user);
  const currentMood = usePetStore((s) => s.currentMood);
  const savings = useSavingsStore((s) => s.savings);
  // Только стабильный экшен — экрану магазина не нужно перерисовываться
  // при изменениях инвентаря/декора.
  const purchaseItem = useShopStore((s) => s.purchaseItem);
  const pendingGifts = useGiftsStore((s) => s.pendingGifts);
  const petType = usePreferencesStore((s) => s.petType);

  const balance = user?.liquid_balance || 0;
  const giftsCount = pendingGifts.length;

  // Скрытые предметы (§12.4/§14) не продаются в магазине — только через подарки.
  // Стартовые предметы комнаты (is_starter) не продаются — они и так у всех
  // с онбординга, в магазине есть только их платные апгрейды. Скины — только
  // для типа питомца, который реально есть у профиля (профиль ведёт одного
  // питомца, скины другого типа ему не подходят).
  const purchasableCatalog = SHOP_CATALOG.filter(
    (item) => !item.is_hidden && !item.is_starter && itemMatchesPetType(item, petType)
  );
  const filteredItems = purchasableCatalog.filter((item) =>
    itemMatchesCategoryFilter(item.category, selectedCategory)
  );

  const handleSelectCategory = (categoryId: string) => {
    triggerHaptic('selection');
    setSelectedCategory(categoryId);
  };

  const handlePurchase = (item: ShopItem) => {
    if (balance < item.price) {
      trigger('error');
      const missing = item.price - balance;
      Alert.alert(
        'Недостаточно монет',
        `Для покупки «${item.name}» не хватает ${formatCoins(missing)}. Пройдите урок или заберите ежедневную награду, чтобы заработать монеты.`,
        [
          { text: 'Понятно', style: 'cancel' },
          { text: 'К урокам', onPress: () => router.push('/(tabs)/lessons' as never) },
        ]
      );
      return;
    }

    const effect = getEffectDescription(item);
    const details = [
      `Категория: ${CATEGORY_DISPLAY_NAMES[item.category] ?? item.category}`,
      effect ? `Эффект: ${effect}` : null,
      `Цена: ${formatCoins(item.price)}`,
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
            Alert.alert('🎉 Успех!', result.message);
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
      <View
        style={{
          paddingTop: scale(56),
          paddingBottom: scale(spacing.md),
          paddingHorizontal: scale(spacing.xxl),
        }}
      >
        <AppHeaderStats
          energy={currentMood}
          coins={balance}
          savings={savings?.currentAmount ?? 0}
        />
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
                  У вас {giftsCount} неоткрытых{' '}
                  {giftsCount === 1 ? 'подарок' : giftsCount < 5 ? 'подарка' : 'подарков'}!
                </Text>
                <Text style={[styles.giftsSubtitle, { fontSize: scaledFont('sm') }]}>
                  Нажмите, чтобы открыть
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={scale(20)} color={theme.onGradient} />
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Категории */}
        <CategoryTabs
          categories={ITEM_CATEGORIES}
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
            <Text style={styles.emptyText}>В этой категории пока нет товаров</Text>
          </View>
        ) : (
          filteredItems.map((item) => (
            <ShopItemCard
              key={item.id}
              item={item}
              balance={balance}
              onPurchase={() => handlePurchase(item)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}
