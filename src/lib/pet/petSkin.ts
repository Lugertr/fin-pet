// lib/pet/petSkin.ts
// Экипировка купленного скина питомца (из инвентаря) — пересекает
// SQLite-профиль (источник истины для profiles.color_variant) и рантайм-стор
// питомца, поэтому отдельный модуль, а не метод одного из сторов (тот же
// принцип, что уже объяснён в profileReset.ts про циклы импортов).

import { getProfileRepository } from '@/data/local/repositories';
import { PetType } from '@/constants/petAssets';
import { ItemContent } from '@/domain/content/ItemContent';
import { SHOP_CATALOG, useShopStore } from '@/lib/hooks/useShop';
import { usePetStore } from '@/lib/stores/petStore';
import { colorPalettes } from '@/theme/tokens';

interface EquipSkinResult {
  success: boolean;
  message: string;
}

/** Цвет свотча классического облика — если в каталоге нет его записи
 * (content/items.json), берём по текущим ассетам вида. */
const CLASSIC_SWATCH_COLOR: Record<PetType, string> = {
  robot: colorPalettes.indigo[500],
  bear: colorPalettes.orange[700],
  cat: colorPalettes.amber[500],
};

/**
 * Все облики вида питомца по возрастанию variant: 0 — «Классический», 1–2 —
 * цветные (content/items.json, category 'skin'). Классический тоже предмет
 * (решение 27.09.2026): облик, выбранный при создании, кладётся в инвентарь,
 * а остальные приходят на уровнях 2 и 3 (PlayerLevel.pickLookToGrant) — и
 * среди них может оказаться классический. Используется онбордингом (выбор
 * облика) и наградой за уровень.
 */
export function getSkinsForPetType(petType: PetType) {
  const looks = SHOP_CATALOG.filter((item) => item.category === 'skin' && item.pet_type === petType)
    .sort((a, b) => (a.skin_variant ?? 0) - (b.skin_variant ?? 0))
    .map((item) => ({
      variant: item.skin_variant ?? 0,
      color: item.swatch_color ?? CLASSIC_SWATCH_COLOR[petType],
      itemId: item.id as number | null,
      name: item.name,
    }));

  // Без записи классического облика в каталоге он остаётся встроенным.
  if (!looks.some((look) => look.variant === 0)) {
    looks.unshift({
      variant: 0,
      color: CLASSIC_SWATCH_COLOR[petType],
      itemId: null,
      name: 'Классический облик',
    });
  }
  return looks;
}

/** Надевает облик из инвентаря (в том числе классический — variant 0). */
export async function equipSkin(item: ItemContent): Promise<EquipSkinResult> {
  if (item.category !== 'skin' || item.skin_variant === undefined) {
    return { success: false, message: 'Этот предмет нельзя надеть' };
  }

  const owned = (useShopStore.getState().ownedItems[item.id] || 0) > 0;
  if (!owned) {
    return { success: false, message: 'Этот скин не куплен' };
  }

  const profile = await getProfileRepository().getCurrent();
  if (!profile) {
    return { success: false, message: 'Профиль не найден' };
  }
  if (profile.petType !== item.pet_type) {
    return { success: false, message: 'Этот скин для другого типа питомца' };
  }

  await getProfileRepository().update({
    ...profile,
    appearance: { ...profile.appearance, colorVariant: item.skin_variant },
  });

  usePetStore.getState().setEquippedSkinVariant(item.skin_variant);

  return { success: true, message: `Скин «${item.name}» надет` };
}

/**
 * Проданный скин не должен оставаться на питомце: если продан последний
 * экземпляр именно надетого скина — возвращаем встроенный «Классический»
 * (variant 0), так же сохраняя его в SQLite-профиль, как equipSkin. Вызывается
 * после успешной продажи (useShop.sellItem сам этого сделать не может — импорт
 * этого модуля из useShop дал бы цикл, см. комментарий в addItem).
 */
export async function unequipSkinIfSold(item: ItemContent): Promise<void> {
  if (item.category !== 'skin' || item.skin_variant === undefined) return;
  if ((useShopStore.getState().ownedItems[item.id] || 0) > 0) return;
  if (usePetStore.getState().equippedSkinVariant !== item.skin_variant) return;

  const profile = await getProfileRepository().getCurrent();
  if (!profile || profile.petType !== item.pet_type) return;

  await getProfileRepository().update({
    ...profile,
    appearance: { ...profile.appearance, colorVariant: 0 },
  });
  usePetStore.getState().setEquippedSkinVariant(0);
}
