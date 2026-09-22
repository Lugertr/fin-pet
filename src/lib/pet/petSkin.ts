// lib/pet/petSkin.ts
// Экипировка купленного скина питомца (из инвентаря) — пересекает
// SQLite-профиль (источник истины для profiles.color_variant) и рантайм-стор
// питомца, поэтому отдельный модуль, а не метод одного из сторов (тот же
// принцип, что уже объяснён в profileReset.ts про циклы импортов).

import { getProfileRepository } from '@/data/local/repositories';
import { ItemContent } from '@/domain/content/ItemContent';
import { useShopStore } from '@/lib/hooks/useShop';
import { usePetStore } from '@/lib/stores/petStore';

interface EquipSkinResult {
  success: boolean;
  message: string;
}

/** variant 0 («Классический») не товар и не проходит через эту функцию —
 * он встроенный, у него нет ItemContent-записи. */
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
