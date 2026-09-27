// src/app/(modal)/gifts-list.tsx
// Список подарков: неоткрытые и история

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { CoinAmount, HelpButton } from '@/components/shared';
import { HistoryGiftCard, PendingGiftCard } from '@/components/gifts';
import { IconButton } from '@/components/ui';
import { useFeedback } from '@/lib/hooks/useFeedback';
import { useGifts } from '@/lib/stores/giftsStore';
import { useResponsive, useTheme } from '@/theme';
import { colorPalettes, emojiSizes, spacing } from '@/theme/tokens';
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

  const headerGradient: [string, string] = [colorPalettes.amber[500], colorPalettes.red[500]];

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
          <IconButton icon="arrow-back" onPress={() => router.back()} variant="onGradient" />
          <Text style={[styles.headerTitle, { fontSize: scaledFont('xl') }]}>Подарки</Text>
          <HelpButton screen="gifts" variant="onGradient" />
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
            <CoinAmount
              amount={totalCoinsFromGifts}
              fontSize={scaledFont('lg')}
              textStyle={[styles.statValue, styles.statValueCoins]}
            />
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
            color={tab === 'pending' ? theme.onGradient : theme.textSecondary}
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
            color={tab === 'history' ? theme.onGradient : theme.textSecondary}
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
              <Text style={{ fontSize: scale(emojiSizes.xxl), marginBottom: scale(spacing.lg) }}>
                🎁
              </Text>
              <Text style={[styles.emptyTitle, { fontSize: scaledFont('xl') }]}>
                Нет неоткрытых подарков
              </Text>
              <Text style={[styles.emptyText, { fontSize: scaledFont('md') }]}>
                Заходи к Финни 7 дней подряд — и получишь подарок!
              </Text>
            </View>
          ) : (
            <View style={styles.pendingList}>
              {pendingGifts.map((gift) => (
                <PendingGiftCard key={gift.id} gift={gift} onOpen={() => handleOpenGift(gift.id)} />
              ))}
            </View>
          )
        ) : history.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={{ fontSize: scale(emojiSizes.xxl), marginBottom: scale(spacing.lg) }}>
              📜
            </Text>
            <Text style={[styles.emptyTitle, { fontSize: scaledFont('xl') }]}>История пуста</Text>
            <Text style={[styles.emptyText, { fontSize: scaledFont('md') }]}>
              Здесь будут отображаться открытые подарки
            </Text>
          </View>
        ) : (
          <View style={styles.historyList}>
            {history.map((entry) => (
              <HistoryGiftCard key={entry.giftId} entry={entry} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
