// src/components/shared/HelpButton/screenHelp.ts
// Подсказка экрана из content/screen_help.json по id.

import { getLocalContentRepository } from '@/data/content';
import type { ScreenHelpContent, ScreenHelpId } from '@/domain/content/ReferenceContent';

const SCREEN_HELP = getLocalContentRepository().getScreenHelpSync();

export function getScreenHelp(id: ScreenHelpId): ScreenHelpContent | undefined {
  return SCREEN_HELP.find((help) => help.id === id);
}
