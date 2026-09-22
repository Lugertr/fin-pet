// src/app/(tabs)/profile.tsx
// Профиль: статистика, компетенции, достижения, настройки с переключателем тем

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';

import { SpiderChart } from '@/components/charts/SpiderChart';
import { DailyRewardCard, PeriodCard } from '@/components/hub';
import {
  AdventureStatsGrid,
  AllAchievementsModal,
  CompetencesModal,
  LevelBadge,
  MedalsPreview,
  ParentZoneCard,
  SettingsModal,
  SettingsRow,
  StatTile,
  StreakCalendar,
  THEME_OPTIONS,
} from '@/components/profile';
import { AppHeaderStats } from '@/components/shared';
import { Card, IconButton, SectionTitle } from '@/components/ui';
import { isFeatureEnabled } from '@/config/featureFlags';
import { computeLevel, getLevelTitle } from '@/domain/player/PlayerLevel';
import { useDailyStore } from '@/lib/hooks/useDaily';
import { useFeedback } from '@/lib/hooks/useFeedback';
import { BRANCHES, useLessonsStore } from '@/lib/hooks/useLessons';
import { useShopStore } from '@/lib/hooks/useShop';
import { ACHIEVEMENTS, useAchievementsStore } from '@/lib/stores/achievementsStore';
import { useGiftsStore } from '@/lib/stores/giftsStore';
import { useLifetimeStatsStore } from '@/lib/stores/lifetimeStatsStore';
import { usePeriodStore } from '@/lib/stores/periodStore';
import { usePetStore } from '@/lib/stores/petStore';
import { useSavingsStore } from '@/lib/stores/savingsStore';
import { useUserStore } from '@/lib/stores/userStore';
import { Alert } from '@/lib/utils/alert';
import { formatCoins, formatDaysCount } from '@/lib/utils/formatters';
import { useResponsive, useTheme } from '@/theme';
import { circleRadius, colorPalettes, emojiSizes, spacing } from '@/theme/tokens';
import { createProfileStyles } from '../../styles/screens/tabs/_profile.styles';

export default function ProfileScreen() {
  const router = useRouter();
  const { theme, isDark, mode, setMode } = useTheme();
  const { scale, scaledFont } = useResponsive(); // ✅ Используем scale и scaledFont
  // Точечные селекторы — Профиль это вкладка, держится смонтированной, и не
  // должен перерисовываться целиком при действии в любом другом сторе.
  const user = useUserStore((s) => s.user);
  const totalNetWorth = useUserStore((s) => s.totalNetWorth);
  const { progress, totalXp, getBranchProgress } = useLessonsStore(
    useShallow((s) => ({
      progress: s.progress,
      totalXp: s.totalXp,
      getBranchProgress: s.getBranchProgress,
    }))
  );
  // Только ownedItems (не весь useShopStore()) — профиль не должен
  // перерисовываться при изменениях placedDecor/equippedFurniture.
  const ownedItemsMap = useShopStore((s) => s.ownedItems);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const ownedItemsList = useMemo(() => useShopStore.getState().getOwnedItems(), [ownedItemsMap]);
  const { trigger, triggerHaptic } = useFeedback();
  const { currentStreak, hasClaimedToday, claimDailyBonus, checkAndUpdateStreak } = useDailyStore(
    useShallow((s) => ({
      currentStreak: s.currentStreak,
      hasClaimedToday: s.hasClaimedToday,
      claimDailyBonus: s.claimDailyBonus,
      checkAndUpdateStreak: s.checkAndUpdateStreak,
    }))
  );
  const lifetimeCoinsEarned = useLifetimeStatsStore((s) => s.lifetimeCoinsEarned);
  const savings = useSavingsStore((s) => s.savings);
  const currentPeriod = usePeriodStore((s) => s.currentPeriod);
  const currentMood = usePetStore((s) => s.currentMood);
  const {
    userAchievements,
    recordBranchProgress,
    recordHiddenItemsOwned,
    recordStreakDays,
    recordShopItemsOwned,
    claimAchievement,
  } = useAchievementsStore(
    useShallow((s) => ({
      userAchievements: s.userAchievements,
      recordBranchProgress: s.recordBranchProgress,
      recordHiddenItemsOwned: s.recordHiddenItemsOwned,
      recordStreakDays: s.recordStreakDays,
      recordShopItemsOwned: s.recordShopItemsOwned,
      claimAchievement: s.claimAchievement,
    }))
  );

  const styles = createProfileStyles({ theme });

  const [showSettings, setShowSettings] = useState(false);
  const [showCompetences, setShowCompetences] = useState(false);
  const [showAllAchievements, setShowAllAchievements] = useState(false);

  const levelInfo = computeLevel(totalXp);
  const levelTitle = getLevelTitle(levelInfo.level);

  const completedLessons = Object.values(progress).filter((p) => p.status === 'completed').length;

  // Компетенции — реальный прогресс по каждой из 7 веток обучения, не заглушка
  const competenceData = BRANCHES.map((branch) => {
    const { completed, total } = getBranchProgress(branch.id);
    return { label: branch.name, value: total > 0 ? Math.round((completed / total) * 100) : 0 };
  });

  // §15.2: подтягиваем актуальный прогресс из других сторов при каждом
  // заходе в профиль — достижения сами не подписаны на useLessonsStore/useShop,
  // чтобы не тащить циклический импорт (см. комментарий в achievementsStore.ts).
  useEffect(() => {
    const branchIds = new Set(
      ACHIEVEMENTS.filter((a) => a.target_branch_id !== undefined).map(
        (a) => a.target_branch_id as number
      )
    );
    branchIds.forEach((branchId) => {
      const { completed, total } = getBranchProgress(branchId);
      recordBranchProgress(branchId, completed, total);
    });

    const hiddenCount = ownedItemsList.filter((i) => i.is_hidden).length;
    recordHiddenItemsOwned(hiddenCount);

    recordStreakDays(currentStreak);
    recordShopItemsOwned(ownedItemsList.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress, currentStreak]);

  useEffect(() => {
    checkAndUpdateStreak();
  }, [checkAndUpdateStreak]);

  const handleOpenSettings = () => {
    triggerHaptic('light');
    setShowSettings(true);
  };

  const handleFinishPeriod = () => {
    triggerHaptic('medium');
    router.push('/(modal)/period-summary' as never);
  };

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
        useUserStore
          .getState()
          .recordTransaction(result.bonus, 'daily_bonus', `Стрик, день ${result.newStreak}`);
      }

      // §14.1/§5: стрик 7 периодов -> случайный подарок по таблице редкости
      if (result.newStreak % 7 === 0) {
        useGiftsStore.getState().addRandomGift('streak_7', null, `Стрик ${result.newStreak}`);
      }

      const dayWord = result.newStreak === 1 ? 'день' : result.newStreak < 5 ? 'дня' : 'дней';

      Alert.alert(
        '🎉 Награда получена!',
        `+${result.bonus} монет!\nСтрик: ${result.newStreak} ${dayWord}`
      );
    }
  };

  const handleOpenCompetences = () => {
    triggerHaptic('light');
    setShowCompetences(true);
  };

  const handleOpenAdultSection = () => {
    triggerHaptic('light');
    router.push('/(modal)/adult-section' as never);
  };

  const handleViewAllAchievements = () => {
    triggerHaptic('light');
    setShowAllAchievements(true);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
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
            coins={user?.liquid_balance ?? 0}
            savings={savings?.currentAmount ?? 0}
          />
        </View>

        {/* Аватар, имя, стрик, настройки */}
        <View style={[styles.header, { paddingTop: 0, paddingBottom: scale(spacing.lg) }]}>
          <View style={styles.headerTopRow}>
            <View
              style={[
                styles.avatarContainer,
                {
                  width: scale(64),
                  height: scale(64),
                  borderRadius: circleRadius(scale(64)),
                  marginRight: scale(spacing.lg),
                },
              ]}
            >
              <Text style={{ fontSize: scale(emojiSizes.md) }}>🤖</Text>
            </View>

            <View style={styles.userInfoContainer}>
              <Text style={[styles.username, { fontSize: scaledFont('xl') }]}>
                {user?.username || 'Игрок'}
              </Text>
              <View style={styles.streakRow}>
                <Text style={{ fontSize: scaledFont('md') }}>🔥</Text>
                <Text style={[styles.streakText, { fontSize: scaledFont('sm') }]}>
                  {formatDaysCount(currentStreak)} стрик
                </Text>
              </View>
            </View>

            {/* КНОПКА НАСТРОЕК */}
            <IconButton
              icon="settings-outline"
              onPress={handleOpenSettings}
              variant="surface"
              size={40}
            />
          </View>

          {/* Статистика */}
          <View style={styles.statsRow}>
            <StatTile
              icon="trending-up"
              label="Достаток"
              value={formatCoins(totalNetWorth)}
              color={colorPalettes.emerald[500]}
            />
            <StatTile
              icon="book"
              label="Уроков"
              value={String(completedLessons)}
              color={colorPalettes.indigo[500]}
            />
            <StatTile
              icon="cube"
              label="Вещей"
              value={String(ownedItemsList.length)}
              color={colorPalettes.violet[500]}
            />
          </View>
        </View>

        {/* Текущий период (переехал сюда с хаба) */}
        {currentPeriod && currentPeriod.status === 'active' && (
          <PeriodCard period={currentPeriod} onFinish={handleFinishPeriod} />
        )}

        {/* Дневная награда (переехала сюда с хаба) */}
        <DailyRewardCard
          currentStreak={currentStreak}
          hasClaimedToday={hasClaimedToday}
          onClaim={handleClaimDailyBonus}
          isDark={isDark}
        />

        {/* Уровень + XP-прогресс */}
        <View style={{ paddingHorizontal: scale(spacing.xxl), paddingTop: scale(spacing.lg) }}>
          <LevelBadge
            level={levelInfo.level}
            title={levelTitle}
            xpIntoLevel={levelInfo.xpIntoLevel}
            xpForNext={levelInfo.xpForNext}
          />
        </View>

        {/* Мои медали */}
        <View style={{ paddingHorizontal: scale(spacing.xxl), paddingTop: scale(spacing.xl) }}>
          <MedalsPreview
            definitions={ACHIEVEMENTS}
            userAchievements={userAchievements}
            onClaim={claimAchievement}
            onViewAll={handleViewAllAchievements}
          />
        </View>

        {/* Статистика приключений */}
        <View style={{ paddingHorizontal: scale(spacing.xxl), paddingTop: scale(spacing.xl) }}>
          <AdventureStatsGrid
            coinsEarned={lifetimeCoinsEarned}
            lessonsCompleted={completedLessons}
            savingsAmount={savings?.currentAmount ?? 0}
            energyPercent={Math.round(currentMood)}
          />
        </View>

        {/* Зона для родителей */}
        {isFeatureEnabled('adult_section') && (
          <View style={{ paddingHorizontal: scale(spacing.xxl), paddingTop: scale(spacing.xl) }}>
            <ParentZoneCard onPress={handleOpenAdultSection} />
          </View>
        )}

        {/* Spider Chart */}
        <View style={[styles.section, { padding: scale(spacing.xxl) }]}>
          <View style={styles.sectionHeader}>
            <SectionTitle marginBottom={0}>Компетенции</SectionTitle>
            <TouchableOpacity
              onPress={handleOpenCompetences}
              activeOpacity={0.7}
              style={styles.sectionButton}
            >
              <Text style={[styles.sectionButtonText, { fontSize: scaledFont('md') }]}>
                Подробнее
              </Text>
              <Ionicons name="chevron-forward" size={scale(16)} color={theme.primary} />
            </TouchableOpacity>
          </View>

          <Card padding="md" style={styles.spiderCardInner}>
            <SpiderChart data={competenceData} color={theme.primary} />
          </Card>
        </View>

        {/* Стрик-календарь */}
        <View style={{ paddingHorizontal: scale(spacing.xxl), paddingBottom: scale(spacing.lg) }}>
          <SectionTitle>Стрик-календарь</SectionTitle>
          <Card padding="md">
            <StreakCalendar currentStreak={currentStreak} />
          </Card>
        </View>

        {/* Настройки */}
        <View
          style={{ paddingHorizontal: scale(spacing.xxl), paddingBottom: scale(spacing.massive) }}
        >
          <SectionTitle>Настройки</SectionTitle>
          <Card padding="none">
            <SettingsRow icon="notifications" label="Уведомления" onPress={handleOpenSettings} />
            <SettingsRow icon="volume-high" label="Звуки" onPress={handleOpenSettings} />
            <SettingsRow
              icon="color-palette"
              label="Тема"
              value={THEME_OPTIONS.find((t) => t.mode === mode)?.label || 'Системная'}
              onPress={handleOpenSettings}
            />
            <SettingsRow
              icon="phone-portrait"
              label="Вибрация"
              onPress={handleOpenSettings}
              isLast
            />
          </Card>

          <Card padding="none" style={styles.settingsCardSecondary}>
            <SettingsRow
              icon="help-circle"
              label="Помощь"
              onPress={() => {
                triggerHaptic('light');
                Alert.alert(
                  'Помощь',
                  'Если у вас возникли вопросы, напишите нам: support@finsputnik.ru'
                );
              }}
            />
            <SettingsRow
              icon="information-circle"
              label="О приложении"
              onPress={() => {
                triggerHaptic('light');
                Alert.alert('Финни', 'Версия 1.0.0\nРазработано на хакатоне с ❤️');
              }}
              isLast
            />
          </Card>
        </View>
      </ScrollView>

      {/* МОДАЛКА НАСТРОЕК С ПЕРЕКЛЮЧАТЕЛЕМ ТЕМЫ */}
      <SettingsModal
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        currentMode={mode}
        onModeChange={setMode}
      />

      {/* МОДАЛКА КОМПЕТЕНЦИЙ */}
      <CompetencesModal
        visible={showCompetences}
        onClose={() => setShowCompetences(false)}
        data={competenceData}
      />

      {/* МОДАЛКА ВСЕХ ДОСТИЖЕНИЙ */}
      <AllAchievementsModal
        visible={showAllAchievements}
        onClose={() => setShowAllAchievements(false)}
        definitions={ACHIEVEMENTS}
        userAchievements={userAchievements}
        onClaim={claimAchievement}
      />
    </View>
  );
}
