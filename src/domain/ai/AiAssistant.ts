// domain/ai/AiAssistant.ts
// Интерфейс ИИ-помощника (§16 ТЗ). На этом этапе единственная реализация —
// StubAiAssistant: фиксированный нейтральный текст со ссылкой на урок, без
// генерации и без сети (§16.1/§16.3). Интерфейс уже асинхронный и не завязан
// на реализацию — реальная on-device/серверная модель подключится позже,
// заменив только фабрику (src/lib/ai), без изменений в aiChatStore/UI.

export interface AiAnswer {
  text: string;
  relatedBranchId: number | null;
  relatedLessonId: number | null;
}

export interface AiAssistant {
  ask(question: string): Promise<AiAnswer>;
}

/** Один элемент базы знаний заглушки — живёт в content/ai_stub_responses.json (§25 ТЗ). */
export interface AiStubResponseEntry {
  branch_id: number;
  keywords: string[];
  response: string;
}

export interface AiStubContent {
  responses: AiStubResponseEntry[];
  fallback: string;
}
