// constants/eventIcons.ts
// Иконка события урока (поле icon в content/lessons/*.json, решение
// пользователя 29.09.2026) — одно из трёх:
// - "question" / "reward" — персонаж: питомец ребёнка в текущем облике
//   (плитки question/reward из assets/images/pets, как в карточках урока);
// - ключ картинки из EVENT_ICON_IMAGES ниже;
// - эмодзи (как было).
// Картинки в React Native подключаются только статическим require, поэтому
// новая иконка = файл в assets/images/ (например, assets/images/events/) +
// строка в EVENT_ICON_IMAGES. Опечатку в ключе ловит тест eventIcons.test.ts.

import type { ImageSourcePropType } from 'react-native';

import type { PetEmotion } from '@/domain/pet/Pet';

export const EVENT_ICON_IMAGES: Record<string, ImageSourcePropType> = {
  laptop: require('../../assets/images/furniture/laptop.svg'),
  piggybank: require('../../assets/images/furniture/piggybank.svg'),
  bed: require('../../assets/images/furniture/bed.svg'),
  window: require('../../assets/images/furniture/window.svg'),
  carpet: require('../../assets/images/furniture/carpet.svg'),
};

/** Иконки-персонажи: эмоция питомца. */
export const PET_EVENT_ICONS: Record<string, PetEmotion> = {
  question: 'question',
  reward: 'reward',
};

export type EventIcon =
  | { kind: 'pet'; emotion: PetEmotion }
  | { kind: 'image'; source: ImageSourcePropType }
  | { kind: 'emoji'; text: string };

/** Похоже на ключ (латиница, цифры, - и _), а не на эмодзи. */
const KEY_PATTERN = /^[a-z][a-z0-9_-]*$/i;

export function resolveEventIcon(icon: string): EventIcon {
  const key = icon.trim();
  if (PET_EVENT_ICONS[key]) return { kind: 'pet', emotion: PET_EVENT_ICONS[key] };
  if (EVENT_ICON_IMAGES[key]) return { kind: 'image', source: EVENT_ICON_IMAGES[key] };
  return { kind: 'emoji', text: key };
}

/** Ключ, которого нет ни среди персонажей, ни среди картинок, — опечатка в контенте. */
export function isUnknownEventIconKey(icon: string): boolean {
  const key = icon.trim();
  return KEY_PATTERN.test(key) && !PET_EVENT_ICONS[key] && !EVENT_ICON_IMAGES[key];
}
