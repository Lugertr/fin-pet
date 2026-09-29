# 4. Архитектура и структура данных

Описание текущей реализации (ветка `new-adventure`, 29.09.2026) — уровень детализации для обсуждения с экспертами. В коде игровой период называется `adventure`, в интерфейсе — «смена».

## 4.1. Принципы

- **Офлайн.** Все механики работают на устройстве. Сетевых запросов в коде нет, сервер не нужен.
- **Без персональных данных.** Профиль состоит из случайного идентификатора (UUID), имени питомца, его вида и облика. Имени ребёнка, телефона, e-mail и аккаунта нет.
- **Слои разделены.** Расчёты игровой экономики — чистые функции в `src/domain`, хранение — в `src/data`, состояние экранов — в `src/lib`, интерфейс — в `src/app` и `src/components`. Учебный контент лежит в JSON-файлах в `content/`.
- **Деньги — только целые числа.** Все суммы в монетах («C») целые; отрицательный баланс запрещён на уровне хранилища.

## 4.2. Функциональная архитектура: игровой цикл

```
Онбординг (10 шагов): цель игры, 3 типа решений, питомец, облик, имя,
первая цель накоплений, стартовый капитал 50 C + 50 C в копилку
        │
        ▼
ГЛАВНЫЙ ЭКРАН (хаб): питомец в комнате · кошелёк «C» · энергия ⚡
        │
        ├──► Планирование смены (игровой период):
        │      тема → урок смены и зарплата → «Потратить» / «Коплю» (≤ зарплаты)
        │            │
        │            ▼
        │    Смена, до 24 реальных часов: урок по этапам
        │      «Теория» → тест / мини-игра → событие (выбор: нужное, желаемое,
        │      бесплатная альтернатива за энергию) — траты из бюджета смены
        │            │
        │            ▼
        │    Итоги: план и факт, бонус за план (+10 C, если факт ≤ плана)
        │      выплата: «Коплю» → копилка, остаток → кошелёк
        │            │
        │            ▼
        │    Опыт за урок → уровень, новый облик питомца → «Новая смена»
        │
        ├──► Копилка: цель (улучшение ноутбука, копилки или кровати), пополнение
        │      из кошелька, снятие; цель достигнута — вещь + 10 % цены
        ├──► Магазин: мебель и декор за монеты кошелька (вещь сразу в комнате)
        ├──► Уроки (вне смены — бесплатно), Аркада (мини-игры за энергию)
        └──► Прогресс: уровень, достижения, история операций, словарь, настройки,
               «Родителям» (PIN): цели, темы, прогресс, демо-режим, сброс, удаление
```

Денежных контуров два, энергия общая:

- **Хаб:** кошелёк и копилка. Кошелёк пополняют итоги смен, Аркада, ежедневная награда, уровни и достижения. Тратится он в магазине и на подсказки вне смены.
- **Бюджет смены:** зарплата за урок. Его тратят события урока, платные подсказки и кофе. При завершении смены «Коплю» уходит в копилку, остаток — в кошелёк.

## 4.3. Компонентная архитектура

```
src/app          экраны (Expo Router)
                 (auth)  onboarding
                 (tabs)  index (хаб) · lessons · savings (копилка) · shop · profile (прогресс) · ai-chat (скрыт)
                 (modal) adventure-planning · adventure (смена) · lesson/[id] · arcade-lobby · arcade ·
                         adult-section · inventory · achievements · glossary · transactions · settings …
   │  использует
src/components   UI по фичам: adventure, lesson, lessons, savings, shop, pet, hub, onboarding,
                 adultSection, profile, games, shared (шапка, «?», суммы), ui (кнопки, текст)
   │
src/lib          прикладной слой: Zustand-сторы (adventureStore, savingsStore, userStore, petStore,
                 useShop, useLessons, useDaily, giftsStore, achievementsStore …), хуки,
                 сервисы (звук и вибрация, уведомления), сценарии (сброс профиля, демо-день)
   │
src/domain       доменная логика без UI и хранилища: чистые функции расчётов и интерфейсы
                 репозиториев (ProfileRepository, AdventureRepository, SavingsRepository,
                 LessonProgressRepository, ContentRepository …)
   ▲  реализует
src/data         SQLite: подключение, 16 миграций, репозитории, транзакции;
                 LocalJsonContentRepository — контент из content/*.json
content/         учебный контент и каталоги (JSON)
```

| Подсистема                              | Расчёты (`src/domain`)                                                              | Состояние и сценарии (`src/lib`)                     | Экраны                                           |
| --------------------------------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------ |
| Профиль, питомец                        | `profile/Profile.ts`, `pet/Pet.ts` + класс на каждый вид (`species/*Pet.ts`)        | `userStore`, `petStore`                              | онбординг, хаб                                   |
| Смена (игровой период)                  | `adventure/Adventure.ts`                                                            | `stores/adventureStore.ts`                           | `adventure-planning`, `adventure`, итоги на хабе |
| Уроки                                   | `lesson/LessonPlan.ts`, `lessonProgress.ts`, `lessonRewards.ts`, `lessonEconomy.ts` | `hooks/useLessons.ts`                                | `(tabs)/lessons`, `lesson/[id]`                  |
| Накопления                              | `savings/Savings.ts`                                                                | `stores/savingsStore.ts`                             | `(tabs)/savings`                                 |
| Магазин, комната                        | `room/RoomLayout.ts`, `content/ItemContent.ts`                                      | `hooks/useShop.ts`                                   | `(tabs)/shop`, `inventory`, комната на хабе      |
| Уровни                                  | `player/PlayerLevel.ts`                                                             | `useLessons.addXp`                                   | окно «Опыт и уровень»                            |
| Энергия                                 | `lib/utils/moodCalculator.ts`                                                       | `petStore`, `useEnergyTicker`                        | шапка                                            |
| Ежедневная награда, подарки, достижения | `daily/DailyReward.ts`, `achievement/Achievement.ts`                                | `useDaily`, `giftsStore`, `achievementsStore`        | хаб, `achievements`                              |
| Аркада                                  | `arcade/TrainerSelection.ts`                                                        | `arcadeSessionStore`                                 | `arcade-lobby`, `arcade`                         |
| Раздел для взрослого                    | `parentalGate/ParentalGate.ts`                                                      | `security/parentalPin.ts`, `profile/profileReset.ts` | `adult-section`                                  |
| ИИ-помощник (скрыт)                     | `ai/AiAssistant.ts` (интерфейс), `StubAiAssistant.ts` (локальная заглушка)          | `aiChatStore`                                        | `(tabs)/ai-chat`, скрыт из панели                |

Источник данных для экранов подменяемый. Контент и хранилище спрятаны за интерфейсами `src/domain/repositories/*`, поэтому SQLite и локальный JSON можно заменить, например, на серверный контент, не меняя экраны и сторы.

## 4.4. Хранение данных

| Хранилище                                  | Что хранит                                                                                                                                                                               | Когда пишется                |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| SQLite, файл `finni.db`                    | профиль, питомец (энергия), журнал операций кошелька, копилка и её история, смены с планом и фактом, решения в событиях, прогресс уроков, опыт                                           | сразу после каждого действия |
| AsyncStorage (Zustand persist)             | инвентарь и надетые вещи (`finsputnik-shop-store`), стрик ежедневной награды, подарки, достижения, счётчик заработанного, настройки (звук, вибрация, уведомления, тема), история ИИ-чата | сразу после изменения        |
| SecureStore                                | PIN раздела для взрослого (`finsputnik_parental_pin_v1`)                                                                                                                                 | при установке или смене PIN  |
| `content/*.json` (в сборке, только чтение) | учебный контент и каталоги                                                                                                                                                               | —                            |

Схема SQLite версионируется: номер схемы хранится в `PRAGMA user_version`, миграции только добавляются (`src/data/local/migrations/index.ts`, v1–v16). Завершение смены с выплатой — одна SQLite-транзакция (`src/data/local/transaction.ts`): если что-то не записалось, не записывается ничего, и смена остаётся активной.

### Таблицы SQLite (после миграции v16)

| Таблица                | Назначение                      | Основные поля                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ---------------------- | ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `profiles`             | локальный профиль               | `id` (UUID), `pet_name`, `pet_type` (`robot`/`bear`/`cat`), `color_variant` (облик), `liquid_balance` (кошелёк, целое ≥ 0), `is_demo`, `total_xp`, `created_at`                                                                                                                                                                                                                                                                  |
| `pets`                 | питомец                         | `profile_id`, `mood` (энергия), `last_mood_updated_at`, `base_recovery_rate` (12,5 ⚡/ч)                                                                                                                                                                                                                                                                                                                                         |
| `transactions`         | журнал кошелька                 | `amount` (±, целое), `transaction_type` (источник), `description`, `created_at`                                                                                                                                                                                                                                                                                                                                                  |
| `savings`              | копилка                         | `current_amount`, `bonus_rate`, `target_item_id` (цель), `withdrawal_credit` (снятое и не возвращённое), `periods_since_withdrawal`                                                                                                                                                                                                                                                                                              |
| `savings_transactions` | история копилки                 | `operation_type` (`deposit`/`withdraw`/`bonus`/`reward`), `amount`, `balance_after`, `period_id` (= id смены), `created_at`                                                                                                                                                                                                                                                                                                      |
| `adventures`           | смены (игровые периоды)         | `adventure_number`, `status` (`planning`/`active`/`completed`), `branch_id`, `lesson_id`, `projected_income` (зарплата), `budget` (бюджет смены), `plan_mandatory`, `plan_optional`, `plan_savings`, `fact_mandatory`, `fact_optional`, `fact_savings`, `started_at`, `planned_end_at` (+24 ч), `completed_at`, `coffee_bought`, `stages_done_at_start`, `wallet_contribution`, `pending_summary` (JSON итогов до закрытия окна) |
| `adventure_event_log`  | решения в событиях уроков смены | `adventure_id`, `template_id`, `option_id`, `category`, `coin_amount`, `resolved_at`                                                                                                                                                                                                                                                                                                                                             |
| `lesson_progress`      | прогресс уроков                 | (`profile_id`, `lesson_id`), `read_nodes`, `results` (JSON по «этап.действие»: пройдено, без ошибок, попытки), `event_picks`, `completed_at`, `perfect_at`, `structure_key` (отпечаток структуры урока)                                                                                                                                                                                                                          |

В `adventures` остались колонки прежних версий (`time_adjustment_ms`, `quests_completed`, `pending_event_*`, `next_event_check_at`, `xp_awarded`). Они не используются и сохранены, потому что миграции только добавляются.

### Модель данных (сокращённо)

```ts
LocalProfile   { id: UUID; petName: string; petType: 'robot'|'bear'|'cat'; colorVariant: 0|1|2; isDemo: boolean; createdAt }
Wallet         liquid_balance: Int ≥ 0          // + журнал transactions
Energy         { stored: Int; updatedAt; recoveryPerHour: 12.5 }   // текущая считается по времени
Savings        { currentAmount: Int; targetItemId?; bonusRate; withdrawalCredit: Int }
Shift          { number; status; branchId; lessonId; salary: Int; budget: Int;
                 plan: { mandatory; optional; savings }; fact: { mandatory; optional; savings };
                 startedAt; plannedEndAt; completedAt?; coffeeBought; stagesDoneAtStart }
LessonProgress { lessonId; readNodes; results: { "этап.действие": { completed; perfect; attempts } };
                 eventPicks; completedAt?; perfectAt? }
PlayerLevel    total_xp: Int → level = 1 + ⌊total_xp / 300⌋  (не понижается)

// Контент (content/lessons/<тема>.json)
Lesson   { id; branch_id; order_index; title; price?; nodeEnergyCost?; coffee?;
           situation: { title; text }; nodes: Node[]; conclusion: { title; text } }
Node     { cards: TheoryCard[]; activities: Activity[]; energyCost? }
Activity = { type: 'test'; questions } | { type: 'minigame'; minigame_type: 'quiz'|'tinder_swipe'|'five_letters'; … }
         | { type: 'event'; pool: Event[] }
Event    { id; title; description; icon; options: { id; label; category: 'mandatory'|'optional'|null; coinAmount: Int; energyCost? }[] }
Item     { id; name; category; price: Int; expense_type: 'mandatory'|'optional'; energy_restore; energy_max_bonus;
           coin_bonus_percent; savings_bonus_rate; is_hidden; is_starter; pet_type?; skin_variant? }
```

### Учебный контент и каталоги (`content/`)

| Файл                                                                                                                                   | Содержимое                                                                                             |
| -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `branches.json`                                                                                                                        | 7 тем: Бюджет, Сбережения, Покупки (обязательные по ТЗ), Безопасность, Долги, Заработок, Цены          |
| `lessons/1_budget.json` … `7_prices.json`                                                                                              | 37 уроков по 4 узла: 37 тестов, 34 викторины, 36 «Свайпов», 37 «5 букв», 81 событие                    |
| `items.json`                                                                                                                           | 33 позиции: мебель и декор, еда (скрыта), облики питомца, скрытые трофеи, стартовые вещи               |
| `glossary.json`                                                                                                                        | словарь — 26 терминов                                                                                  |
| `screen_help.json`                                                                                                                     | подсказки «?» к 24 экранам                                                                             |
| `achievements.json`, `five_letters_words.json`, `arcade_swipe_cards.json`, `ai_stub_responses.json`, `features.json`, `documents.json` | достижения (12), банк слов (48), карточки Аркады, ответы заглушки ИИ, флаги функций, документы (пусто) |

## 4.5. Правила и формулы расчётов

Все суммы — целые монеты. Отрицательный кошелёк запрещён в `userStore.recordTransaction`: операция, уводящая баланс ниже нуля, отклоняется. Трата в событии проходит, только если хватает бюджета смены (`canAfford`).

| Что                           | Правило                                                                                                                                                                                                             | Где в коде                              |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| Энергия                       | `текущая = min(100 + бонус кровати, сохранённая + ⌊часы × (12,5 + бонус)⌋)`; питомец спит при ⚡ ≤ 20                                                                                                               | `lib/utils/moodCalculator.ts`           |
| Расход энергии                | этап урока в смене — `energyCost` этапа (по умолчанию 10); ошибка в тесте или мини-игре смены — 5; Аркада — 10 за игру; вариант события «за энергию» — по контенту. Кофе: +10⚡ за 30 C бюджета смены, раз за смену | `lessonEconomy.ts`, `adventureStore.ts` |
| Зарплата смены                | `round(price урока × (1 + бонус ноутбука % / 100))`; урок уже начат — пропорционально оставшимся этапам                                                                                                             | `lessonSalary`, `remainingStagesSalary` |
| План                          | `нужно + хочу + коплю ≤ доступно`; «Не распределено» = доступно − распределено                                                                                                                                      | `clampAllocationAmount`                 |
| Факт                          | траты событий — в корзины «Нужно» / «Хочу»; кофе и подсказки — «Хочу»; «Коплю» — сколько ушло в копилку                                                                                                             | `adventureStore.recordFact`             |
| Бонус за план                 | +10 C в бюджет смены, если `факт трат ≤ плана трат`; урок не закончен — × доля                                                                                                                                      | `isPlanBonusEligible`                   |
| Доля при досрочном завершении | этапы, пройденные в этой смене ÷ этапы, оставшиеся к её началу; урок пройден или демо — 1                                                                                                                           | `shiftCompletionRatio`                  |
| Выплата                       | остаток бюджета (+ бонус) × доля: «Коплю» → копилка (не больше остатка), остальное → кошелёк                                                                                                                        | `computeAdventurePayout`                |
| Бонус копилки                 | `новые = пополнение − min(пополнение, снятое ранее)`; `бонус = ⌊новые × ставка / 100⌋`, ставка 1 % (+2…+4 % от копилки-улучшения); из незаконченной смены — без бонуса                                              | `computeDepositBonus`                   |
| Цель достигнута               | вещь в инвентарь + `⌊цена × 10 %⌋` C в кошелёк                                                                                                                                                                      | `goalCompletionBonus`                   |
| Опыт и уровень                | первое прохождение урока — `300 / число уроков темы` (вся тема — ровно +1 уровень); демо — 300 за урок; уровень = `1 + ⌊опыт / 300⌋`, не понижается                                                                 | `lessonRewards.ts`, `PlayerLevel.ts`    |
| Награды уровней               | ур. 2 — 100 C + облик; 3 — 150 C + облик; 4–9 — 200–500 C; 10 — 750 C + трофей                                                                                                                                      | `LEVEL_REWARDS`                         |
| Аркада                        | 10⚡ за игру, +2 C за верный ответ                                                                                                                                                                                  | `constants/gameplay.ts`                 |
| Ежедневная награда            | дни стрика 1–7: 50, 75, 100, 125, 150, 200, 200 C; на 7-й день — подарок 10–100 C; не в день создания профиля                                                                                                       | `hooks/useDaily.ts`                     |
| Продажа вещи                  | 50 % цены (стартовые вещи, облики и трофеи не продаются)                                                                                                                                                            | `useShop.sellItem`                      |

## 4.6. Как добавить учебный контент

1. Новый урок — объект в файле темы `content/lessons/<id>_<тема>.json` (формат — README, раздел «Формат урока»). Код менять не нужно.
2. `npm run lessons:check` проверяет, что денег смены хватит в худшем случае; `npm test` — правила состава урока, уникальность id вопросов и наличие слов «5 букв» в банке.
3. Новая тема — новый файл, строка в `content/branches.json` и строка в `src/data/content/lessonFiles.ts` (Metro подключает файлы только явно).
4. Новый товар — запись в `content/items.json`. Если у товара свой рисунок, файл кладётся в `assets/` и регистрируется в `src/constants/itemAssets.ts`.

## 4.7. Качество

- Jest: 40 наборов, 413 тестов доменной логики: план бюджета, покупки, накопления, план и факт, выплата смены, рост уровня, восстановление энергии, награды, контент. На 29.09 проходят 412; один контентный тест падает: слова «СПРОС» из урока 943 нет в банке слов.
- `npx tsc --noEmit` — без ошибок. `npx eslint src scripts` — 0 ошибок, 68 предупреждений (стили inline). `npm run lint` сейчас проверяет и собранный бандл `docs/`, поэтому выдаёт тысячи ошибок; папку надо добавить в игнор.
- UI-тестов нет. Сценарий проверялся вручную в веб-сборке, на Android ещё не проверялся.

## 4.8. Сервер и ИИ

Серверной части нет, и приложение к сети не обращается. ИИ-помощник есть в коде (`AiAssistant` → `StubAiAssistant`, локальные ответы из `content/ai_stub_responses.json`, 5⚡ за вопрос, история и её очистка), но скрыт из интерфейса и в обязательный сценарий не входит. Оставшийся `docker-compose.yml` ссылается на удалённую папку `server/`.

## 4.9. Ограничения архитектуры

- Хранение разнесено: кошелёк и накопления лежат в SQLite, инвентарь магазина — в AsyncStorage. Покупка пишет в два хранилища не атомарно; вероятность сбоя мала, но в документации это стоит упомянуть.
- «Удалить профиль» очищает таблицы SQLite, AsyncStorage и PIN. Сжатие файла БД (`VACUUM`) не выполняется. Автоматическое резервное копирование Android (`allowBackup`) не отключено, поэтому данные игры могут попасть в резервную копию Google-аккаунта устройства. Рекомендуется `android.allowBackup: false`.
- На вебе AsyncStorage работает поверх `localStorage` браузера, а PIN хранится там же (SecureStore на вебе недоступен). Это касается только веб-прототипа.
