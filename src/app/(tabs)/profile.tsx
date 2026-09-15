// src/app/(tabs)/profile.tsx
// Профиль: статистика, компетенции, достижения, настройки с переключателем тем

import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Modal, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';

import { SpiderChart } from '@/components/charts/SpiderChart';
import { Badge } from '@/components/ui';
import { useFeedback } from '@/lib/hooks/useFeedback';
import { useLessonsStore } from '@/lib/hooks/useLessons';
import { useShop } from '@/lib/hooks/useShop';
import { feedback } from '@/lib/services/feedback';
import { notifications } from '@/lib/services/notifications';
import { useUserStore } from '@/lib/stores/userStore';
import { formatCoins, formatDaysCount } from '@/lib/utils/formatters';
import { ThemeMode, useResponsive, useTheme } from '@/theme';
import { fontWeights, spacing } from '@/theme/tokens';
import type { IconName } from '@/types/icons';
import { createProfileStyles } from '../../styles/screens/tabs/_profile.styles';

// Данные для Spider Chart
const SPIDER_DATA = [
  { label: 'Бюджет', value: 75 },
  { label: 'Безопасность', value: 60 },
  { label: 'Инвестиции', value: 45 },
  { label: 'Налоги', value: 30 },
  { label: 'Кредиты', value: 55 },
  { label: 'Бизнес', value: 40 },
  { label: 'Экономика', value: 65 },
];

// Варианты тем для переключателя
const THEME_OPTIONS: { mode: ThemeMode; label: string; icon: IconName }[] = [
  { mode: 'system', label: 'Системная', icon: 'phone-portrait' },
  { mode: 'light', label: 'Светлая', icon: 'sunny' },
  { mode: 'dark', label: 'Тёмная', icon: 'moon' },
  { mode: 'amoled', label: 'AMOLED', icon: 'contrast' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { theme, mode, setMode } = useTheme();
  const { scale, scaledFont } = useResponsive(); // ✅ Используем scale и scaledFont
  const { user, totalNetWorth } = useUserStore();
  const { progress } = useLessonsStore();
  const { getOwnedItems } = useShop();
  const { triggerHaptic } = useFeedback();

  const styles = createProfileStyles({ theme });

  const [currentStreak] = useState(5);
  const [showSettings, setShowSettings] = useState(false);
  const [showCompetences, setShowCompetences] = useState(false);

  const completedLessons = Object.values(progress).filter((p) => p.status === 'completed').length;
  const ownedItems = getOwnedItems();

  const headerGradient: [string, string, string] = ['#4F46E5', '#7C3AED', '#DB2777'];

  const handleOpenSettings = () => {
    triggerHaptic('light');
    setShowSettings(true);
  };

  const handleOpenCompetences = () => {
    triggerHaptic('light');
    setShowCompetences(true);
  };

  const handleLogout = () => {
    triggerHaptic('medium');
    Alert.alert('Выход из аккаунта', 'Все данные будут удалены. Вы уверены?', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Выйти',
        style: 'destructive',
        onPress: async () => {
          try {
            await AsyncStorage.clear();
            router.replace('/(auth)/onboarding' as never);
          } catch (error) {
            console.error('[Logout] Ошибка:', error);
            Alert.alert('Ошибка', 'Не удалось выйти из аккаунта');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Шапка профиля с градиентом */}
        <LinearGradient
          colors={headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.header, { paddingTop: scale(60), paddingBottom: scale(30) }]}
        >
          {/* Аватар и основная инфа */}
          <View style={styles.headerTopRow}>
            <View
              style={[
                styles.avatarContainer,
                {
                  width: scale(80),
                  height: scale(80),
                  borderRadius: scale(40),
                  marginRight: scale(spacing.lg),
                },
              ]}
            >
              <Text style={{ fontSize: scale(40) }}>🤖</Text>
            </View>

            <View style={styles.userInfoContainer}>
              <Text style={[styles.username, { fontSize: scaledFont('xxl') }]}>
                {user?.username || 'Игрок'}
              </Text>
              <View style={styles.streakRow}>
                <Text style={{ fontSize: scale(16) }}>🔥</Text>
                <Text style={[styles.streakText, { fontSize: scaledFont('md') }]}>
                  {formatDaysCount(currentStreak)} стрик
                </Text>
              </View>
            </View>

            {/* КНОПКА НАСТРОЕК */}
            <TouchableOpacity
              onPress={handleOpenSettings}
              activeOpacity={0.7}
              style={[styles.settingsButton, { width: scale(40), height: scale(40) }]}
            >
              <Ionicons name="settings-outline" size={scale(20)} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Статистика */}
          <View style={styles.statsRow}>
            <StatTile
              icon="wallet"
              label="Баланс"
              value={formatCoins(user?.liquid_balance || 0)}
              color="#FBBF24"
            />
            <StatTile
              icon="trending-up"
              label="Достаток"
              value={formatCoins(totalNetWorth)}
              color="#34D399"
            />
            <StatTile icon="book" label="Уроков" value={String(completedLessons)} color="#60A5FA" />
            <StatTile icon="cube" label="Вещей" value={String(ownedItems.length)} color="#F472B6" />
          </View>
        </LinearGradient>

        {/* Spider Chart */}
        <View style={[styles.section, { padding: scale(spacing.xxl) }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { fontSize: scaledFont('xxl') }]}>Компетенции</Text>
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

          <View style={styles.spiderCard}>
            <SpiderChart data={SPIDER_DATA} color={theme.primary} />
          </View>
        </View>

        {/* Стрик-календарь */}
        <View style={{ paddingHorizontal: scale(spacing.xxl), paddingBottom: scale(spacing.lg) }}>
          <Text
            style={[
              styles.sectionTitle,
              { fontSize: scaledFont('xxl'), marginBottom: scale(spacing.lg) },
            ]}
          >
            Стрик-календарь
          </Text>
          <View style={styles.streakCard}>
            <StreakCalendar currentStreak={currentStreak} />
          </View>
        </View>

        {/* Достижения */}
        <View style={{ paddingHorizontal: scale(spacing.xxl), paddingBottom: scale(spacing.lg) }}>
          <Text
            style={[
              styles.sectionTitle,
              { fontSize: scaledFont('xxl'), marginBottom: scale(spacing.lg) },
            ]}
          >
            Достижения
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.achievementsRow}
          >
            <AchievementCard icon="🎯" title="Первый урок" unlocked />
            <AchievementCard icon="🔥" title="7 дней" unlocked />
            <AchievementCard icon="💰" title="1000 монет" unlocked />
            <AchievementCard icon="📚" title="10 уроков" unlocked={false} />
            <AchievementCard icon="🏆" title="Все ветки" unlocked={false} />
          </ScrollView>
        </View>

        {/* Настройки */}
        <View
          style={{ paddingHorizontal: scale(spacing.xxl), paddingBottom: scale(spacing.massive) }}
        >
          <Text
            style={[
              styles.sectionTitle,
              { fontSize: scaledFont('xxl'), marginBottom: scale(spacing.lg) },
            ]}
          >
            Настройки
          </Text>
          <View style={styles.settingsCard}>
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
          </View>

          <View style={[styles.settingsCard, styles.settingsCardSecondary]}>
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
                Alert.alert('ФинСпутник', 'Версия 1.0.0\nРазработано на хакатоне с ❤️');
              }}
            />
            <SettingsRow icon="log-out" label="Выйти" danger onPress={handleLogout} isLast />
          </View>
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
      <CompetencesModal visible={showCompetences} onClose={() => setShowCompetences(false)} />
    </View>
  );
}

/**
 * Модалка настроек с переключателем темы
 */
function SettingsModal({
  visible,
  onClose,
  currentMode,
  onModeChange,
}: {
  visible: boolean;
  onClose: () => void;
  currentMode: ThemeMode;
  onModeChange: (mode: ThemeMode) => void;
}) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const { triggerHaptic } = useFeedback();

  const styles = createProfileStyles({ theme });

  const [soundsEnabled, setSoundsEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleToggleSounds = (value: boolean) => {
    triggerHaptic('light');
    setSoundsEnabled(value);
    feedback.setSoundsEnabled(value);
  };

  const handleToggleHaptics = (value: boolean) => {
    if (value) triggerHaptic('light');
    setHapticsEnabled(value);
    feedback.setHapticsEnabled(value);
  };

  const handleToggleNotifications = (value: boolean) => {
    triggerHaptic('light');
    setNotificationsEnabled(value);
    notifications.setEnabled(value);
  };

  const handleModeChange = (mode: ThemeMode) => {
    triggerHaptic('selection');
    onModeChange(mode);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
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
          <Text style={[styles.modalTitle, { fontSize: scaledFont('xxl') }]}>Настройки</Text>
          <Text style={[styles.modalSubtitle, { fontSize: scaledFont('md') }]}>
            Настройте приложение под себя
          </Text>

          {/* Переключатели */}
          <View style={styles.toggleRowsContainer}>
            {/* Звуки */}
            <View style={styles.toggleRow}>
              <View style={styles.toggleRowLeft}>
                <View
                  style={[styles.toggleIconBox, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}
                >
                  <Ionicons name="volume-high" size={scale(18)} color={theme.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.toggleLabel}>Звуки</Text>
                  <Text style={styles.toggleDescription}>Звуковые эффекты при действиях</Text>
                </View>
              </View>
              <Switch
                value={soundsEnabled}
                onValueChange={handleToggleSounds}
                trackColor={{ false: theme.textMuted, true: theme.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* Вибрация */}
            <View style={styles.toggleRow}>
              <View style={styles.toggleRowLeft}>
                <View
                  style={[styles.toggleIconBox, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}
                >
                  <Ionicons name="phone-portrait" size={scale(18)} color={theme.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.toggleLabel}>Вибрация</Text>
                  <Text style={styles.toggleDescription}>Тактильная отдача при нажатиях</Text>
                </View>
              </View>
              <Switch
                value={hapticsEnabled}
                onValueChange={handleToggleHaptics}
                trackColor={{ false: theme.textMuted, true: theme.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* Уведомления */}
            <View style={styles.toggleRow}>
              <View style={styles.toggleRowLeft}>
                <View
                  style={[styles.toggleIconBox, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}
                >
                  <Ionicons name="notifications" size={scale(18)} color={theme.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.toggleLabel}>Уведомления</Text>
                  <Text style={styles.toggleDescription}>Напоминания о стрике и наградах</Text>
                </View>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={handleToggleNotifications}
                trackColor={{ false: theme.textMuted, true: theme.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          {/* ПЕРЕКЛЮЧАТЕЛЬ ТЕМЫ */}
          <Text
            style={{
              color: theme.textPrimary,
              fontSize: scaledFont('md'),
              fontWeight: fontWeights.semibold,
              marginBottom: scale(spacing.md),
            }}
          >
            Тема приложения
          </Text>
          <View style={{ gap: scale(spacing.sm), marginBottom: scale(spacing.xxl) }}>
            {THEME_OPTIONS.map((option) => {
              const isActive = currentMode === option.mode;
              return (
                <TouchableOpacity
                  key={option.mode}
                  onPress={() => handleModeChange(option.mode)}
                  activeOpacity={0.7}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: isActive ? `${theme.primary}20` : theme.surfaceLight,
                    borderRadius: scale(spacing.md),
                    padding: scale(spacing.md),
                    borderWidth: 1,
                    borderColor: isActive ? theme.primary : 'transparent',
                  }}
                >
                  <View
                    style={{ flexDirection: 'row', alignItems: 'center', gap: scale(spacing.sm) }}
                  >
                    <Ionicons
                      name={option.icon}
                      size={scale(18)}
                      color={isActive ? theme.primary : theme.textSecondary}
                    />
                    <Text
                      style={{
                        color: isActive ? theme.primary : theme.textPrimary,
                        fontSize: scaledFont('md'),
                        fontWeight: isActive ? fontWeights.bold : fontWeights.medium,
                      }}
                    >
                      {option.label}
                    </Text>
                  </View>
                  {isActive && (
                    <Ionicons name="checkmark-circle" size={scale(20)} color={theme.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Кнопка закрытия */}
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.8}
            style={[styles.modalButton, { backgroundColor: theme.primary }]}
          >
            <Text style={styles.modalButtonText}>Готово</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

/**
 * Модалка компетенций с деталями
 */
function CompetencesModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();

  const styles = createProfileStyles({ theme });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          onPress={onClose}
        />

        <View
          style={[
            styles.modalContent,
            { padding: scale(spacing.xxl), paddingTop: scale(spacing.xxxl), maxHeight: '80%' },
          ]}
        >
          <Text
            style={[
              styles.modalTitle,
              { fontSize: scaledFont('xxl'), marginBottom: scale(spacing.lg) },
            ]}
          >
            Ваши компетенции
          </Text>

          <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
            {SPIDER_DATA.map((item) => (
              <View key={item.label} style={styles.competenceRow}>
                <Text style={[styles.competenceName, { fontSize: scaledFont('md') }]}>
                  {item.label}
                </Text>
                <View style={styles.competenceRightRow}>
                  <View style={styles.competenceProgressBar}>
                    <LinearGradient
                      colors={theme.gradients.primary}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{ height: '100%', width: `${item.value}%` }}
                    />
                  </View>
                  <Text style={[styles.competencePercent, { fontSize: scaledFont('sm') }]}>
                    {item.value}%
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.8}
            style={[
              styles.modalButton,
              { backgroundColor: theme.primary, marginTop: scale(spacing.xl) },
            ]}
          >
            <Text style={styles.modalButtonText}>Закрыть</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

/**
 * Строка настроек
 */
function SettingsRow({
  icon,
  label,
  value,
  danger,
  isLast,
  onPress,
}: {
  icon: IconName;
  label: string;
  value?: string;
  danger?: boolean;
  isLast?: boolean;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();

  const styles = createProfileStyles({ theme });

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.settingsRow,
        {
          padding: scale(spacing.lg),
          borderBottomWidth: isLast ? 0 : 1,
          borderBottomColor: theme.divider,
        },
      ]}
    >
      <View style={styles.settingsRowLeft}>
        <View
          style={[
            styles.settingsIconBox,
            {
              backgroundColor: danger ? 'rgba(239, 68, 68, 0.15)' : 'rgba(99, 102, 241, 0.15)',
            },
          ]}
        >
          <Ionicons name={icon} size={scale(18)} color={danger ? theme.error : theme.primary} />
        </View>
        <Text
          style={[
            styles.settingsLabel,
            {
              color: danger ? theme.error : theme.textPrimary,
              fontSize: scaledFont('lg'),
            },
          ]}
        >
          {label}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: scale(spacing.sm) }}>
        {value && (
          <Text style={{ color: theme.textSecondary, fontSize: scaledFont('md') }}>{value}</Text>
        )}
        <Ionicons name="chevron-forward" size={scale(16)} color={theme.textMuted} />
      </View>
    </TouchableOpacity>
  );
}

/**
 * Карточка статистики в шапке
 */
function StatTile({
  icon,
  label,
  value,
  color,
}: {
  icon: IconName;
  label: string;
  value: string;
  color: string;
}) {
  const { scale, scaledFont } = useResponsive();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: scale(spacing.md),
        padding: scale(spacing.sm),
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
      }}
    >
      <Ionicons name={icon} size={scale(18)} color={color} />
      <Text
        style={{
          color: '#FFFFFF',
          fontWeight: fontWeights.bold,
          fontSize: scaledFont('sm'),
          marginTop: scale(spacing.xs),
          marginBottom: scale(spacing.xxs),
        }}
        numberOfLines={1}
      >
        {value}
      </Text>
      <Text
        style={{
          color: 'rgba(255,255,255,0.7)',
          fontSize: scaledFont('xxs'),
        }}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

/**
 * Стрик-календарь
 */
function StreakCalendar({ currentStreak }: { currentStreak: number }) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();

  const styles = createProfileStyles({ theme });

  const days = [1, 2, 3, 4, 5, 6, 7];
  const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  return (
    <View>
      <View style={styles.streakDaysRow}>
        {days.map((day) => {
          const isCompleted = day <= currentStreak;
          const isToday = day === currentStreak + 1;
          const isSuperCase = day === 7;

          return (
            <View key={day} style={styles.streakDayContainer}>
              <View
                style={[
                  styles.streakDayCircle,
                  {
                    width: scale(36),
                    height: scale(36),
                    borderRadius: scale(18),
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
                  <Ionicons name="checkmark" size={scale(18)} color="#FFFFFF" />
                ) : isSuperCase ? (
                  <Text style={{ fontSize: scale(16) }}>🎁</Text>
                ) : (
                  <Text
                    style={[
                      styles.streakDayNumber,
                      { color: isToday ? '#000000' : theme.textMuted, fontSize: scaledFont('sm') },
                    ]}
                  >
                    {day}
                  </Text>
                )}
              </View>
              <Text style={[styles.streakDayName, { fontSize: scaledFont('xxs') }]}>
                {dayNames[day - 1]}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.streakProgressBar}>
        <LinearGradient
          colors={['#F59E0B', '#FBBF24']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            height: '100%',
            width: `${(currentStreak / 7) * 100}%`,
          }}
        />
      </View>

      <View
        style={[
          styles.streakInfoBanner,
          {
            backgroundColor: `${theme.warning}15`,
            borderColor: `${theme.warning}40`,
          },
        ]}
      >
        <Text style={{ fontSize: scale(20) }}>🎁</Text>
        <Text style={[styles.streakInfoText, { color: theme.warning, fontSize: scaledFont('sm') }]}>
          Супер-кейс с редкими предметами на 7-й день серии!
        </Text>
      </View>
    </View>
  );
}

/**
 * Карточка достижения
 */
function AchievementCard({
  icon,
  title,
  unlocked,
}: {
  icon: string;
  title: string;
  unlocked: boolean;
}) {
  const { theme } = useTheme();
  const { scale, scaledFont } = useResponsive();
  const { triggerHaptic } = useFeedback();

  const styles = createProfileStyles({ theme });

  return (
    <TouchableOpacity
      onPress={() => {
        triggerHaptic('light');
        Alert.alert(
          title,
          unlocked ? 'Достижение получено! 🎉' : 'Достижение ещё не получено. Продолжайте играть!'
        );
      }}
      activeOpacity={0.7}
      style={[
        styles.achievementCard,
        {
          width: scale(110),
          padding: scale(spacing.lg),
          opacity: unlocked ? 1 : 0.4,
          borderColor: unlocked ? theme.success : theme.borderLight,
        },
      ]}
    >
      <Text style={{ fontSize: scale(32), marginBottom: scale(spacing.sm) }}>{icon}</Text>
      <Text
        style={[
          styles.achievementTitle,
          { fontSize: scaledFont('sm'), marginBottom: scale(spacing.sm) },
        ]}
        numberOfLines={2}
      >
        {title}
      </Text>
      <Badge
        label={unlocked ? 'Получено' : 'Закрыто'}
        variant={unlocked ? 'success' : 'neutral'}
        size="sm"
      />
    </TouchableOpacity>
  );
}
