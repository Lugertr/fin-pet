// data/content/index.ts

import { ContentRepository } from '@/domain/repositories/ContentRepository';
import { LocalJsonContentRepository } from './LocalJsonContentRepository';

let contentRepository: LocalJsonContentRepository | null = null;

export function getContentRepository(): ContentRepository {
  if (!contentRepository) contentRepository = new LocalJsonContentRepository();
  return contentRepository;
}

/** Синхронный доступ для экранов, которым пока не нужен async/loading-стейт. */
export function getLocalContentRepository(): LocalJsonContentRepository {
  if (!contentRepository) contentRepository = new LocalJsonContentRepository();
  return contentRepository;
}
