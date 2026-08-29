// app/(tabs)/index.tsx
// Главный Хаб — Комната с питомцем (улучшенный визуал)

import { PetRoom } from '@/components/pet/PetRoom';
import { COLORS } from '@/constants/theme';
import { useDaily } from '@/lib/hooks/useDaily';
import { useFeedback } from '@/lib/hooks/useFeedback';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { usePet } from '@/lib/hooks/usePet';
import { useShop } from '@/lib/hooks/useShop';
import { useUser } from '@/lib/hooks/useUser';
import { usePetStore } from '@/lib/stores/petStore';
import { useUserStore } from '@/lib/stores/userStore';
import { formatCoins, formatTimeUntilFullMood } from '@/lib/utils/formatters';
import { getMoodBlockMessage } from '@/lib/utils/moodCalculator';
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

export default function HubScreen() {
  const router = useRouter();
  const { trigger, triggerHaptic } = useFeedback();
  const { scheduleMoodRestored } = useNotifications();

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

  const hasError = userError || petError;
  const isLoading = userLoading || petLoading;

  useEffect(() => {
    checkAndUpdateStreak();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const placedDecor = getPlacedDecor().map((item, index) => ({
    id: item.id,
    name: item.name,
    icon: item.icon,
    position: (index % 2 === 0 ? 'left' : 'right') as 'left' | 'right',
  }));

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
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: COLORS.background,
        }}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ color: COLORS.textSecondary, marginTop: 16 }}>Загрузка...</Text>
      </View>
    );
  }

  if (hasError && !user) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: COLORS.background,
          padding: 24,
        }}
      >
        <Text style={{ fontSize: 64, marginBottom: 16 }}>😵</Text>
        <Text
          style={{
            color: 'white',
            fontSize: 20,
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: 8,
          }}
        >
          Не удалось загрузить данные
        </Text>
        <Text style={{ color: COLORS.textSecondary, textAlign: 'center', marginBottom: 24 }}>
          Проверьте подключение к интернету и попробуйте снова
        </Text>
        <TouchableOpacity
          onPress={handleRefresh}
          style={{
            backgroundColor: COLORS.primary,
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 12,
          }}
        >
          <Text style={{ color: 'white', fontWeight: '600' }}>Повторить</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const moodBlockMessage = getMoodBlockMessage(currentMood);
  const totalMoodBuff = moodBuffs + getTotalMoodBuff();
  const timeUntilFull = pet
    ? formatTimeUntilFullMood(currentMood, pet.base_recovery_rate + totalMoodBuff)
    : null;

  const petType: 'robot' | 'dragon' | 'cat' = 'robot';
  const petName = userData?.pet?.id ? 'Ваш помощник' : 'Помощник';

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.background }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={handleRefresh}
          tintColor={COLORS.primary}
        />
      }
    >
      {/* Шапка с балансом */}
      <LinearGradient
        colors={['#1E293B', '#0F172A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ paddingTop: 56, paddingBottom: 24, paddingHorizontal: 24 }}
      >
        {/* Приветствие и баланс */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
          }}
        >
          <View>
            <Text style={{ color: COLORS.textSecondary, fontSize: 14, marginBottom: 2 }}>
              Привет, {user?.username || 'Игрок'}! 👋
            </Text>
            <Text style={{ color: 'white', fontSize: 28, fontWeight: 'bold' }}>
              {formatCoins(totalNetWorth)}
            </Text>
            <Text style={{ color: COLORS.textMuted, fontSize: 12, marginTop: 2 }}>
              Общий достаток
            </Text>
          </View>

          {/* Баланс монет */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              backgroundColor: 'rgba(251, 191, 36, 0.15)',
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 24,
              borderWidth: 1,
              borderColor: 'rgba(251, 191, 36, 0.3)',
            }}
          >
            <Ionicons name="wallet" size={20} color={COLORS.coins} />
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
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
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              borderWidth: 1,
              borderColor: 'rgba(239, 68, 68, 0.3)',
              borderRadius: 12,
              padding: 12,
              marginTop: 16,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Ionicons name="alert-circle" size={18} color="#EF4444" />
            <Text style={{ color: '#FCA5A5', fontSize: 13, flex: 1 }}>{moodBlockMessage}</Text>
          </View>
        )}

        {/* Бонус за настроение */}
        {currentMood > 50 && (
          <View
            style={{
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              borderWidth: 1,
              borderColor: 'rgba(34, 197, 94, 0.3)',
              borderRadius: 12,
              padding: 12,
              marginTop: 16,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Text style={{ fontSize: 16 }}>✨</Text>
            <Text style={{ color: '#86EFAC', fontSize: 13, flex: 1 }}>
              Настроение выше 50% — бонус к доходу активен!
            </Text>
          </View>
        )}

        {/* Время до полного восстановления */}
        {timeUntilFull && currentMood < 100 && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              marginTop: 12,
            }}
          >
            <Ionicons name="time-outline" size={14} color={COLORS.textMuted} />
            <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>
              До полного настроения: {timeUntilFull}
            </Text>
          </View>
        )}
      </LinearGradient>

      {/* Быстрые действия */}
      <View style={{ padding: 24, paddingTop: 20 }}>
        <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>
          Быстрые действия
        </Text>

        {/* Первый ряд */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
          <ActionButton
            icon="school"
            title="Обучение"
            subtitle={currentMood <= 0 ? 'Недоступно' : '7 веток'}
            gradient={['#6366F1', '#8B5CF6']}
            onPress={() => navigateTo('/(tabs)/learn')}
            disabled={currentMood <= 0}
          />
          <ActionButton
            icon="chatbubbles"
            title="ИИ-Наставник"
            subtitle="5 в день бесплатно"
            gradient={['#A855F7', '#EC4899']}
            onPress={() => navigateTo('/(modal)/ai-chat')}
          />
        </View>

        {/* Второй ряд */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <ActionButton
            icon="trending-up"
            title="Вклады"
            subtitle="+2% в день"
            gradient={['#22C55E', '#14B8A6']}
            onPress={() => navigateTo('/(modal)/deposit')}
          />
          <ActionButton
            icon="cube"
            title="Инвентарь"
            subtitle="Мои вещи"
            gradient={['#F59E0B', '#F97316']}
            onPress={() => navigateTo('/(modal)/inventory')}
          />
        </View>
      </View>

      {/* Ежедневная награда */}
      <View style={{ paddingHorizontal: 24, paddingBottom: 16 }}>
        <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>
          Ежедневная награда
        </Text>

        <TouchableOpacity
          onPress={handleClaimDailyBonus}
          disabled={hasClaimedToday}
          activeOpacity={0.8}
          style={{
            borderRadius: 20,
            overflow: 'hidden',
            opacity: hasClaimedToday ? 0.6 : 1,
          }}
        >
          <LinearGradient
            colors={hasClaimedToday ? ['#334155', '#1E293B'] : ['#F59E0B', '#F97316']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              padding: 20,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 24 }}>{hasClaimedToday ? '✓' : '🎁'}</Text>
              </View>
              <View>
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
                  {hasClaimedToday ? 'Награда получена' : 'Забрать награду'}
                </Text>
                <Text
                  style={{
                    color: hasClaimedToday ? COLORS.textSecondary : 'rgba(255,255,255,0.9)',
                    fontSize: 13,
                  }}
                >
                  День {currentStreak + (hasClaimedToday ? 0 : 1)} из 7
                </Text>
              </View>
            </View>
            <View
              style={{
                backgroundColor: hasClaimedToday
                  ? 'rgba(255,255,255,0.1)'
                  : 'rgba(255,255,255,0.25)',
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
              }}
            >
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>
                {hasClaimedToday ? 'Получено' : 'Забрать'}
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Мини-календарь стрика */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
          {[1, 2, 3, 4, 5, 6, 7].map((day) => {
            const isCompleted = day <= currentStreak;
            const isToday = day === currentStreak + 1 && !hasClaimedToday;
            const isSuperCase = day === 7;

            return (
              <View key={day} style={{ alignItems: 'center' }}>
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    alignItems: 'center',
                    justifyContent: 'center',
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
                    <Ionicons name="checkmark" size={16} color="white" />
                  ) : isSuperCase && !isCompleted ? (
                    <Text style={{ fontSize: 14 }}>🎁</Text>
                  ) : (
                    <Text
                      style={{
                        color: isToday ? 'black' : COLORS.textMuted,
                        fontSize: 12,
                        fontWeight: 'bold',
                      }}
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
      <View style={{ paddingHorizontal: 24, paddingBottom: 32 }}>
        <TouchableOpacity
          onPress={() => triggerHaptic('light')}
          activeOpacity={0.8}
          style={{
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            borderWidth: 1,
            borderColor: 'rgba(99, 102, 241, 0.3)',
            borderRadius: 16,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: 12,
          }}
        >
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: 'rgba(99, 102, 241, 0.2)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="bulb" size={18} color={COLORS.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: 'white', fontWeight: '600', fontSize: 14, marginBottom: 4 }}>
              Совет дня
            </Text>
            <Text style={{ color: COLORS.textSecondary, fontSize: 13, lineHeight: 18 }}>
              Покупайте декор в магазине — он даёт бонус к восстановлению настроения!
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

/**
 * Кнопка быстрого действия с градиентом
 */
function ActionButton({
  icon,
  title,
  subtitle,
  gradient,
  onPress,
  disabled,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  gradient: [string, string];
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={{ flex: 1, borderRadius: 20, overflow: 'hidden', opacity: disabled ? 0.5 : 1 }}
    >
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ padding: 16, alignItems: 'center' }}
      >
        <Ionicons name={icon} size={28} color="white" />
        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 15, marginTop: 8 }}>
          {title}
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, marginTop: 2 }}>
          {subtitle}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}
