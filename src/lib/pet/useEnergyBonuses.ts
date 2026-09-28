// lib/pet/useEnergyBonuses.ts
// §6.1/§12.2: размещённый декор и мебель двигают скорость восстановления и
// максимум энергии питомца. Подключается в корневом layout, поэтому бонусы
// действуют на любом экране, в том числе открытом прямой ссылкой, — раньше
// их применял только хаб, и до первого захода на него энергия считалась без
// бонусов.

import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { useShopStore } from '@/lib/hooks/useShop';
import { usePetStore } from '@/lib/stores/petStore';

export function useEnergyBonuses(): void {
  // Бонусы — числа, поэтому useShallow триггерит ререндер только когда
  // реально меняется сама сумма (а не любое поле placedDecor/equippedFurniture).
  const { recoveryBonus, maxBonus } = useShopStore(
    useShallow((s) => ({
      recoveryBonus: s.getTotalEnergyRecoveryBonus(),
      maxBonus: s.getTotalEnergyMaxBonus(),
    }))
  );

  useEffect(() => {
    usePetStore.getState().setMoodBuffs(recoveryBonus);
  }, [recoveryBonus]);

  useEffect(() => {
    usePetStore.getState().setMoodMaxBonus(maxBonus);
  }, [maxBonus]);
}
