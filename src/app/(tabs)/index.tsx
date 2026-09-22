// app/(tabs)/index.tsx
// Главный Хаб — только комната питомца + 2 кнопки (Пройти урок / Аркада), см.
// HubHeader.tsx. Период/дневная награда переехали в профиль (см. profile.tsx)
// — этот файл отвечает за загрузку общих данных (сторы, эффекты) и рендер
// комнаты; фоновая загрузка периода/прогресса/накоплений и гейт на
// планирование бюджета остаются здесь, даже когда сами карточки не видны на
// этом экране — это данные для других экранов и системный переход, а не UI.
//
// Экран больше не скроллится (раньше был ScrollView с секциями ниже комнаты,
// их не осталось) — обычный View с flex:1, чтобы комната действительно
// занимала весь доступный вертикальный экран (см. HubHeader.tsx/PetRoom.tsx).

import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';

import { HubHeader } from '@/components/hub';
import { useFeedback } from '@/lib/hooks/useFeedback';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { useShopStore } from '@/lib/hooks/useShop';
import { feedback } from '@/lib/services/feedback';
import { notifications } from '@/lib/services/notifications';
import { usePeriodStore } from '@/lib/stores/periodStore';
import { usePetProgressStore } from '@/lib/stores/petProgressStore';
import { usePetStore } from '@/lib/stores/petStore';
import { usePreferencesStore } from '@/lib/stores/preferencesStore';
import { useSavingsStore } from '@/lib/stores/savingsStore';
import { useUserStore } from '@/lib/stores/userStore';
import { useTheme } from '@/theme';
import { createHubStyles } from '../../styles/screens/tabs/_index.styles';

export default function HubScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { triggerHaptic } = useFeedback();
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
  const currentPeriod = usePeriodStore((s) => s.currentPeriod);
  const loadOrStartPeriod = usePeriodStore((s) => s.loadOrStartPeriod);
  const petProgress = usePetProgressStore((s) => s.progress);
  const loadOrCreatePetProgress = usePetProgressStore((s) => s.loadOrCreate);
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

  const hasRequestedPeriod = useRef(false);
  useEffect(() => {
    if (user?.id && !currentPeriod && !hasRequestedPeriod.current) {
      hasRequestedPeriod.current = true;
      loadOrStartPeriod(user.id);
    }
  }, [user?.id, currentPeriod, loadOrStartPeriod]);

  const hasRequestedPetProgress = useRef(false);
  useEffect(() => {
    if (user?.id && !petProgress && !hasRequestedPetProgress.current) {
      hasRequestedPetProgress.current = true;
      loadOrCreatePetProgress(user.id);
    }
  }, [user?.id, petProgress, loadOrCreatePetProgress]);

  const hasRequestedSavings = useRef(false);
  useEffect(() => {
    if (user?.id && !savings && !hasRequestedSavings.current) {
      hasRequestedSavings.current = true;
      loadOrCreateSavings(user.id);
    }
  }, [user?.id, savings, loadOrCreateSavings]);

  // §7 ТЗ: новый период требует планирования бюджета до входа в хаб —
  // системный переход, не привязан к какой-либо видимой на экране карточке.
  useEffect(() => {
    if (currentPeriod?.status === 'planning') {
      router.replace('/(modal)/budget-planning' as never);
    }
  }, [currentPeriod?.status, router]);

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

  const petType: 'robot' | 'dragon' | 'cat' = savedPetType || 'robot';
  const petName = savedPetName || 'Помощник';

  return (
    <View style={styles.container}>
      <HubHeader
        petType={petType}
        petName={petName}
        skinVariant={equippedSkinVariant}
        currentMood={currentMood}
        coins={user?.liquid_balance ?? 0}
        savings={savings?.currentAmount ?? 0}
        onPetPress={() => {
          triggerHaptic('light');
          handleRefreshMood();
        }}
      />
    </View>
  );
}
