// lib/adventure/formatDuration.ts
// Общий формат отображения оставшегося времени приключения (полоска под
// сценой в AdventureActiveView).

export function formatDuration(ms: number): string {
  const totalMinutes = Math.max(0, Math.ceil(ms / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours} ч ${minutes} мин`;
}
