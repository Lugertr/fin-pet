# AGENTS.md

# Finni (Финни)

Offline mobile game (Android, React Native / Expo) that teaches financial
literacy to children aged **7–11** through a virtual pet. Hackathon prototype
for the Moscow Department of Finance.

Sources of truth, in priority order:

1. `finni_tz_final.md` — the full specification (sections referenced as §N).
2. `CLAUDE.md` — development rules and hard constraints (read it first).
3. The existing code.

`README.md` describes the user journey, the adventure loop, demo mode and tests.

---

# Stack

- React Native, Expo SDK 57, Expo Router, TypeScript (strict)
- Zustand (+ AsyncStorage persistence for some stores)
- `expo-sqlite` — source of truth for profile, pet, adventures, savings
  (versioned, additive-only migrations in `src/data/local/migrations`)
- `expo-secure-store` — parent PIN only
- `react-native-svg`, `react-native-reanimated`, `expo-image`
- Styling: `StyleSheet` in `*.styles.ts` files + theme tokens (`src/theme`).
  NativeWind is installed but **not used** — do not introduce `className`.
- Jest (`jest-expo`) for domain/store logic
- `server/` — FastAPI stub for a future local AI model; the app never calls it

---

# Architecture

```
src/app/          screens (Expo Router): (auth), (tabs), (modal)
src/components/   UI components grouped by feature; each has Component.tsx,
                  Component.styles.ts, index.ts; import via the folder barrel
src/domain/       pure business logic, entity types, repository interfaces —
                  no UI, no storage
src/data/         SQLite repositories + local JSON content repository
src/lib/stores/   Zustand stores (adventure, savings, pet, user, gifts, …)
src/lib/hooks/    stores/hooks for lessons (useLessons) and shop (useShop)
src/lib/…         screen-level application logic (adventure, lessons, profile)
src/theme/        tokens, light/dark themes, useResponsive (scale/scaledFont)
content/          all learning/game content as JSON (never hardcode in UI)
```

Rules:

- Business rules live in `src/domain` (pure, tested) or in stores — not in
  route files.
- Game content (lessons, items, events, achievements) lives in `content/*.json`.
- Schema changes = a new migration; never edit existing migrations.

---

# Core loop: the Adventure

- Two money pools, shared energy: **hub** (wallet + bank; shop, bank goal) and
  **adventure budget** (`AdventureRecord.budget`, only for events). The shop
  and bank never touch the adventure budget.
- Hub → «Начать приключение» → planning (100-coin budget split into
  «Потратить» / «Коплю» (fill + «N%» per field; «Потратить» is stored in
  `plan.mandatory` with `optional = 0`, read it via `plannedSpend()`); then pick 1 of
  7 learning topics).
- The hub tab is always the hub (room); the adventure is its own screen
  `(modal)/adventure` opened by the hub CTA or the laptop. Its header: back on
  the left, «?» and ✕ (complete early) on the right next to coins/energy.
  Bottom tabs: Уроки, Копилка (bank, `(tabs)/savings`: goal card + buckets
  «Хочу» = hub wallet, «Коплю» = bank; no «Нужно» bucket in the hub), Хаб, Магазин,
  Прогресс; the AI chat tab is hidden for now (`href: null`). Savings goals are
  only laptop/piggybank/bed upgrades (`isSavingsGoalItem`). Quests = lessons of the chosen topic (each speeds up the 8-hour
  real-time timer); arcade is reachable only from the adventure and offers
  any mini-game (quiz / swipes / 5 letters) for the adventure's topic
  (`domain/arcade/TrainerSelection.ts`); only rounds started by the quest
  button (`countsAsQuest`) count as quests (−45 min); other arcade rounds speed
  the adventure up weaker — up to 15 min by answer accuracy
  (`arcadeTimeBonusMinutes`, `registerArcadeRound`); random events
  follow `EVENT_PACING` (`src/domain/adventure/AdventureEvent.ts`).
- Lesson/quest coins go straight to the hub wallet (first completion only);
  lessons give no XP. XP comes only from completing an adventure
  (`ADVENTURE_XP` = 150).
- The adventure completes automatically when time is up; plan bonus goes into
  the budget, then «Коплю» → bank and the rest → wallet
  (`computeAdventurePayout`). Results are shown in a modal on the hub.
- Food is a last resort: buy/eat only when the pet is hungry (energy < 30),
  priced ≥ 10 coins per 1⚡. Bank bonus is paid only on new money
  (`withdrawalCredit`).
- New lessons are taken only as adventure quests. Completed lessons can be
  replayed without rewards (§9). Demo mode (§18: toggle on onboarding step 1
  or in the adult section) is a 1–2 minute showcase: any lesson opens and is
  shortened (DEMO_LESSON_LIMITS), short Arcade rounds (DEMO_ROUND_LIMIT),
  events on every entry to the adventure screen in demo_order (max 2), ✕
  completes with full reward and each adventure is a level-up (xpToNextLevel).
  All of it only for is_demo profiles.

---

# Hard constraints (from CLAUDE.md — never violate)

- Offline-first; SQLite is the source of truth; no mandatory mechanic uses the network.
- No authentication, no personal data, no ads, no in-app purchases, no real
  money, no external links for children.
- Balance can never go negative; insufficient funds block the purchase with an
  explanation (§12.3). Money is integer.
- Progress is saved after every action and fully restored after restart.
- A child's mistake is never punished (no pet death/illness, no progress reset,
  level never decreases). Only exception: wrong answers inside an adventure
  quest cost 5 energy.
- The AI assistant is a stub (`StubAiAssistant`) behind the `AiAssistant`
  interface; energy cost, history and clearing are real.
- Never add mechanics that allow unlimited coin/XP farming.

---

# UI conventions

- Accessibility: touch targets ≥ 48×48 dp, main text ≥ 16 sp, color is never
  the only carrier of meaning (§23).
- Currency is **coins**, shown on screen as «80 C»: `CoinAmount` /
  `formatPrice()` (`src/lib/utils/formatters.ts`), including prices inside
  alert texts. `formatCoins()` («25 монет») is only for accessibility labels.
  `CoinIcon` is a decorative illustration only, never next to an amount.
  No ⭐ or ₽ for game money. Plan category colors: `PLAN_CATEGORY_COLORS`.
- Child-facing copy addresses the child as «ты» (gender-neutral where
  possible); the adult section uses «вы».
- «Прогресс» tab (`(tabs)/profile.tsx`) follows mockup S31: level card,
  achievements preview, stats, menu (Настройки / Родителям / Словарь /
  Документы). Its subpages are stack routes in `(modal)/` (settings,
  achievements, glossary, documents, transactions, adult-section) and use
  `SubpageHeader` (back, «?» help, big title, subtitle).
- Economy (27.09): gifts come ONLY from the 7-day streak and are modest
  (coins + maybe a hidden collectible, never bonus furniture or skins);
  achievements pay coins. Furniture/decor prices are ×5 so upgrades need the
  bank (`Economy.test.ts` guards it). Skins are never sold, gifted or granted by
  events — only level-ups give them. Early adventure completion pays only the
  elapsed share (`computeAdventurePayout(..., completionRatio)`) and no bank bonus.
- Every screen has a «?» help button (`HelpButton`, or the `help` prop of
  `AppHeaderStats` / `SubpageHeader`); texts live in `content/screen_help.json`
  keyed by `SCREEN_HELP_IDS`. A new route must get one —
  `domain/content/ScreenHelp.test.ts` fails otherwise.
- Daily reward is a hub modal on the first visit of the day, never on the
  profile-creation day (`domain/daily/DailyReward.ts`,
  `lib/daily/useDailyRewardOffer.ts`). Settings toggles live in
  `preferencesStore` and are applied by `useApplySettings` in the root layout.
- Shared header: `AppHeaderStats` + `useAppHeaderPadding()` so its height is
  identical on every tab.

---

# Commands

```bash
npm install
npm run start        # expo start (npm run android / npm run web)
npm test             # jest
npm run lint         # eslint (npm run lint:fix)
npm run format       # prettier
npx tsc --noEmit     # type check
```

---

# Definition of done

- `npx tsc --noEmit` passes
- `npm run lint` has no errors on modified files; prettier formatting applied
- `npm test` passes; calculation logic changes come with tests
- persistence and offline behavior work
- `README.md` updated if user-visible behavior changed
- no new dependency without a clear justification (a license list is part of
  the submission)
