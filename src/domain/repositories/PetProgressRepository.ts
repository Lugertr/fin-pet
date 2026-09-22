// domain/repositories/PetProgressRepository.ts

import { PetProgressRecord } from '@/domain/pet/PetProgress';

export interface PetProgressRepository {
  getByProfileId(profileId: string): Promise<PetProgressRecord | null>;
  create(profileId: string): Promise<PetProgressRecord>;
  update(id: number, successfulPeriodsCount: number, currentStage: number): Promise<void>;
}
