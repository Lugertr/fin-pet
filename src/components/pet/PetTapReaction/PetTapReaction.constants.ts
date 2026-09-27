// src/components/pet/PetTapReaction/PetTapReaction.constants.ts
// Платформенно-нейтральные константы реакции питомца по тапу — без
// импорта rive-react-native (импортируется и нативным, и .web-компонентом,
// и PetSprite.tsx напрямую, чтобы последний не знал о Rive вообще).
//
// .riv-файлов пока не существует (assets/animations/ пуст, а .riv —
// бинарный формат редактора Rive, сгенерировать его нельзя) — тот же
// приём, что уже применён для фона уроков (см. LessonsBackground.tsx):
// режим + URL пустые, ничего не рендерится, пока кто-то не подготовит
// .riv-файл под описанный ниже контракт и не пропишет сюда URL.
//
// Контракт для .riv-файла (все 3 вида питомца — один и тот же): State
// Machine с состояниями "Idle" и реакцией, триггер-вход, переводящий из
// Idle в реакцию, и автоматический (по времени/exit time) переход обратно
// в Idle. JS ничего не оркеструет руками — стреляет триггером один раз и
// слушает onStateChanged, чтобы узнать, когда SM вернулась в Idle.

import type { PetType } from '@/constants/petAssets';

export const PET_TAP_RIVE_MODE: 'rive' | 'off' = 'off';
export const PET_TAP_RIVE_STATE_MACHINE = 'PetTapSM';
export const PET_TAP_RIVE_IDLE_STATE = 'Idle';
export const PET_TAP_RIVE_TRIGGER = 'Tap';
/** Ссылки на .riv-файлы по видам питомца — пусто, пока ассеты не готовы. */
export const PET_TAP_RIVE_URLS: Record<PetType, string> = {
  robot: '',
  bear: '',
  cat: '',
};
/** Страховка: если .riv не соответствует контракту и onStateChanged не
 * пришёл — форс-возврат на статичный спрайт, чтобы питомец не завис. */
export const PET_TAP_RIVE_FALLBACK_MS = 4000;

export function isPetTapReactionAvailable(petType: PetType): boolean {
  return PET_TAP_RIVE_MODE === 'rive' && PET_TAP_RIVE_URLS[petType].length > 0;
}
