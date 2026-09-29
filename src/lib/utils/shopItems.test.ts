// lib/utils/shopItems.test.ts
// Вопрос после покупки (решение пользователя 29.09.2026): поставить вещь в
// комнату или оставить в хранилище — с честной подсказкой, где работает бонус.

import { SHOP_CATALOG } from '@/lib/hooks/useShop';
import { placementPromptText } from './shopItems';

const byCategory = (category: string) =>
  SHOP_CATALOG.find((i) => i.category === category && !i.is_starter && !i.is_hidden)!;

describe('placementPromptText — поставить купленное в комнату?', () => {
  it('кровать: бонус к энергии — только когда стоит в комнате', () => {
    const bed = byCategory('bed');
    expect(bed.energy_max_bonus).toBeGreaterThan(0);
    expect(placementPromptText(bed)).toContain(`«${bed.name}»`);
    expect(placementPromptText(bed)).toContain('только когда вещь стоит в комнате');
  });

  it('ноутбук и копилка: бонус работает и из хранилища', () => {
    for (const item of [byCategory('laptop'), byCategory('piggybank')]) {
      expect(placementPromptText(item)).toContain('даже если вещь в хранилище');
    }
  });

  it('вещь без бонуса — без подсказки о бонусе', () => {
    const carpet = byCategory('carpet');
    expect(placementPromptText(carpet)).not.toContain('Бонус');
    expect(placementPromptText(carpet)).toContain('подождёт в хранилище');
  });
});
