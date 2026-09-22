// domain/profile/Profile.ts
// Локальный профиль по §4.2 ТЗ: без аккаунта, без персональных данных ребёнка

import { PetType } from '@/constants/petAssets';

// §4.4 ТЗ: стартовый капитал 100⭐ — 50 в кошелёк, 50 в накопления. Общий
// источник для онбординга и «Сброса профиля» (§17.2) — оба воспроизводят
// одно и то же исходное состояние.
export const STARTING_WALLET_BALANCE = 50;
export const STARTING_SAVINGS_BALANCE = 50;

export interface PetAppearance {
  bodyVariant: number;
  colorVariant: number;
  accessory: string | null;
}

export interface LocalProfile {
  id: string;
  /** Ник, который вводит ребёнок в шаге 1 онбординга. Не входит в §4.2 ТЗ (там профиль — это только имя+внешний вид питомца), оставлен как надстройка над текущим онбордингом — см. отчёт по Этапу 0. */
  username: string | null;
  petName: string;
  petType: PetType;
  appearance: PetAppearance;
  liquidBalance: number;
  isDemo: boolean;
  createdAt: string;
}
