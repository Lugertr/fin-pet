// src/app/(tabs)/shop.tsx
// Магазин с кнопкой инвентаря и секцией подарков

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { Badge } from '@/components/ui';
import { useFeedback } from '@/lib/hooks/useFeedback';
import { SHOP_CATALOG, ShopItem, useShop } from '@/lib/hooks/useShop';
import { useGifts } from '@/lib/stores/giftsStore';
import { useUserStore } from '@/lib/stores/userStore';
import { formatCoins } from '@/lib/utils/formatters';
import { useResponsive, useTheme } from '@/theme';
import { spacing } from '@/theme/tokens';
import type { IconName } from '@/types/icons';
import { createShopStyles } from '../../styles/screens/tabs/_shop.styles';

const SHOP_CATEGORIES: { id: string; name: string; icon: IconName }[] = [
  { id: 'all', name: 'Все', icon: 'apps' },
  { id: 'decor', name: 'Декор', icon: 'home' },
  { id: 'food', name: 'Еда', icon: 'restaurant' },
  { id: 'buff', name: 'Баффы', icon: 'flash' },
  { id: 'skin', name: 'Скины', icon: 'color-palette' },
];

export default function ShopScreen() {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const { scale, scaledFont } = useResponsive(); // ✅ Используем scale и scaledFont
  const { trigger, triggerHaptic } = useFeedback();

  const styles = createShopStyles({ theme });

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { user } = useUserStore();
  const { purchaseItem } = useShop();
  const { pendingGifts } = useGifts();

  const balance = user?.liquid_balance || 0;
  const giftsCount = pendingGifts.length;

  const headerGradient: [string, string] = isDark ? ['#1E293B', '#0F172A'] : ['#FFFFFF', '#F1F5F9'];

  const filteredItems =
    selectedCategory === 'all'
      ? SHOP_CATALOG
      : SHOP_CATALOG.filter((item) => item.category === selectedCategory);

  const handleSelectCategory = (categoryId: string) => {
    triggerHaptic('selection');
    setSelectedCategory(categoryId);
  };

  const handlePurchase = (item: ShopItem) => {
    if (balance < item.price) {
      trigger('error');
      Alert.alert(
        'Недостаточно монет',
        `Для покупки ${item.name} нужно ${formatCoins(item.price)}`,
        [{ text: 'ОК' }]
      );
      return;
    }

    Alert.alert('Подтверждение покупки', `Купить ${item.name} за ${formatCoins(item.price)}?`, [
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
      {/* Заголовок с балансом и кнопкой инвентаря */}
      <LinearGradient
        colors={headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.header, { paddingTop: scale(56), paddingBottom: scale(spacing.xl) }]}
      >
        <View style={styles.headerTopRow}>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { fontSize: scaledFont('title') }]}>Магазин 🛒</Text>
            <Text style={[styles.subtitle, { fontSize: scaledFont('md') }]}>
              Покупайте улучшения для питомца
            </Text>
          </View>

          <View style={styles.headerActionsRow}>
            {/* Баланс */}
            <View
              style={[
                styles.balanceBadge,
                {
                  paddingHorizontal: scale(spacing.lg),
                  paddingVertical: scale(spacing.sm),
                },
              ]}
            >
              <Ionicons name="wallet" size={scale(18)} color={theme.coins} />
              <Text style={[styles.balanceText, { fontSize: scaledFont('md') }]}>
                {formatCoins(balance)}
              </Text>
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
                    { width: scale(18), height: scale(18), borderRadius: scale(9) },
                  ]}
                >
                  <Text style={styles.inventoryBadgeText}>{giftsCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
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
                  { width: scale(44), height: scale(44), borderRadius: scale(22) },
                ]}
              >
                <Text style={{ fontSize: scale(24) }}>🎁</Text>
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
              <Ionicons name="chevron-forward" size={scale(20)} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Категории */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesRow}
        >
          {SHOP_CATEGORIES.map((category) => {
            const isActive = selectedCategory === category.id;
            return (
              <TouchableOpacity
                key={category.id}
                onPress={() => handleSelectCategory(category.id)}
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
                  color={isActive ? '#FFFFFF' : theme.textSecondary}
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

/**
 * Карточка товара
 */
function ShopItemCard({
  item,
  balance,
  onPurchase,
}: {
  item: ShopItem;
  balance: number;
  onPurchase: () => void;
}) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();

  const styles = createShopStyles({ theme });
  const canAfford = balance >= item.price;

  return (
    <View
      style={[
        styles.itemCard,
        {
          padding: scale(spacing.lg),
          borderRadius: scale(spacing.xl),
        },
      ]}
    >
      {/* Иконка товара */}
      <View
        style={[
          styles.itemIconBox,
          {
            width: scale(64),
            height: scale(64),
            borderRadius: scale(spacing.lg),
            marginRight: scale(spacing.lg),
          },
        ]}
      >
        <Text style={{ fontSize: scale(32) }}>{item.icon}</Text>
      </View>

      {/* Информация */}
      <View style={styles.itemInfoContainer}>
        <Text
          style={[styles.itemName, { fontSize: scaledFont('lg'), marginBottom: scale(spacing.xs) }]}
        >
          {item.name}
        </Text>
        <Text
          style={[
            styles.itemDescription,
            { fontSize: scaledFont('sm'), marginBottom: scale(spacing.xs) },
          ]}
        >
          {item.description}
        </Text>
        {item.mood_buff > 0 && (
          <Badge label={`+${item.mood_buff} к настроению`} variant="success" size="sm" />
        )}
      </View>

      {/* Цена и кнопка */}
      <View style={styles.itemPriceContainer}>
        <Text
          style={[
            styles.itemPrice,
            canAfford ? styles.itemPriceAffordable : styles.itemPriceNotAffordable,
            { fontSize: scaledFont('lg'), marginBottom: scale(spacing.sm) },
          ]}
        >
          {formatCoins(item.price)}
        </Text>
        <TouchableOpacity
          onPress={onPurchase}
          disabled={!canAfford}
          activeOpacity={0.7}
          style={[
            styles.buyButton,
            canAfford ? styles.buyButtonEnabled : styles.buyButtonDisabled,
            {
              paddingHorizontal: scale(spacing.lg),
              paddingVertical: scale(spacing.sm),
            },
          ]}
        >
          <Text style={[styles.buyButtonText, { fontSize: scaledFont('sm') }]}>
            {canAfford ? 'Купить' : 'Нет монет'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
