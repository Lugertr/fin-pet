// src/app/(modal)/gifts-list.tsx
// Список подарков: неоткрытые и история

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { useFeedback } from '@/lib/hooks/useFeedback';
import { useGifts } from '@/lib/stores/giftsStore';
import { formatCoins } from '@/lib/utils/formatters';
import { useResponsive, useTheme } from '@/theme';
import { spacing } from '@/theme/tokens';
import { GIFT_RARITY_CONFIGS } from '@/types/gifts';
import { createGiftsListStyles } from '../../styles/screens/modal/_gifts-list.styles';

type TabType = 'pending' | 'history';

export default function GiftsListScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive(); // ✅ Используем scale и scaledFont
  const { triggerHaptic } = useFeedback();
  const { pendingGifts, history, totalCoinsFromGifts } = useGifts();

  const styles = createGiftsListStyles({ theme });

  const [tab, setTab] = useState<TabType>('pending');

  const headerGradient: [string, string] = ['#F59E0B', '#EF4444'];

  const handleOpenGift = (giftId: string) => {
    triggerHaptic('medium');
    router.push({
      pathname: '/(modal)/theme-reward',
      params: { giftId },
    } as never);
  };

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
          <Text style={[styles.headerTitle, { fontSize: scaledFont('xl') }]}>Подарки</Text>
          <View style={{ width: scale(36) }} />
        </View>

        {/* Статистика */}
        <View style={styles.statsRow}>
          <View style={[styles.statTile, { padding: scale(spacing.md) }]}>
            <Text style={[styles.statValue, { fontSize: scaledFont('xxl') }]}>
              {pendingGifts.length}
            </Text>
            <Text style={[styles.statLabel, { fontSize: scaledFont('xs') }]}>Неоткрыто</Text>
          </View>
          <View style={[styles.statTile, { padding: scale(spacing.md) }]}>
            <Text style={[styles.statValue, { fontSize: scaledFont('xxl') }]}>
              {history.length}
            </Text>
            <Text style={[styles.statLabel, { fontSize: scaledFont('xs') }]}>Открыто</Text>
          </View>
          <View style={[styles.statTile, { padding: scale(spacing.md) }]}>
            <Text style={[styles.statValue, styles.statValueCoins, { fontSize: scaledFont('lg') }]}>
              {formatCoins(totalCoinsFromGifts)}
            </Text>
            <Text style={[styles.statLabel, { fontSize: scaledFont('xs') }]}>Получено монет</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Переключатель табов */}
      <View
        style={[styles.tabSwitcher, { margin: scale(spacing.lg), marginBottom: scale(spacing.sm) }]}
      >
        <TouchableOpacity
          onPress={() => setTab('pending')}
          activeOpacity={0.8}
          style={[
            styles.tabButton,
            tab === 'pending' && styles.tabButtonActive,
            { paddingVertical: scale(spacing.sm), gap: scale(spacing.xs) },
          ]}
        >
          <Ionicons
            name="gift"
            size={scale(16)}
            color={tab === 'pending' ? '#FFFFFF' : theme.textSecondary}
          />
          <Text
            style={[
              styles.tabButtonText,
              tab === 'pending' ? styles.tabButtonTextActive : styles.tabButtonTextInactive,
              { fontSize: scaledFont('md') },
            ]}
          >
            Неоткрытые ({pendingGifts.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setTab('history')}
          activeOpacity={0.8}
          style={[
            styles.tabButton,
            tab === 'history' && styles.tabButtonActive,
            { paddingVertical: scale(spacing.sm), gap: scale(spacing.xs) },
          ]}
        >
          <Ionicons
            name="time"
            size={scale(16)}
            color={tab === 'history' ? '#FFFFFF' : theme.textSecondary}
          />
          <Text
            style={[
              styles.tabButtonText,
              tab === 'history' ? styles.tabButtonTextActive : styles.tabButtonTextInactive,
              { fontSize: scaledFont('md') },
            ]}
          >
            История
          </Text>
        </TouchableOpacity>
      </View>

      {/* Список */}
      <ScrollView
        style={styles.listScroll}
        contentContainerStyle={styles.listScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {tab === 'pending' ? (
          pendingGifts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={{ fontSize: scale(64), marginBottom: scale(spacing.lg) }}>🎁</Text>
              <Text style={[styles.emptyTitle, { fontSize: scaledFont('xl') }]}>
                Нет неоткрытых подарков
              </Text>
              <Text style={[styles.emptyText, { fontSize: scaledFont('md') }]}>
                Проходите темы целиком, чтобы получать подарки!
              </Text>
            </View>
          ) : (
            <View style={styles.pendingList}>
              {pendingGifts.map((gift) => {
                const config = GIFT_RARITY_CONFIGS[gift.rarity];
                return (
                  <TouchableOpacity
                    key={gift.id}
                    onPress={() => handleOpenGift(gift.id)}
                    activeOpacity={0.85}
                    style={styles.pendingCard}
                  >
                    <LinearGradient
                      colors={config.gradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={[styles.pendingCardInner, { padding: scale(spacing.lg) }]}
                    >
                      <View
                        style={[
                          styles.pendingIconBox,
                          {
                            width: scale(56),
                            height: scale(56),
                            borderRadius: scale(spacing.lg),
                            marginRight: scale(spacing.lg),
                          },
                        ]}
                      >
                        <Text style={{ fontSize: scale(32) }}>🎁</Text>
                      </View>
                      <View style={styles.pendingInfoContainer}>
                        <Text style={[styles.pendingTitle, { fontSize: scaledFont('md') }]}>
                          {config.name} подарок
                        </Text>
                        <Text style={[styles.pendingSubtitle, { fontSize: scaledFont('sm') }]}>
                          {gift.themeName ? `За тему «${gift.themeName}»` : 'Специальный подарок'}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.pendingOpenButton,
                          {
                            paddingHorizontal: scale(spacing.md),
                            paddingVertical: scale(spacing.sm),
                          },
                        ]}
                      >
                        <Text style={[styles.pendingOpenText, { fontSize: scaledFont('sm') }]}>
                          Открыть
                        </Text>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                );
              })}
            </View>
          )
        ) : history.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={{ fontSize: scale(64), marginBottom: scale(spacing.lg) }}>📜</Text>
            <Text style={[styles.emptyTitle, { fontSize: scaledFont('xl') }]}>История пуста</Text>
            <Text style={[styles.emptyText, { fontSize: scaledFont('md') }]}>
              Здесь будут отображаться открытые подарки
            </Text>
          </View>
        ) : (
          <View style={styles.historyList}>
            {history.map((entry) => {
              const config = GIFT_RARITY_CONFIGS[entry.rarity];
              return (
                <View
                  key={entry.giftId}
                  style={[styles.historyCard, { padding: scale(spacing.lg) }]}
                >
                  <View
                    style={[
                      styles.historyIconBox,
                      {
                        width: scale(44),
                        height: scale(44),
                        borderRadius: scale(spacing.md),
                        backgroundColor: `${config.accentColor}20`,
                        marginRight: scale(spacing.md),
                      },
                    ]}
                  >
                    <Text style={{ fontSize: scale(22) }}>{entry.itemIcon}</Text>
                  </View>
                  <View style={styles.historyInfoContainer}>
                    <Text style={[styles.historyItemName, { fontSize: scaledFont('md') }]}>
                      {entry.itemName}
                    </Text>
                    <Text
                      style={[
                        styles.historyRarityText,
                        { color: config.accentColor, fontSize: scaledFont('sm') },
                      ]}
                    >
                      {config.name} • +{formatCoins(entry.coins)}
                    </Text>
                  </View>
                  <Text style={[styles.historyDate, { fontSize: scaledFont('xs') }]}>
                    {new Date(entry.openedAt).toLocaleDateString('ru-RU')}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
