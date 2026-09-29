// src/components/games/FiveLettersGame/evaluateGuess.ts
// Стандартный wordle-алгоритм сравнения угадываемого слова с целевым —
// двухпроходный, чтобы повторяющиеся буквы считались корректно (иначе,
// например, вторая одинаковая буква в guess получила бы 'present' даже
// когда в target она встречается только один раз).

export type LetterResult = 'correct' | 'present' | 'absent';

export function evaluateGuess(guess: string, target: string): LetterResult[] {
  const length = target.length;
  const result: LetterResult[] = new Array(length).fill('absent');
  const remaining: Record<string, number> = {};

  // Проход 1: точные совпадения по позиции — сразу 'correct', буква
  // расходуется из остатка для второго прохода.
  for (let i = 0; i < length; i++) {
    if (guess[i] === target[i]) {
      result[i] = 'correct';
    } else {
      remaining[target[i]] = (remaining[target[i]] ?? 0) + 1;
    }
  }

  // Проход 2: для всего, что не 'correct' — есть ли буква где-то ещё в
  // target (с учётом того, сколько от неё уже "занято" другими позициями).
  for (let i = 0; i < length; i++) {
    if (result[i] === 'correct') continue;
    const letter = guess[i];
    if ((remaining[letter] ?? 0) > 0) {
      result[i] = 'present';
      remaining[letter] -= 1;
    }
  }

  return result;
}

/**
 * Какую букву открыть подсказкой «Открыть букву» (решение 29.09.2026): первую
 * слева, которую игрок ещё не отгадал на её месте (не зелёная ни в одной
 * попытке). Все отгаданы — первую.
 */
export function letterToReveal(results: LetterResult[][], length: number): number {
  for (let i = 0; i < length; i++) {
    if (!results.some((row) => row[i] === 'correct')) return i;
  }
  return 0;
}
