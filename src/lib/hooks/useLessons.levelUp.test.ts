// lib/hooks/useLessons.levelUp.test.ts
// §8.4: при переходе объясняется, какая награда получена — результат
// level-up отражает то, что реально выдано (монеты, скин только если он новый).

import { usePetStore } from '@/lib/stores/petStore';
import { usePreferencesStore } from '@/lib/stores/preferencesStore';
import { useUserStore } from '@/lib/stores/userStore';
import { useShopStore } from './useShop';
import { useLessonsStore } from './useLessons';

beforeEach(() => {
  useLessonsStore.getState().resetProgress();
  useShopStore.getState().resetInventory();
  usePreferencesStore.getState().setPetType('robot');
  usePetStore.getState().setEquippedSkinVariant(0);
  useUserStore.getState().setUser({
    id: 'test-profile',
    username: 'Тест',
    liquid_balance: 0,
    created_at: new Date().toISOString(),
    is_demo: false,
  });
});

describe('useLessonsStore.addXp — награда за уровень', () => {
  it('уровень 2: монеты и новый скин своего вида', () => {
    const result = useLessonsStore.getState().addXp(250);

    expect(result?.to).toBe(2);
    expect(result?.coins).toBe(100);
    expect(result?.skinName).not.toBeNull();
    expect(useUserStore.getState().user?.liquid_balance).toBe(100);
  });

  it('облик, выбранный при создании, не выдаётся повторно — приходит следующий', () => {
    useShopStore.getState().addItem(13, 1); // выбран «Робот: Оранжевый»
    usePetStore.getState().setEquippedSkinVariant(1);

    const result = useLessonsStore.getState().addXp(250);

    expect(result?.skinName).toBe('Робот: Розовый скин');
    expect(useShopStore.getState().ownedItems[13]).toBe(1);
    expect(useShopStore.getState().ownedItems[14]).toBe(1);
  });

  it('вид с одним обликом (мишка) получает только монеты', () => {
    usePreferencesStore.getState().setPetType('bear');

    const result = useLessonsStore.getState().addXp(250);

    expect(result?.coins).toBe(100);
    expect(result?.skinName).toBeNull();
  });
});
