// src/app/(modal)/adventure.tsx
// Экран приключения («работа» питомца). По решению пользователя (27.09.2026)
// хаб остаётся хабом и во время приключения, а сюда ведёт кнопка на хабе
// («Продолжить приключение») или тап по ноутбуку. Вся логика — в
// AdventureActiveView; когда приключение завершено (✕ или время вышло), экран
// сам возвращает на хаб, где показываются итоги.

import { AdventureActiveView } from '@/components/adventure';

export default function AdventureScreen() {
  return <AdventureActiveView />;
}
