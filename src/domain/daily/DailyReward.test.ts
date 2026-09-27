// domain/daily/DailyReward.test.ts
// Ежедневная награда: модалка при первом за день заходе, но не в день
// создания профиля (там стартовый капитал), и «Дней с Финни».

import { daysWithFinni, shouldOfferDailyReward } from './DailyReward';

const created = new Date(2026, 8, 20, 10, 0).toISOString();

describe('shouldOfferDailyReward', () => {
  it('в день создания профиля награду не предлагает', () => {
    const now = new Date(2026, 8, 20, 23, 30);
    expect(shouldOfferDailyReward({ profileCreatedAt: created, lastClaimDate: null, now })).toBe(
      false
    );
  });

  it('на следующий день — предлагает', () => {
    const now = new Date(2026, 8, 21, 8, 0);
    expect(shouldOfferDailyReward({ profileCreatedAt: created, lastClaimDate: null, now })).toBe(
      true
    );
  });

  it('уже забрана сегодня — не предлагает повторно', () => {
    const now = new Date(2026, 8, 22, 18, 0);
    const lastClaimDate = new Date(2026, 8, 22, 0, 0).toISOString();
    expect(shouldOfferDailyReward({ profileCreatedAt: created, lastClaimDate, now })).toBe(false);
  });

  it('забрана вчера — сегодня снова предлагает', () => {
    const now = new Date(2026, 8, 23, 9, 0);
    const lastClaimDate = new Date(2026, 8, 22, 0, 0).toISOString();
    expect(shouldOfferDailyReward({ profileCreatedAt: created, lastClaimDate, now })).toBe(true);
  });

  it('профиль ещё не загружен — не предлагает', () => {
    expect(
      shouldOfferDailyReward({ profileCreatedAt: null, lastClaimDate: null, now: new Date() })
    ).toBe(false);
  });
});

describe('daysWithFinni', () => {
  it('в день создания — 1', () => {
    expect(daysWithFinni(created, new Date(2026, 8, 20, 23, 0))).toBe(1);
  });

  it('считает календарные дни, а не 24-часовые интервалы', () => {
    // Создан в 10:00, сейчас 08:00 через 4 дня — 5-й день с Финни.
    expect(daysWithFinni(created, new Date(2026, 8, 24, 8, 0))).toBe(5);
  });
});
