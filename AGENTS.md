# AGENTS.md

# FinPet

Mobile application that teaches financial literacy to children (8–14 years old) using a virtual pet.

Stack:

- React Native
- Expo SDK 57
- Expo Router
- TypeScript
- Zustand
- NativeWind
- AsyncStorage
- SecureStore
- Expo Notifications

---

# Project Goals

The application is a game first and an educational application second.

Core mechanics:

- complete financial tasks
- earn coins
- choose between spending and saving
- care for the pet
- gradually unlock new content

Every new feature should improve one of:

- budgeting
- planning
- saving
- delayed gratification
- responsible spending

---

# Architecture

The project follows **Feature-Sliced Design (FSD).**

```
src/

app/

pages/

widgets/

features/

entities/

shared/
```

Layer dependencies

```
app
 ↓
pages
 ↓
widgets
 ↓
features
 ↓
entities
 ↓
shared
```

Never violate layer boundaries.

---

# Feature Structure

Every feature contains

```
feature/

ui/

model/

lib/

api/

index.ts
```

Always import through

```ts
import { FeedPetButton } from '@/features/feed-pet';
```

Never import internal files directly.

---

# Entities

Core entities

- Player
- Pet
- Wallet
- Task
- Adventure
- Inventory
- PiggyBank
- Achievement
- Transaction
- Notification

Entities contain only business rules and types.

UI belongs to Features or Widgets.

---

# State Management

Use Zustand.

Global stores only for

- player
- pet
- settings
- notifications
- synchronization

Feature state stays inside the feature.

Do not create one giant store.

---

# Storage

AsyncStorage

- player
- pet
- inventory
- transactions
- settings
- diary
- statistics

SecureStore

- parent PIN
- auth tokens

Never store secrets inside AsyncStorage.

---

# Navigation

Use Expo Router.

One page = one screen.

Business logic should never be placed inside route files.

Pages compose Widgets.

Widgets compose Features.

---

# UI Rules

Use NativeWind.

Support

- dark mode
- safe areas
- tablets
- accessibility

Minimum touch target

48dp

Avoid deeply nested JSX.

Extract reusable components.

---

# Business Rules

The pet should never permanently die.

Coins cannot become negative.

Every transaction must be recorded.

Cloud synchronization is optional.

Offline mode is the default.

The application must work completely offline except:

- synchronization
- AI chat

Never add mechanics that allow infinite coin farming.

Rewards should come from

- daily tasks
- adventures
- streaks
- mini games (limited)

---

# Code Style

Use

- TypeScript strict
- functional components
- React Hooks
- small reusable components

Avoid

- any
- class components
- duplicated logic
- prop drilling

Prefer composition over inheritance.

Keep files below ~300 lines whenever possible.

---

# Performance

Use

- React.memo
- useMemo
- useCallback
- FlatList
- lazy loading

Avoid unnecessary re-renders.

Never perform heavy calculations during render.

---

# Notifications

Supported notifications

- daily tasks
- hungry pet
- adventure complete
- weekly interest
- achievements

All notifications must be configurable.

---

# AI Assistant

LLM is an educational helper.

Never provide

- investment advice
- crypto recommendations
- financial planning for real money

Responses should be understandable for children aged 8–14.

---

# Commands

Install

```bash
npm install
```

Run

```bash
npm run start
```

Android

```bash
npm run android
```

Web

```bash
npm run web
```

Lint

```bash
npm run lint
```

Auto fix

```bash
npm run lint:fix
```

Format

```bash
npm run format
```

---

# Before Finishing Any Task

Always

- run eslint on modified files
- run prettier
- fix TypeScript errors
- keep architecture intact
- avoid unrelated refactoring

Do not add dependencies without clear justification.

---

# Definition of Done

A task is complete only if

- architecture respected
- business logic implemented
- UI implemented
- state connected
- persistence works
- offline mode works
- lint passes
- formatting passes
- TypeScript has no errors

---

# Priorities

## MVP

- onboarding
- pet
- tasks
- wallet
- shop
- piggy bank
- profile
- local persistence

## Phase 2

- parent mode
- synchronization
- diary
- adventures
- notifications

## Phase 3

- mini games
- room customization
- leaderboard

Never implement Phase 3 before MVP is complete.
