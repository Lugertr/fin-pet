// lib/profile/profileReset.ts
// §17.2/§18.2 ТЗ: «Сброс профиля» (сохраняет личность — имя, питомца) и
// «Удаление профиля» (полное удаление локальных данных). Обе операции живут
// здесь, а не в одном из сторов — они пересекают SQLite-репозитории и сразу
// несколько независимых AsyncStorage-сторов, ни один из которых не должен
// знать про остальные (тот же принцип, что уже объяснён в achievementsStore.ts
// про циклы импортов).

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getAdventureRepository,
  getPetRepository,
  getProfileRepository,
  getSavingsRepository,
  getTransactionRepository,
} from '@/data/local/repositories';
import { STARTING_SAVINGS_BALANCE, STARTING_WALLET_BALANCE } from '@/domain/profile/Profile';
import { useDailyStore } from '@/lib/hooks/useDaily';
import { useLessonsStore } from '@/lib/hooks/useLessons';
import { STARTER_FURNITURE_ITEM_IDS, useShopStore } from '@/lib/hooks/useShop';
import { clearPin } from '@/lib/security/parentalPin';
import { useAchievementsStore } from '@/lib/stores/achievementsStore';
import { useAdventureStore } from '@/lib/stores/adventureStore';
import { useAiChatStore } from '@/lib/stores/aiChatStore';
import { useGiftsStore } from '@/lib/stores/giftsStore';
import { useLifetimeStatsStore } from '@/lib/stores/lifetimeStatsStore';
import { usePetStore } from '@/lib/stores/petStore';
import { usePreferencesStore } from '@/lib/stores/preferencesStore';
import { useSavingsStore } from '@/lib/stores/savingsStore';
import { useUserStore } from '@/lib/stores/userStore';

/**
 * §17.2 «Сброс профиля» / §18.2 «Сбросить демо» — одна и та же операция:
 * профиль (имя, питомец, тип) остаётся, экономика и прогресс возвращаются
 * к исходному состоянию онбординга (§4.4 — 50 монет в кошелёк + 50 в накопления).
 */
export async function resetProfileToInitialState(): Promise<void> {
  const { user } = useUserStore.getState();
  if (!user) return;

  const profileId = user.id;
  const now = new Date().toISOString();

  await getTransactionRepository().clearForProfile(profileId);
  await getProfileRepository().updateBalance(profileId, STARTING_WALLET_BALANCE);
  await getAdventureRepository().deleteAllForProfile(profileId);

  const pet = await getPetRepository().getByProfileId(profileId);
  if (pet) {
    await getPetRepository().updateMood(pet.id, 100, now);
  }

  const savings = await getSavingsRepository().getByProfileId(profileId);
  if (savings) {
    await getSavingsRepository().clearTransactions(savings.id);
    await getSavingsRepository().update({
      ...savings,
      currentAmount: STARTING_SAVINGS_BALANCE,
      targetItemId: null,
      periodsSinceWithdrawal: 0,
      withdrawalCredit: 0,
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
  resetDailyStreak();

  // Синхронизация в памяти. adventureStore/savingsStore перечитываются из
  // SQLite прямо здесь: хаб грузит их однократно (ref-guard) и, оставаясь
  // смонтированным под разделом для взрослого, сам бы их не перезагрузил —
  // банк показывал бы пустоту до перезапуска (например, после включения демо).
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
  useAdventureStore.getState().reset();
  useSavingsStore.getState().reset();
  await useAdventureStore.getState().loadCurrent(profileId);
  await useSavingsStore.getState().loadOrCreate(profileId);
}

/**
 * Ежедневный стрик — тоже игровой прогресс. Сбрасываем и в памяти: после
 * AsyncStorage.clear() persist-стор иначе записал бы старый стрик обратно, и
 * следующий ребёнок на устройстве получил бы чужую серию и «награда уже получена».
 */
function resetDailyStreak(): void {
  useDailyStore.setState({
    currentStreak: 0,
    lastClaimDate: null,
    totalClaimed: 0,
    hasClaimedToday: false,
  });
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
  useAdventureStore.getState().reset();
  useSavingsStore.getState().reset();
  useLessonsStore.getState().resetProgress();
  useShopStore.getState().resetInventory();
  useGiftsStore.getState().clearAll();
  useAchievementsStore.getState().resetAll();
  useAiChatStore.getState().clearHistory();
  useLifetimeStatsStore.getState().reset();
  usePreferencesStore.getState().resetPreferences();
  resetDailyStreak();
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
