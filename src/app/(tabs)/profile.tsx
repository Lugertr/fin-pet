// app/(tabs)/profile.tsx
// Профиль: Spider Chart, статистика, стрик-календарь, настройки

import { SpiderChart } from '@/components/charts/SpiderChart';
import { Badge } from '@/components/ui/Badge';
import { COLORS } from '@/constants/theme';
import { useFeedback } from '@/lib/hooks/useFeedback';
import { useLessonsStore } from '@/lib/hooks/useLessons';
import { useShop } from '@/lib/hooks/useShop';
import { useUserStore } from '@/lib/stores/userStore';
import { formatCoins, formatDaysCount } from '@/lib/utils/formatters';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

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

export default function ProfileScreen() {
  const { user, totalNetWorth } = useUserStore();
  const { progress } = useLessonsStore();
  const { getOwnedItems } = useShop();
  const { triggerHaptic } = useFeedback();
  const [currentStreak] = useState(5);

  const completedLessons = Object.values(progress).filter((p) => p.status === 'completed').length;
  const ownedItems = getOwnedItems();

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Шапка профиля с градиентом */}
        <LinearGradient
          colors={['#4F46E5', '#7C3AED', '#DB2777']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingTop: 60, paddingBottom: 30, paddingHorizontal: 24 }}
        >
          {/* Аватар и основная инфа */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
            {/* Аватар с обводкой */}
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                borderWidth: 3,
                borderColor: 'rgba(255,255,255,0.3)',
                backgroundColor: 'rgba(255,255,255,0.2)',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 16,
              }}
            >
              <Text style={{ fontSize: 40 }}>🤖</Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: 'white',
                  fontSize: 24,
                  fontWeight: 'bold',
                  marginBottom: 4,
                }}
              >
                {user?.username || 'Игрок'}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ fontSize: 16 }}>🔥</Text>
                <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>
                  {formatDaysCount(currentStreak)} стрик
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => triggerHaptic('light')}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: 'rgba(255,255,255,0.2)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="settings-outline" size={20} color="white" />
            </TouchableOpacity>
          </View>

          {/* Статистика — 4 карточки */}
          <View style={{ flexDirection: 'row', gap: 10 }}>
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
        <View style={{ padding: 24, paddingTop: 24 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16,
            }}
          >
            <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>Компетенции</Text>
            <TouchableOpacity
              onPress={() => triggerHaptic('light')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Text style={{ color: COLORS.primary, fontSize: 14, fontWeight: '500' }}>
                Подробнее
              </Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          <View
            style={{
              backgroundColor: COLORS.surface,
              borderRadius: 24,
              padding: 16,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: COLORS.surfaceLight,
            }}
          >
            <SpiderChart data={SPIDER_DATA} color={COLORS.primary} />
          </View>
        </View>

        {/* Стрик-календарь */}
        <View style={{ paddingHorizontal: 24, paddingBottom: 16 }}>
          <Text
            style={{
              color: 'white',
              fontSize: 20,
              fontWeight: 'bold',
              marginBottom: 16,
            }}
          >
            Стрик-календарь
          </Text>
          <View
            style={{
              backgroundColor: COLORS.surface,
              borderRadius: 20,
              padding: 20,
              borderWidth: 1,
              borderColor: COLORS.surfaceLight,
            }}
          >
            <StreakCalendar currentStreak={currentStreak} />
          </View>
        </View>

        {/* Достижения */}
        <View style={{ paddingHorizontal: 24, paddingBottom: 16 }}>
          <Text
            style={{
              color: 'white',
              fontSize: 20,
              fontWeight: 'bold',
              marginBottom: 16,
            }}
          >
            Достижения
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <AchievementCard icon="🎯" title="Первый урок" unlocked />
              <AchievementCard icon="🔥" title="7 дней" unlocked />
              <AchievementCard icon="💰" title="1000 монет" unlocked />
              <AchievementCard icon="📚" title="10 уроков" unlocked={false} />
              <AchievementCard icon="🏆" title="Все ветки" unlocked={false} />
            </View>
          </ScrollView>
        </View>

        {/* Настройки */}
        <View style={{ paddingHorizontal: 24, paddingBottom: 40 }}>
          <Text
            style={{
              color: 'white',
              fontSize: 20,
              fontWeight: 'bold',
              marginBottom: 16,
            }}
          >
            Настройки
          </Text>
          <View
            style={{
              backgroundColor: COLORS.surface,
              borderRadius: 20,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: COLORS.surfaceLight,
            }}
          >
            <SettingsRow icon="notifications" label="Уведомления" value="Вкл" />
            <SettingsRow icon="volume-high" label="Звуки" value="Вкл" />
            <SettingsRow icon="phone-portrait" label="Вибрация" value="Вкл" />
            <SettingsRow icon="moon" label="Тёмная тема" value="Вкл" isLast />
          </View>

          <View
            style={{
              backgroundColor: COLORS.surface,
              borderRadius: 20,
              overflow: 'hidden',
              marginTop: 12,
              borderWidth: 1,
              borderColor: COLORS.surfaceLight,
            }}
          >
            <SettingsRow icon="help-circle" label="Помощь" />
            <SettingsRow icon="information-circle" label="О приложении" />
            <SettingsRow icon="log-out" label="Выйти" danger isLast />
          </View>
        </View>
      </ScrollView>
    </View>
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
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 14,
        padding: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
      }}
    >
      <Ionicons name={icon} size={18} color={color} />
      <Text
        style={{
          color: 'white',
          fontWeight: 'bold',
          fontSize: 13,
          marginTop: 4,
          marginBottom: 2,
        }}
        numberOfLines={1}
      >
        {value}
      </Text>
      <Text
        style={{
          color: 'rgba(255,255,255,0.7)',
          fontSize: 10,
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
  const days = [1, 2, 3, 4, 5, 6, 7];
  const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
        {days.map((day) => {
          const isCompleted = day <= currentStreak;
          const isToday = day === currentStreak + 1;
          const isSuperCase = day === 7;

          return (
            <View key={day} style={{ alignItems: 'center', flex: 1 }}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 6,
                  backgroundColor: isCompleted
                    ? COLORS.success
                    : isToday
                      ? COLORS.accent
                      : COLORS.surfaceLight,
                  borderWidth: isToday ? 2 : 0,
                  borderColor: isToday ? '#FDE68A' : 'transparent',
                }}
              >
                {isCompleted ? (
                  <Ionicons name="checkmark" size={18} color="white" />
                ) : isSuperCase ? (
                  <Text style={{ fontSize: 16 }}>🎁</Text>
                ) : (
                  <Text
                    style={{
                      color: isToday ? 'black' : COLORS.textMuted,
                      fontSize: 13,
                      fontWeight: 'bold',
                    }}
                  >
                    {day}
                  </Text>
                )}
              </View>
              <Text style={{ color: COLORS.textMuted, fontSize: 10 }}>{dayNames[day - 1]}</Text>
            </View>
          );
        })}
      </View>

      {/* Прогресс-бар стрика */}
      <View
        style={{
          height: 6,
          backgroundColor: COLORS.surfaceLight,
          borderRadius: 3,
          overflow: 'hidden',
          marginBottom: 12,
        }}
      >
        <View
          style={{
            height: '100%',
            width: `${(currentStreak / 7) * 100}%`,
            backgroundColor: COLORS.accent,
            borderRadius: 3,
          }}
        />
      </View>

      <View
        style={{
          backgroundColor: `${COLORS.accent}15`,
          borderRadius: 12,
          padding: 12,
          borderWidth: 1,
          borderColor: `${COLORS.accent}40`,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <Text style={{ fontSize: 20 }}>🎁</Text>
        <Text style={{ color: COLORS.accent, fontSize: 13, flex: 1 }}>
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
  return (
    <View
      style={{
        width: 110,
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        opacity: unlocked ? 1 : 0.4,
        borderWidth: 1,
        borderColor: unlocked ? COLORS.success : COLORS.surfaceLight,
      }}
    >
      <Text style={{ fontSize: 32, marginBottom: 8 }}>{icon}</Text>
      <Text
        style={{
          color: 'white',
          fontSize: 12,
          fontWeight: '500',
          textAlign: 'center',
          marginBottom: 8,
        }}
        numberOfLines={2}
      >
        {title}
      </Text>
      <Badge label={unlocked ? 'Получено' : 'Закрыто'} variant={unlocked ? 'success' : 'neutral'} />
    </View>
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
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  danger?: boolean;
  isLast?: boolean;
}) {
  const { triggerHaptic } = useFeedback();

  return (
    <TouchableOpacity
      onPress={() => triggerHaptic('light')}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: COLORS.surfaceLight,
      }}
      activeOpacity={0.7}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: danger ? 'rgba(239, 68, 68, 0.15)' : 'rgba(99, 102, 241, 0.15)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name={icon} size={18} color={danger ? COLORS.error : COLORS.primary} />
        </View>
        <Text
          style={{
            color: danger ? COLORS.error : 'white',
            fontSize: 15,
            fontWeight: '500',
          }}
        >
          {label}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {value && <Text style={{ color: COLORS.textSecondary, fontSize: 14 }}>{value}</Text>}
        <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
      </View>
    </TouchableOpacity>
  );
}
