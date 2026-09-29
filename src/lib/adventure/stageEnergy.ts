// lib/adventure/stageEnergy.ts
// Энергия за этап урока смены (решение пользователя 29.09.2026): этап стоит
// nodeEnergyCost урока (content/lessons, lessonEconomy.ts; этап «Теория» — как
// обычный); не хватает энергии —
// этап не начать, объясняем, что делать. Списывается, когда этап пройден
// (LessonPlayer). Финальный этап (заключение и награда) энергии не стоит.

import { planForLesson } from '@/domain/lesson/LessonPlan';
import { createLessonProgress, currentPosition } from '@/domain/lesson/lessonProgress';
import { LESSONS, useLessonsStore } from '@/lib/hooks/useLessons';
import { useAdventureStore } from '@/lib/stores/adventureStore';
import { usePetStore } from '@/lib/stores/petStore';
import { useUserStore } from '@/lib/stores/userStore';
import { Alert } from '@/lib/utils/alert';

/** Сколько энергии стоит текущий этап урока (0 — финальный или урок пройден). */
export function stageEnergyCost(lessonId: number): number {
  const lesson = LESSONS.find((l) => l.id === lessonId);
  if (!lesson) return 0;
  const isDemo = useUserStore.getState().user?.is_demo ?? false;
  const state = useLessonsStore.getState().lessonStates[lessonId] ?? createLessonProgress(lessonId);
  const position = currentPosition(planForLesson(lesson, isDemo), state);
  if (position.kind !== 'reading' && position.kind !== 'activity') return 0;
  return position.node.energyCost;
}

/**
 * Хватает ли энергии на текущий этап урока смены; нет — объяснение (подождать
 * или, если кофе в этой смене ещё не выпит, выпить кофе) и false. Не урок
 * смены — всегда true.
 */
export function ensureStageEnergy(lessonId: number, branchId: number): boolean {
  if (!useAdventureStore.getState().isShiftLesson(lessonId, branchId)) return true;
  const cost = stageEnergyCost(lessonId);
  usePetStore.getState().refreshMood();
  const energy = usePetStore.getState().currentMood;
  if (energy >= cost) return true;
  // Кофе — раз за смену, с первого этапа (энергии не хватает — значит, не полная).
  const coffeeAvailable = !useAdventureStore.getState().currentAdventure?.coffeeBought;
  Alert.alert(
    'Не хватает энергии',
    `Этап стоит ${cost}⚡, а у питомца ${Math.floor(energy)}⚡. Подожди — энергия восстанавливается сама${
      coffeeAvailable ? ', или выпей кофе на экране смены' : ''
    }.`
  );
  return false;
}
