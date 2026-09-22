// lib/ai/index.ts
// Точка подмены реализации ИИ-помощника (§16.1 ТЗ). Сейчас единственная
// реализация — StubAiAssistant. Когда появится настоящая on-device/серверная
// модель, здесь меняется только конструируемый класс — aiChatStore и экран
// чата про это ничего не знают, они работают через интерфейс AiAssistant.

import { getLocalContentRepository } from '@/data/content';
import { AiAssistant } from '@/domain/ai/AiAssistant';
import { StubAiAssistant } from '@/domain/ai/StubAiAssistant';

let assistant: AiAssistant | null = null;

export function getAiAssistant(): AiAssistant {
  if (!assistant) {
    const repo = getLocalContentRepository();
    const { responses, fallback } = repo.getAiStubContentSync();
    assistant = new StubAiAssistant(responses, fallback, repo.getLessonsSync());
  }
  return assistant;
}
