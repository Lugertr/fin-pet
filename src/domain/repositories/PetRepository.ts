// domain/repositories/PetRepository.ts

export interface PetRecord {
  id: number;
  profileId: string;
  mood: number;
  lastMoodUpdatedAt: string;
  baseRecoveryRate: number;
}

export interface PetRepository {
  getByProfileId(profileId: string): Promise<PetRecord | null>;
  create(pet: Omit<PetRecord, 'id'>): Promise<PetRecord>;
  updateMood(petId: number, mood: number, lastMoodUpdatedAt: string): Promise<void>;
}
