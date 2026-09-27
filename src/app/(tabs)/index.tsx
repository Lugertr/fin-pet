// app/(tabs)/index.tsx
// Главный Хаб — только комната питомца + кнопка «Начать приключение», см.
// HubHeader.tsx. Пока идёт приключение, хаба нет: на его месте (на этой же
// вкладке) показывается экран приключения — AdventureActiveView.
// Ежедневная награда — модалка DailyRewardModal при первом за день заходе
// (не в день создания профиля, см. domain/daily/DailyReward.ts). Этот файл отвечает
// за загрузку общих данных (сторы, эффекты) и рендер комнаты; фоновая
// загрузка прогресса/накоплений/текущего приключения остаётся здесь, даже
// когда сами карточки не видны на этом экране — это данные для других экранов
// и для выбора, что показывать на этой вкладке (хаб или приключение). В
// отличие от старого игрового периода, приключение НЕ создаётся здесь
// автоматически — только читается (см. adventureStore.loadCurrent), создание —
// явным действием на (modal)/adventure-planning. А вот завершается
// приключение, у которого вышло время, автоматически — здесь (при загрузке,
// при возврате на вкладку и когда время истекает, пока она открыта), и его
// итоги (как и итоги ручного завершения) показываются здесь же модалкой
// AdventureSummaryModal.
//
// Экран больше не скроллится (раньше был ScrollView с секциями ниже комнаты,
// их не осталось) — обычный View с flex:1, чтобы комната действительно
// занимала весь доступный вертикальный экран (см. HubHeader.tsx/PetRoom.tsx).

import { useIsFocused, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';

import { AdventureSummaryModal } from '@/components/adventure';
import { DailyRewardModal, HubHeader } from '@/components/hub';
import { useAdventureCountdown } from '@/lib/adventure/useAdventureCountdown';
import { useDailyRewardOffer } from '@/lib/daily/useDailyRewardOffer';
import { useFeedback } from '@/lib/hooks/useFeedback';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { useShopStore } from '@/lib/hooks/useShop';
import { feedback } from '@/lib/services/feedback';
import { notifications } from '@/lib/services/notifications';
import { useAdventureStore } from '@/lib/stores/adventureStore';
import { usePetStore } from '@/lib/stores/petStore';
import { usePreferencesStore } from '@/lib/stores/preferencesStore';
import { useSavingsStore } from '@/lib/stores/savingsStore';
import { useUserStore } from '@/lib/stores/userStore';
import { Alert } from '@/lib/utils/alert';
import { useTheme } from '@/theme';
import { createHubStyles } from '../../styles/screens/tabs/_index.styles';

export default function HubScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { trigger, triggerHaptic } = useFeedback();
  const { scheduleMoodRestored } = useNotifications();

  const styles = createHubStyles({ theme });

  // Точечные селекторы вместо подписки на весь стор — Хаб открыт большую
  // часть времени игры, и раньше перерисовывался целиком при любом изменении
  // в любом из этих сторов (например при покупке в магазине), даже если
  // изменившееся поле здесь не используется.
  const user = useUserStore((s) => s.user);
  const { currentMood, pet, equippedSkinVariant } = usePetStore(
    useShallow((s) => ({
      currentMood: s.currentMood,
      pet: s.pet,
      equippedSkinVariant: s.equippedSkinVariant,
    }))
  );
  const refreshMood = usePetStore((s) => s.refreshMood);
  // Бонусы — числа, поэтому useShallow триггерит ререндер только когда
  // реально меняется сама сумма (а не любое поле placedDecor/equippedFurniture).
  const { recoveryBonus, maxBonus } = useShopStore(
    useShallow((s) => ({
      recoveryBonus: s.getTotalEnergyRecoveryBonus(),
      maxBonus: s.getTotalEnergyMaxBonus(),
    }))
  );
  const savedPetType = usePreferencesStore((s) => s.petType);
  const savedPetName = usePreferencesStore((s) => s.petName);
  const loadCurrentAdventure = useAdventureStore((s) => s.loadCurrent);
  const completeIfExpired = useAdventureStore((s) => s.completeIfExpired);
  const completionSummary = useAdventureStore((s) => s.lastCompletionSummary);
  const dismissCompletionSummary = useAdventureStore((s) => s.dismissCompletionSummary);
  const countdown = useAdventureCountdown();
  const adventureExpired = countdown.active && countdown.expired;
  // Вкладка хаба остаётся смонтированной, пока ребёнок на других экранах, —
  // без фокуса модалка итогов всплыла бы поверх урока/магазина, а
  // приключение закрывалось бы посреди задания.
  const isFocused = useIsFocused();
  // Ежедневная награда — только на открытом хабе и после итогов приключения
  // (два окна подряд, а не друг поверх друга).
  const dailyOffer = useDailyRewardOffer(isFocused && !completionSummary);
  const savings = useSavingsStore((s) => s.savings);
  const loadOrCreateSavings = useSavingsStore((s) => s.loadOrCreate);

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

  // §6.1/§12.2: размещённый декор двигает и скорость восстановления, и максимум энергии
  useEffect(() => {
    usePetStore.getState().setMoodBuffs(recoveryBonus);
  }, [recoveryBonus]);

  useEffect(() => {
    usePetStore.getState().setMoodMaxBonus(maxBonus);
  }, [maxBonus]);

  // Только читаем текущее приключение (если есть) — в отличие от старого
  // периода, ничего не создаём автоматически на хабе. Если за время, пока
  // приложение было закрыто, оно истекло — сразу завершаем (итоги ниже).
  const hasRequestedAdventure = useRef(false);
  useEffect(() => {
    if (user?.id && !hasRequestedAdventure.current) {
      hasRequestedAdventure.current = true;
      loadCurrentAdventure(user.id).then(() => completeIfExpired());
    }
  }, [user?.id, loadCurrentAdventure, completeIfExpired]);

  // Время вышло, пока хаб открыт, или ребёнок вернулся на хаб уже после конца.
  useEffect(() => {
    if (isFocused && adventureExpired) void completeIfExpired();
  }, [isFocused, adventureExpired, completeIfExpired]);

  const hasRequestedSavings = useRef(false);
  useEffect(() => {
    if (user?.id && !savings && !hasRequestedSavings.current) {
      hasRequestedSavings.current = true;
      loadOrCreateSavings(user.id);
    }
  }, [user?.id, savings, loadOrCreateSavings]);

  const handleRefreshMood = () => {
    const prevMood = currentMood;
    refreshMood();
    const freshMood = usePetStore.getState().currentMood;

    if (prevMood <= 0 && pet) {
      const minutesToFull = Math.ceil(
        ((100 - freshMood) / (pet.base_recovery_rate + recoveryBonus)) * 60
      );
      if (minutesToFull > 0 && minutesToFull < 60) {
        scheduleMoodRestored(minutesToFull);
      }
    }
  };

  const petType: 'robot' | 'bear' | 'cat' = savedPetType || 'robot';
  const petName = savedPetName || 'Помощник';

  return (
    <View style={styles.container}>
      {/* Хаб — всегда комната; во время приключения кнопка ведёт на его экран. */}
      {
        <HubHeader
          petType={petType}
          petName={petName}
          skinVariant={equippedSkinVariant}
          currentMood={currentMood}
          coins={user?.liquid_balance ?? 0}
          onPetPress={() => {
            triggerHaptic('light');
            handleRefreshMood();
          }}
        />
      }

      {isFocused && completionSummary && (
        <AdventureSummaryModal
          summary={completionSummary}
          onClose={dismissCompletionSummary}
          onStartNew={() => {
            dismissCompletionSummary();
            router.push('/(modal)/adventure-planning' as never);
          }}
        />
      )}

      {dailyOffer.visible && (
        <DailyRewardModal
          streakDay={dailyOffer.streakDay}
          bonus={dailyOffer.bonus}
          onClaim={() => {
            const result = dailyOffer.claim();
            if (!result.success) return;
            trigger('dailyClaim');
            if (result.giftGranted) {
              Alert.alert(
                '🎁 Подарок за неделю!',
                'Ты заходишь к Финни 7 дней подряд. Открой его в магазине — там появится баннер подарков.'
              );
            }
          }}
        />
      )}
    </View>
  );
}
