// lib/stores/petStore.ts
// Состояние питомца с ленивым вычислением энергии (§6 ТЗ)

import { getPetRepository } from '@/data/local/repositories';
import { MOOD_MAX } from '@/constants/gameplay';
import { calculateCurrentMood } from '@/lib/utils/moodCalculator';
import { Pet } from '@/types/models';
import { create } from 'zustand';

interface PetState {
  // Данные
  pet: Pet | null;
  currentMood: number;
  moodBuffs: number; // §12.2 «уют/освещение» — бонус к скорости восстановления
  moodMaxBonus: number; // §12.2 «мебель/растения» — бонус к максимуму энергии (§6.1)
  lastFetchedAt: number | null; // timestamp последнего запроса
  /** Надетый скин питомца (0 — «Классический»). Источник истины — profiles.color_variant
   * в SQLite (см. useAppBootstrap.ts); здесь — рантайм-копия для живого рендера. */
  equippedSkinVariant: number;

  // Действия
  setPet: (pet: Pet) => void;
  setMoodBuffs: (buffs: number) => void;
  setMoodMaxBonus: (bonus: number) => void;
  setEquippedSkinVariant: (variant: number) => void;
  refreshMood: () => void;
  spendEnergy: (amount: number) => void;
  restoreEnergy: (amount: number) => void;
  updateFromServer: (pet: Pet, serverMood: number) => void;
  /** §17.2 «Удаление профиля» — полностью обнуляет стор (не для «Сброса», там нужен setPet). */
  reset: () => void;
}

export const usePetStore = create<PetState>((set, get) => ({
  pet: null,
  currentMood: 100,
  moodBuffs: 0,
  moodMaxBonus: 0,
  lastFetchedAt: null,
  equippedSkinVariant: 0,

  setEquippedSkinVariant: (variant) => set({ equippedSkinVariant: variant }),

  setPet: (pet) => {
    const { moodBuffs, moodMaxBonus } = get();
    const result = calculateCurrentMood({
      storedMood: pet.mood,
      lastUpdatedAt: pet.last_mood_updated_at,
      baseRecoveryRate: pet.base_recovery_rate,
      inventoryBuffs: moodBuffs,
      maxBonus: moodMaxBonus,
    });

    set({
      pet,
      currentMood: result.currentMood,
      lastFetchedAt: Date.now(),
    });
  },

  setMoodBuffs: (buffs) => {
    const { pet, moodMaxBonus } = get();
    if (pet) {
      const result = calculateCurrentMood({
        storedMood: pet.mood,
        lastUpdatedAt: pet.last_mood_updated_at,
        baseRecoveryRate: pet.base_recovery_rate,
        inventoryBuffs: buffs,
        maxBonus: moodMaxBonus,
      });
      set({ moodBuffs: buffs, currentMood: result.currentMood });
    } else {
      set({ moodBuffs: buffs });
    }
  },

  setMoodMaxBonus: (bonus) => {
    const { pet, moodBuffs } = get();
    if (pet) {
      const result = calculateCurrentMood({
        storedMood: pet.mood,
        lastUpdatedAt: pet.last_mood_updated_at,
        baseRecoveryRate: pet.base_recovery_rate,
        inventoryBuffs: moodBuffs,
        maxBonus: bonus,
      });
      set({ moodMaxBonus: bonus, currentMood: result.currentMood });
    } else {
      set({ moodMaxBonus: bonus });
    }
  },

  /**
   * Пересчитывает энергию на клиенте
   * (вызывается по таймеру или при фокусе экрана)
   */
  refreshMood: () => {
    const { pet, moodBuffs, moodMaxBonus } = get();
    if (!pet) return;

    const result = calculateCurrentMood({
      storedMood: pet.mood,
      lastUpdatedAt: pet.last_mood_updated_at,
      baseRecoveryRate: pet.base_recovery_rate,
      inventoryBuffs: moodBuffs,
      maxBonus: moodMaxBonus,
    });

    set({ currentMood: result.currentMood });
  },

  /**
   * Списывает энергию (§6.2: Аркада 10⚡, ИИ-помощник 5⚡) и сразу же чекпоинтит
   * результат в pet.mood — иначе следующий refreshMood() пересчитает энергию от
   * старой (ещё не списанной) базовой точки и списание потеряется до перезапуска.
   */
  spendEnergy: (amount) => {
    // Сначала пересчитываем от последнего чекпоинта: currentMood мог устареть
    // (энергия копится по времени, а пересчёт — лишь по событиям), и списание
    // от устаревшего значения сохранило бы его как новый чекпоинт — вся
    // накопленная за это время энергия пропала бы (например, при ошибке в
    // задании приключения после нескольких часов простоя).
    get().refreshMood();
    const { currentMood, pet } = get();
    const newMood = Math.max(0, currentMood - amount);
    const now = new Date().toISOString();

    set({
      currentMood: newMood,
      pet: pet ? { ...pet, mood: newMood, last_mood_updated_at: now } : pet,
    });

    if (pet) {
      getPetRepository()
        .updateMood(pet.id, newMood, now)
        .catch((error) => console.warn('[PetStore] Не удалось сохранить настроение:', error));
    }
  },

  /**
   * Мгновенное восстановление энергии едой (§12.2), с тем же чекпоинтом, что и
   * spendEnergy — иначе восстановление «потеряется» при следующем refreshMood().
   */
  restoreEnergy: (amount) => {
    // То же, что в spendEnergy: еда прибавляется к актуальной энергии.
    get().refreshMood();
    const { currentMood, pet, moodMaxBonus } = get();
    const cap = MOOD_MAX + moodMaxBonus;
    const newMood = Math.min(cap, currentMood + amount);
    const now = new Date().toISOString();

    set({
      currentMood: newMood,
      pet: pet ? { ...pet, mood: newMood, last_mood_updated_at: now } : pet,
    });

    if (pet) {
      getPetRepository()
        .updateMood(pet.id, newMood, now)
        .catch((error) => console.warn('[PetStore] Не удалось сохранить настроение:', error));
    }
  },

  /**
   * Обновляет данные с сервера
   * Сервер является источником истины
   */
  updateFromServer: (pet, serverMood) => {
    set({
      pet,
      currentMood: serverMood,
      lastFetchedAt: Date.now(),
    });
  },

  reset: () =>
    set({
      pet: null,
      currentMood: 100,
      moodBuffs: 0,
      moodMaxBonus: 0,
      lastFetchedAt: null,
      equippedSkinVariant: 0,
    }),
}));

/**
 * Энергия питомца уже полная (с бонусом кровати): прибавлять нечего — кофе в
 * смене в этот момент не продаётся (решение 29.09.2026), иначе монеты ушли бы
 * впустую. Сначала пересчитывает энергию по времени.
 */
export function isPetEnergyFull(): boolean {
  const store = usePetStore.getState();
  store.refreshMood();
  const { currentMood, moodMaxBonus } = usePetStore.getState();
  return currentMood >= MOOD_MAX + moodMaxBonus;
}
