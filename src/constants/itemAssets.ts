// constants/itemAssets.ts
// Картинки вещей — одна карта для комнаты (PetRoom) и для всех списков вещей
// (магазин, инвентарь, цель в банке): там показывается настоящий облик
// предмета, а не эмодзи (решение пользователя 27.09.2026). Вариант арта —
// skin_variant товара. Для еды и скрытых трофеев картинок нет — у них
// остаётся эмодзи (см. components/shared/ItemImage).

import type { ImageSourcePropType } from 'react-native';

import type { PetType } from '@/constants/petAssets';
import type { ItemContent } from '@/domain/content/ItemContent';
import { getPetSpecies } from '@/domain/pet/petSpeciesRegistry';

export type FurnitureChipCategory = 'laptop' | 'piggybank' | 'bed';

export const FURNITURE_ASSETS: Record<FurnitureChipCategory, Record<number, number>> = {
  laptop: {
    0: require('../../assets/images/furniture/laptop.svg'),
    1: require('../../assets/images/furniture/laptop-v1.svg'),
    2: require('../../assets/images/furniture/laptop-v2.svg'),
  },
  piggybank: {
    0: require('../../assets/images/furniture/piggybank.svg'),
    1: require('../../assets/images/furniture/piggybank-v1.svg'),
    2: require('../../assets/images/furniture/piggybank-v2.svg'),
  },
  bed: {
    0: require('../../assets/images/furniture/bed.svg'),
    1: require('../../assets/images/furniture/bed-v1.svg'),
    2: require('../../assets/images/furniture/bed-v2.svg'),
  },
};

export const WINDOW_ASSETS: Record<number, number> = {
  0: require('../../assets/images/furniture/window.svg'),
  1: require('../../assets/images/furniture/window-v1.svg'),
  2: require('../../assets/images/furniture/window-v2.svg'),
};

export const CARPET_ASSETS: Record<number, number> = {
  0: require('../../assets/images/furniture/carpet.svg'),
  1: require('../../assets/images/furniture/carpet-v1.svg'),
  2: require('../../assets/images/furniture/carpet-v2.svg'),
};

export const ROOM_BACKGROUNDS: Record<number, number> = {
  0: require('../../assets/images/furniture/room-background.svg'),
  1: require('../../assets/images/furniture/room-background-space.svg'),
};

/**
 * Настоящая картинка вещи: мебель и фон комнаты — их арт нужного варианта,
 * облик питомца — сам питомец в этом облике. null — арта нет (еда, трофеи),
 * показывается эмодзи item.icon.
 */
export function getItemImage(
  item: Pick<ItemContent, 'category' | 'skin_variant' | 'pet_type'>
): ImageSourcePropType | null {
  const variant = item.skin_variant ?? 0;
  switch (item.category) {
    case 'laptop':
    case 'piggybank':
    case 'bed':
      return FURNITURE_ASSETS[item.category][variant] ?? FURNITURE_ASSETS[item.category][0];
    case 'window':
      return WINDOW_ASSETS[variant] ?? WINDOW_ASSETS[0];
    case 'carpet':
      return CARPET_ASSETS[variant] ?? CARPET_ASSETS[0];
    case 'room':
      return ROOM_BACKGROUNDS[variant] ?? ROOM_BACKGROUNDS[0];
    case 'skin':
      return item.pet_type
        ? getPetSpecies(item.pet_type as PetType).getBodyAsset('idle', variant)
        : null;
    default:
      return null;
  }
}
