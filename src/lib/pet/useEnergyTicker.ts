// lib/pet/useEnergyTicker.ts
// Энергия копится по времени (§6.3), но в сторе пересчитывается лишь по
// событиям (старт, тап по питомцу, трата). Без периодического пересчёта ⚡ в
// общей шапке «замирала» на часы, пока приложение открыто. Раз в минуту и при
// возврате приложения из фона пересчитываем её от последнего чекпоинта —
// дёшево (чистая функция) и ничего не пишет в БД.

import { useEffect } from 'react';
import { AppState } from 'react-native';

import { usePetStore } from '@/lib/stores/petStore';

const ENERGY_TICK_MS = 60_000;

export function useEnergyTicker(): void {
  useEffect(() => {
    const refresh = () => usePetStore.getState().refreshMood();
    const interval = setInterval(refresh, ENERGY_TICK_MS);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, []);
}
