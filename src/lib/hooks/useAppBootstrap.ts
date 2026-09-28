// lib/hooks/useAppBootstrap.ts
// Гидратация Zustand-сторов из SQLite при старте приложения.
// Без этого userStore/petStore пустые после перезапуска — профиль и питомец
// живут только SQLite-стороне, Zustand лишь кэширует их в памяти на сессию.

import { useEffect, useState } from 'react';
import { describeDatabaseError } from '@/data/local/database';
import { getPetRepository, getProfileRepository } from '@/data/local/repositories';
import { useLessonsStore } from '@/lib/hooks/useLessons';
import { STARTER_FURNITURE_ITEM_IDS, SHOP_CATALOG, useShopStore } from '@/lib/hooks/useShop';
import { usePetStore } from '@/lib/stores/petStore';
import { usePreferencesStore } from '@/lib/stores/preferencesStore';
import { useUserStore } from '@/lib/stores/userStore';
import { Alert } from '@/lib/utils/alert';
import { isLockedRoomSkin } from '@/lib/utils/itemCategories';

/** Онбординг выдаёт стартовые предметы мебели один раз при создании профиля
 * (см. onboarding.tsx) — если новая категория (например carpet/window/room)
 * появляется уже ПОСЛЕ того, как профиль прошёл онбординг, такой профиль
 * никогда не получит её стартовый предмет обычным путём. Довыдаём и
 * экипируем недостающие идемпотентно при каждом старте — no-op, если всё
 * уже есть (см. profileReset.ts, тот же приём для «Сброса профиля»). */
function backfillMissingStarterFurniture() {
  const { ownedItems, equippedFurniture } = useShopStore.getState();
  STARTER_FURNITURE_ITEM_IDS.forEach((itemId) => {
    if ((ownedItems[itemId] || 0) > 0) return;
    const item = SHOP_CATALOG.find((i) => i.id === itemId);
    if (!item) return;
    useShopStore.getState().addItem(itemId, 1);
    if (!equippedFurniture[item.category]) {
      useShopStore.getState().equipFurniture(itemId);
    }
  });
}

/** Скин комнаты, надетый до того, как скины закрыли флагом room_skins (см.
 * isLockedRoomSkin), снимается — возвращается стартовая комната. Покупка
 * остаётся в инвентаре; no-op, если надета стартовая. */
function resetLockedRoomSkin() {
  const { equippedFurniture } = useShopStore.getState();
  const equipped = SHOP_CATALOG.find((i) => i.id === equippedFurniture.room);
  if (!equipped || !isLockedRoomSkin(equipped)) return;
  const starterRoom = SHOP_CATALOG.find((i) => i.category === 'room' && i.is_starter);
  if (starterRoom) useShopStore.getState().equipFurniture(starterRoom.id);
}

export function useAppBootstrap() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const profile = await getProfileRepository().getCurrent();

        if (profile && !cancelled) {
          useUserStore.getState().setUser({
            id: profile.id,
            username: profile.username ?? profile.petName,
            liquid_balance: profile.liquidBalance,
            created_at: profile.createdAt,
            is_demo: profile.isDemo,
          });

          const petRecord = await getPetRepository().getByProfileId(profile.id);
          if (petRecord && !cancelled) {
            usePetStore.getState().setPet({
              id: petRecord.id,
              user_id: petRecord.profileId,
              mood: petRecord.mood,
              last_mood_updated_at: petRecord.lastMoodUpdatedAt,
              base_recovery_rate: petRecord.baseRecoveryRate,
            });
          }

          usePreferencesStore.getState().setPetType(profile.petType);
          usePreferencesStore.getState().setPetName(profile.petName);
          usePetStore.getState().setEquippedSkinVariant(profile.appearance.colorVariant);
          backfillMissingStarterFurniture();
          resetLockedRoomSkin();
          // Учебный прогресс и опыт — из SQLite (миграция v9), до показа экранов.
          await useLessonsStore.getState().load(profile.id);
          useUserStore.getState().setOnboarded(true);
        }
      } catch (error) {
        console.error('[Bootstrap] Не удалось загрузить профиль из SQLite:', error);
        const dbMessage = describeDatabaseError(error);
        if (dbMessage && !cancelled) {
          Alert.alert('Проблема с локальной базой', dbMessage);
        }
      } finally {
        if (!cancelled) {
          useUserStore.getState().setLoading(false);
          setIsReady(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return isReady;
}
