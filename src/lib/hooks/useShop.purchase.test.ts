// lib/hooks/useShop.purchase.test.ts
// CLAUDE.md: «покупка: проверка достаточности средств, списание, запрет
// отрицательного баланса».

import { SHOP_CATALOG, useShopStore } from './useShop';
import { usePetStore } from '../stores/petStore';
import { useUserStore } from '../stores/userStore';

// id 6 «Яблоко» — обычный покупаемый товар (не starter/hidden). Еда покупается
// только голодным питомцем, поэтому в общих тестах покупки питомец голоден.
const APPLE = SHOP_CATALOG.find((i) => i.id === 6)!;

function seedPetEnergy(mood: number) {
  usePetStore.setState({
    pet: {
      id: 1,
      user_id: 'test-profile',
      mood,
      last_mood_updated_at: new Date().toISOString(),
      base_recovery_rate: 12.5,
    },
    currentMood: mood,
    moodBuffs: 0,
    moodMaxBonus: 0,
  });
}

function seedUser(liquidBalance: number) {
  useUserStore.getState().setUser({
    id: 'test-profile',
    username: 'Тест',
    liquid_balance: liquidBalance,
    created_at: new Date().toISOString(),
    is_demo: false,
  });
}

beforeEach(() => {
  useUserStore.getState().reset();
  useShopStore.getState().resetInventory();
  seedPetEnergy(10); // голоден
});

describe('useShopStore.purchaseItem', () => {
  it('товар с ценой существует и не является starter/hidden (иначе тест ничего не проверяет)', () => {
    expect(APPLE).toBeDefined();
    expect(APPLE.is_starter).not.toBe(true);
    expect(APPLE.is_hidden).not.toBe(true);
    expect(APPLE.price).toBeGreaterThan(0);
  });

  it('блокирует покупку при недостаточных средствах, баланс не меняется', () => {
    seedUser(APPLE.price - 1);
    const result = useShopStore.getState().purchaseItem(APPLE.id);

    expect(result.success).toBe(false);
    expect(useUserStore.getState().user?.liquid_balance).toBe(APPLE.price - 1);
    expect(useShopStore.getState().ownedItems[APPLE.id]).toBeUndefined();
  });

  it('списывает ровно цену товара и добавляет его в инвентарь при достаточном балансе', () => {
    seedUser(APPLE.price + 50);
    const result = useShopStore.getState().purchaseItem(APPLE.id);

    expect(result.success).toBe(true);
    expect(useUserStore.getState().user?.liquid_balance).toBe(50);
    expect(useShopStore.getState().ownedItems[APPLE.id]).toBe(1);
  });

  it('накопительная покупка нескольких штук списывает сумму за все и складывает количество', () => {
    seedUser(1000);
    useShopStore.getState().purchaseItem(APPLE.id, 3);

    expect(useUserStore.getState().user?.liquid_balance).toBe(1000 - APPLE.price * 3);
    expect(useShopStore.getState().ownedItems[APPLE.id]).toBe(3);
  });

  it('баланс никогда не уходит в минус даже при повторных покупках на грани средств', () => {
    seedUser(APPLE.price); // ровно на один товар
    useShopStore.getState().purchaseItem(APPLE.id); // проходит, баланс -> 0
    const second = useShopStore.getState().purchaseItem(APPLE.id); // должно блокироваться

    expect(second.success).toBe(false);
    expect(useUserStore.getState().user!.liquid_balance).toBeGreaterThanOrEqual(0);
    expect(useShopStore.getState().ownedItems[APPLE.id]).toBe(1);
  });

  it('стартовые предметы нельзя купить повторно', () => {
    const starter = SHOP_CATALOG.find((i) => i.is_starter)!;
    seedUser(10_000);
    const result = useShopStore.getState().purchaseItem(starter.id);
    expect(result.success).toBe(false);
  });

  it('скрытые (подарочные) предметы нельзя купить напрямую', () => {
    const hidden = SHOP_CATALOG.find((i) => i.is_hidden)!;
    seedUser(10_000);
    const result = useShopStore.getState().purchaseItem(hidden.id);
    expect(result.success).toBe(false);
  });
});

describe('еда — вынужденная мера (только голодному питомцу)', () => {
  it('сытому питомцу еду купить нельзя — баланс не меняется', () => {
    seedPetEnergy(80);
    seedUser(1000);

    const result = useShopStore.getState().purchaseItem(APPLE.id);

    expect(result.success).toBe(false);
    expect(useUserStore.getState().user?.liquid_balance).toBe(1000);
  });

  it('сытого питомца нельзя покормить даже едой из запаса', () => {
    useShopStore.getState().addItem(APPLE.id, 1);
    seedPetEnergy(80);

    const result = useShopStore.getState().consumeItem(APPLE.id);

    expect(result.success).toBe(false);
    expect(useShopStore.getState().ownedItems[APPLE.id]).toBe(1);
  });

  it('голодного питомца можно покормить — энергия растёт', () => {
    useShopStore.getState().addItem(APPLE.id, 1);
    seedPetEnergy(10);

    const result = useShopStore.getState().consumeItem(APPLE.id);

    expect(result.success).toBe(true);
    expect(usePetStore.getState().currentMood).toBe(10 + APPLE.energy_restore);
  });

  it('еда не дешевле 10 монет за 1⚡ — фарм «еда → Аркада» невыгоден', () => {
    for (const food of SHOP_CATALOG.filter((i) => i.category === 'food')) {
      expect(food.price / food.energy_restore).toBeGreaterThanOrEqual(10);
    }
  });
});
