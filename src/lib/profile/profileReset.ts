// lib/profile/profileReset.ts
// §17.2/§18.2 ТЗ: «Сброс профиля» (сохраняет личность — имя, питомца) и
// «Удаление профиля» (полное удаление локальных данных). Обе операции живут
// здесь, а не в одном из сторов — они пересекают SQLite-репозитории и сразу
// несколько независимых AsyncStorage-сторов, ни один из которых не должен
// знать про остальные (тот же принцип, что уже объяснён в achievementsStore.ts
// про циклы импортов).

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getPeriodRepository,
  getPetProgressRepository,
  getPetRepository,
  getProfileRepository,
  getSavingsRepository,
  getTransactionRepository,
} from '@/data/local/repositories';
import { STARTING_SAVINGS_BALANCE, STARTING_WALLET_BALANCE } from '@/domain/profile/Profile';
import { useLessonsStore } from '@/lib/hooks/useLessons';
import { STARTER_FURNITURE_ITEM_IDS, useShopStore } from '@/lib/hooks/useShop';
import { clearPin } from '@/lib/security/parentalPin';
import { useAchievementsStore } from '@/lib/stores/achievementsStore';
import { useAiChatStore } from '@/lib/stores/aiChatStore';
import { useGiftsStore } from '@/lib/stores/giftsStore';
import { useLifetimeStatsStore } from '@/lib/stores/lifetimeStatsStore';
import { usePeriodStore } from '@/lib/stores/periodStore';
import { usePetProgressStore } from '@/lib/stores/petProgressStore';
import { usePetStore } from '@/lib/stores/petStore';
import { usePreferencesStore } from '@/lib/stores/preferencesStore';
import { useSavingsStore } from '@/lib/stores/savingsStore';
import { useUserStore } from '@/lib/stores/userStore';

/**
 * §17.2 «Сброс профиля» / §18.2 «Сбросить демо» — одна и та же операция:
 * профиль (имя, питомец, тип) остаётся, экономика и прогресс возвращаются
 * к исходному состоянию онбординга (§4.4 — 50⭐ в кошелёк + 50⭐ в накопления).
 */
export async function resetProfileToInitialState(): Promise<void> {
  const { user } = useUserStore.getState();
  if (!user) return;

  const profileId = user.id;
  const now = new Date().toISOString();

  await getTransactionRepository().clearForProfile(profileId);
  await getProfileRepository().updateBalance(profileId, STARTING_WALLET_BALANCE);
  await getPeriodRepository().deleteAllForProfile(profileId);

  const pet = await getPetRepository().getByProfileId(profileId);
  if (pet) {
    await getPetRepository().updateMood(pet.id, 100, now);
  }

  const progress = await getPetProgressRepository().getByProfileId(profileId);
  if (progress) {
    await getPetProgressRepository().update(progress.id, 0, 1);
  }

  const savings = await getSavingsRepository().getByProfileId(profileId);
  if (savings) {
    await getSavingsRepository().clearTransactions(savings.id);
    await getSavingsRepository().update({
      ...savings,
      currentAmount: STARTING_SAVINGS_BALANCE,
      targetItemId: null,
      periodsSinceWithdrawal: 0,
    });
    await getSavingsRepository().addTransaction({
      savingsId: savings.id,
      operationType: 'deposit',
      amount: STARTING_SAVINGS_BALANCE,
      balanceAfter: STARTING_SAVINGS_BALANCE,
      periodId: null,
    });
  }

  // AsyncStorage-сторы прогресса/экономики — назад к исходному состоянию.
  // preferencesStore НЕ трогаем — имя питомца/вид/приоритетные ветки это
  // личность профиля, а не прогресс, «сброс» их не подразумевает.
  // PIN родительского раздела (SecureStore) — по той же причине НЕ сбрасываем:
  // это родительская настройка безопасности, а не игровой прогресс.
  useLessonsStore.getState().resetProgress();
  useShopStore.getState().resetInventory();
  // 6 базовых предметов комнаты нельзя убрать (см. useShop.ts) — resetInventory
  // выше стирает вообще всё владение, поэтому сразу перевыдаём и расставляем их заново.
  STARTER_FURNITURE_ITEM_IDS.forEach((itemId) => {
    useShopStore.getState().addItem(itemId, 1);
    useShopStore.getState().equipFurniture(itemId);
  });
  useGiftsStore.getState().clearAll();
  useAchievementsStore.getState().resetAll();
  useAiChatStore.getState().clearHistory();
  useLifetimeStatsStore.getState().reset();

  // Синхронизация в памяти. periodStore/petProgressStore/savingsStore не
  // перезагружаются отсюда напрямую — они обнуляются, а хаб сам подхватит
  // null через уже существующие loadOrStart*/loadOrCreate-эффекты (тот же
  // путь, что срабатывает при обычном запуске приложения).
  useUserStore.getState().setUser({ ...user, liquid_balance: STARTING_WALLET_BALANCE });
  if (pet) {
    usePetStore.getState().setPet({
      id: pet.id,
      user_id: profileId,
      mood: 100,
      last_mood_updated_at: now,
      base_recovery_rate: pet.baseRecoveryRate,
    });
  }
  usePetStore.getState().setMoodBuffs(0);
  usePetStore.getState().setMoodMaxBonus(0);
  usePeriodStore.getState().reset();
  usePetProgressStore.getState().reset();
  useSavingsStore.getState().reset();
}

/**
 * §17.2 «Удаление профиля» — полное и необратимое удаление всех локальных
 * данных (SQLite + AsyncStorage). Экран-вызывающий сам переходит на онбординг
 * после resolve — этот модуль ничего не знает про навигацию.
 */
export async function deleteProfileCompletely(): Promise<void> {
  await getProfileRepository().reset(); // каскадом чистит все SQLite-таблицы
  await AsyncStorage.clear();
  // SecureStore не задет AsyncStorage.clear() — без явной очистки PIN
  // родительского раздела пережил бы удаление профиля и достался бы
  // следующему ребёнку на этом устройстве.
  await clearPin();

  useUserStore.getState().reset();
  usePetStore.getState().reset();
  usePeriodStore.getState().reset();
  usePetProgressStore.getState().reset();
  useSavingsStore.getState().reset();
  useLessonsStore.getState().resetProgress();
  useShopStore.getState().resetInventory();
  useGiftsStore.getState().clearAll();
  useAchievementsStore.getState().resetAll();
  useAiChatStore.getState().clearHistory();
  useLifetimeStatsStore.getState().reset();
  usePreferencesStore.getState().resetPreferences();
}

/** §18.3 — активация демо-режима доступна только из раздела для взрослого. */
export async function setDemoMode(enabled: boolean): Promise<boolean> {
  const profile = await getProfileRepository().getCurrent();
  const { user } = useUserStore.getState();
  if (!profile || !user) return false;

  await getProfileRepository().update({ ...profile, isDemo: enabled });
  useUserStore.getState().setUser({ ...user, is_demo: enabled });
  return true;
}
