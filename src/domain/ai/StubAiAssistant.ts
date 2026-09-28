// domain/ai/StubAiAssistant.ts
// §16.1/§16.3 ТЗ: никакой генерации, никаких сетевых вызовов — простое
// сопоставление ключевых слов закрытому набору тем (веток обучения) и
// фиксированный нейтральный ответ со ссылкой на первый урок подходящей
// ветки. Нераспознанный вопрос -> нейтральный fallback (§16.4), без
// выдумывания фактов.

import { AnyLessonContent } from '@/domain/content/LessonContent';
import { AiAnswer, AiAssistant, AiStubResponseEntry } from './AiAssistant';

export class StubAiAssistant implements AiAssistant {
  constructor(
    private readonly responses: AiStubResponseEntry[],
    private readonly fallback: string,
    private readonly lessons: AnyLessonContent[]
  ) {}

  async ask(question: string): Promise<AiAnswer> {
    const normalized = question.toLowerCase();
    const matched = this.responses.find((entry) =>
      entry.keywords.some((keyword) => normalized.includes(keyword))
    );

    if (!matched) {
      return { text: this.fallback, relatedBranchId: null, relatedLessonId: null };
    }

    const firstLessonInBranch = this.lessons
      .filter((lesson) => lesson.branch_id === matched.branch_id)
      .sort((a, b) => a.order_index - b.order_index)[0];

    return {
      text: matched.response,
      relatedBranchId: matched.branch_id,
      relatedLessonId: firstLessonInBranch ? firstLessonInBranch.id : null,
    };
  }
}
