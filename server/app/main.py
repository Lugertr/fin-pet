"""Минимальный каркас FastAPI-бэкенда для ИИ-помощника (§16 ТЗ).

Клиент сейчас работает полностью офлайн на локальной заглушке
StubAiAssistant (см. src/lib/ai в клиентском коде) и не обращается к этому
сервису. Каркас — задел на будущее: когда заглушку заменит настоящая
on-device/серверная модель, эндпоинт ниже уже возвращает данные в форме,
совместимой с клиентским AiAnswer (text/related_branch_id/related_lesson_id),
и дальше не развивается на этом этапе.
"""

from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Финни — ИИ-помощник (заглушка)", version="0.1.0")


class AskRequest(BaseModel):
    question: str


class AskResponse(BaseModel):
    text: str
    related_branch_id: int | None = None
    related_lesson_id: int | None = None


STUB_ANSWER = (
    "Хороший вопрос! Пока я умею уверенно отвечать только на вопросы по темам "
    "наших веток обучения — загляните на вкладку «Уроки», там точно "
    "найдётся урок по вашей теме."
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/ai/ask", response_model=AskResponse)
def ask(request: AskRequest) -> AskResponse:
    # Никакой генерации, никаких обращений к внешним сервисам (§16.1/§16.3) —
    # тот же нейтральный стаб, что и в клиентском StubAiAssistant.
    del request  # содержимое вопроса пока не влияет на ответ заглушки
    return AskResponse(text=STUB_ANSWER, related_branch_id=None, related_lesson_id=None)
