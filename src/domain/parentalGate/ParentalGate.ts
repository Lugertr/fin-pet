// domain/parentalGate/ParentalGate.ts
// Барьер входа в раздел для взрослого (§17.1 ТЗ): арифметический пример.
// Чистая генерация — экран лишь показывает вопрос и сверяет ответ.

export interface ArithmeticChallenge {
  a: number;
  b: number;
  operator: '+' | '−' | '×';
  answer: number;
  label: string;
}

const OPERATORS: ('+' | '−' | '×')[] = ['+', '−', '×'];

export function generateArithmeticChallenge(): ArithmeticChallenge {
  const operator = OPERATORS[Math.floor(Math.random() * OPERATORS.length)];
  let a = Math.floor(Math.random() * 8) + 2; // 2-9
  let b = Math.floor(Math.random() * 8) + 2; // 2-9

  if (operator === '−' && b > a) {
    [a, b] = [b, a]; // не уходим в отрицательные числа — это не про математику ребёнка
  }

  const answer = operator === '+' ? a + b : operator === '−' ? a - b : a * b;

  return { a, b, operator, answer, label: `${a} ${operator} ${b} = ?` };
}
