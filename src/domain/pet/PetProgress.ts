// domain/pet/PetProgress.ts
// Рост питомца по совокупности успешных периодов (§8 ТЗ).
// Счётчик кумулятивный (не стрик): неуспешный период не сбрасывает его,
// стадия никогда не уменьшается (§8.4).

export interface PetStageDefinition {
  stage: number;
  name: string;
  requiredSuccessfulPeriods: number;
}

// §8.3
export const PET_STAGES: PetStageDefinition[] = [
  { stage: 1, name: 'Малыш', requiredSuccessfulPeriods: 0 },
  { stage: 2, name: 'Подросток', requiredSuccessfulPeriods: 1 },
  { stage: 3, name: 'Взрослый', requiredSuccessfulPeriods: 3 },
  { stage: 4, name: 'Мудрый', requiredSuccessfulPeriods: 5 },
  { stage: 5, name: 'Легенда', requiredSuccessfulPeriods: 10 },
];

export interface PetProgressRecord {
  id: number;
  profileId: string;
  successfulPeriodsCount: number;
  currentStage: number;
}

export function getStageName(stage: number): string {
  return PET_STAGES.find((s) => s.stage === stage)?.name ?? PET_STAGES[0].name;
}

export function computeStageForCount(count: number): number {
  let stage = PET_STAGES[0].stage;
  for (const definition of PET_STAGES) {
    if (count >= definition.requiredSuccessfulPeriods) {
      stage = definition.stage;
    }
  }
  return stage;
}

/**
 * §8.2: период успешен, если на момент завершения энергия ≥30⚡ (обязательное
 * покрыто) И в этот период было хотя бы одно пополнение накоплений (регулярность).
 * Точное совпадение плана и факта в формулу роста не входит.
 */
export function isPeriodSuccessful(energyAtCompletion: number, savingsFact: number): boolean {
  return energyAtCompletion >= 30 && savingsFact > 0;
}
