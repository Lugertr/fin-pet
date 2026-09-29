// lib/adventure/stageEnergy.ts
// Энергия за этап урока смены (решение пользователя 29.09.2026): этап стоит
// nodeEnergyCost урока (lessons.json, lessonEconomy.ts; этап «Теория» — как
// обычный); не хватает энергии —
// этап не начать, объясняем, что делать. Списывается, когда этап пройден
// (LessonPlayer). Финальный этап (заключение и награда) энергии не стоит.

import { isCoffeeUnlocked } from '@/domain/adventure/Adventure';
import { planForLesson } from '@/domain/lesson/LessonPlan';
import {
  completedNodeCount,
  createLessonProgress,
  currentPosition,
} from '@/domain/lesson/lessonProgress';
import { LESSONS, useLessonsStore } from '@/lib/hooks/useLessons';
import { useAdventureStore } from '@/lib/stores/adventureStore';
import { usePetStore } from '@/lib/stores/petStore';
import { useUserStore } from '@/lib/stores/userStore';
import { Alert } from '@/lib/utils/alert';

/** Текущий этап урока: его цена в энергии (0 — финальный или урок пройден) и сколько этапов пройдено. */
function stageStatus(lessonId: number): { cost: number; stagesDone: number } {
  const lesson = LESSONS.find((l) => l.id === lessonId);
  if (!lesson) return { cost: 0, stagesDone: 0 };
  const isDemo = useUserStore.getState().user?.is_demo ?? false;
  const state = useLessonsStore.getState().lessonStates[lessonId] ?? createLessonProgress(lessonId);
  const plan = planForLesson(lesson, isDemo);
  const position = currentPosition(plan, state);
  return {
    cost: position.kind === 'reading' || position.kind === 'activity' ? position.node.energyCost : 0,
    stagesDone: completedNodeCount(plan, state),
  };
}

/** Сколько энергии стоит текущий этап урока (0 — финальный или урок пройден). */
export function stageEnergyCost(lessonId: number): number {
  return stageStatus(lessonId).cost;
}

/**
 * Хватает ли энергии на текущий этап урока смены; нет — объяснение (подождать
 * или, если кофе уже открыт, выпить кофе) и false. Не урок смены — всегда true.
 */
export function ensureStageEnergy(lessonId: number, branchId: number): boolean {
  if (!useAdventureStore.getState().isShiftLesson(lessonId, branchId)) return true;
  const { cost, stagesDone } = stageStatus(lessonId);
  usePetStore.getState().refreshMood();
  const energy = usePetStore.getState().currentMood;
  if (energy >= cost) return true;
  // Кофе — раз за смену и только после первого её этапа (Adventure.isCoffeeUnlocked).
  const adventure = useAdventureStore.getState().currentAdventure;
  const coffeeAvailable =
    !!adventure &&
    !adventure.coffeeBought &&
    isCoffeeUnlocked(stagesDone, adventure.stagesDoneAtStart);
  Alert.alert(
    'Не хватает энергии',
    `Этап стоит ${cost}⚡, а у питомца ${Math.floor(energy)}⚡. Подожди — энергия восстанавливается сама${
      coffeeAvailable ? ', или выпей кофе на экране смены' : ''
    }.`
  );
  return false;
}
