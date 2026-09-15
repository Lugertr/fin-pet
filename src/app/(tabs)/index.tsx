// app/(tabs)/index.tsx
// Главный Хаб — Комната с питомцем (с адаптивностью)

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { PetRoom } from '@/components/pet';
import { STARTING_DECOR } from '@/constants/petAssets';
import { useDaily } from '@/lib/hooks/useDaily';
import { useFeedback } from '@/lib/hooks/useFeedback';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { usePet } from '@/lib/hooks/usePet';
import { useShop } from '@/lib/hooks/useShop';
import { useUser } from '@/lib/hooks/useUser';
import { feedback } from '@/lib/services/feedback';
import { notifications } from '@/lib/services/notifications';
import { useGifts } from '@/lib/stores/giftsStore';
import { usePetStore } from '@/lib/stores/petStore';
import { usePreferences } from '@/lib/stores/preferencesStore';
import { useUserStore } from '@/lib/stores/userStore';
import { formatCoins, formatTimeUntilFullMood } from '@/lib/utils/formatters';
import { getMoodBlockMessage } from '@/lib/utils/moodCalculator';
import { useResponsive, useTheme } from '@/theme';
import { fontWeights, spacing } from '@/theme/tokens';
import { createHubStyles } from '../../styles/screens/tabs/_index.styles';

export default function HubScreen() {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const { trigger, triggerHaptic } = useFeedback();
  const { scheduleMoodRestored } = useNotifications();
  const { pendingGifts } = useGifts();

  const styles = createHubStyles({ theme });

  const {
    data: userData,
    isLoading: userLoading,
    error: userError,
    refetch: refetchUser,
  } = useUser();
  const { isLoading: petLoading, error: petError, refetch: refetchPet } = usePet();

  const { user, totalNetWorth } = useUserStore();
  const { currentMood, pet, moodBuffs, refreshMood } = usePetStore();
  const { currentStreak, hasClaimedToday, claimDailyBonus, checkAndUpdateStreak } = useDaily();
  const { getPlacedDecor, getTotalMoodBuff } = useShop();
  const { petType: savedPetType, petName: savedPetName } = usePreferences();

  const hasError = userError || petError;
  const isLoading = userLoading || petLoading;
  const giftsCount = pendingGifts.length;

  const headerGradient: [string, string] = isDark ? ['#1E293B', '#0F172A'] : ['#FFFFFF', '#F1F5F9'];

  useEffect(() => {
    let isMounted = true;

    const initServices = async () => {
      try {
        await feedback.initialize();
        await notifications.initialize();
      } catch (error) {
        console.warn('[Hub] Ошибка инициализации сервисов:', error);
      }
    };

    if (isMounted) {
      initServices();
    }

    return () => {
      isMounted = false;
      feedback.cleanup().catch(() => {});
    };
  }, []);

  useEffect(() => {
    checkAndUpdateStreak();
  }, [checkAndUpdateStreak]);

  const handleClaimDailyBonus = () => {
    if (hasClaimedToday) {
      trigger('error');
      Alert.alert('Награда уже получена', 'Приходите завтра!');
      return;
    }

    const result = claimDailyBonus();
    if (result.success) {
      trigger('dailyClaim');

      const { user: currentUser } = useUserStore.getState();
      if (currentUser) {
        useUserStore.getState().updateBalance(currentUser.liquid_balance + result.bonus);
      }

      const dayWord = result.newStreak === 1 ? 'день' : result.newStreak < 5 ? 'дня' : 'дней';

      Alert.alert(
        '🎉 Награда получена!',
        `+${result.bonus} монет!\nСтрик: ${result.newStreak} ${dayWord}`
      );
    }
  };

  const handleRefreshMood = () => {
    const prevMood = currentMood;
    refreshMood();

    if (prevMood <= 0 && pet) {
      const minutesToFull = Math.ceil(
        ((100 - currentMood) / (pet.base_recovery_rate + moodBuffs + getTotalMoodBuff())) * 60
      );
      if (minutesToFull > 0 && minutesToFull < 60) {
        scheduleMoodRestored(minutesToFull);
      }
    }
  };

  const userDecor = getPlacedDecor();
  const placedDecor = [
    ...STARTING_DECOR.map((item) => ({
      id: item.id as unknown as number,
      name: item.name,
      icon: '',
      position: item.position,
    })),
    ...userDecor
      .filter((item) => !STARTING_DECOR.some((sd) => sd.name === item.name))
      .map((item, index) => ({
        id: item.id,
        name: item.name,
        icon: item.icon,
        position: (index % 2 === 0 ? 'left' : 'right') as 'left' | 'right',
      })),
  ];

  const handleRefresh = async () => {
    triggerHaptic('light');
    await Promise.all([refetchUser(), refetchPet()]);
  };

  const navigateTo = (path: string) => {
    triggerHaptic('light');
    router.push(path as never);
  };

  if (isLoading && !user && !pet) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={{ color: theme.textSecondary, marginTop: scale(16) }}>Загрузка...</Text>
      </View>
    );
  }

  if (hasError && !user) {
    return (
      <View
        style={[
          styles.container,
          { alignItems: 'center', justifyContent: 'center', padding: scale(spacing.xxl) },
        ]}
      >
        <Text style={{ fontSize: scale(64), marginBottom: scale(16) }}>😵</Text>
        <Text
          style={{
            color: theme.textPrimary,
            fontSize: scaledFont('xxl'),
            fontWeight: fontWeights.bold,
            textAlign: 'center',
            marginBottom: scale(8),
          }}
        >
          Не удалось загрузить данные
        </Text>
        <Text
          style={{
            color: theme.textSecondary,
            textAlign: 'center',
            marginBottom: scale(24),
          }}
        >
          Проверьте подключение к интернету и попробуйте снова
        </Text>
        <TouchableOpacity
          onPress={handleRefresh}
          style={{
            backgroundColor: theme.primary,
            paddingHorizontal: scale(24),
            paddingVertical: scale(12),
            borderRadius: scale(12),
          }}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>Повторить</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const moodBlockMessage = getMoodBlockMessage(currentMood);
  const totalMoodBuff = moodBuffs + getTotalMoodBuff();
  const timeUntilFull = pet
    ? formatTimeUntilFullMood(currentMood, pet.base_recovery_rate + totalMoodBuff)
    : null;

  const petType: 'robot' | 'dragon' | 'cat' = savedPetType || 'robot';
  const petName = savedPetName || (userData?.pet?.id ? 'Ваш помощник' : 'Помощник');

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={handleRefresh}
          tintColor={theme.primary}
        />
      }
    >
      {/* Шапка с балансом */}
      <LinearGradient
        colors={headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.header, { paddingTop: scale(56), paddingBottom: scale(spacing.xxl) }]}
      >
        {/* Приветствие и баланс */}
        <View style={styles.headerTopRow}>
          <View>
            <Text style={[styles.greetingText, { fontSize: scaledFont('md') }]}>
              Привет, {user?.username || 'Игрок'}! 👋
            </Text>
            <Text style={[styles.balanceText, { fontSize: scaledFont('hero') }]}>
              {formatCoins(totalNetWorth)}
            </Text>
            <Text style={[styles.balanceLabel, { fontSize: scaledFont('sm') }]}>
              Общий достаток
            </Text>
          </View>

          <View
            style={[
              styles.coinsBadge,
              { paddingHorizontal: scale(spacing.lg), paddingVertical: scale(spacing.sm) },
            ]}
          >
            <Ionicons name="wallet" size={scale(20)} color={theme.coins} />
            <Text style={[styles.coinsText, { fontSize: scaledFont('lg') }]}>
              {formatCoins(user?.liquid_balance || 0)}
            </Text>
          </View>
        </View>

        {/* Комната питомца */}
        <PetRoom
          petType={petType}
          petName={petName}
          mood={currentMood}
          placedDecor={placedDecor}
          onPetPress={() => {
            triggerHaptic('light');
            handleRefreshMood();
          }}
        />

        {/* Предупреждение о блокировке */}
        {moodBlockMessage && (
          <View
            style={[
              styles.warningBanner,
              styles.warningBannerError,
              { padding: scale(spacing.md) },
            ]}
          >
            <Ionicons name="alert-circle" size={scale(18)} color={theme.error} />
            <Text style={[styles.warningTextError, { fontSize: scaledFont('sm') }]}>
              {moodBlockMessage}
            </Text>
          </View>
        )}

        {/* Бонус за настроение */}
        {currentMood > 50 && (
          <View
            style={[
              styles.warningBanner,
              styles.warningBannerSuccess,
              { padding: scale(spacing.md) },
            ]}
          >
            <Text style={{ fontSize: scale(16) }}>✨</Text>
            <Text style={[styles.warningTextSuccess, { fontSize: scaledFont('sm') }]}>
              Настроение выше 50% — бонус к доходу активен!
            </Text>
          </View>
        )}

        {/* Время до полного восстановления */}
        {timeUntilFull && currentMood < 100 && (
          <View style={styles.timeUntilFullRow}>
            <Ionicons name="time-outline" size={scale(14)} color={theme.textMuted} />
            <Text style={[styles.timeUntilFullText, { fontSize: scaledFont('sm') }]}>
              До полного настроения: {timeUntilFull}
            </Text>
          </View>
        )}
      </LinearGradient>

      {/* Быстрые действия */}
      <View
        style={[
          styles.actionsSection,
          { padding: scale(spacing.xxl), paddingTop: scale(spacing.xl) },
        ]}
      >
        <Text
          style={[
            styles.sectionTitle,
            { fontSize: scaledFont('xxl'), marginBottom: scale(spacing.lg) },
          ]}
        >
          Быстрые действия
        </Text>

        {/* Главная кнопка — Уроки */}
        <TouchableOpacity
          onPress={() => navigateTo('/(tabs)/lessons')}
          disabled={currentMood <= 0}
          activeOpacity={0.8}
          style={[styles.mainActionButton, { opacity: currentMood <= 0 ? 0.5 : 1 }]}
        >
          <LinearGradient
            colors={theme.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.mainActionInner, { padding: scale(spacing.xl), gap: scale(spacing.lg) }]}
          >
            <View
              style={[
                styles.mainActionIconBox,
                { width: scale(56), height: scale(56), borderRadius: scale(16) },
              ]}
            >
              <Ionicons name="school" size={scale(28)} color="#FFFFFF" />
            </View>
            <View style={styles.mainActionTextContainer}>
              <Text style={[styles.mainActionTitle, { fontSize: scaledFont('xl') }]}>
                Перейти к урокам
              </Text>
              <Text style={[styles.mainActionSubtitle, { fontSize: scaledFont('sm') }]}>
                {currentMood <= 0
                  ? 'Недоступно: восстановите настроение'
                  : 'Изучайте финансовую грамотность'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={scale(24)} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Два ряда по две кнопки */}
        <View
          style={[styles.actionsRow, { gap: scale(spacing.md), marginBottom: scale(spacing.md) }]}
        >
          <TouchableOpacity
            onPress={() => navigateTo('/(modal)/ai-chat')}
            activeOpacity={0.8}
            style={styles.actionCard}
          >
            <LinearGradient
              colors={['#A855F7', '#EC4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.actionCardInner, { padding: scale(spacing.lg) }]}
            >
              <Ionicons name="chatbubbles" size={scale(28)} color="#FFFFFF" />
              <Text
                style={[
                  styles.actionCardTitle,
                  { fontSize: scaledFont('md'), marginTop: scale(spacing.sm) },
                ]}
              >
                ИИ-Наставник
              </Text>
              <Text
                style={[
                  styles.actionCardSubtitle,
                  { fontSize: scaledFont('xs'), marginTop: scale(spacing.xs) },
                ]}
              >
                5 в день бесплатно
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigateTo('/(modal)/deposit')}
            activeOpacity={0.8}
            style={styles.actionCard}
          >
            <LinearGradient
              colors={['#10B981', '#06B6D4']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.actionCardInner, { padding: scale(spacing.lg) }]}
            >
              <Ionicons name="trending-up" size={scale(28)} color="#FFFFFF" />
              <Text
                style={[
                  styles.actionCardTitle,
                  { fontSize: scaledFont('md'), marginTop: scale(spacing.sm) },
                ]}
              >
                Вклады
              </Text>
              <Text
                style={[
                  styles.actionCardSubtitle,
                  { fontSize: scaledFont('xs'), marginTop: scale(spacing.xs) },
                ]}
              >
                +2% в день
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Баннер подарков */}
        {giftsCount > 0 && (
          <TouchableOpacity
            onPress={() => {
              triggerHaptic('medium');
              router.push('/(modal)/gifts-list' as never);
            }}
            activeOpacity={0.8}
            style={styles.giftsBanner}
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
      </View>

      {/* Ежедневная награда */}
      <View
        style={[
          styles.dailySection,
          { paddingHorizontal: scale(spacing.xxl), paddingBottom: scale(spacing.lg) },
        ]}
      >
        <Text
          style={[
            styles.sectionTitle,
            { fontSize: scaledFont('xxl'), marginBottom: scale(spacing.lg) },
          ]}
        >
          Ежедневная награда
        </Text>

        <TouchableOpacity
          onPress={handleClaimDailyBonus}
          disabled={hasClaimedToday}
          activeOpacity={0.8}
          style={[styles.dailyCard, { opacity: hasClaimedToday ? 0.6 : 1 }]}
        >
          <LinearGradient
            colors={
              hasClaimedToday
                ? isDark
                  ? ['#334155', '#1E293B']
                  : ['#E2E8F0', '#CBD5E1']
                : theme.gradients.reward
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.dailyCardInner, { padding: scale(spacing.xl) }]}
          >
            <View style={[styles.dailyLeftRow, { gap: scale(spacing.md) }]}>
              <View
                style={[
                  styles.dailyIconBox,
                  { width: scale(48), height: scale(48), borderRadius: scale(24) },
                ]}
              >
                <Text style={{ fontSize: scale(24) }}>{hasClaimedToday ? '✓' : '🎁'}</Text>
              </View>
              <View>
                <Text style={[styles.dailyTitle, { fontSize: scaledFont('lg') }]}>
                  {hasClaimedToday ? 'Награда получена' : 'Забрать награду'}
                </Text>
                <Text style={[styles.dailySubtitle, { fontSize: scaledFont('sm') }]}>
                  День {currentStreak + (hasClaimedToday ? 0 : 1)} из 7
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.dailyButton,
                {
                  backgroundColor: hasClaimedToday
                    ? 'rgba(255,255,255,0.1)'
                    : 'rgba(255,255,255,0.25)',
                  paddingHorizontal: scale(spacing.lg),
                  paddingVertical: scale(spacing.sm),
                },
              ]}
            >
              <Text style={[styles.dailyButtonText, { fontSize: scaledFont('md') }]}>
                {hasClaimedToday ? 'Получено' : 'Забрать'}
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Мини-календарь стрика */}
        <View style={[styles.streakRow, { marginTop: scale(spacing.lg) }]}>
          {[1, 2, 3, 4, 5, 6, 7].map((day) => {
            const isCompleted = day <= currentStreak;
            const isToday = day === currentStreak + 1 && !hasClaimedToday;
            const isSuperCase = day === 7;

            return (
              <View key={day} style={styles.streakDayContainer}>
                <View
                  style={[
                    styles.streakDayCircle,
                    {
                      width: scale(32),
                      height: scale(32),
                      borderRadius: scale(16),
                      backgroundColor: isCompleted
                        ? theme.success
                        : isToday
                          ? theme.warning
                          : theme.surfaceLight,
                      borderWidth: isToday ? 2 : 0,
                      borderColor: isToday ? '#FDE68A' : 'transparent',
                    },
                  ]}
                >
                  {isCompleted ? (
                    <Ionicons name="checkmark" size={scale(16)} color="#FFFFFF" />
                  ) : isSuperCase && !isCompleted ? (
                    <Text style={{ fontSize: scale(14) }}>🎁</Text>
                  ) : (
                    <Text
                      style={[
                        styles.streakDayNumber,
                        {
                          color: isToday ? '#000000' : theme.textMuted,
                          fontSize: scaledFont('sm'),
                        },
                      ]}
                    >
                      {day}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Совет дня */}
      <View
        style={[
          styles.tipSection,
          { paddingHorizontal: scale(spacing.xxl), paddingBottom: scale(spacing.xxxl) },
        ]}
      >
        <TouchableOpacity
          onPress={() => triggerHaptic('light')}
          activeOpacity={0.8}
          style={[
            styles.tipCard,
            {
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              borderColor: 'rgba(99, 102, 241, 0.3)',
              padding: scale(spacing.lg),
              gap: scale(spacing.md),
            },
          ]}
        >
          <View
            style={[
              styles.tipIconBox,
              {
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                width: scale(36),
                height: scale(36),
                borderRadius: scale(18),
              },
            ]}
          >
            <Ionicons name="bulb" size={scale(18)} color={theme.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.tipTitle,
                { fontSize: scaledFont('md'), marginBottom: scale(spacing.xs) },
              ]}
            >
              Совет дня
            </Text>
            <Text style={[styles.tipText, { fontSize: scaledFont('sm') }]}>
              Покупайте декор в магазине — он даёт бонус к восстановлению настроения!
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
