import type { StateCreator } from 'zustand';
import type { GameStore } from '@/app/providers/store';
import { simpleHash } from '@/entities/settings';

export interface ParentModeSlice {
  setParentPin: (pin: string) => void;
  removeParentPin: (pin: string) => boolean;
  verifyParentPin: (pin: string) => boolean;
}

export const createParentModeSlice: StateCreator<GameStore, [], [], ParentModeSlice> = (
  set,
  get
) => ({
  setParentPin: (pin) => {
    set({
      settings: {
        ...get().settings,
        parentPinHash: simpleHash(pin),
      },
    });
  },

  removeParentPin: (pin) => {
    const state = get();
    if (state.settings.parentPinHash === simpleHash(pin)) {
      set({
        settings: {
          ...state.settings,
          parentPinHash: undefined,
        },
      });
      return true;
    }
    return false;
  },

  verifyParentPin: (pin) => {
    const state = get();
    return state.settings.parentPinHash === simpleHash(pin);
  },
});
