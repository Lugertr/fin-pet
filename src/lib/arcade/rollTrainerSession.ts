// lib/arcade/rollTrainerSession.ts
// Собирает случайный раунд Аркады (§10.3 ТЗ). Обычная функция, не хук —
// читает сторы напрямую через getState(), вызывается по нажатию кнопки.

import {
  TrainerSession,
  buildTrainerSession,
  getAvailableTrainerBranches,
  pickRandom,
} from '@/domain/arcade/TrainerSelection';
import { BRANCHES, LESSONS, useLessonsStore } from '@/lib/hooks/useLessons';
import { usePreferencesStore } from '@/lib/stores/preferencesStore';

/** Ветка «пройдена», если у неё есть уроки и все они завершены. */
export function getCompletedBranchIds(): number[] {
  const { getBranchProgress } = useLessonsStore.getState();
  return BRANCHES.filter((branch) => {
    const progress = getBranchProgress(branch.id);
    return progress.total > 0 && progress.completed === progress.total;
  }).map((branch) => branch.id);
}

export function rollTrainerSession(): TrainerSession | null {
  const completedBranchIds = getCompletedBranchIds();
  const excludedBranchIds = usePreferencesStore.getState().excludedTrainerBranches;
  const availableBranchIds = getAvailableTrainerBranches(completedBranchIds, excludedBranchIds);

  const branchId = pickRandom(availableBranchIds);
  if (branchId === null) return null;

  const lessonsInBranch = LESSONS.filter((l) => l.branch_id === branchId);
  return buildTrainerSession(branchId, lessonsInBranch);
}
